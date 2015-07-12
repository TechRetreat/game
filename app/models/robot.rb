class Robot < ActiveRecord::Base
  belongs_to :owner, polymorphic: true

  has_many :entries, class_name: 'Entry'
  has_many :matches, through: :entries

  validates :name, presence: true
end
