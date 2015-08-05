module TanksHelper
  def user_owns_tank(tank)
    !tank.owner.nil? and !current_user.nil? and tank.owner.id.equal? current_user.id
  end
end
