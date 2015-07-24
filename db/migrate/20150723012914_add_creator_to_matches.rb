class AddCreatorToMatches < ActiveRecord::Migration
  def change
    add_reference :matches, :owner, polymorphic: true, index: true
  end
end
