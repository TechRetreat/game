ENV['RAILS_ENV'] ||= 'test'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Test Suite coverage check
  require 'coveralls'
  Coveralls.wear!

  # Add more helper methods to be used by all tests here...
  FactoryGirl.define do
    factory :user do
      email { "fake@account.com" }
      password "password"
      password_confirmation "password"
      confirmed_at Date.today
      username "user"
      factory :admin do
          admin true
          email { "admin@account.com" }
          username "admin"
        end
    end
  end
end
