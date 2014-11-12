class FillOntologies < ActiveRecord::Migration
  def up
    execute "INSERT INTO `ontologies` VALUES (1,'Борьба самбо'),(2,'Интеллектуальные диалоговые системы'),(3,'Базы данных и экспертные системы (введение в интеллектуальные системы)'),(4,'Функциональное программирование'),(5,'Проектирование кибернетических систем, основанных на знаниях'),(6,'Динамические интеллектуальные системы');"
  end

  def down
    execute "DELETE FROM 'ontologies';"
  end
end
