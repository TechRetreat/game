class AddDraftCodeToTanks < ActiveRecord::Migration
  def change
    add_column :tanks, :published_code, :text
  end
end
