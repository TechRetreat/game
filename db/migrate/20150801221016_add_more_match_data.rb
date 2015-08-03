class AddMoreMatchData < ActiveRecord::Migration
  def change
    add_column :entries, :killed_at, :integer
    add_reference :entries, :killer, index: true

    add_column :matches, :max_ticks, :integer
    add_column :matches, :seed, :integer, limit: 8
    add_column :matches, :duration, :integer
  end
end
