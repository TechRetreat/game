class MakeOldRunningMatchesTests < ActiveRecord::Migration
  def change
    Match.find_each do |match|
      match.test = true if match.status == "running"
      match.save!
    end
  end
end
