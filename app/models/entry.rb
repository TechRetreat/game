class Entry < ActiveRecord::Base
  belongs_to :tank
  belongs_to :match
  belongs_to :killer, class_name: 'Entry'

  has_many :kills, class_name: 'Entry', foreign_key: 'killer_id'

  validates :tank, presence: true
  validates :match, presence: true
end
