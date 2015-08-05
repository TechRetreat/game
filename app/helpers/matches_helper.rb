module MatchesHelper
  def user_owns_match(match)
    !match.owner.nil? and !current_user.nil? and match.owner.id.equal? current_user.id
  end
end
