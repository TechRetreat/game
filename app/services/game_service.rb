class GameService
  @queue = :match_runner

  def self.perform(match_id)
    # match = Match.find match_id

    # TODO: add tanks and run game

    channel = WebsocketRails["match.#{match_id}"]
    channel.make_private
    channel.trigger :start
  end
end
