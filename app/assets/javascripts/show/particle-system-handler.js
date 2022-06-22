/**
 * Created by Максим on 17.12.14.
 */
//Renderer - средство отрисовки для системы частиц Arbor'а. В данном случае используется canvas
function Renderer(canvas) {
    //Для canvas всегда нужно задавать параметры canvas.height и canvas.width, иначе будут проблемы с масштабом
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    var ctx = canvas.getContext("2d");
    var particleSystem;

    var that = {
        //init вызывается единожды, когда создается система
        init: function (system) {
            particleSystem = system;

            //Передаем системе размеры канвы
            particleSystem.screenSize(canvas.offsetWidth, canvas.offsetHeight);
            particleSystem.screenPadding(80);

            //Инициализируем обработчики кликов
            that.initMouseHandling();
        },

        //redraw (перерисовка) вызывается каждый раз, когда изменяется положение частиц в системе (читай, постоянно)
        redraw: function () {
            //Сначала очищаем canvas
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            //Отрисовываем все ребра системы частиц:
            particleSystem.eachEdge(function (edge, pt1, pt2) {
                //Цвет выбираем взависимости от типа:
                switch (edge.data.type) {
                    //Для иерархических связей (ребер дерева)
                    case undefined:
                        ctx.strokeStyle = "black";
                        break;
                    //Остальные опции для "связей"
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
                //P.S. Узнать бы еще, каким кодом какой тип обозначается

                //Собственно, проводим линию
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                ctx.stroke();
            });

            //Отрисовываем все вершины:
            particleSystem.eachNode(function (node, pt) {
                //Замеряем ширину текста
                pt = pt || node._p;
                var w = ctx.measureText(node.name).width; //ctx.fillRect(pt.x-w/2, pt.y-w/2, w,w); - оригинальный код из демо
                //Закрашиваем соотв.область белым
                ctx.clearRect(pt.x - w / 2, pt.y - 7, w, 14);

                //На всякий случай оставлю в комментах, как нарисовать рамку
                //ctx.rect(pt.x-w/2, pt.y-7, w,14);
                //ctx.stroke();

                //Выбираем шрифт...
                ctx.font = "bold 11px Arial";
                ctx.textAlign = "center";
                //Выделенные элементы пишем красным, остальные - черным
                node.data.isSelected ? (ctx.fillStyle = "#FF0000") : (ctx.fillStyle = "#888888");
                //Пишем текст (название вершины)
                ctx.fillText(node.name, pt.x, pt.y + 4);
            });
        },

        //Инициализация обработчиков кликов
        initMouseHandling: function () {
            var dragged = null;

            var handler = {
                clicked: function (e) {
                    //Определяем, в какой пиксель ткнули
                    var pos = $(canvas).offset();
                    _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top);
                    //Находим ближайшую вершину
                    var clicked = particleSystem.nearest(_mouseP);

                    //Оставлю эту проверку на всякий (примерно так было в демке)
                    if (clicked === null || clicked.node === undefined) {
                        return false;
                    }

                    //Костылик для скрытия окошка с инфой об элементу
                    //Также, как с экшн-меню на главной не получится, т.к. mousedown-обработчик на canvas перекрывает аналогичный на документе
                    var DataTable = document.getElementById("ElementDataTable");
                    DataTable.style.display == "block" ? (DataTable.style.display = "none") : undefined;

                    //Если при клике по элементу нажат Shift - выделяем его
                    if (e.shiftKey) {
                        var listElem = document.getElementById(clicked.node.name).content;
                        clicked.node.data.isSelected = !clicked.node.data.isSelected;

                        //Также выделяем и соответствующий элемент в древовидном списке
                        if (clicked.node.data.isSelected) {
                            listElem.classList.add("selectedElement");
                        } else {
                            if (listElem.classList.contains("selectedElement")) {
                                listElem.classList.remove("selectedElement");
                            }
                        }
                        //Мб выделить это добро сверху в отдельную ф-цию? Тем более в обработчике клика по элементу списка написано почти то же самое

                        //Эта строчка здесь и ниже нужна для того, чтобы отменять дефолтные обработчики кликов в браузере
                        return false;
                    }

                    //Если при клике по элементу нажат Ctrl - отобразить связи
                    if (e.ctrlKey) {
                        //Немного некорректная реализация: методы hideLinks и showLinks привязываются уже при инициализации системы (в скрипте ____.js)
                        //Делаю так, потому что для них требуется ссылка на онтологию, а в Renderer совсем не хочется передавать ее параметром

                        //Если соответствующие методы не определены,
                        if (particleSystem.hideLinks == undefined || particleSystem.showLinks == undefined) {
                            //возвращаем фигу
                            return false;
                        }

                        clicked.node.data.areLinksShown
                            ? particleSystem.hideLinks(clicked.node.name)
                            : particleSystem.showLinks(clicked.node.name);
                        clicked.node.data.areLinksShown = !clicked.node.data.areLinksShown;

                        //После отображения нужно скорректировать параметры системы (зачем - см. саму функцию)
                        CorrectParticleSystemParameters(particleSystem); //Вроде видит particleSystem
                        return false;
                    }

                    //Если при клике по элементу нажат Alt - показываем информацию об элементе
                    if (e.altKey) {
                        //Получаем ссылку на данный элемент в онтологии
                        var element = clicked.node.data.element;
                        //Отображаем информацию о нем
                        ShowElementData(element);
                        return false;
                    }

                    //Если никаких клавиш-модификаторов не нажато, значит, делаем drag'n'drop:
                    //Передаем в другие функции кликнутую вершину через общую переменную dragged
                    dragged = clicked;
                    //Фиксируем узел, пока тащим его
                    dragged.node.fixed = true;

                    //Вешаем обработчики drag'n'drop'а
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
                    //Когда отпустили мышку, сниаем обработчики
                    $(canvas).unbind("mousemove", handler.dragged);
                    $(window).unbind("mouseup", handler.dropped);
                    _mouseP = null;
                    return false;
                },
            };

            //Вешаем клик-listener
            $(canvas).mousedown(handler.clicked);
        },
    };
    return that;
}

//Получение массива выделенных элементов графа
function GetSelectedNodes(sys) {
    //Небольшой эксперимент: хочу прикрутить для красоты эту функцию к системе, как метод. Поэтому пишу эту фишечку:
    sys = sys || this;

    var selectedElements = [];

    sys.eachNode(function (node, pt) {
        if (node.data.isSelected) {
            //Берем числа, а не строковые идентификаторы, т.к. в некоторых методах у меня используетсся поиск (indexOf) по массиву выделенных элементов
            selectedElements.push(+node.name);
        }
    });

    return selectedElements;
}

function getById(id, l) {
    return l.find((e) => e.element_id.toString() === id.toString());
}

function getParent(id, elements, structure) {
    let current = getById(id, structure);
    if (current) {
        return getById(current.parent_element, elements);
    }
}

function getChildren(id, elements, structure) {
    return structure
        .filter((e) => e.parent_element.toString() === id.toString())
        .map((e) => getById(e.element_id, elements));
}

function getRoot(elements, structure) {
    return elements.find((e) => !structure.map((s) => s.element_id).includes(e.element_id));
}

function countCords({ elements, structure }) {
    let root = getRoot(elements, structure);
    root.x = 100;
    root.y = 100;
    const r = 10;
    return [root].concat(countChildren(root, elements, structure, r));
}

function gradToRad(g) {
    return (Math.PI * g) / 180;
}

function radToGrad(r) {
    return (r * 180) / Math.PI;
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function countChildren(el, elements, structure, r, initialRad = 0) {
    let children = getChildren(el.element_id, elements, structure);
    let sector = (2 * Math.PI) / (children.length + 1);
    let counted = children.map((e, i) => {
        let dest = r;
        let cs = getChildren(e.element_id, elements, structure);
        if (cs.length) {
            dest = r * getRandomArbitrary(3, 7);
        }
        centerX = el.x;
        centerY = el.y;

        let angle = initialRad + sector * (i + 1);
        e.x = Math.cos(angle) * dest + centerX;
        e.y = Math.sin(angle) * dest + centerY;
        e.angle = angle;
        return e;
    });
    counted.forEach((e) => {
        counted = counted.concat(countChildren(e, elements, structure, r, Math.PI + e.angle));
    });
    return counted;
}

//Корректировка содержимого графа (вершин/ребер) в соответствии с текущим состоянием онтологии
function CorrectParticleSystemContent(ontology, sys) {
    //Небольшой эксперимент: хочу прикрутить для красоты эту функцию к системе, как метод. Поэтому пишу эту фишечку:
    sys = sys || this;

    //Сначала удаляем из графа то, чего нет в онтологии
    sys.eachNode(function (node, pt) {
        for (var i = 0; i < ontology.elements.length; i++) {
            if (node.name == ontology.elements[i].element_id) {
                //Здесь и далее небольшое допущение: сравнивается строковое (node.name) и числовое значение (element_id)
                //Убираем выделение (для порядка)
                node.data.isSelected = false;
                //Если узел нашелся, прекращаем выполнение
                return;
            }
        }

        sys.pruneNode(node);
    });

    //Затем добавляем то, чего в нем не хватает
    debugger;
    ontology.elements = countCords(ontology);

    for (var i = 0; i < ontology.elements.length; i++) {
        //Если узла нет
        if (!sys.getNode(ontology.elements[i].element_id)) {
            //Добавляем узел
            //Тут же добавляю инфу об элементе для отображения по альт-клику. Сделал это просто ссылкой, но, может, стоило вручную вписать все св-ва. Пока не знаю
            sys.addNode(ontology.elements[i].element_id, {
                x: ontology.elements[i].x,
                y: ontology.elements[i].y,
                isSelected: false,
                areLinksShown: false,
                element: ontology.elements[i],
            });
        }
    }

    for (var i = 0; i < ontology.structure.length; i++) {
        if (
            sys.getEdges("" + ontology.structure[i].parent_element, "" + ontology.structure[i].element_id).length == 0
        ) {
            //Нужно обратить внимание на то, что является соусом, а что таргетом
            sys.addEdge(ontology.structure[i].parent_element, ontology.structure[i].element_id);
        }
    }
}

//Корректировка параметров системы частиц Arbor'а. Зачем это делается - см. issue на GitHub'е
function CorrectParticleSystemParameters(sys) {
    //Небольшой эксперимент: хочу прикрутить для красоты эту функцию к системе, как метод. Поэтому пишу эту фишечку:
    sys = sys || this;

    var linksAreDisplayed;
    var nodeCount = 0;

    sys.eachNode(function (node, pt) {
        nodeCount++;
        if (node.data.areLinksShown) {
            linksAreDisplayed = true;
        }
    });

    //Регулировка натяжения: если есть хоть одна веорщина с areLinksShown = true - stiffness в ноль
    if (linksAreDisplayed) {
        sys.parameters({ stiffness: 0 });
    } else {
        sys.parameters({ stiffness: 600 });
    }

    //Регулировка отталкивания: если в системе только одна вершина - занулить отталкивание
    if (nodeCount > 1) {
        sys.parameters({ repulsion: 1000 });
    } else {
        sys.parameters({ repulsion: 0 });
    }
}

//Отображение окошка с инфой об элементе. Куда впихнуть эту ф-цию, хз
function ShowElementData(element) {
    var DataTable = document.getElementById("ElementDataTable");

    //Переносим его под курсор
    DataTable.style.top = event.clientY + "px";
    DataTable.style.left = event.clientX + "px";
    //Отображаем
    DataTable.style.display = "block";

    //Заполняем инфой
    var IdCell = document.getElementById("DataTableIdCell");
    IdCell.innerHTML = "" + element.element_id;

    var NameCell = document.getElementById("DataTableNameCell");
    NameCell.innerHTML = "" + element.element_name;

    var DataCell = document.getElementById("DataTableDataCell");
    DataCell.innerHTML = "" + element.element_data;
}
