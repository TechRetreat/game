class AddUsernameToUsersAndAdminNotDefault < ActiveRecord::Migration
  def change
    add_column :users, :username, :string, :default => ""
    change_column_default :users, :admin, false
  end
end
