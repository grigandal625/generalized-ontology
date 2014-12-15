class SignToElement < ActiveRecord::Base
  self.table_name = "signs_to_elements"
  self.primary_keys = "element_id", "ontology_id", "sign_id"
end