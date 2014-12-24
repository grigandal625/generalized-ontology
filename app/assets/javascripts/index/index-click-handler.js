(function (){

var listElems = document.getElementsByClassName('listElement');
//Для каждого элемента списмка (т.е. для каждой онтологии)
for (var i = 0; i < listElems.length; i++) {
    //Добавляем соответствующий редирект по клику (а нельзя ли было обойтись обычной ссылкой во вьюхе?(
	listElems[i].onclick = function() {
		window.location.href = "/ontologies/" + this.id;
	}

    //Добавляем вызов менюшки по райт-клику
    listElems[i].oncontextmenu = function() {
        //Собственно, вызов менюшки
        ShowActionMenu(this.id);

        //Отменяем стандартный обработчик райт-клика
        return false;
    }
}

var ShowActionMenu = function(id) {
    //Находим менюшку по id
    var ActionMenu = document.getElementById('actionMenu');

    //Переносим ее под курсор
    ActionMenu.style.top = event.clientY + 'px';
    ActionMenu.style.left = event.clientX + 'px';
    //Отображаем
    ActionMenu.style.display = "block";

    //Переписываем ссылки в менюшке (пока что костыльно)
    var deleteLink = ActionMenu.children[0];
    deleteLink.href = "/ontologies/" + id;

    //Добавляем на весь документ обработчик клика, который:
    document.onclick = function() {
        //скрывает менюшку
        ActionMenu.style.display = "none";
        //и удаляется
        document.onclick = undefined;
    }
}
})()