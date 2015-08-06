class AddReplayDataToMatch < ActiveRecord::Migration
  def change
    add_column :matches, :replay_data, :text
    add_column :matches, :test, :boolean, :null => false, :default => false
  end
end
