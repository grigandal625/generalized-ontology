/**
 * Created by Максим on 05.11.14.
 */

function BuildTreeList(sys, ontology) {
    var node;
    var origin = document.getElementsByClassName('Container')[0];

    //Удаляем все из контейнера для списка, если там что-то было до этого (в частности, при перерисовке списка)
    while (origin.firstChild) {
        origin.removeChild(origin.firstChild);
    }

    for (var i = 0; i < ontology.elements.length; i++){
        node = createNode(ontology.elements[i]);
        node.root = true; node.leaf = true; node.last = true; //Кастомные св-ва юзаются для удобства
        origin.appendChild(node);
    }

    var child;
    var parent;

    for (var i = 0; i < ontology.structure.length; i++){
        child = document.getElementById(ontology.structure[i].element_id);
        parent = document.getElementById(ontology.structure[i].parent_element);

        child.root = false;
        parent.leaf = false;
		
		//Если у узла-родителя есть потомок, то убираем у него флаг "последний"
        if(node = parent.container.lastChild){
            node.last = false;
        }

        parent.container.appendChild(child);
    }

    for (var i = 0; i < ontology.elements.length; i++){
        node = document.getElementById(ontology.elements[i].element_id);

        if (node.leaf) {
            node.className += ' ExpandLeaf';
        } else {
            node.className += ' ExpandClosed';
        }

        if (node.root) {
            node.className += ' IsRoot';
            node.style.backgroundImage = 'none'; //Переопределяем для красоты
        }

        if (node.last) {
            node.className += ' IsLast';
        }

        node.root = undefined; node.leaf = undefined; node.last = undefined; //Стираем кастомные св-ва
    }

    //После того, как древовидный список отрисован, инициализируем обработчик клика по элементам
    InitListClickHandler(sys);
}

function createNode(elem){
    var node = document.createElement('li');
    node.className = 'Node';
    node.id = elem.element_id;

    var expand = document.createElement('div');
    expand.className = 'Expand';
    expand.onclick = expandNode;
    node.appendChild(expand);

    var content = document.createElement('div');
    content.className = 'Content';
    content.innerHTML = /*'<div class = "listElement">*/'(' + elem.element_id + ')' + ' ' + elem.element_name/* + '</div>'*/;    //Вложенный div - костыль для совместимости со старыми стилями списков
    node.appendChild(content);

    //Экспериментирую с поиском по дереву
    node.content = content;
    node.SearchResult = SearchResult;

    //Экспериментирую с клик хендлерами
    content.classList.add("listElement");

    var container = document.createElement('ul');
    container.className = 'Container';
    node.container = container;
    node.appendChild(container);

    return node;
}


function expandNode(){
    var clickedElem = event.target;

    var node = clickedElem.parentNode
    if (hasClass(node, 'ExpandLeaf')) {
        return // клик на листе
    }

    // определить новый класс для узла
    var newClass = hasClass(node, 'ExpandOpen') ? 'ExpandClosed' : 'ExpandOpen'
    // заменить текущий класс на newClass
    // регексп находит отдельно стоящий open|close и меняет на newClass
    var re =  /(^|\s)(ExpandOpen|ExpandClosed)(\s|$)/
    node.className = node.className.replace(re, '$1'+newClass+'$3')
}


function hasClass(elem, className) {
    return new RegExp("(^|\\s)"+className+"(\\s|$)").test(elem.className)
}


function InitListClickHandler(sys) {
    var selectElement = function(event){
        var elem = event.target;
        var node = sys.getNode(elem.parentNode.id);

        if (!elem.classList.contains("selectedElement")) {
            elem.classList.add("selectedElement");
            node.data.isSelected = true;
        } else {
            elem.classList.remove("selectedElement");
            node.data.isSelected = false;
        }
    }

    //... и, собственно, прикручиваем его к ним
    var listElems = document.getElementsByClassName('listElement');
    for (var i = 0; i < listElems.length; i++) {
        listElems[i].onclick = selectElement;
    }
}





//Инициализация обработчика строки поиска по списку
function InitSearchFieldHandler() {
    var textField = document.getElementsByClassName("textField")[0];

    textField.onkeyup = function () {
        var input = this.value;

        var roots = document.getElementsByClassName("IsRoot");

        for (var i = 0; i < roots.length; i++) {
            roots[i].SearchResult(input);
        }
    }
}

//Собственно, функция поиска
function SearchResult(input) {
    var flag = false;

    for (var i = 0; i < this.container.children.length; i++) {
        flag = this.container.children[i].SearchResult(input) || flag;
    }

    if (this.content.innerHTML.toLowerCase().indexOf(input.toLowerCase()) >= 0 || flag) {
        this.style.display = "block";
        return true;
    }
    else {
        this.style.display = "none";
        return false;
    }
}