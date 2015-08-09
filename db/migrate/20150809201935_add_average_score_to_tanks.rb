class AddAverageScoreToTanks < ActiveRecord::Migration
  def change
    add_column :tanks, :average_score, :integer
  end
end
