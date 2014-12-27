class OntologiesController < ApplicationController
  skip_before_filter  :verify_authenticity_token
  
  def index
	@ontologies = Ontology.all
  end

  def show
	@ontology = Ontology.find(params[:id])
	childElementsID = HierarchicalStructure.where(ontology_id: params[:id]).distinct.pluck('element_id')
  parentElementsID = HierarchicalStructure.where(ontology_id: params[:id]).distinct.pluck('parent_element')
  elementsID = childElementsID | parentElementsID
	@elements = Element.find(elementsID)
  end

  #Сохранение новой онтологии
  def create
    #Создаем соотв. экземпляр модели
    new_onto = Ontology.create(ontology_name: params[:name])
    #Запоминаем новый айдишник (понадобится в дальнейшем)
    new_id = new_onto[:ontology_id]

    #Далее для всех необходимых моделей заменяем старый айдишник онтологии на новый и сохраняем

    if !params[:structure].nil?
      params[:structure].each do |struct|
        struct[:ontology_id] = new_id
        HierarchicalStructure.create(struct.permit(:element_weight, :level_id, :parent_element, :ontology_id, :element_id))
      end
    end

    if !params[:links].nil?
      params[:links].each do |link|
        link[:ontology_id] = new_id
        Link.create(link.permit(:element_id, :link_type, :linked_element_id, :ontology_id))
      end
    end

    if !params[:competences].nil?
      params[:competences].each do |comp|
        comp[:ontology_id] = new_id
        ElementToCompetence.create(comp.permit(:element_id, :competence_weight, :ontology_id, :competence_id))
      end
    end

    #Пока что сохраняю с признаками. В крайнем случае, можно будет просто потереть из БД
    if !params[:signs].nil?
      params[:signs].each do |sign|
        sign[:ontology_id] = new_id
        SignToElement.create(sign.permit(:element_id, :sign_rang, :ontology_id, :sign_id))
      end
    end

    #Возвращаем сообщение об успешном выполнении
    render text: "OK"
  end


  #Удаление онтологии
  def destroy
    #Впилю небольшую заглушку, чтобы нельзя было удалить исходные шесть онтологий
    if params[:id] <= '6'
      render text: "Данную онтологию нельзя удалить"
    end

    #Если все ОК,
    #Удаляем из всех таблиц строки с соотв. ontology_id
    Ontology.destroy_all(ontology_id: params[:id])
    HierarchicalStructure.destroy_all(ontology_id: params[:id])
    Link.destroy_all(ontology_id: params[:id])
    ElementToCompetence.destroy_all(ontology_id: params[:id])
    SignToElement.destroy_all(ontology_id: params[:id])

    #и возвращаемся на главную
    redirect_to ontologies_path
  end

  #Отправка онтологии (для show)
  def sendOntology
    ontology = {}
	  childElementsID = HierarchicalStructure.where(ontology_id: params[:id]).distinct.pluck('element_id')
    parentElementsID = HierarchicalStructure.where(ontology_id: params[:id]).distinct.pluck('parent_element')
    elementsID = childElementsID | parentElementsID
    ontology['elements'] = Element.find(elementsID)
	  ontology['structure']  = HierarchicalStructure.where(ontology_id: params[:id])
	  ontology['links'] = Link.where(ontology_id: params[:id])
	  ontology['competences'] = ElementToCompetence.where(ontology_id: params[:id])
	  ontology['signs'] = SignToElement.where(ontology_id: params[:id])
    render json: ontology
  end

end
