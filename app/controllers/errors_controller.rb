class ErrorsController < ApplicationController
  def show
    render :error, :status => status_code
  end

  protected

  def status_code
    params[:code] || 500
  end

end
