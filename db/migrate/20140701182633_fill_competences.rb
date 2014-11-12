class FillCompetences < ActiveRecord::Migration
  def up
    execute "INSERT INTO `competences` VALUES (1,'Способность демонстрации общенаучных базовых знаний естественных наук, математики и информатики, понимание основных фактов, концепций, принципов теорий, связанных с прикладной математикой и информатикой','ПК-1','Научная и научно-исследовательская компетенция'),(2,'Способность приобретать новые научные и профессиональные знания, используя современные образовательные и информационные технологии','ПК-2','Научная и научно-исследовательская компетенция'),(3,'Способность понимать и применять в исследовательской и прикладной деятельности современный математический аппарат','ПК-3','Научная и научно-исследовательская компетенция'),(4,'Способность в составе научно-исследовательского и производственного коллектива решать задачи профессиональной деятельности','ПК-4','Научная и научно-исследовательская компетенция'),(5,'Способность критически переосмысоивать накопленный опыт, изменять при необходимости вид и характер своей профессиональной деятельности','ПК-5','Научная и научно-исследовательская компетенция'),(6,'Способность осуществлять целенаправленный поиск информации о новейших научных и технологических достижениях в сети Интернет и из других источников','ПК-6','Проектная и производственно-технологическая деятельность'),(7,'Способность собирать, обрабатывать и интерпретировать данные современных научных исследований,  необходимые для формирования выводов по соответсвующим научным, профессиональным, социальны и этическим проблемам','ПК-7','Проектная и производственно-технологическая деятельность'),(8,'Способность формировать суждения о значени и последствиях своей профессиональной деятельности с учетом социальных, профессиональных и этических позиций','ПК-8','Проектная и производственно-технологическая деятельность'),(9,'Способность решать задачи производственной и технологической деятельности на профессиональном уровне, включая: разработку алгоритмических и программных решений в области системного и прикладного программирования','ПК-9','Проектная и производственно-технологическая деятельность'),(10,'Способность применять в профессиональной деятельности современные языки программирования и языки баз данных, операционные системы, электронные документы и пакеты программ, сетевые технологии','ПК-10','Проектная и производственно-технологическая деятельность'),(11,'','',''),(12,'Способностью организовывать процессы корпоративного обучения на основе технологий электронного и мобильного обучения и развития корпоративных баз знаний','ПК-6',''),(13,'Способностью разрабатывать учебно-методические комплексы для электронного и мобильного обучения','ПК-9',''),(14,'Способность реализации решений, направленных на поддержку социально-значимых проектов, на повышение электронной грамотности населения, обеспечения общедоступности информационных услуг','ПК-14','');"
  end

  def down
    execute "DELETE FROM 'competences';"
  end
end
