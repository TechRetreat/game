class Match < ActiveRecord::Base
  belongs_to :owner, polymorphic: true

  has_many :entries, class_name: 'Entry'
  has_many :tanks, through: :entries

  validates :entries, length: { minimum: 2 }
end
