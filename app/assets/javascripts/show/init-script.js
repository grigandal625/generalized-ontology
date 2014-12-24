//Иницализируем систему частиц Arbor'а
var sys = arbor.ParticleSystem(1000, 600, 0.5, true);       // Для дебага пока переменная глобальная
var ontology;   //При выполнении операций ссылка на текущее состояние онтологии теряется, так что оставляю пер-ную глобальной (см. соотв. issue на GitHub'е)


//Подгружаем онтологию с помощью AJAX'а
window.onload = function getOnto() {    //По идее можно даже вытащить код из под window.onload. Все равно ведь скрипт при загрузке выполнится
    var ajax = getXmlHttp();
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                //Эвалим пришедший json
                ontology = eval('(' + ajax.responseText + ')'); //Можно заменить на JSON.parse

                //Отрисовываем граф,..  //Порядок важен (в ф-ции DrawOnto инициализируется пе
                DrawOnto(sys, ontology);
                //,..строим древовидный список,..
                BuildTreeList(sys, ontology);
                //...инициализируем обработчик строки поиска по списку,..
                InitSearchFieldHandler();
                //...и инициализируем обработчики кнопок
                InitButtonHandlers(sys/*, ontology*/);

                //Важное примечание: почти во все функции передаются ссылки на онтологию/систему частиц,
                //потому что все части получаются взаимосвязаны. Это сильно нарушает модульность и структурную независимость кода,
                //но я другого решения пока найти не смог
            }
            else {
                alert('Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу');
            }
        }
    }
    ajax.open('GET', window.location.href + '/get', true);
    ajax.send(null);
}

function DrawOnto(sys, ontology) {
    var canvas = document.getElementById("DrawSpot");

    //Определяем отрисовщик
    sys.renderer = Renderer(canvas);

    //Определяем методы для отображения/скрытия связей. Они описаны здесь, а не в другом скрипте, потому что требуют ссылку на онтологию
    sys.showLinks = function(id){ //Вылазит косяк данных: некоторые из элементов онтологии связаны с такими элементами, которых нет в ее иерархической структуре (???????)
		for (var i = 0; i < ontology.links.length; i++) {
			if (ontology.links[i].element_id == id) {
				sys.addEdge('' + ontology.links[i].element_id, '' + ontology.links[i].linked_element_id, {length: .1000, type: ontology.links[i].link_type});
			}
		}
	}

    //По идее, нужно отображать только исходящие дуги. В ином случае использовать функцию: isSelected = function(node){var id = node.name; var selectedElems = document.getElementsByClassName('selectedElement'); for (var i = 0; i < selectedElems.length; i++) { if (id == selectedElems[i].id){ return true; } } return false;}
    //и добавить соответствующие альтернативы в условные блоки
	sys.hideLinks = function(id){
		var linksFrom = sys.getEdgesFrom(id);
		
		for (var i = 0; i < linksFrom.length; i++){
			if (linksFrom[i].data.type != undefined){
				sys.pruneEdge(linksFrom[i]);
			}
		}
	}

    //Прикручивваем метод получения списка выделенных вершин
    sys.getSelectedNodes = GetSelectedNodes;

    //Прикручиваем методы корректировки содержимого/параметров
    sys.correctContent = CorrectParticleSystemContent;
    sys.correctParameters = CorrectParticleSystemParameters;

    //Собственно, отрисовываем саму онтологию с помощью метода корректировки
    sys.correctContent(ontology);
}


function InitButtonHandlers(sys/*, ontology*/) {
    //Делаем стэк для бэкапа
    var ontologyBackupStack = [];


    //Обработчик кнопочки "Отсечь"
    var CutBtn = document.getElementById("CutBtn");

    CutBtn.onclick = function() {
        //Находим выделенные элементы
        var selectedElems = sys.getSelectedNodes();

        //Если не выделено ни одного элемента
        if (selectedElems.length == 0) {
            //Выводим соответствующее сообщение и заканчиванием выполнение. А можно и ничего не выводить.
            alert("Ни одного элемента не выделено");
            return;
        }

        //Бэкапим онтологию
        ontologyBackupStack.push(JSON.parse(JSON.stringify(ontology)));

        //Вызываем метод
        ontology = CutElements(ontology, selectedElems);


        //Если метод вернул ошибку
        if (ontology == undefined) {
            //Делаем откат
            ontology = ontologyBackupStack.pop();

            //Вызываем сообщение об ошибке
            alert("Операция не может быть выполнена");
        } else {
            //Если же все прошло удачно
            //Перерисовывем древовидный список элементов
            BuildTreeList(sys, ontology);

            //Корректируем изображение графа
            sys.correctContent(ontology);

            //Корректируем параметры системы частиц, отвечающие за физику графа
            setTimeout("sys.correctParameters()", 75);
        }
    }


    //Обработчик кнопочки "Выборка"
    var ExcerptBtn = document.getElementById("ExcerptBtn");

    ExcerptBtn.onclick = function() {
        //Находим выделенные элементы
        var selectedElems = sys.getSelectedNodes();

        //Если не выделено ни одного элемента
        if (selectedElems.length == 0) {
            //Выводим соответствующее сообщение и заканчиванием выполнение. А можно и ничего не выводить.
            alert("Ни одного элемента не выделено");
            return;
        }

        //Бэкапим онтологию
        ontologyBackupStack.push(JSON.parse(JSON.stringify(ontology)));

        //Вызываем метод
        ontology = ExcerptElements(ontology, selectedElems);


        //Если метод вернул ошибку
        if (ontology == undefined) {
            //Делаем откат
            ontology = ontologyBackupStack.pop();

            //Вызываем сообщение об ошибке
            alert("Операция не может быть выполнена");
        } else {
            //Если же все прошло удачно
            //Перерисовывем древовидный список элементов
            BuildTreeList(sys, ontology);

            //Корректируем изображение графа
            sys.correctContent(ontology);

            //Корректируем параметры системы частиц, отвечающие за физику графа
            setTimeout("sys.correctParameters()", 75);
            //Почему здесь и далее юзается setTimeout - см. issue на GitHub'е
        }
    }


    //Обработчик кнопочки "Поиск"
    var LocateBtn = document.getElementById("LocateBtn");

    LocateBtn.onclick = function() {
        //Находим выделенные элементы
        var selectedElems = sys.getSelectedNodes();

        //Если не выделено ни одного элемента
        if (selectedElems.length == 0) {
            //Выводим соответствующее сообщение и заканчиванием выполнение. А можно и ничего не выводить.
            alert("Ни одного элемента не выделено");
            return;
        } else if (selectedElems.length > 1){
            //По идее, данная операция должна выполняться для одного элемента, поэтому
            //если выделено более одного
            //выводим соотв. сообщение и обрываем выполнение.
            alert("Выделите один элемент");
            return;
        }


        //Бэкапим онтологию
        ontologyBackupStack.push(JSON.parse(JSON.stringify(ontology)));

        //Запрашиваем параметры поиска. По-хорошему, надо бы запилить свое диалоговое окошко.
        var bfsFlag = confirm("Взять элементы, находящиеся с выбранным на одном уровне иерархии?");
        var dfsFlag = confirm("Взять элемент-родитель и элементы-потомки выбранного?");

        //Вызываем метод
        ontology = LocateElement(ontology, selectedElems[0], bfsFlag, dfsFlag);


        //Если метод вернул ошибку
        if (ontology == undefined) {
            //Делаем откат
            ontology = ontologyBackupStack.pop();

            //Вызываем сообщение об ошибке
            alert("Операция не может быть выполнена");
        } else {
            //Если же все прошло удачно
            //Перерисовывем древовидный список элементов
            BuildTreeList(sys, ontology);

            //Корректируем изображение графа
            sys.correctContent(ontology);

            //Корректируем параметры системы частиц, отвечающие за физику графа
            setTimeout("sys.correctParameters()", 75);
        }
    }


    //Обработчик кнопочки "Объединить"
    var UniteBtn = document.getElementById("UniteBtn");

    UniteBtn.onclick = function() {
        //Запрашиваем онтологии, с которыми необходимо объединить данную
        //Пока что заглушка, по-хорошему нужно свое диалоговое окно сбацать
        var idList = prompt("Введите через запятую id онтологий:");

        //Для заглушки сделаю только обработчик отмены запроса
        if (idList == null) {
            //В этом случае прекращаем выполнение
            return
        } else {
            //Иначе сплитаем строку по запятой
            idList = idList.split(',');
        }


        //Инициализируем массив онтологий, которые будут объединены
        var ontologiesArr = [];
        //Сразу добавим туда текущую
        ontologiesArr.push(JSON.parse(JSON.stringify(ontology)));

        //Загружаем запрошенные онтологии:

        //Создадим транспорт и напишем обработчик ответа от сервера
        var ajax = getXmlHttp();
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    //Если запрос успешен, добавляем в массив пришедшую онтологию
                    ontologiesArr.push(eval('(' + ajax.responseText + ')'));

                    //Если пришли все онтологии (т.к. с каждым шагом мы удаляем один элемент из массива idList, процесс закончится, когда его длин станет равна нулю)
                    //По идее ниженаписанный блок кода можно выделить в отдельную функцию
                    if (idList.length == 0) {
                        //Бэкапим онтологию
                        ontologyBackupStack.push(JSON.parse(JSON.stringify(ontology)));

                        //Вызываем метод
                        ontology = MultipleUnion(ontologiesArr);


                        //Если метод вернул ошибку
                        if (ontology == undefined) {
                            //Делаем откат
                            ontology = ontologyBackupStack.pop();

                            //Вызываем сообщение об ошибке
                            alert("Операция не может быть выполнена");
                        } else {
                            //Если же все прошло удачно
                            //Перерисовывем древовидный список элементов
                            BuildTreeList(sys, ontology);

                            //Корректируем изображение графа
                            sys.correctContent(ontology);

                            //Корректируем параметры системы частиц, отвечающие за физику графа
                            setTimeout("sys.correctParameters()", 75);
                        }
                        //Если пришли не все онтологии,
                    } else {
                        //запросим следующую
                        ajax.open('GET', '/ontologies/' + idList.shift() + '/get', true);
                        ajax.send(null);
                    }
                }
                else {
                    alert('Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу');
                }
            }
        }

        //Делаем первый запрос (далее процесс идет по цепочке)
        ajax.open('GET', '/ontologies/' + idList.shift() + '/get', true);
        ajax.send(null);
        //P.S. Может, заменить все это одним запросом? (См. соотв. issue на GitHub'е)
    }


    //Обработчик кнопочки "Отменить"
    var UndoBtn = document.getElementById("UndoBtn");

    UndoBtn.onclick = function() {
        //Если есть, к чему откатываться (бэкап-стек не пустой)
        if (ontologyBackupStack.length > 0) {
            //Откатываем онтологию
            ontology = ontologyBackupStack.pop();

            //Перерисовывем древовидный список элементов
            BuildTreeList(sys, ontology);

            //Корректируем изображение графа
            sys.correctContent(ontology);

            //Корректируем параметры системы частиц, отвечающие за физику графа
            setTimeout("sys.correctParameters()", 75);

        } else {
            //В противном случае можно кинуть alert,
            //а по-хорошему, надо бы замутить какой-нибудь дизейблер для кнопки "Отменить"
        }
    }


    //Обработчик кнопочки "Сохранить"
    var SaveBtn = document.getElementById("SaveBtn");

    SaveBtn.onclick = function() {
        var ans;

        //Запрашиваем название для новой онтологии
        //Пока пользователь не введет название
        while (!(ans = prompt('Введите название обобщенной онтологии', 'NewOntology'))) {
            //Если пользователь нажал "Отмена",
            if (ans == null) {
                //прекращаем выполнение
                return;
                //Иначе (т.е. была введена пустая строка)
            } else {
                //выводим соотв. сообщение
                alert('Вы не ввели название.');
            }
        }

        //В том случае, если было корректно введено название
        //Копируем текущую онтологию (вообще говоря, это как-то фигово, но мне нужно впилить туда еще одно св-во с имененм)
        var newOntology = JSON.parse(JSON.stringify(ontology));
        //Добавляем имя
        newOntology.name = ans;

        //Отправляем запрос на сервер
        var ajax = getXmlHttp();
        ajax.onreadystatechange = function() {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    //Если все оки - выводим сообщение
                    alert('Онтология ' + ans + ' успешно сохранена');
                }
                else {
                    //иначе выводим ошибку
                    alert('Ошибка: онтология не была сохранена. Попробуйте еще раз');
                }
            }
        }

        ajax.open('POST', '/ontologies', true);
        ajax.setRequestHeader('Content-Type', 'application/json');
        ajax.send(JSON.stringify(newOntology));
    }
}
