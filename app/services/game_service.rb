class GameService
  def initialize(options)
    @runner = RTanque::Recorder.create_runner(options)
  end

  def add_bot(bot, num_instances = 1)
    @runner.add_brain_code bot.code, num_instances
  end

  def simulate
    @runner.start(false)
  end
end
