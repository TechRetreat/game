class MatchesController < ApplicationController
  def index
    Resque.enqueue GameService, 123
    render json: {}
  end
end
