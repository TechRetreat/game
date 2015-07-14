class AddPublicAndForkedFromToTanks < ActiveRecord::Migration
  def change
    add_column :tanks, :public, :boolean
    add_reference :tanks, :forked_from, index: true, foreign_key: true
  end
end
