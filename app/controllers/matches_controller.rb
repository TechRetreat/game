class MatchesController < ApplicationController
  include AuthorizationHelper

  before_filter :authenticate_user!, except: [:index]
  before_filter :set_match, only: [:show, :edit, :update, :destroy]
  before_filter :check_permissions, only: [:show, :edit, :update, :destroy]

  # GET /matches
  # GET /matches.json
  def index
    @matches = Match.order(:name).page(params[:page]).per(10000)
  end

  # GET /matches/1
  # GET /matches/1.json
  def show
  end

  # GET /matches/new
  def new
    @match = Match.new
    if current_user.admin?
      @tanks = Tank.all
    else
      @tanks = Tank.where "public = ? OR (owner_type = 'User' AND owner_id = ?)", true, current_user.id
    end
  end

  # GET /matches/1/edit
  def edit
  end

  # POST /matches
  # POST /matches.json
  def create
    @match = Match.new(match_params)
    @match.owner = current_user
    @match.test = params[:match][:test] || false;

    params[:match][:tanks].each do |tank_id|
      unless tank_id.empty? # get around strange rails thing with multi selects
        tank = Tank.find tank_id
        if tank.public || user_can_view(current_user, tank) || current_user.admin?
          @match.tanks << tank
        end
      end
    end

    respond_to do |format|
      if @match.save

        # check if the user has a currently running match
        current_match_id = $user_matches.get(current_user.id)

        unless current_match_id.nil?
          # if yes kill it
          Resque::Plugins::Status::Hash.kill(current_match_id)
          puts 'killed match uuid: ' + current_match_id
        end

        job_id = GameService.create(match_id:@match.id)
        status = Resque::Plugins::Status::Hash.get(job_id)

        $user_matches.set(current_user.id, status['uuid'])

        puts 'saved match uuid: ' + status['uuid'] + ' to user ' + current_user.id.to_s

        format.html { redirect_to @match, notice: 'Match was successfully created and queued.' }
        format.json { render :show, status: :created, location: @match }
      else
        format.html { render :new }
        format.json { render json: @match.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /matches/1
  # PATCH/PUT /matches/1.json
  # def update
  #  respond_to do |format|
  #    if @match.update(match_params)
  #      format.html { redirect_to @match, notice: 'Match was successfully updated.' }
  #      format.json { render :show, status: :ok, location: @match }
  #    else
  #      format.html { render :edit }
  #      format.json { render json: @match.errors, status: :unprocessable_entity }
  #    end
  #  end
  # end

  # DELETE /matches/1
  # DELETE /matches/1.json
  def destroy
    @match.destroy
    respond_to do |format|
      format.html { redirect_to matches_url, notice: 'Match was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_match
      @match = Match.find params[:id]
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def match_params
      param_list = [:name, :public]
      param_list << :max_ticks if current_user.admin?
      params[:match].permit param_list if params[:match]
    end

    def check_permissions
      unless @match.public or user_can_view(current_user, @match) or current_user.admin?
        respond_to do |format|
          format.html { redirect_to :back, notice: 'You are not allowed to do that.' }
          format.json { render json: { error: 'You are not allowed to do that.' }, status: :forbidden }
        end
      end
    end
end
