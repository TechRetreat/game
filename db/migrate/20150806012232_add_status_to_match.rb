class AddStatusToMatch < ActiveRecord::Migration
  def change
    add_column :matches, :status, :string, :null => false, :default => "running"
  end
end
