require 'obscenity/active_model'

class Tank < ActiveRecord::Base
  belongs_to :owner, polymorphic: true

  has_one :forked_from, class_name: 'Tank'
  has_many :entries, class_name: 'Entry'
  has_many :matches, through: :entries

  validates :name, presence: true, obscenity: true
  validates_format_of :name, with: /\A\w+\z/
  validates_format_of :color, with: /\A#?([a-f\d]{3})|([a-f\d]{6})\z/i

  scope :mine, -> (user) { where owner: user }

  def update_averages
    sum = 0
    total = 0

    entries.joins(:match).where('score IS NOT NULL').where(matches: { public: true }).order(created_at: 'DESC').limit(10).each do |entry|
      total += 1
      sum += entry.score
    end

    update_attributes average_score: sum / total if total > 0
  end

  def owner_name
    if owner
      if owner.username
        owner.username
      else
        'Anonymous'
      end
    else
      'Sample'
    end
  end
end
