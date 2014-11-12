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

ActiveRecord::Schema.define(version: 20140701185132) do

  create_table "competence_models", primary_key: "model_id", force: true do |t|
    t.string "model_name", null: false
  end

  add_index "competence_models", ["model_id"], name: "sqlite_autoindex_competence_models_1", unique: true

  create_table "competences", primary_key: "competence_id", force: true do |t|
    t.string "competence_name"
    t.string "competence_code",        null: false
    t.string "competence_description"
  end

  add_index "competences", ["competence_id"], name: "sqlite_autoindex_competences_1", unique: true

  create_table "elements", primary_key: "element_id", force: true do |t|
    t.string "element_name", null: false
    t.string "element_data"
  end

  add_index "elements", ["element_id"], name: "sqlite_autoindex_elements_1", unique: true

  create_table "elements_to_competences", primary_key: "element_id", force: true do |t|
    t.integer "competence_weight", limit: 11
    t.integer "ontology_id",       limit: 11, null: false
    t.integer "competence_id",     limit: 11, null: false
  end

  add_index "elements_to_competences", ["element_id", "ontology_id", "competence_id"], name: "sqlite_autoindex_elements_to_competences_1", unique: true

  create_table "hierarchical_structures", primary_key: "element_id", force: true do |t|
    t.integer "element_weight", limit: 11
    t.integer "level_id",       limit: 11
    t.integer "parent_element", limit: 11, null: false
    t.integer "ontology_id",    limit: 11, null: false
  end

  add_index "hierarchical_structures", ["element_id", "parent_element", "ontology_id"], name: "sqlite_autoindex_hierarchical_structures_1", unique: true

  create_table "hierarchy_of_competence_models", primary_key: "model_id", force: true do |t|
    t.integer "competence_id",       limit: 11, null: false
    t.integer "child_competence_id", limit: 11, null: false
  end

  add_index "hierarchy_of_competence_models", ["model_id", "competence_id", "child_competence_id"], name: "sqlite_autoindex_hierarchy_of_competence_models_1", unique: true

  create_table "linked_elements", primary_key: "element_id", force: true do |t|
    t.integer "link_type",         limit: 11, null: false
    t.integer "linked_element_id", limit: 11, null: false
    t.integer "ontology_id",       limit: 11, null: false
  end

  add_index "linked_elements", ["element_id", "linked_element_id", "ontology_id"], name: "sqlite_autoindex_linked_elements_1", unique: true

  create_table "ontologies", primary_key: "ontology_id", force: true do |t|
    t.string "ontology_name", null: false
  end

  create_table "signs", primary_key: "sign_id", force: true do |t|
    t.string "sign_name"
    t.string "sign_description"
  end

  add_index "signs", ["sign_id"], name: "sqlite_autoindex_signs_1", unique: true

  create_table "signs_to_elements", primary_key: "element_id", force: true do |t|
    t.integer "sign_rang",   limit: 11
    t.integer "ontology_id", limit: 11, null: false
    t.integer "sign_id",     limit: 11, null: false
  end

  add_index "signs_to_elements", ["element_id", "ontology_id", "sign_id"], name: "sqlite_autoindex_signs_to_elements_1", unique: true

end
