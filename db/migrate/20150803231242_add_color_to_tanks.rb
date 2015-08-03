class AddColorToTanks < ActiveRecord::Migration
  def change
    add_column :tanks, :color, :string, default: '#BADA55'
  end
end
