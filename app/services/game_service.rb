require 'rtanque/runner'
require 'json'

class GameService
  attr_reader :ticks_since_send, :tick_batch_data_array

  @queue = :match_runner

  def self.perform(match_id)
    @ticks_since_send = 0
    @tick_batch_data_array = Array.new

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
      # TODO: batch ticks and send useful data
      channel.trigger :tick, tick: match.ticks

      @tick_batch_data_array.push ticks: match.ticks

      @ticks_since_send += 1
      if @ticks_since_send > 50
        tick_batch_data_json = @tick_batch_data_array.to_json
        channel.trigger :tick_batch, tick_batch: tick_batch_data_json
        @ticks_since_send = 0
        @tick_batch_data_array = Array.new
      end
    end

    runner.match.after_stop = proc do |match|
      channel.trigger :stop
    end

    runner.start false
  end
end
