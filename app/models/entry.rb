class Entry < ActiveRecord::Base
  belongs_to :robot
  belongs_to :match

  validates :robot, presence: true
  validates :match, presence: true
end
