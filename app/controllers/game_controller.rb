class GameController
  attr_accessor :runner

  def initialize(options)
    @runner = RTanque::Recorder.create_runner(options)
  end

  def add_ai_list(brain_paths)
    brain_paths.each do |brain_path|
      begin
        @runner.add_brain_path(brain_path)
      rescue RTanque::Runner::LoadError => e
        say e.message, :red
        exit false
      end
    end
  end

  def simulate()
    @runner.start(false)
  end
end