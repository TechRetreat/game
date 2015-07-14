class RenameRobotToTank < ActiveRecord::Migration
  def change
    rename_table :robots, :tanks

    rename_column :entries, :robot_id, :tank_id
  end
end
