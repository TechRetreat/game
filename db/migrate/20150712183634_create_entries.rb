class CreateEntries < ActiveRecord::Migration
  def change
    create_table :entries do |t|
      t.references :robot, index: true, foreign_key: true
      t.references :match, index: true, foreign_key: true
      t.integer :place
      t.integer :health

      t.timestamps null: false
    end
  end
end
