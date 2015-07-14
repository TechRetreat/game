class Match < ActiveRecord::Base
  has_many :entries, class_name: 'Entry'
  has_many :tanks, through: :entries
end
