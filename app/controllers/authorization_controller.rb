class AuthorizationController < WebsocketRails::BaseController
  def authorize_public
    WebsocketRails[message['channel']].make_private
  end

  def authorize_private
    if user_signed_in?
      # TODO: check if they have permission to view the match
      accept_channel
    else
      deny_channel message: 'You must be logged in.'
    end
  end
end
