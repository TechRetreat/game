class Team < ActiveRecord::Base
  validates :name, presence: true
end
