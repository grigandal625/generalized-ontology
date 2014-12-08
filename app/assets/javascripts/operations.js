/**
 * Created by Максим on 08.12.14.
 */
var CutBtn = document.getElementById("CutBtn");
CutBtn.onclick = function() {
    var selectedElems = getSelectedElements();
    cutElements(selectedElems);
    CorrectParticleSystemContent();
    //Ооооочень забавное дело. Судя по всему, узлы добавляются в систему асинхронно, потому что
    //если оставить один узел и кликнуть отмену, счетчик насчитает только один узел и не изменит параметры. При этом если эти же операции вызвать вручную, все сработает нормально.
    //Поэтому юзаем такой костыль:
    setTimeout("CorrectParticleSystemParameters()", 50);
}

var UndoBtn = document.getElementById("UndoBtn");
UndoBtn.onclick = function() {
    OntologyRollback();
    CorrectParticleSystemContent();
    //Ооооочень забавное дело. Судя по всему, узлы добавляются в систему асинхронно, потому что
    //если оставить один узел и кликнуть отмену, счетчик насчитает только один узел и не изменит параметры. При этом если эти же операции вызвать вручную, все сработает нормально.
    //Поэтому юзаем такой костыль:
    setTimeout("CorrectParticleSystemParameters()", 50);
}


function getSelectedElements(){
    var selectedElements = [];

    sys.eachNode(function(node, pt){
        if (node.data.isSelected){
            selectedElements.push(node.name);   //Хз, числа или строки пихать. В particleSystem имена - строки, в ontology - числа
        }
    });

    return selectedElements;
}

//Не мешало бы как-нибудь поинтереснее оптимизировать эту функцию.
function cutElements(elementsToCut) {    //Удостовериться в корректности !!!
    tmpOntology = JSON.parse(JSON.stringify(ontology));  //Бэкапим исходную онтологию                !!!Не забыть поменять ontology_id во всех массивах!!!
    for (var i = 0; i < elementsToCut.length; i++) {
        deleteElement(elementsToCut[i]);
    }

    for (keys in ontology) {
        flatten(ontology[keys]);
    }

    if (ontology.elements.length > 0) {
        //Добавить проверку на связность    *Онтологии пока не построены до конца, имеет ли смысл?
        return true;
    }
    else {
        ontology = null;
    }
}

function deleteElement(id) {
    for (var i = 0; i < ontology.elements.length; i++) {
        if (ontology.elements[i] != null && ontology.elements[i].element_id == id) {
            ontology.elements[i] = null;//Удалить элемент из списка
            break;
        }
    }
    if (i == ontology.elements.length) {return} //В случае, если элемент не был найден, продолжать выполнение функции бессмысленно


    for (var i = 0; i < ontology.structure.length; i++) {
        /*if (ontology.structure[i].parent_element == id) {
         deleteElement(ontology.structure[i].element_id);
         }*/
        if (ontology.structure[i] != null && ontology.structure[i].element_id == id) {
            ontology.structure[i] = null;
            break; //Можно добавить break, потому что в иерархической структуре каждый элемент встречается единожды
        }
    }


    for (var i = 0; i < ontology.links.length; i++) {
        if (ontology.links[i] != null && (ontology.links[i].element_id == id || ontology.links[i].linked_element_id == id)) {
            ontology.links[i] = null;
        }
    }


    for (var i = 0; i < ontology.competences.length; i++) {
        if (ontology.competences[i] != null && ontology.competences[i].element_id == id) {
            ontology.competences[i] = null;
        }
    }


    for (var i = 0; i < ontology.signs.length; i++) {
        if (ontology.signs[i] != null && ontology.signs[i].element_id == id) {
            ontology.signs[i] = null;
        }
    }


    //Ищем, есть ли потомки у данного элемента
    for (var i = 0; i < ontology.structure.length; i++) {
        if (ontology.structure[i] != null && ontology.structure[i].parent_element == id) { //Косяк!!!! Массив в процессе рекурсивного вызова сплющивается (вроде исправил)
            deleteElement(ontology.structure[i].element_id);
        }
    }
    //Не забыть прописать "сплющивание" массивов - удаление null'ов
}


//Функция "сплющивания" массива: удаляет все null-элементы, сдвигая последующие на пустое место
function flatten(array) {
    var i = 0;
    while (array[i] !== undefined) {
        if (array[i] == null) {
            array.splice(i,1);
        }
        else {
            i++;
        }
    }
}

function OntologyRollback() {
    if (tmpOntology !== undefined){
        ontology = tmpOntology;
        tmpOntology = undefined;
    }
}

function CorrectParticleSystemContent () { //Нужно обратить внимание на тип идентификаторов - число или строка
    //Сначала удаляем из графа то, чего нет в онтологии
    sys.eachNode(function(node, pt){
        for (var i = 0; i < ontology.elements.length; i++){
            if (node.name == ontology.elements[i].element_id) {
                return; //Если узел нашелся, прекращаем выполнение
            }
        }

        sys.pruneNode(node);
    });

    //Затем добавляем то, чего в нем не хватает
    for (var i = 0; i < ontology.elements.length; i++){
        if (!sys.getNode(ontology.elements[i].element_id)){ //Если узла нет
            sys.addNode(ontology.elements[i].element_id, {isSelected:false, areLinksShown:false});
        }
    }

    for (var i = 0; i < ontology.structure.length; i++){
        if (sys.getEdges('' + ontology.structure[i].parent_element, '' + ontology.structure[i].element_id).length == 0) {    //Нужно обратить внимание на то, что является соусом, а что таргетом
            sys.addEdge(ontology.structure[i].parent_element, ontology.structure[i].element_id);
        }
    }
}

function CorrectParticleSystemParameters () {
    //Регулировка натяжения: если есть хоть одна веорщина с areLinksShown = true - stiffness в ноль
    var linksAreDisplayed;
    var nodeCount = 0;

    sys.eachNode(function(node, pt){
        nodeCount++;
        if (node.data.areLinksShown){
            linksAreDisplayed = true;
        }
    });

    //Регулировка натяжения: если есть хоть одна веорщина с areLinksShown = true - stiffness в ноль
    if (linksAreDisplayed){
        sys.parameters({stiffness: 0});
    } else {
        sys.parameters({stiffness: 600});
    }

    //Регулировка отталкивания: если в системе только одна вершина - занулить отталкивание
    if (nodeCount > 1) {
        sys.parameters({repulsion: 1000});
    } else {
        sys.parameters({repulsion: 0});
    }
}

