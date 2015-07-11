require 'rtanque'
require 'rtanque/runner'

class SiteController < ApplicationController
  def index
    brain_paths = []
    options = { :width => 800, :height => 600, :max_ticks => 1200 , :gui => false, :gc => true , :replay_dir => 'replays' , :seed => Kernel.srand}
    runner = RTanque::Recorder.create_runner(options)
    brain_paths.each do |brain_path|
      begin
        runner.add_brain_path(brain_path)
      rescue RTanque::Runner::LoadError => e
        say e.message, :red
        exit false
      end
    end
    runner.start(false)
  end
end
