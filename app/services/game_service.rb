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

    channel = nil
    replay_data = {}
    if match.test
      channel = WebsocketRails["match.#{match_id}"]
      channel.make_private
    end

    Kernel.srand # The first time this is run it returns zero, anything after is fine

    random_val = Kernel.srand % 36028797018963967 # So our random value fits in a bigint (8 bytes)

    Kernel.srand match.seed || random_val
    runner = RTanque::Runner.new 800, 600, match.max_ticks || 5000

    match.attributes = options.slice(:max_ticks, :seed)

    match.entries.each do |entry|
      # Check syntax
      if match.test
        code = entry.tank.code
      else
        code = entry.tank.published_code || entry.tank.code
      end

      code_to_check = code.gsub("^#\!.+$", "\n") # Make sure the script doesn't actually get executed from a shebang line
      check_result = ""
      Open3.popen2e("ruby", "-c", "-e", code_to_check) { |i,o|
        check_result = o.read()
      }
      unless check_result =~ /Syntax OK/
        if match.test
          channel.trigger :error, error: "Syntax error", output: check_result
        else
          match.status = "syntax_error"
          match.save
        end
        return
      end

      tank = runner.add_brain_code(code, 1, entry.tank.name)[0]
      entry_map[tank.__id__] = entry
    end

    runner.match.before_start = proc do |rt_match|
      tanks = []
      rt_match.bots.each do |bot|
        tank = entry_map[bot.__id__].tank
        tanks.push name: bot.name, position: bot.position.to_h.slice(:x, :y), heading: bot.heading.to_f,
          turret_heading: bot.turret.heading.to_f, radar_heading: bot.radar.heading.to_f, color: tank.color
      end

      if match.test
        channel.trigger :start, width: rt_match.arena.width, height: rt_match.arena.height, tanks: tanks
      else
        replay_data["start"] = {width: rt_match.arena.width, height: rt_match.arena.height, tanks: tanks}
      end
    end

    runner.match.after_tick = proc do |rt_match|
      bot_array = []
      rt_match.bots.each do |bot|
        error = nil
        if bot.error
          e = bot.error
          error = {message: e.message, backtrace: e.backtrace.select{|line| line.starts_with?('sandbox')}.map{|line| line.gsub(/sandbox\-\d+:/, 'Line ')}}
        end

        bot_array.push name: bot.name, x: bot.position.x, y: bot.position.y, health: bot.health, heading: bot.heading.to_f,
          turret_heading: bot.turret.heading.to_f, radar_heading: bot.radar.heading.to_f, logs: bot.logs, error: error
      end

      tick_data_array.push tick: rt_match.ticks, tanks: bot_array, created: shells_created, destroyed: shells_destroyed

      if rt_match.ticks % 5 == 4 && match.test
        channel.trigger :batch, batch: tick_data_array
        tick_data_array = []
      end

      shells_created = []
      shells_destroyed = []
    end

    runner.match.after_stop = proc do |rmatch|
      channel.trigger :batch, batch: tick_data_array if tick_data_array.length > 0 && match.test # Send any leftover ticks

      remaining_tanks = []

      match.duration = rmatch.ticks

      rmatch.bots.each do |tank|
        remaining_tanks.push name: tank.name if tank.health > 0
        entry = entry_map[tank.__id__]
        entry.health = tank.health
        entry.save
      end

      match.entries.each do |entry| # Need to save them in the last step so relations work here
        ticks_lasted = entry.killed_at || match.duration
        entry.score = (ticks_lasted / match.duration.to_f) * 100 + entry.health + (entry.kills.count / (match.entries.length.to_f - 1)) * 100
      end

      match.entries.sort_by { |e| -e.score }.each_with_index do |entry, index|
        entry.place = index + 1
        entry.save
      end

      ranks = match.entries.sort_by{ |e| -e.score }.map do |e|
        {name: e.tank.name, score: e.score}
      end

      if match.test
        channel.trigger :ranks, ranks: ranks
        channel.trigger :stop, tanks: remaining_tanks, ended: true
      else
        replay_data["ranks"] = ranks
        tick_data_array.push({tanks: remaining_tanks, ended: true})
        replay_data["batch"] = tick_data_array
        match.replay_data = replay_data.to_json
        match.status = "done"
      end
      match.save
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

  def self.on_failure(e, uuid, options)
    match_id = options['match_id'].to_i
    match = Match.find match_id
    if match.test
      channel = WebsocketRails["match.#{options[:match_id]}"]
      channel.make_private
      channel.trigger :error,
        error: "#{e}",
        backtrace: e.backtrace.select{|line| line.starts_with?("sandbox")}.map{|line| line.gsub(/sandbox\-\d+:/, "Line ")}
    else
      match.status = "runtime_error"
      match.save
    end
  end
end
