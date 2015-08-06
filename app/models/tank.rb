require 'obscenity/active_model'

class Tank < ActiveRecord::Base
  belongs_to :owner, polymorphic: true

  has_one :forked_from, class_name: 'Tank'
  has_many :entries, class_name: 'Entry'
  has_many :matches, through: :entries

  validates :name, presence: true, obscenity: true
  validates_format_of :name, :with => /\A\w+\z/
  validates_format_of :color, :with => /\A#?([a-f\d]{3})|([a-f\d]{6})\z/i
end
