var ontology;
var sys;

window.onload = function getOnto() {
	var ajax = getXmlHttp();
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                ontology = eval('(' + ajax.responseText + ')');
                paintTree();    //Порядок важен.
                paintOnto();    //В этом скрипте задается обработчик кликов по элементам, создаваемым функцией painTree скрипта tree-script.js. По-хорошему скрипты нужно объединить, чтобы инкапсулировать весь функционал.
            }
            else {
                alert('Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу');
            }
        }
    }
    ajax.open('GET', window.location.href + '/get', true);
    ajax.send(null);
}

function paintOnto() {

	var Renderer = function(){
		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.width = canvas.offsetWidth;	// !!! для canvas всегда нужно задавать параметры canvas.height и canvas.width, иначе будут проблемы с масштабом
		canvas.height = canvas.offsetHeight;
		var ctx = canvas.getContext("2d");
		var particleSystem;

		var that = {
			init:function(system){
				particleSystem = system

				particleSystem.screenSize(canvas.offsetWidth, canvas.offsetHeight); 
				particleSystem.screenPadding(80);

				that.initMouseHandling()
			},
      
			redraw:function(){
				ctx.fillStyle = "white"
				ctx.fillRect(0,0, canvas.offsetWidth, canvas.offsetHeight)
        
				particleSystem.eachEdge(function(edge, pt1, pt2){
					switch (edge.data.type) {
						case undefined:
							ctx.strokeStyle = "black";
							break;
						case 0:
							ctx.strokeStyle = "red";
							break;
						case 1:
							ctx.strokeStyle = "yellow";
							break;
						case 2: 
							ctx.strokeStyle = "green";
							break;
					}	

					ctx.lineWidth = 1
					ctx.beginPath()
					ctx.moveTo(pt1.x, pt1.y)
					ctx.lineTo(pt2.x, pt2.y)
					ctx.stroke()
				})

				particleSystem.eachNode(function(node, pt){
					var w = ctx.measureText(node.name).width;
					//ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w); - оригинальный код из демо
					ctx.clearRect(pt.x-w/2, pt.y-7, w,14);
					//ctx.rect(pt.x-w/2, pt.y-7, w,14); - сделать рамку
					//ctx.stroke();
					ctx.font = "bold 11px Arial";
					ctx.textAlign = "center";
					ctx.fillStyle = "#888888";
					ctx.fillText(node.name, pt.x, pt.y + 4);
				})    			
			},

			initMouseHandling:function(){
				var dragged = null;
				//var selected = null;


				var handler = {
                    //Писал контекст меня на райтклик для редактирования онтологии
					/*rightclicked:function(e){
						var pos = $(canvas).offset();
						_mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top);
						selected = particleSystem.nearest(_mouseP);
			  
						var menu = createEditionMenu(canvas);
			  
						var theAddButton = menu.children[0];
						theAddButton.onclick = function () {
							var childID = prompt("Введите id дочернего элемента");
							sys.addEdge(selected.node, childID);
							//Потребуется множество проверок на добавление: есть ли элемент в данной онтологии, есть ли данный элемент вообще.
						}
			  
						var cutNodeRecursively = function(nodeObject) {
							var edgesFrom = sys.getEdgesFrom(nodeObject);
							for (var i = 0; i < edgesFrom.length; i++) {
								cutNodeRecursively(edgesFrom[i].target);
							}
							sys.pruneNode(nodeObject);
						};
			  
						var theDeleteButton = menu.children[1];
						theDeleteButton.onclick = function () {
							if (confirm("Вы точно хотите удалить данный элемент?")){
								resultOntology = ontology;
								deleteElement(selected.node.name);
								flatten(resultOntology.elements);         //Весь этот блок сделан для демонстрации "на коленке" (resultOntology указывает теперь на ontology)
								flatten(resultOntology.structure);
								document.body.removeChild(canvas);
								paintOnto();
								//sys.pruneNode(selected.node.name); //Запилить рекурсивное удаление вершин
								//var edgesFrom = sys.getEdgesFrom(selected.node.name);
								//for (var i = 0; i < edgesFrom.length; i++) {
									//sys.pruneNode(edgesFrom[i].target);
								//}
								cutNodeRecursively(selected.node);
							}
						}
						return false;
					},*/
		  
					clicked:function(e){
						var pos = $(canvas).offset();
						_mouseP = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)
						dragged = particleSystem.nearest(_mouseP);

						if (dragged && dragged.node !== null){
							dragged.node.fixed = true
						}

						$(canvas).bind('mousemove', handler.dragged)
						$(window).bind('mouseup', handler.dropped)

						return false
					},
				
					dragged:function(e){
						var pos = $(canvas).offset();
						var s = arbor.Point(e.pageX-pos.left, e.pageY-pos.top)

						if (dragged && dragged.node !== null){
							var p = particleSystem.fromScreen(s)
							dragged.node.p = p
						}

						return false
					},

					dropped:function(e){
						if (dragged===null || dragged.node===undefined) return
						if (dragged.node !== null) dragged.node.fixed = false
						dragged.node.tempMass = 1000
						dragged = null
						$(canvas).unbind('mousemove', handler.dragged)
						$(window).unbind('mouseup', handler.dropped)
						_mouseP = null
						return false
					}
				}

				$(canvas).mousedown(handler.clicked);
				//$(canvas).contextmenu(handler.rightclicked);
			}
      
		}
		return that
	}    


    /*для дебага делаю переменную глобальной*/
    sys = arbor.ParticleSystem(1000, 600, 0.5, true)
    sys.renderer = Renderer();


    //--- Первый вариант визуализации ---
    //--- При загрузке онтология не визуализируется. ---
    //--- При выделении элемента в списке он отображается в canvas ---
    //--- как с иерархическими, так и с логическими связями ---

    //--- Проблема: при ненулевом значении repulsion физика слетает, если отобразить что-либо еще, когда на экране один единственный узел ---
    //--- Возможное решение: при добавлении к одиночному узлу задавать repulsion = 0; Если узел не один - repulsion = 1000; ---

	/*isDisplayed = function(id) {
		if (sys.getNode(id)){
			return true;
		} else {
			return false;
		}
	}

	checkAlone = function(){
		var i = 0;
		sys.eachNode(function(node, pt){
			i++;
		});
		if (i == 1) {
			return true;
		}
	}

	showNode = function(id) {

		if (checkAlone()){
			sys.parameters({repulsion: 0});
		} else {
            sys.parameters({repulsion: 1000});
        }

		sys.addNode(id);

		for (var i = 0; i < ontology.structure.length; i++) {
			if ((ontology.structure[i].parent_element == id && isDisplayed(ontology.structure[i].element_id)) ||
			    (ontology.structure[i].element_id == id && isDisplayed(ontology.structure[i].parent_element))){
				sys.addEdge('' + ontology.structure[i].parent_element, '' + ontology.structure[i].element_id);
			}
		}
		
		for (var i = 0; i < ontology.links.length; i++) {
			if ((ontology.links[i].element_id == id && isDisplayed(ontology.links[i].linked_element_id))||
			    (ontology.links[i].linked_element_id == id && isDisplayed(ontology.links[i].element_id == id))) {
				sys.addEdge('' + ontology.links[i].element_id, '' + ontology.links[i].linked_element_id, {length: .1000, type: ontology.links[i].link_type});
			}
		}
	}
	
	hideNode = function (id) {
		sys.pruneNode(id);
	}

     selectElement = function(event){
        var elem = event.target;
        if (elem.className == "listElement") {
            elem.className = elem.className +" selectedElement";
            showNode(elem.id);
        } else {
            elem.className = "listElement";
            hideNode(elem.id);
        }
     }*/


    // --- Второй вариант визуализации (предпочтительнее) ---
    // --- При загрузке отображается иерархическая структура онтологии ---
    // --- При выделении элемента в списке в canvas отображаются его логические связи ---

    // --- Проблема: из-за большого количества связей при ненулевом значении stiffness слетает вся физика ---
    // --- Решение: если выделен хоть один элемент, задавать stiffness = 0 ---

    //По идее, нужно отображать только исходящие дуги. В ином случае использовать функцию: isSelected = function(node){var id = node.name; var selectedElems = document.getElementsByClassName('selectedElement'); for (var i = 0; i < selectedElems.length; i++) { if (id == selectedElems[i].id){ return true; } } return false;}
	//и добавить соответствующие альтернативы в условные блоки
    
    showLinks = function(id){ //Вылазит косяк данных: некоторые из элементов онтологии связаны с такими элементами, которых нет в ее иерархической структуре (???????)
		sys.parameters({stiffness: 0});
		for (var i = 0; i < ontology.links.length; i++) {
			if (ontology.links[i].element_id == id) {
				sys.addEdge('' + ontology.links[i].element_id, '' + ontology.links[i].linked_element_id, {length: .1000, type: ontology.links[i].link_type});
			}
		}
	}

	hideLinks = function(id){ 
		var linksFrom = sys.getEdgesFrom(id);
		
		for (var i = 0; i < linksFrom.length; i++){
			if (linksFrom[i].data.type != undefined){
				sys.pruneEdge(linksFrom[i]);
			}
		}

		if (document.getElementsByClassName('selectedElement').length == 0){
			sys.parameters({stiffness: 600}); //Если нет выделенных для отображения связей элементов, натянем граф
		}
	}

	selectElement = function(event){
		var elem = event.target;
		if (elem.className == "listElement") {
			elem.className = elem.className +" selectedElement";
			showLinks(elem.parentNode.parentNode.id);   //Костыли из-за нового отображения списка элементов
		} else {
			elem.className = "listElement";
			hideLinks(elem.parentNode.parentNode.id);   //Костыли из-за нового отображения списка элементов
		}
	}

     for (var i = 0; i < ontology.structure.length; i++) {
     sys.addEdge('' + ontology.structure[i].parent_element, '' + ontology.structure[i].element_id);
     }


	var listElems = document.getElementsByClassName('listElement');
	for (var i = 0; i < listElems.length; i++) {
		listElems[i].onclick = selectElement;
	}

}