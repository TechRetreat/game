class Match < ActiveRecord::Base
  has_many :entries, class_name: 'Entry'
  has_many :robots, through: :entries
end
