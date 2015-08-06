class ChangeMatchSeedLimit < ActiveRecord::Migration
  def change
    change_column :matches, :seed, :integer, :limit => 8
  end
end
