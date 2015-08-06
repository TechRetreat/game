class AddDarkThemeToUsers < ActiveRecord::Migration
  def change
    add_column :users, :dark_theme, :boolean, :default => true
  end
end
