class ChangeUsernameUnique < ActiveRecord::Migration
  def change
    User.find_each do |user|
      user.username = user.email if user.username.nil? || user.username == ""
      user.save!
    end
    add_index :users, :username, :unique=>true
  end
end
