# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20150806003327) do

  create_table "entries", force: :cascade do |t|
    t.integer  "tank_id"
    t.integer  "match_id"
    t.integer  "place"
    t.integer  "health",     default: 100
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.integer  "killed_at"
    t.integer  "killer_id"
  end

  add_index "entries", ["killer_id"], name: "index_entries_on_killer_id"
  add_index "entries", ["match_id"], name: "index_entries_on_match_id"
  add_index "entries", ["tank_id"], name: "index_entries_on_tank_id"

  create_table "matches", force: :cascade do |t|
    t.string   "name",                 default: "Unnamed Match"
    t.boolean  "public",               default: false
    t.datetime "created_at",                                     null: false
    t.datetime "updated_at",                                     null: false
    t.integer  "owner_id"
    t.string   "owner_type"
    t.integer  "max_ticks"
    t.integer  "seed",       limit: 8
    t.integer  "duration"
  end

  add_index "matches", ["owner_type", "owner_id"], name: "index_matches_on_owner_type_and_owner_id"

  create_table "tanks", force: :cascade do |t|
    t.string   "name"
    t.text     "code"
    t.integer  "owner_id"
    t.string   "owner_type"
    t.datetime "created_at",                         null: false
    t.datetime "updated_at",                         null: false
    t.boolean  "public"
    t.integer  "forked_from_id"
    t.string   "color",          default: "#BADA55"
  end

  add_index "tanks", ["forked_from_id"], name: "index_tanks_on_forked_from_id"
  add_index "tanks", ["owner_type", "owner_id"], name: "index_tanks_on_owner_type_and_owner_id"

  create_table "teams", force: :cascade do |t|
    t.string   "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "users", force: :cascade do |t|
    t.string   "email",                  default: "",    null: false
    t.string   "encrypted_password",     default: "",    null: false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          default: 0,     null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.string   "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string   "unconfirmed_email"
    t.integer  "failed_attempts",        default: 0,     null: false
    t.string   "unlock_token"
    t.datetime "locked_at"
    t.datetime "created_at",                             null: false
    t.datetime "updated_at",                             null: false
    t.boolean  "admin",                  default: false
    t.string   "username"
  end

  add_index "users", ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
  add_index "users", ["email"], name: "index_users_on_email", unique: true
  add_index "users", ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  add_index "users", ["unlock_token"], name: "index_users_on_unlock_token", unique: true
  add_index "users", ["username"], name: "index_users_on_username", unique: true

end
