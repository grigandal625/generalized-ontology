class HierarchyOfCompetences < ActiveRecord::Base
  self.table_name = "hierarchy_of_competence_models"
  self.primary_keys = "model_id", "competence_id", "child_competence_id"
end