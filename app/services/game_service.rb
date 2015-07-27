require 'rtanque/runner'
require 'json'

class GameService
  attr_reader :tick_data_array, :shells_created, :shells_destroyed

  @queue = :match_runner

  def self.perform(match_id)
    @tick_data_array = Array.new
    @shells_created = Array.new
    @shells_destroyed = Array.new

    # match = Match.find match_id

    # TODO: add tanks and run game

    channel = WebsocketRails["match.#{match_id}"]
    channel.make_private
    channel.trigger :start, {
      width: 800,
      height: 600,
      tanks: {
        YuChenBot: {
          color: "#DD1100",
          position: {
            x: rand(400),
            y: rand(600)
          }
        },
        DaveBot: {
          color: "#652FB5",
          position: {
            x: rand(400) + 400,
            y: rand(600)
          }
        }
      }
    }

    options = { width: 800, height: 600, max_ticks: 1200, gui: false, gc: true, replay_dir: 'replays', seed: Kernel.srand }
    runner = RTanque::Recorder.create_runner options
    runner.add_brain_path 'sample_bots/camper.rb:x2'

    runner.match.before_start = proc do |match|
    end

    runner.match.after_tick = proc do |match|
      bot_array = Array.new
      match.bots.each { |bot|
        bot_array.push name: bot.name, x: bot.position.x, y: bot.position.y, health: bot.health, heading: bot.heading.to_f,
                       turret_heading: bot.radar.heading.to_f, radar_heading: bot.turret.heading.to_f
      }

      @tick_data_array.push tick: match.ticks, tanks: bot_array, created: @shells_created, destroyed: @shells_destroyed

      if match.ticks % 5 == 4
        channel.trigger :batch, batch: @tick_data_array
        @tick_data_array = Array.new
      end
      @shells_created = Array.new
      @shells_destroyed = Array.new
    end

    runner.match.after_stop = proc do |match|
      channel.trigger :stop
    end

    runner.match.shell_created = proc do |shell|
      @shells_created.push id: shell.id, x: shell.position.x, y: shell.position.y, heading: shell.heading.to_f, speed: shell.fire_power
    end

    runner.match.shell_destroyed = proc do |shell|
      @shells_destroyed.push id: shell.id
    end

    runner.start false
  end
end
