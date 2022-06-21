//Глобальные переменные:

var mainWindow;
var methodWindow;
var resultWindow;

var methodWindowBackground;
var resultWindowBackground;

var ontoID;
var CombineOntoID;
var ontology;
var ontology;

//Начальная инициализация страницы

window.onload = function () {
    loadMainWindow();
};

//Конструктор шаблона окна

function WindowPattern() {
    var newWindow = document.createElement("div");
    newWindow.className = "windowOutsideStyle";
    newWindow.positionWindow = function (left, top) {
        this.style.left = left + "%";
        this.style.top = top + "%";
        this.style.marginLeft = -0.5 * this.offsetWidth + "px";
        this.style.marginTop = -0.5 * this.offsetHeight + "px";
    };

    var heading = document.createElement("div");
    heading.className = "heading";
    heading.onmousedown = drag;
    newWindow.myHeading = heading;
    newWindow.appendChild(heading);

    var content = document.createElement("div");
    content.className = "windowInsideStyle";
    newWindow.myContent = content;
    newWindow.appendChild(content);

    var subheading = document.createElement("h5");
    newWindow.mySubheading = subheading;
    content.appendChild(subheading);

    var textField = document.createElement("input");
    textField.type = "text";
    textField.className = "textField";
    textField.onkeyup = function () {
        var textInput = this.value;
        var elems = this.parentNode.parentNode.myList.children;
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].innerHTML.toLowerCase().indexOf(textInput.toLowerCase()) == -1) {
                elems[i].style.display = "none";
            } else {
                elems[i].style.display = "block";
            }
        }
    };
    newWindow.myTextField = textField;
    content.appendChild(textField);

    var list = document.createElement("div");
    list.className = "list";
    list.fillList = function (content, pattern) {
        for (var i = 0; i < content.length; i++) {
            this.appendChild(renderListElement(content[i], pattern));
        }
    };
    newWindow.myList = list;
    content.appendChild(list);

    var buttonsContainer = document.createElement("div");
    buttonsContainer.className = "buttonsContainer";
    buttonsContainer.addMyButton = function (name, onClickFunction) {
        var button = document.createElement("button");
        button.innerHTML = name;
        button.onclick = onClickFunction;
        this.appendChild(button);
    };
    newWindow.myButtonsContainer = buttonsContainer;
    content.appendChild(buttonsContainer);

    return newWindow;
}

function getOnto() {
    var ajax = getXmlHttp();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                ontology = eval("(" + ajax.responseText + ")");
                document.body.removeChild(mainWindow);
                paintOnto();
            } else {
                alert("Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу");
            }
        }
    };
    ajax.open("GET", "../ontologies/" + ontoID, true);
    ajax.send(null);
}

function createEditionMenu() {
    var editionMenu = document.getElementById("actionMenu");
    if (!editionMenu) {
        editionMenu = document.createElement("div");
        editionMenu.id = "actionMenu";
        editionMenu.innerHTML =
            '<div class="actionMenuOption">Добавить дочерний элемент</div>' +
            '<div class="actionMenuOption">Удалить элемент</div>';
        editionMenu.oncontextmenu = function () {
            return false;
        };

        document.onclick = function () {
            document.body.removeChild(editionMenu);
            return false;
        };
        document.body.appendChild(editionMenu);
    }

    editionMenu.style.top = event.clientY + "px";
    editionMenu.style.left = event.clientX + "px";
    return editionMenu;
}

function paintOnto() {
    var Renderer = function () {
        var canvas = document.createElement("canvas");
        canvas.width = 800;
        canvas.height = 800;
        canvas.id = "bla";
        document.body.appendChild(canvas);

        var backButton = document.createElement("button");
        backButton.innerHTML = "Назад";
        backButton.onclick = function () {
            document.body.removeChild(canvas);
            document.body.removeChild(backButton);
            loadMainWindow();
        };
        document.body.appendChild(backButton);

        var ctx = canvas.getContext("2d");
        var particleSystem;

        var that = {
            init: function (system) {
                //
                // the particle system will call the init function once, right before the
                // first frame is to be drawn. it's a good place to set up the canvas and
                // to pass the canvas size to the particle system
                //
                // save a reference to the particle system for use in the .redraw() loop
                particleSystem = system;

                // inform the system of the screen dimensions so it can map coords for us.
                // if the canvas is ever resized, screenSize should be called again with
                // the new dimensions
                particleSystem.screenSize(canvas.width, canvas.height);
                particleSystem.screenPadding(80); // leave an extra 80px of whitespace per side

                // set up some event handlers to allow for node-dragging
                that.initMouseHandling();
            },

            redraw: function () {
                //
                // redraw will be called repeatedly during the run whenever the node positions
                // change. the new positions for the nodes can be accessed by looking at the
                // .p attribute of a given node. however the p.x & p.y values are in the coordinates
                // of the particle system rather than the screen. you can either map them to
                // the screen yourself, or use the convenience iterators .eachNode (and .eachEdge)
                // which allow you to step through the actual node objects but also pass an
                // x,y point in the screen's coordinate system
                //
                ctx.fillStyle = "white";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                particleSystem.eachEdge(function (edge, pt1, pt2) {
                    // edge: {source:Node, target:Node, length:#, data:{}}
                    // pt1:  {x:#, y:#}  source position in screen coords
                    // pt2:  {x:#, y:#}  target position in screen coords

                    // draw a line from pt1 to pt2
                    //ctx.strokeStyle = "rgba(0,0,0, .333)"
                    switch (edge.data.type) {
                        case undefined:
                            ctx.strokeStyle = "black";
                            break;
                        case 1:
                            ctx.strokeStyle = "red";
                            break;
                        case 2:
                            ctx.strokeStyle = "yellow";
                            break;
                        case 3:
                            ctx.strokeStyle = "green";
                            break;
                    }
                    // ctx.strokeStyle = (edge.data.type == undefined) ? "black": (
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(pt1.x, pt1.y);
                    ctx.lineTo(pt2.x, pt2.y);
                    ctx.stroke();
                });

                particleSystem.eachNode(function (node, pt) {
                    // node: {mass:#, p:{x,y}, name:"", data:{}}
                    // pt:   {x:#, y:#}  node position in screen coords

                    // draw a rectangle centered at pt
                    var w = ctx.measureText(node.name).width;
                    //ctx.fillStyle = (node.data.alone) ? "orange" : "black"
                    //ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w);
                    ctx.clearRect(pt.x - w / 2, pt.y - 7, w, 14);
                    //ctx.rect(pt.x-w/2, pt.y-7, w,14);
                    //ctx.stroke();
                    ctx.font = "bold 11px Arial";
                    ctx.textAlign = "center";
                    ctx.fillStyle = "#888888";
                    ctx.fillText(node.name, pt.x, pt.y + 4);
                });
            },

            initMouseHandling: function () {
                // no-nonsense drag and drop (thanks springy.js)
                var dragged = null;
                var selected = null;

                // set up a handler object that will initially listen for mousedowns then
                // for moves and mouseups while dragging
                var handler = {
                    rightclicked: function (e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        selected = particleSystem.nearest(_mouseP);

                        var menu = createEditionMenu(canvas);

                        var theAddButton = menu.children[0];
                        theAddButton.onclick = function () {
                            var childID = prompt("Введите id дочернего элемента");
                            sys.addEdge(selected.node, childID);
                            //Потребуется множество проверок на добавление: есть ли элемент в данной онтологии, есть ли данный элемент вообще.
                        };

                        var cutNodeRecursively = function (nodeObject) {
                            var edgesFrom = sys.getEdgesFrom(nodeObject);
                            for (var i = 0; i < edgesFrom.length; i++) {
                                cutNodeRecursively(edgesFrom[i].target);
                            }
                            sys.pruneNode(nodeObject);
                        };

                        var theDeleteButton = menu.children[1];
                        theDeleteButton.onclick = function () {
                            if (confirm("Вы точно хотите удалить данный элемент?")) {
                                /*resultOntology = ontology;
                      deleteElement(selected.node.name);
                      flatten(resultOntology.elements);         //Весь этот блок сделан для демонстрации "на коленке" (resultOntology указывает теперь на ontology)
                      flatten(resultOntology.structure);
                      document.body.removeChild(canvas);
                      paintOnto();*/
                                //sys.pruneNode(selected.node.name); //Запилить рекурсивное удаление вершин
                                //var edgesFrom = sys.getEdgesFrom(selected.node.name);
                                //for (var i = 0; i < edgesFrom.length; i++) {
                                //sys.pruneNode(edgesFrom[i].target);
                                //}
                                cutNodeRecursively(selected.node);
                            }
                        };
                        return false;
                    },

                    clicked: function (e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                        dragged = particleSystem.nearest(_mouseP);

                        if (dragged && dragged.node !== null) {
                            // while we're dragging, don't let physics move the node
                            dragged.node.fixed = true;
                        }

                        $(canvas).bind("mousemove", handler.dragged);
                        $(window).bind("mouseup", handler.dropped);

                        return false;
                    },
                    dragged: function (e) {
                        var pos = $(canvas).offset();
                        var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);

                        if (dragged && dragged.node !== null) {
                            var p = particleSystem.fromScreen(s);
                            dragged.node.p = p;
                        }

                        return false;
                    },

                    dropped: function (e) {
                        if (dragged === null || dragged.node === undefined) return;
                        if (dragged.node !== null) dragged.node.fixed = false;
                        dragged.node.tempMass = 1000;
                        dragged = null;
                        $(canvas).unbind("mousemove", handler.dragged);
                        $(window).unbind("mouseup", handler.dropped);
                        _mouseP = null;
                        return false;
                    },
                };

                // start listening
                $(canvas).mousedown(handler.clicked);
                $(canvas).contextmenu(handler.rightclicked);
            },
        };
        return that;
    };

    var sys = arbor.ParticleSystem(1000, 600, 0.5); // create the system with sensible repulsion/stiffness/friction
    //sys.parameters({gravity:true}) // use center-gravity to make the graph settle nicely (ymmv)
    sys.renderer = Renderer(); // our newly created renderer will have its .init() method called shortly by sys...

    // add some nodes to the graph and watch it go...
    //sys.addEdge('1','2')
    //sys.addEdge('1','3')
    //sys.addEdge('1','4')
    //sys.addEdge('1','5')
    //sys.addNode('6', {alone:true, mass:.25})
    for (var i = 0; i < ontology.structure.length; i++) {
        sys.addEdge("" + ontology.structure[i].parent_element, "" + ontology.structure[i].element_id);
    }
    for (var i = 0; i < ontology.links.length; i++) {
        sys.addEdge("" + ontology.links[i].element_id, "" + ontology.links[i].linked_element_id, {
            length: 0.1,
            type: ontology.links[i].link_type,
        });
    }
    // or, equivalently:
    //
    // sys.graft({
    //   nodes:{
    //     f:{alone:true, mass:.25}
    //   },
    //   edges:{
    //     a:{ b:{},
    //         c:{},
    //         d:{},
    //         e:{}
    //     }
    //   }
    // })
}

function renderListElement(element, pattern) {
    var div = document.createElement("div");
    switch (pattern) {
        case "main":
            div.className = "listElement";
            div.onclick = function () {
                ontoID = this.onto_id;
                getOnto();
            };
            div.onto_id = element.ontology_id; //Т.к. у DOM-элементов онтологий и элементов онтологий айдишники могут совпадать, попробую это разрешить, присвоим онтологиям свой "кастомный" айди.
            div.innerHTML = element.ontology_name;
            break;
        case "combine":
            div.className = "listElement";
            div.onclick = function () {
                CombineOntoID = this.id;
            };
            div.id = element.ontology_id;
            div.innerHTML = element.ontology_name;
            break;
        case "excerpt":
            div.className = "listElement";
            div.onclick = function () {
                selectElement(this);
            };
            div.id = element.element_id;
            div.innerHTML = element.element_name;
            break;
        case "cut":
            div.className = "listElement";
            div.onclick = function () {
                selectElement(this);
            };
            div.id = element.element_id;
            div.innerHTML = element.element_name;
            break;
        case "find":
            div.className = "listElement";
            div.onclick = function () {
                selectElementOnce(this);
            };
            div.id = element.element_id;
            div.innerHTML = element.element_name;
            break;
        case "result":
            div.innerHTML = element.element_name;
            break;
    }
    return div;
}

//Функция генерации окон

function createWindow(data, type) {
    var newWindow = new WindowPattern();

    switch (type) {
        case "main":
            newWindow.myHeading.innerHTML = "Построение обобщенной онтологии";
            newWindow.mySubheading.innerHTML = "Список онтологий курсов/дисциплин:";
            //Заглушка. На этом месте должен быть вызов функции загрузки списка онтологий с помощью AJAX
            newWindow.myList.fillList(data, type);
            /*newWindow.myList.innerHTML = '  <div id="1" class="listElement" onclick="ontoID = this.id; showActionMenu()">Базы данных и экспертные системы (Введение в интеллектуальные системы)</div> \
                                            <div id="2" class="listElement" onclick="ontoID = this.id; showActionMenu()">Экспертные системы</div> \
                                            <div id="3" class="listElement" onclick="ontoID = this.id; showActionMenu()">Проектирование кибернетических систем, основанных на знаниях</div> \
                                            <div id="4" class="listElement" onclick="ontoID = this.id; showActionMenu()">Динамические интеллектуальные системы</div>';*/
            newWindow.myButtonsContainer.addMyButton("Выход", function () {
                window.close();
            });
            newWindow.style.height = "300px";
            newWindow.myContent.style.height = "275px";
            newWindow.myList.style.height = "130px";
            newWindow.myList.style.cursor = "pointer";
            break;
        case "combine":
            newWindow.myHeading.innerHTML = "Объединение онтологий";
            newWindow.mySubheading.innerHTML = "Список онтологий курсов/дисциплин:";
            newWindow.myList.fillList(data, type);
            newWindow.myButtonsContainer.addMyButton("Назад", closeMethodWindow);
            newWindow.myButtonsContainer.addMyButton("Далее", function () {
                if (!checkSelection("combine")) {
                    return;
                }
                makeGeneralizedOntology(type);
            });
            newWindow.style.height = "300px";
            newWindow.myContent.style.height = "275px";
            newWindow.myList.style.height = "130px";
            newWindow.myList.style.cursor = "pointer";
            break;
        case "excerpt":
            newWindow.myHeading.innerHTML = "Выборка элементов онтологии курса/дисциплины";
            newWindow.mySubheading.innerHTML = "Список элементов онтологии:";
            newWindow.myList.fillList(data, type);
            newWindow.myButtonsContainer.addMyButton("Назад", closeMethodWindow);
            newWindow.myButtonsContainer.addMyButton("Далее", function () {
                if (!checkSelection("excerpt")) {
                    return;
                }
                makeGeneralizedOntology(type);
            });
            newWindow.style.height = "300px";
            newWindow.myContent.style.height = "275px";
            newWindow.myList.style.height = "130px";
            newWindow.myList.style.cursor = "pointer";
            break;
        case "cut":
            newWindow.myHeading.innerHTML = "Отсечение элементов онтологии курса/дисциплины";
            newWindow.mySubheading.innerHTML = "Список элементов онтологии:";
            newWindow.myList.fillList(data, type);
            //Заглушка. На этом месте должен быть вызов функции загрузки списка элементов онтологии с помощью AJAX
            /*newWindow.myList.innerHTML = '  <div class="listElement" id="6" onclick="selectElement(this)">Общее представление человека об окружающем мире</div> \
                                            <div class="listElement" id="24" onclick="selectElement(this)">Понятие эвристики</div> \
                                            <div class="listElement" id="32" onclick="selectElement(this)">Понятие предметной области</div> \
                                            <div class="listElement" id="16" onclick="selectElement(this)">Понятийная структура предметной области</div> \
                                            <div class="listElement" id="21" onclick="selectElement(this)">Наука когнитология</div> \
                                            <div class="listElement" id="12" onclick="selectElement(this)">3 типа источников знаний</div> \
                                            <div class="listElement" id="34" onclick="selectElement(this)">Онтология</div> \
                                            <div class="listElement" id="27" onclick="selectElement(this)">Понятие базы данных</div> \
                                            <div class="listElement" id="3" onclick="selectElement(this)">Понятие интеллектуальной системы</div>';*/
            newWindow.myButtonsContainer.addMyButton("Назад", closeMethodWindow);
            newWindow.myButtonsContainer.addMyButton("Далее", function () {
                if (!checkSelection("cut")) {
                    return;
                }
                makeGeneralizedOntology(type);
            }); //Вызов окна с результатом должен быть выполнен только после проверки корректного выполнения метода
            newWindow.style.height = "300px";
            newWindow.myContent.style.height = "275px";
            newWindow.myList.style.height = "130px";
            newWindow.myList.style.cursor = "pointer";
            break;
        case "find":
            newWindow.myHeading.innerHTML = "Поиск элемента онтологии курса/дисциплины";
            newWindow.mySubheading.innerHTML = "Список элементов онтологии:";
            newWindow.myList.fillList(data, type);
            //Заглушка. На этом месте должен быть вызов функции загрузки списка элементов онтологии с помощью AJAX
            /*newWindow.myList.innerHTML = '  <div class="listElement" id="6" onclick="selectElementOnce(this)">Общее представление человека об окружающем мире</div> \
                                            <div class="listElement" id="24" onclick="selectElementOnce(this)">Понятие эвристики</div> \
                                            <div class="listElement" id="32" onclick="selectElementOnce(this)">Понятие предметной области</div> \
                                            <div class="listElement" id="16" onclick="selectElementOnce(this)">Понятийная структура предметной области</div> \
                                            <div class="listElement" id="21" onclick="selectElementOnce(this)">Наука когнитология</div> \
                                            <div class="listElement" id="12" onclick="selectElementOnce(this)">3 типа источников знаний</div> \
                                            <div class="listElement" id="34" onclick="selectElementOnce(this)">Онтология</div> \
                                            <div class="listElement" id="27" onclick="selectElementOnce(this)">Понятие базы данных</div> \
                                            <div class="listElement" id="3" onclick="selectElementOnce(this)">Понятие интеллектуальной системы</div>';*/
            var searchOptionsContainer = document.createElement("div");
            searchOptionsContainer.innerHTML =
                '    <h5>Укажите тип поиска</h5> \
                                                    <div class="searchOptions"> \
                                                    <label><input type="checkbox" id="bfsFlag"/>Отображение элементов, находящихся на одном уровне с искомым (поиск в ширину)</label><br /> \
                                                    <label><input type="checkbox" id="dfsFlag"/>Отображение элементов, находящихся на уровень выше и на уровень ниже в иерархической структуре \
                                                    (отображение элемента-предка и элементов-потомков, поиск в глубину)</label> \
                                                    </div>';
            newWindow.myContent.insertBefore(searchOptionsContainer, newWindow.myButtonsContainer);
            newWindow.myButtonsContainer.addMyButton("Назад", closeMethodWindow);
            newWindow.myButtonsContainer.addMyButton("Далее", function () {
                if (!checkSelection("find")) {
                    return;
                }
                makeGeneralizedOntology(type);
            }); // !!!! Добавить проверку на наличие типа поиска !!!!
            newWindow.style.height = "450px";
            newWindow.myContent.style.height = "425px";
            newWindow.myList.style.height = "130px";
            newWindow.myList.style.cursor = "pointer";
            break;
        case "result":
            newWindow.myHeading.innerHTML = "Обобщенная онтология";
            newWindow.mySubheading.innerHTML = "Список элементов онтологии:";
            newWindow.myList.fillList(data, type);
            //Заглушка. На этом месте должна быть отрисовка результата
            /*newWindow.myList.innerHTML = '  <div>Общее представление человека об окружающем мире</div> \
                                            <div>Понятие эвристики</div> \
                                            <div>Понятие предметной области</div> \
                                            <div>Понятийная структура предметной области</div> \
                                            <div>Наука когнитология</div> \
                                            <div>3 типа источников знаний</div> \
                                            <div>Онтология</div> \
                                            <div>Понятие базы данных</div> \
                                            <div>Понятие интеллектуальной системы</div>';*/
            newWindow.myButtonsContainer.addMyButton("Назад", closeResultWindow);
            newWindow.myButtonsContainer.addMyButton("Сохранить", save);
            newWindow.style.height = "300px";
            newWindow.myContent.style.height = "275px";
            newWindow.myList.style.height = "130px";
            break;
    }

    return newWindow;
}

//Функции, отвечающие за AJAX-запросы

function getXmlHttp() {
    var xmlhttp;
    try {
        xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
        try {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (E) {
            xmlhttp = false;
        }
    }
    if (!xmlhttp && typeof XMLHttpRequest != "undefined") {
        xmlhttp = new XMLHttpRequest();
    }
    return xmlhttp;
}

function loadMainWindow() {
    var ajax = getXmlHttp();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                var ontoList = eval("(" + ajax.responseText + ")");
                showMainWindow(ontoList);
            } else {
                alert("Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу");
            }
        }
    };
    ajax.open("GET", "../ontologiesList", true);
    ajax.send(null);
    //mainWindow.myList.innerHTML = "Запрос выполняется. Подождите";
}

function loadMethodWindow(method) {
    var ajax = getXmlHttp();
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                ontology = eval("(" + ajax.responseText + ")");
                showMethodWindow(ontology.elements, method);
            } else {
                alert("Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу");
            }
        }
    };
    ajax.open("GET", "ontologies/" + ontoID, true);
    ajax.send(null);
}

function makeGeneralizedOntology(method) {
    switch (method) {
        case "combine":
            flag = combineOntologies();
            break;
        case "excerpt":
            flag = excerptElements();
            break;
        case "cut":
            flag = cutElements();
            break;
        case "find":
            flag = findElement();
            break;
    }
    if (flag) {
        showResultWindow(resultOntology.elements);
    } else {
        alert("Онтология не может быть построена");
    }
    /*/var ajax = getXmlHttp();
    //ajax.onreadystatechange = function() {
        //if (ajax.readyState == 4) {
            //if (ajax.status == 200) {
                //alert(ajax.responseText);
				//var flag;
				resultOntology = eval('(' + ajax.responseText + ')');// Сохраняю для проверки
				//var temp = eval('(' + ajax.responseText + ')'); //Это сделано, чтобы не терять список элементов онтологии, который был загружен ранее
				//ontology.structure = temp.structure;			//(при инициализации methodWindow)
				//ontology.links = temp.links;
				//ontology.competences = temp.competences;
				//ontology.signs = temp.signs;
				
				//var elemList = eval('(' + ajax.responseText + ')');
                //showMethodWindow(elemList, method);
            }
            else {
                alert('Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу');
            }
        }
    }
    ajax.open('GET', 'ontologies/' + ontoID, true);
    ajax.send(null);*/
}

//Функции отображения и закрытия окна метода и окна результата

function showMainWindow(data) {
    mainWindow = createWindow(data, "main");
    document.body.appendChild(mainWindow);
    mainWindow.positionWindow(50, 40);
}

function showMethodWindow(data, method) {
    methodWindow = createWindow(data, method);
    methodWindowBackground = createBackground();
    methodWindowBackground.appendChild(methodWindow);
    document.body.appendChild(methodWindowBackground);
    methodWindow.positionWindow(80, 30);
    methodWindowBackground.onclick = function () {
        if (window.event.target == this) {
            closeMethodWindow();
        }
    };
}

function closeMethodWindow() {
    methodWindowBackground.removeChild(methodWindow);
    document.body.removeChild(methodWindowBackground);
    methodWindow = null;
    methodWindowBackground = null;
    ontology = null;
}

function showResultWindow(data) {
    resultWindow = createWindow(data, "result");
    resultWindowBackground = createBackground();
    resultWindowBackground.appendChild(resultWindow);
    methodWindowBackground.appendChild(resultWindowBackground);
    resultWindow.positionWindow(50, 50);
    resultWindowBackground.onclick = function () {
        if (window.event.target == this) {
            closeResultWindow();
        }
    };
}

function closeResultWindow() {
    resultWindowBackground.removeChild(resultWindow);
    methodWindowBackground.removeChild(resultWindowBackground);
    resultWindow = null;
    resultWindowBackground = null;
    resultOntology = null;
}

//Функции для работы с бэкграундами окон и контекстным меню

function createBackground() {
    var background = document.createElement("div");
    background.className = "background";
    /*background.onclick = function (){                      - старая реализация закрытия окна по клику. Очень проста и удобна, но не дает возможности деинициализации глобальных переменных,
        if (window.event.target == this){                    связанных с окнами метода и результата и их бэкграундами
            this.removeChild(this.children[0]);
            this.parentNode.removeChild(this);
        }
    }*/
    return background;
}

/*var actionMenu = document.createElement('div');
actionMenu.id = 'actionMenu';
actionMenu.innerHTML =  '<div class="actionMenuOption" onclick="loadMethodWindow(\'combine\')">Объединить с ..</div>' +       
                        '<div class="actionMenuOption" onclick="loadMethodWindow(\'excerpt\')">Выбрать элементы</div>' +       
                        '<div class="actionMenuOption" onclick="loadMethodWindow(\'cut\')">Отсечь элементы</div>' + 
                        '<div class="actionMenuOption" onclick="loadMethodWindow(\'find\')">Найти элемент</div>';


function showActionMenu() {
    actionMenu.style.top = event.clientY + 'px';
    actionMenu.style.left = event.clientX + 'px';
    document.body.appendChild(actionMenu);
}


document.onclick = function () {
    var validElements = mainWindow.myList.children;
    for (var i = 0; i < validElements.length; i++){
        if (window.event.target == validElements[i]){
            return;
        }
    }
    if (document.getElementById('actionMenu')) {
        document.body.removeChild(actionMenu);
    }    
}
*/

//Функции для выделения элементов онтологии (соответственно, множественный выбор и единственный)

function selectElement(elem) {
    elem.className == "listElement"
        ? (elem.className = elem.className + " selectedElement")
        : (elem.className = "listElement");
}

function selectElementOnce(elem) {
    if (elem.className != "listElement") {
        elem.className = "listElement";
        return;
    }
    var selectedElement = document.getElementsByClassName("listElement selectedElement")[0];
    if (selectedElement) {
        selectedElement.className = "listElement";
    }
    elem.className += " selectedElement";
}

//Функция проверки на выделение при вызове метода

function checkSelection(method) {
    if (!document.getElementsByClassName("listElement selectedElement")[0]) {
        switch (method) {
            case "cut":
                alert("Вы не выбрали ни одного элемента для отсечения.");
                break;
            case "find":
                alert("Вы не выбрали ни одного элемента для поиска.");
                break;
            case "excerpt":
                alert("Вы не выбрали ни одного элемента для выборки.");
                break;
            case "combine":
                alert("Вы не выбрали онтологии для объединения.");
                break;
        }
        return false;
    }

    if (
        method == "find" &&
        !(document.getElementById("dfsFlag").checked || document.getElementById("bfsFlag").checked)
    ) {
        alert("Выберите тип поиска");
        return false;
    }

    return true;
}

//Функции реализации методов - в разработке
//----------------- ВЫБОРКА -------------------

function excerptElements() {
    //Не забыть переставить везде ontology_id !!!  (или выполнить это на сервере)
    var elementsToExcerpt = document.getElementsByClassName("selectedElement");
    var elementsToExcerptIDs = []; //Создаем массив айдишников для удобства в дальнейшем

    resultOntology = {};
    resultOntology.elements = [];

    for (var i = 0; i < elementsToExcerpt.length; i++) {
        resultOntology.elements[i] = {};
        resultOntology.elements[i].element_id = elementsToExcerptIDs[i] = +elementsToExcerpt[i].id; //Проверить последовательность присваивания        !!! Важный момент: у DOM элементов id - строка, а в онтологиях - число
        resultOntology.elements[i].element_name = elementsToExcerpt[i].innerHTML; //Хитрость, достаем имя прямо из DOM-элемента, а не из исходной онтологии
    }

    //Добавить все иерархические связи
    resultOntology.structure = [];
    var j = 0;
    for (var i = 0; i < ontology.structure.length; i++) {
        if (
            elementsToExcerptIDs.indexOf(ontology.structure[i].element_id) >= 0 &&
            elementsToExcerptIDs.indexOf(ontology.structure[i].parent_element) >= 0
        ) {
            resultOntology.structure[j] = JSON.parse(JSON.stringify(ontology.structure[i])); //Копируем связь
            j++;
        }
    }

    //Добавить все связи
    resultOntology.links = [];
    j = 0;
    for (var i = 0; i < ontology.links.length; i++) {
        if (
            elementsToExcerptIDs.indexOf(ontology.links[i].element_id) >= 0 &&
            elementsToExcerptIDs.indexOf(ontology.links[i].linked_element_id) >= 0
        ) {
            resultOntology.links[j] = JSON.parse(JSON.stringify(ontology.links[i])); //Копируем связь
            j++;
        }
    }

    //Добавить все компетенции
    resultOntology.competences = [];
    j = 0;
    for (var i = 0; i < ontology.competences.length; i++) {
        if (elementsToExcerptIDs.indexOf(ontology.competences[i].element_id) >= 0) {
            resultOntology.competences[j] = JSON.parse(JSON.stringify(ontology.competences[i]));
            j++;
        }
    }

    //Добавить все признаки
    resultOntology.signs = [];
    j = 0;
    for (var i = 0; i < ontology.signs.length; i++) {
        if (elementsToExcerptIDs.indexOf(ontology.signs[i].element_id) >= 0) {
            resultOntology.signs[j] = JSON.parse(JSON.stringify(ontology.signs[i]));
            j++;
        }
    }
    /*var Excerpted = [] ; 
	var k = 0;
	for (var i=0; i < elementsToExcerpt.length; i++){
	  if (ontology.elements[i] != null && ontology.elements[i].element_id == id) { 	
			Excerpted[k] = ontology.elements[i].element_id;
			k++;
		 }
	   }
	for (var i=0; i < elementsToExcerpt.length; i++){
	   if (ontology.elements[i] != null && (!(ontology.elements[i].element_id in Excerpted)) )
	        {
	         ontology.elements[i] = null;
			 break;
			}
				if (ontology.structure[i] != null && (!(ontology.structure[i].element_id in Excerpted))) {
			ontology.structure[i] = null;
		}
	}

	
	for (var i = 0; i < ontology.competences.length; i++) {
		if (ontology.competences[i] != null && (!(ontology.competences[i].element_id in Excerpted))) {
			ontology.competences[i] = null;
		}
	}
	for (var i = 0; i < ontology.signs.length; i++) {
		if (ontology.signs[i] != null && (!(ontology.signs[i].element_id in Excerpted))) {
			ontology.signs[i] = null;
		}
	}
	for (var i = 0; i < ontology.structure.length; i++) {
		if (ontology.structure[i] != null && (!(ontology.elements[i].element_id in Excerpted))) { 
			deleteElement(ontology.structure[i].element_id);
			}
	}
			
			
	flatten(ontology.elements);
	flatten(ontology.structure);
	flatten(ontology.links);
	flatten(ontology.competences);
	flatten(ontology.signs);
	
	if (ontology.structure.length > 0) {
		return true;
	}*/
    if (true) {
        //Запилить проверку на связность
        return true;
    }
}
//--------------------

function cutElements() {
    //Удостовериться в корректности !!!
    resultOntology = JSON.parse(JSON.stringify(ontology)); //Копируем исходную онтологию                !!!Не забыть поменять ontology_id во всех массивах!!!
    var elementsToCut = document.getElementsByClassName("selectedElement");
    for (var i = 0; i < elementsToCut.length; i++) {
        deleteElement(elementsToCut[i].id);
    }
    flatten(resultOntology.elements);
    flatten(resultOntology.structure);
    flatten(resultOntology.links);
    flatten(resultOntology.competences);
    flatten(resultOntology.signs);

    if (resultOntology.elements.length > 0) {
        //Добавить проверку на связность    *Онтологии пока не построены до конца, имеет ли смысл?
        return true;
    } else {
        resultOntology = null;
    }
}

function deleteElement(id) {
    for (var i = 0; i < resultOntology.elements.length; i++) {
        if (resultOntology.elements[i] != null && resultOntology.elements[i].element_id == id) {
            resultOntology.elements[i] = null; //Удалить элемент из списка
            break;
        }
    }
    if (i == resultOntology.elements.length) {
        return;
    } //В случае, если элемент не был найден, продолжать выполнение функции бессмысленно

    for (var i = 0; i < resultOntology.structure.length; i++) {
        /*if (ontology.structure[i].parent_element == id) {
			deleteElement(ontology.structure[i].element_id);
		}*/
        if (resultOntology.structure[i] != null && resultOntology.structure[i].element_id == id) {
            resultOntology.structure[i] = null;
            break; //Можно добавить break, потому что в иерархической структуре каждый элемент встречается единожды
        }
    }

    for (var i = 0; i < resultOntology.links.length; i++) {
        if (
            resultOntology.links[i] != null &&
            (resultOntology.links[i].element_id == id || resultOntology.links[i].linked_element_id == id)
        ) {
            resultOntology.links[i] = null;
        }
    }

    for (var i = 0; i < resultOntology.competences.length; i++) {
        if (resultOntology.competences[i] != null && resultOntology.competences[i].element_id == id) {
            resultOntology.competences[i] = null;
        }
    }

    for (var i = 0; i < resultOntology.signs.length; i++) {
        if (resultOntology.signs[i] != null && resultOntology.signs[i].element_id == id) {
            resultOntology.signs[i] = null;
        }
    }

    //Ищем, есть ли потомки у данного элемента
    for (var i = 0; i < resultOntology.structure.length; i++) {
        if (resultOntology.structure[i] != null && resultOntology.structure[i].parent_element == id) {
            //Косяк!!!! Массив в процессе рекурсивного вызова сплющивается (вроде исправил)
            deleteElement(resultOntology.structure[i].element_id);
        }
    }
    //Не забыть прописать "сплющивание" массивов - удаление null'ов
}

//Функция "сплющивания" массива: удаляет все null-элементы, сдвигая последующие на пустое место
function flatten(array) {
    var i = 0;
    while (array[i] !== undefined) {
        if (array[i] == null) {
            array.splice(i, 1);
        } else {
            i++;
        }
    }
}

function findElement() {
    // !!!Не забыть про ontology_id !!!
    var elementToFind = document.getElementsByClassName("selectedElement")[0]; //Т.к. выделен может быть только один элемент
    var elementsIDs = []; //Создаем для удобства в дальнейшем

    resultOntology = {};
    resultOntology.elements = [];

    var j = 0;
    resultOntology.elements[j] = {};
    resultOntology.elements[j].element_id = elementsIDs[j] = +elementToFind.id; // у DOM-элемента id - строка !
    resultOntology.elements[j].element_name = elementToFind.innerHTML;
    j++;

    //Если выбран поиск в ширину
    if (document.getElementById("bfsFlag").checked) {
        for (var i = 0; i < ontology.structure.length; i++) {
            if (elementToFind.id == ontology.structure[i].element_id) {
                var level = ontology.structure[i].level_id; //Определяем требуемый уровень иерархии
                break;
            }
        }

        //Добавляем все элементы, находящиеся на том же уровне иерархии
        for (var i = 0; i < ontology.structure.length; i++) {
            if (ontology.structure[i].level_id == level && ontology.structure[i].element_id != elementToFind.id) {
                resultOntology.elements[j] = {}; //j - единица, потому что нулевой элемент уже есть - искомый
                resultOntology.elements[j].element_id = elementsIDs[j] = ontology.structure[i].element_id;
                resultOntology.elements[j].element_name = document.getElementById(
                    ontology.structure[i].element_id
                ).innerHTML; //Опять хитрость
                j++;
            }
        }
    }

    resultOntology.structure = [];
    //Если выбран поиск в глубину
    if (document.getElementById("dfsFlag").checked) {
        //Определяем всех потомков элемента !!!для начала - на один уровень в глубину!!!
        var k = 0;
        for (var i = 0; i < ontology.structure.length; i++) {
            // Добавляем элементы-потомки
            if (ontology.structure[i].parent_element == elementToFind.id) {
                resultOntology.elements[j] = {};
                resultOntology.elements[j].element_id = elementsIDs[j] = ontology.structure[i].element_id;
                resultOntology.elements[j].element_name = document.getElementById(
                    ontology.structure[i].element_id
                ).innerHTML; //Опять хитрость           !!! Внезапно облажался - id у DOM-элементом онтологий и элементов онтологий совпадают
                j++;
                resultOntology.structure[k] = JSON.parse(JSON.stringify(ontology.structure[i])); //Тут же добавляем иерархические связи
                k++;
            }

            if (ontology.structure[i].element_id == elementToFind.id) {
                //Добавляем элемент-родитель
                resultOntology.elements[j] = {};
                resultOntology.elements[j].element_id = elementsIDs[j] = ontology.structure[i].parent_element;
                resultOntology.elements[j].element_name = document.getElementById(
                    ontology.structure[i].parent_element
                ).innerHTML; //Опять хитрость
                j++;
                resultOntology.structure[k] = JSON.parse(JSON.stringify(ontology.structure[i])); //Тут же добавляем иерархические связи
                k++;
            }
        }
    }

    //Добавить все связи
    resultOntology.links = [];
    var k = 0;
    for (var i = 0; i < ontology.links.length; i++) {
        if (
            elementsIDs.indexOf(ontology.links[i].element_id) >= 0 &&
            elementsIDs.indexOf(ontology.links[i].linked_element_id) >= 0
        ) {
            resultOntology.links[k] = JSON.parse(JSON.stringify(ontology.links[i])); //Копируем связь
            k++;
        }
    }

    //Добавить все компетенции
    resultOntology.competences = [];
    k = 0;
    for (var i = 0; i < ontology.competences.length; i++) {
        if (elementsIDs.indexOf(ontology.competences[i].element_id) >= 0) {
            resultOntology.competences[k] = JSON.parse(JSON.stringify(ontology.competences[i]));
            k++;
        }
    }

    //Добавить все признаки
    resultOntology.signs = [];
    k = 0;
    for (var i = 0; i < ontology.signs.length; i++) {
        if (elementsIDs.indexOf(ontology.signs[i].element_id) >= 0) {
            resultOntology.signs[k] = JSON.parse(JSON.stringify(ontology.signs[i]));
            k++;
        }
    }

    return true; //??? Нужна ли проверка на связность???
}

//Функция сохранения онтологии

function save() {
    var ans = prompt("Введите название обобщенной онтологии", "NewOntology");
    var button = window.event.target;
    if (ans == "") {
        alert("Вы не ввели название.");
        save();
    } else if (ans != null) {
        resultOntology.name = ans;
        //Отправляем запрос на сервер

        var ajax = getXmlHttp();
        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    //Если все оки - выводим сообщение и меняем кнопочку
                    //alert(ajax.responseText);
                    button.innerHTML = "Закрыть";
                    button.onclick = function () {
                        closeResultWindow();
                        closeMethodWindow();
                    };
                    var newOnto = eval("(" + ajax.responseText + ")");
                    mainWindow.myList.appendChild(renderListElement(newOnto, "main")); //Добавляем новую онтологию в общий список без его перезагрузки
                    alert("Онтология " + ans + " успешно сохранена");
                } else {
                    alert("Ошибка: онтология не была сохранена. Попробуйте еще раз");
                }
            }
        };
        ajax.open("POST", "ontologiesSave", true); //Открылся небольшой косяк - при POST-запросе в теле автоматически появляется параметр "ontology => {}". Так и не понял, как можно в него что-то запихнуть
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send(JSON.stringify(resultOntology));
    }
}

//Функции для drag'n'drop'a

function fixEvent(e) {
    e = e || window.event;

    if (!e.target) e.target = e.srcElement;

    if (e.pageX == null && e.clientX != null) {
        // если нет pageX..
        var html = document.documentElement;
        var body = document.body;

        e.pageX = e.clientX + (html.scrollLeft || (body && body.scrollLeft) || 0);
        e.pageX -= html.clientLeft || 0;

        e.pageY = e.clientY + (html.scrollTop || (body && body.scrollTop) || 0);
        e.pageY -= html.clientTop || 0;
    }

    if (!e.which && e.button) {
        e.which = e.button & 1 ? 1 : e.button & 2 ? 3 : e.button & 4 ? 2 : 0;
    }

    return e;
}

function getCoords(elem) {
    var box = elem.getBoundingClientRect();

    var body = document.body;
    var docElem = document.documentElement;

    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;

    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    return { top: Math.round(top), left: Math.round(left) };
}

function drag(e) {
    var self = this.parentNode;
    e = fixEvent(e);

    var coords = getCoords(self);
    var shiftX = e.pageX - coords.left;
    var shiftY = e.pageY - coords.top;

    function moveAt(e) {
        self.style.left = e.pageX - shiftX + self.offsetWidth * 0.5 + "px";
        self.style.top = e.pageY - shiftY + self.offsetHeight * 0.5 + "px";
    }

    document.onmousemove = function (e) {
        e = fixEvent(e);
        moveAt(e);
    };

    document.onmouseup = function () {
        document.onmousemove = document.onmouseup = null;
    };
}
