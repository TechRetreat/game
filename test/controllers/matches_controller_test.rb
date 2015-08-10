require 'test_helper'

class MatchesControllerTest < ActionController::TestCase
  include Devise::TestHelpers

  def setup
    @request.env["devise.mapping"] = Devise.mappings[:admin]
    user = FactoryGirl.create(:admin)
    user.confirm!
    sign_in user
  end

  setup do
    @match = matches(:one)
    port = `lsof -p #{Process.pid} -ai TCP -as TCP:LISTEN -Fn | grep ^n | cut -c 4- | uniq`.strip
    @request.env['HTTP_REFERER'] = 'localhost:' + port
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:matches)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create match" do
    assert_difference('Match.count') do
      post :create, match: {:tanks => Tank.where(owner: nil, public: true), :test =>true}
    end

    assert_redirected_to match_path(assigns(:match))
  end

  test "should show match" do
    get :show, id: @match
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @match
    assert_response :success
  end

  test "should update match" do
    patch :update, id: @match, match: {  }
    assert_redirected_to match_path(assigns(:match))
  end

  test "should destroy match" do
    assert_difference('Match.count', -1) do
      delete :destroy, id: @match
    end

    assert_redirected_to matches_path
  end
end
