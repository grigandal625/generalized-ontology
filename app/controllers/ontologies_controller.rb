class OntologiesController < ApplicationController
  skip_before_filter  :verify_authenticity_token
  
  def index
	@ontologies = Ontology.all
  end

  def test

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
    #Удаляем из всех таблиц строки с соотв. ontology_id
    Ontology.destroy_all(ontology_id: params[:id])
    HierarchicalStructure.destroy_all(ontology_id: params[:id])
    Link.destroy_all(ontology_id: params[:id])
    ElementToCompetence.destroy_all(ontology_id: params[:id])
    SignToElement.destroy_all(ontology_id: params[:id])

    #и возвращаемся на главную
    redirect_to ontologies_path
  end
  
  def mainMenu
  #render text: "OK"
  end
  
  def sendList
    a = Ontology.all
    render json: a
  end

  #def sendElements
    #childElementsID = HierarchicalStructure.where(ontology_id: params[:id]).distinct.pluck('element_id')
    #parentElementsID = HierarchicalStructure.where(ontology_id: params[:id]).distinct.pluck('parent_element')
    #elementsID = childElementsID | parentElementsID
    #elementsList = Element.find(elementsID)
    #render json: elementsList
  #end
  
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


  def saveOntology
    new_onto = Ontology.create(ontology_name: params[:name])
    new_id = new_onto[:ontology_id]

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

    if !params[:signs].nil?
      params[:signs].each do |sign|
        sign[:ontology_id] = new_id
        SignToElement.create(sign.permit(:element_id, :sign_rang, :ontology_id, :sign_id))
      end
    end

    render json: new_onto #Отправляем обратно новую онтологию, чтобы не перезагружать весь список
  end



  def firstDebugging
    onto = Ontology.find_by(ontology_id: 7)
    onto.destroy

    struct = HierarchicalStructure.where(ontology_id: 7)
    struct.delete_all

    links = Link.where(ontology_id: 7)
    links.delete_all

    comps = ElementToCompetence.where(ontology_id: 7)
    comps.delete_all

    signs = SignToElement.where(ontology_id: 7)
    signs.delete_all

    render text: "OK"
  end

  def secDebugging
    data = Ontology.all
    #data = HierarchicalStructure.where(ontology_id: 7)
    #data = Link.where(ontology_id: 7)
    #data = ElementToCompetence.where(ontology_id: 7)
    #data = SignToElement.where(ontology_id: 7)
    render json: data
  end
  
  
  def paintOnto
  end
end
