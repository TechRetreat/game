ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...
  FactoryGirl.define do
    factory :user do
      email { "fake@account.com" }
      password "password"
      password_confirmation "password"
      confirmed_at Date.today
      factory :admin do
          admin true
        end
    end
  end
end
