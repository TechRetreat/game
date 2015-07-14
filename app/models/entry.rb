class Entry < ActiveRecord::Base
  belongs_to :tank
  belongs_to :match

  validates :tank, presence: true
  validates :match, presence: true
end
