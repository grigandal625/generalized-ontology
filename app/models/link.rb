class Link < ActiveRecord::Base
  self.table_name = "linked_elements"
  self.primary_keys = "element_id", "linked_element_id", "ontology_id"
end