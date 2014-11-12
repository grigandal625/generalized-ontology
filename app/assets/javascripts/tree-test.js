/**
 * Created by Максим on 05.11.14.
 */
var ontology;

window.onload = function getOnto() {
    var ajax = getXmlHttp();
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                ontology = eval('(' + ajax.responseText + ')');
                paintTree();
            }
            else {
                alert('Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу');
            }
        }
    }
    ajax.open('GET','treeTest/7', true);
    ajax.send(null);
}

function createNode(elem){
    var node = document.createElement('li');
    node.className = 'Node';
    node.id = elem.element_id;

    var expand = document.createElement('div');
    expand.className = 'Expand';
    node.appendChild(expand);

    var content = document.createElement('div');
    content.className = 'Content';
    content.innerHTML = '(' + elem.element_id + ')' + ' ' + elem.element_name;
    node.appendChild(content);

    var container = document.createElement('ul');
    container.className = 'Container';
    node.container = container;
    node.appendChild(container);

    return node;
}

function paintTree() {
    var node;
    var origin = document.getElementsByClassName('Container')[0];
    origin.onclick = tree_toggle;

    for (var i = 0; i < ontology.elements.length; i++){
        node = createNode(ontology.elements[i]);
        node.root = true; node.leaf = true; node.last = true; //Кастомные св-ва для удобства
        origin.appendChild(node);
    }

    var child;
    var parent;

    for (var i = 0; i < ontology.structure.length; i++){
        child = document.getElementById(ontology.structure[i].element_id);
        parent = document.getElementById(ontology.structure[i].parent_element);

        child.root = false;
        parent.leaf = false;

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

}

function tree_toggle(event) {
    event = event || window.event
    var clickedElem = event.target || event.srcElement

    if (!hasClass(clickedElem, 'Expand')) {
        return // клик не там
    }

    // Node, на который кликнули
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