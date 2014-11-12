class FillElementsToCompetences < ActiveRecord::Migration
  def up
    execute "INSERT INTO `elements_to_competences` VALUES (2,1,-1,1),(0,65,-1,2),(0,66,-1,3),(0,335,-1,3),(0,336,-1,3),(0,337,-1,3),(0,338,-1,2),(0,339,-1,2),(0,340,-1,0),(0,703,-1,0),(0,705,-1,0),(0,706,-1,1);"
  end

  def down
    execute "DELETE FROM 'elements_to_competences';"
  end
end
