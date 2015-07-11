class Robot < ActiveRecord::Base
  has_and_belongs_to_many :user
  has_one :name
  has_one :creation_date
  has_one :code
  has_one :tank_style
  has_one :score
end