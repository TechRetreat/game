require 'rtanque'
require 'rtanque/runner'

class SiteController < ApplicationController
  def index
    brain_paths = []
    options = { :width => 800, :height => 600, :max_ticks => 1200 , :gui => false, :gc => true , :replay_dir => 'replays' , :seed => Kernel.srand}

    game = GameService.new options
    # game.add_bot bot
    game.simulate

    puts 'generated game'
  end
end
