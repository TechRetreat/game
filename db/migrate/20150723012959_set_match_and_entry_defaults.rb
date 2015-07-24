class SetMatchAndEntryDefaults < ActiveRecord::Migration
  def change
    change_column_default :matches, :name, 'Unnamed Match'

    change_column_default :entries, :health, 100
  end
end
