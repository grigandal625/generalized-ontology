class HierarchicalStructure < ActiveRecord::Base
  self.primary_keys = "element_id", "parent_element", "ontology_id"
end
