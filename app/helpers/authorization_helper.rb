module AuthorizationHelper
  def user_can_edit(user, resource)
    user == resource.owner # TODO: check if one of their teams has access
  end

  def user_can_view(user, resource)
    resource.public || user_can_edit(user, resource)
  end
end
