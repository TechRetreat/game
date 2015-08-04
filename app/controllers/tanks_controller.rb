class TanksController < ApplicationController
  include AuthorizationHelper

  before_filter :authenticate_user!, except: [:index]
  before_action :set_tank, only: [:show, :edit, :update, :destroy, :upload_code]

  # GET /tanks
  # GET /tanks.json
  def index
    @tanks = Tank.all
    @title = 'Listing tanks'
  end

  # GET /tanks/1
  # GET /tanks/1.json
  def show
    @title = 'Showing tank'
  end

  # GET /tanks/new
  def new
    @tank = Tank.new
  end

  # GET /tanks/1/edit
  def edit
    id = params[:id]
    tank = Tank.find(id)
    unless user_can_edit current_user, tank
      render text: 'permission error'
    end
    @title = 'Editing ' + tank.name
  end

  # POST /tanks
  # POST /tanks.json
  def create
    @tank = Tank.new(tank_params)
    @tank.owner = current_user
    @title = 'Creating new tank'

    respond_to do |format|
      if @tank.save
        format.html { redirect_to @tank, notice: 'Tank was successfully created.' }
        format.json { render :show, status: :created, location: @tank }
      else
        format.html { render :new }
        format.json { render json: @tank.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /tanks/1
  # PATCH/PUT /tanks/1.json
  def update
    respond_to do |format|
      if @tank.update(tank_params)
        format.html { redirect_to @tank, notice: 'Tank was successfully updated.' }
        format.json { render :show, status: :ok, location: @tank }
      else
        format.html { render :edit }
        format.json { render json: @tank.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /tanks/1
  # DELETE /tanks/1.json
  def destroy
    if @tank.owner.nil? or !@tank.owner.id.equal? current_user.id
      render text: 'permission error'
    end
    @tank.destroy
    respond_to do |format|
      format.html { redirect_to tanks_url, notice: 'Tank was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_tank
      @tank = Tank.find(params[:id])
    end

    # Never trust parameters from the scary internet, only allow the white list through.
    def tank_params
      params.require(:tank).permit(:name, :code, :color)
    end
end
