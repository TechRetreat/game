require 'rtanque'
require 'rtanque/runner'

class SiteController < ApplicationController
  def index
    brain_paths = []
    options = { :width => 800, :height => 600, :max_ticks => 1200 , :gui => false, :gc => true , :replay_dir => 'replays' , :seed => Kernel.srand}

    game_ctrl = GameController.new(options)
    game_ctrl.add_ai_list(brain_paths)
    game_ctrl.simulate

  end
end
