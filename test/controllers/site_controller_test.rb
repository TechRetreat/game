require 'test_helper'

class SiteControllerTest < ActionController::TestCase include Devise::TestHelpers
  def setup
    @request.env["devise.mapping"] = Devise.mappings[:admin]
    user = FactoryGirl.create(:admin)
    user.confirm!
    sign_in user
  end

  test "should get index" do
    get :index
    assert_response :success
  end

end
