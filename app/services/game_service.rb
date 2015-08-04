require 'rtanque/runner'
require 'json'
require 'open3'

class GameService
  include Resque::Plugins::Status

  @queue = :match_runner

  def perform
    match_id = options['match_id'].to_i

    puts match_id

    tick_data_array = []
    shells_created = []
    shells_destroyed = []
    entry_map = {}

    match = Match.find match_id

    channel = WebsocketRails["match.#{match_id}"]
    channel.make_private

    Kernel.srand # The first time this is run it returns zero, anything after is fine

    random_val = Kernel.srand % 36028797018963967 # So our random value fits in a bigint (8 bytes)

    options = { width: 800, height: 600, max_ticks: match.max_ticks || 5000, gui: false, gc: true, replay_dir: 'replays', seed: match.seed || random_val }
    runner = RTanque::Recorder.create_runner options

    match.attributes = options.slice(:max_ticks, :seed)

    match.entries.each do |entry|
      # Check syntax
      code_to_check = entry.tank.code.gsub("^#!.+$", "") # Make sure the script doesn't actually get executed from a shebang line
      check_result = ""
      Open3.popen2e("ruby", "-c", "-e", code_to_check) { |i,o|
        check_result = o.read()
      }
      unless check_result =~ /Syntax OK/
        channel.trigger :error, error: "Syntax error", output: check_result
        return
      end

      tank = runner.add_brain_code(entry.tank.code, 1, entry.tank.name)[0]
      entry_map[tank.__id__] = entry
    end

    runner.match.before_start = proc do |match|
      tanks = []
      match.bots.each do |bot|
        tank = entry_map[bot.__id__].tank
        tanks.push name: bot.name, position: bot.position.to_h.slice(:x, :y), heading: bot.heading.to_f,
          turret_heading: bot.turret.heading.to_f, radar_heading: bot.radar.heading.to_f, color: tank.color
      end

      channel.trigger :start, width: match.arena.width, height: match.arena.height, tanks: tanks
    end

    runner.match.after_tick = proc do |match|
      bot_array = []
      match.bots.each do |bot|
        bot_array.push name: bot.name, x: bot.position.x, y: bot.position.y, health: bot.health, heading: bot.heading.to_f,
                       turret_heading: bot.turret.heading.to_f, radar_heading: bot.radar.heading.to_f
      end

      tick_data_array.push tick: match.ticks, tanks: bot_array, created: shells_created, destroyed: shells_destroyed

      if match.ticks % 5 == 4
        channel.trigger :batch, batch: tick_data_array
        tick_data_array = []
      end

      shells_created = []
      shells_destroyed = []
    end

    runner.match.after_stop = proc do |rmatch|
      channel.trigger :batch, batch: tick_data_array if tick_data_array.length > 0 # Send any leftover ticks

      remaining_tanks = []

      rmatch.bots.each do |tank|
        remaining_tanks.push name: tank.name if tank.health > 0
        entry = entry_map[tank.__id__]
        entry.health = tank.health
      end

      match.entries.sort_by { |e| [-e.health, e.killed_at] }.each_with_index do |entry, index|
        entry.place = index + 1
        entry.save
      end

      match.duration = rmatch.ticks
      match.save

      channel.trigger :stop, tanks: remaining_tanks, ended: true
    end

    runner.match.shell_created = proc do |shell|
      shells_created.push id: shell.id, x: shell.position.x, y: shell.position.y, heading: shell.heading.to_f, speed: shell.fire_power
    end

    runner.match.shell_destroyed = proc { |shell| shells_destroyed.push id: shell.id }

    runner.match.after_death = proc do |tank, match|
      entry = entry_map[tank.__id__]
      entry.health = 0
      entry.killed_at = match.ticks
      entry.killer = entry_map[tank.killer.__id__] if tank.killer
    end

    runner.start false
  end

  def self.on_failure(e, match_id)
    channel = WebsocketRails["match.#{match_id}"]
    channel.make_private
    channel.trigger :error,
      error: "#{e}",
      backtrace: e.backtrace.select{|line| line.starts_with?("sandbox")}.map{|line| line.gsub(/sandbox\-\d+:/, "Line ")}
    puts "Sent error: #{e.inspect}"
    puts e.backtrace
  end
end
