require 'test_helper'

class TanksControllerTest < ActionController::TestCase
  include Devise::TestHelpers
  def setup
    @request.env["devise.mapping"] = Devise.mappings[:admin]
    admin = FactoryGirl.create(:admin)
    admin.confirm!
    sign_in admin
  end

  setup do
    @tank = tanks(:one)
    @public = tanks(:camper)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:tanks)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create tank" do
    assert_difference('Tank.count') do
      post :create, tank: { name: @tank.name }
    end

    assert_redirected_to edit_tank_url(assigns(:tank))
  end

  test "should show tank" do
    get :show, id: @tank
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @tank
    assert_response :success
  end

  test "should update tank" do
    patch :update, id: @tank, tank: { name: @tank.name }
    assert_redirected_to tank_path(assigns(:tank))
  end

  test "should destroy tank" do
    assert_difference('Tank.count', -1) do
      delete :destroy, id: @tank
    end

    assert_redirected_to tanks_path
  end

  test "should not destroy tank" do
    user = FactoryGirl.create(:user)
    user.confirm!
    sign_in user

    assert_difference('Tank.count', 0) do
      delete :destroy, id: @tank
    end
  end

  test "should not destroy public tank" do
    user = FactoryGirl.create(:user)
    user.confirm!
    sign_in user

    assert_difference('Tank.count', 0) do
      delete :destroy, id: @public
    end
  end
end
