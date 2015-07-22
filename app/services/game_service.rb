require 'rtanque/runner'

class GameService
  @queue = :match_runner

  def self.perform(match_id)
    # match = Match.find match_id

    # TODO: add tanks and run game

    channel = WebsocketRails["match.#{match_id}"]
    channel.make_private
    channel.trigger :start

    options = { width: 800, height: 600, max_ticks: 1200, gui: false, gc: true, replay_dir: 'replays', seed: Kernel.srand }
    runner = RTanque::Recorder.create_runner options
    runner.add_brain_path 'sample_bots/camper.rb:x2'

    runner.match.before_start = proc do |match|
      channel.trigger :start
    end

    runner.match.after_tick = proc do |match|
      # TODO: batch ticks and send useful data
      channel.trigger :tick, tick: match.ticks
    end

    runner.match.after_stop = proc do |match|
      channel.trigger :stop
    end

    runner.start false
  end
end
