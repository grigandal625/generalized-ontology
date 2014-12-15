class ElementToCompetence < ActiveRecord::Base
  self.table_name = "elements_to_competences"
  self.primary_keys = "element_id", "ontology_id", "competence_id"
end