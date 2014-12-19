/**
 * Created by Максим on 08.12.14.
 */

//Операция отсечения

//Размышления на тему вариации алгоритма смотри в соотв. issue на GitHub'е
function CutElements(ontology, elementsToCut) {
    for (var i = 0; i < elementsToCut.length; i++) {
        deleteElement(ontology, elementsToCut[i]);
    }

    //Типа сплющиваем все массивы
    for (var keys in ontology) {
        flatten(ontology[keys]);
    }

    //Если был удален корень (т.е. по сути все дерево целиком)
    if (ontology.elements.length == 0) {
        //Вернем ошибку
        return undefined;
    } else {
        //Если все в порядке, возвращаем прооперированную онтологию
        return ontology;
    }
}

function deleteElement(ontology, id) {
    for (var i = 0; i < ontology.elements.length; i++) {
        if (ontology.elements[i] != null && ontology.elements[i].element_id == id) {
            ontology.elements[i] = null;//Удалить элемент из списка
            break;
        }
    }

    //В случае, если элемент не был найден, продолжать выполнение функции бессмысленно
    if (i == ontology.elements.length) {return}


    //Изменил немного свой старый код: сразу при проходе по structure запускаю рекурсивное удаление. Если что-то будет косячить,
    //см. старую версию в script.js
    for (var i = 0; i < ontology.structure.length; i++) {
        //Если у элемента найден потомок, рекурсивно удалим его
        if (ontology.structure[i] != null && ontology.structure[i].parent_element == id) {
            deleteElement(ontology, ontology.structure[i].element_id);
        }

        if (ontology.structure[i] != null && ontology.structure[i].element_id == id) {
            ontology.structure[i] = null;
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








//Операция выборки

function ExcerptElements(ontology, elementsToExcerpt) {
    var result = {};

    //Инициализируем все части новой онтологии
    for (var keys in ontology) {
        result[keys] = [];
    }

    //Добавляем все элементы из исходной онтологии
    for (var i = 0; i < ontology.elements.length; i++) {
        //Если элемент есть среди тех, которые выбраны - добавляем его
        if (elementsToExcerpt.indexOf(ontology.elements[i].element_id) >= 0) {
            //Просто запушить объект нельзя, т.к. он хранится по ссылке, по этому костыльно копируем его
            //Хз, как лучше: туда-сюда прогонять через JSON (как сделано), или вручную инициализировать объект и копировать значения. Во всяком случае, так короче.
            result.elements.push(JSON.parse(JSON.stringify(ontology.elements[i])));
        }
    }


    //Добавляем все иерархические связи
    for (var i = 0; i < ontology.structure.length; i++) {
        if (elementsToExcerpt.indexOf(ontology.structure[i].element_id) >= 0 && elementsToExcerpt.indexOf(ontology.structure[i].parent_element) >= 0) {
            result.structure.push(JSON.parse(JSON.stringify(ontology.structure[i])));
        }
    }

    //Добавляем все связи
    for (var i = 0; i < ontology.links.length; i++) {
        if (elementsToExcerpt.indexOf(ontology.links[i].element_id) >= 0 && elementsToExcerpt.indexOf(ontology.links[i].linked_element_id) >= 0) {
            result.links.push(JSON.parse(JSON.stringify(ontology.links[i])));
        }
    }


    //Добавляем все компетенции
    for (var i = 0; i < ontology.competences.length; i++) {
        if (elementsToExcerpt.indexOf(ontology.competences[i].element_id) >= 0) {
            result.competences.push(JSON.parse(JSON.stringify(ontology.competences[i])));
        }
    }


    //Добавляем все признаки
    for (var i = 0; i < ontology.signs.length; i++) {
        if (elementsToExcerpt.indexOf(ontology.signs[i].element_id) >= 0) {
            result.signs.push(JSON.parse(JSON.stringify(ontology.signs[i])));
        }
    }


    //Если в результате выборки получилась связная онтология ...
    //А нужна ли вообще проверка на связность? Хороший вопрос.
    if (true) {
        return result;
    } else {
        return undefined;
    }
}







//Операция "поиска"

function LocateElement(ontology, id, bfsFlag, dfsFlag) {
    var result = {};

    //Инициализируем массив, в котором будут храниться айдишники элементов,
    //которые должны присутствовать в новой онтологии
    var elementsToAdd = [];
    //Сразу запихнем туда выбранный элемент
    elementsToAdd.push(id);

    //Инициализируем все части новой онтологии
    for (var keys in ontology) {
        result[keys] = [];
    }

    //По-хорошему, нужно написать короткое выполнение в том случае, если не затребованы ни элементы того же уровня иерархии, ни потомки и родитель (хотя на кой черт тогда вообще юзать этот метод?)
    if (!dfsFlag && !bfsFlag) {
        //В таком случае просто находим выделенный элемент в исходной онтологии и пихаем ее в новую
        for (var i = 0; i < ontology.elements.length; i++) {
            if (ontology.elements[i].element_id == id) {
                result.elements.push(JSON.parse(JSON.stringify(ontology.elements[i])));

                //И сразу возвращаем значение
                return result;
            }
        }
    }

    //Если нужно взять элементы с того же уровня иерархии, определим его
    if (bfsFlag){
        for (var i = 0; i < ontology.structure.length; i++) {
            if (ontology.structure[i].element_id == id) {
                var level = ontology.structure[i].level_id;
                break;
            }
        }
    }

    //Теперь пробежимся по структуре онтологии, чтобы определить, какие элементы нам нужны.
    for (var i = 0; i < ontology.structure.length; i++) {
        //Если требуется, находим элемент-родитель...
        if (dfsFlag && ontology.structure[i].element_id == id) {
            elementsToAdd.push(ontology.structure[i].parent_element);
        }

        //... и элементы-потомки
        if (dfsFlag && ontology.structure[i].parent_element == id) {
            elementsToAdd.push(ontology.structure[i].element_id);
        }

        //Если требуется, берем элементы с уровня иерархии, определенного ранее
        if (bfsFlag && ontology.structure[i].level_id == level) {
            elementsToAdd.push(ontology.structure[i].element_id);
            //Ребро в данном случае копировать не надо, т.к. его не может быть в новой онтологии
        }
    }

    //Далее добавляем, собственно, элементы-объекты в новую онтологию
    for (var i = 0; i < ontology.elements.length; i++) {
        //Если элемент есть среди тех, которые выбраны - добавляем его
        if (elementsToAdd.indexOf(ontology.elements[i].element_id) >= 0) {
            result.elements.push(JSON.parse(JSON.stringify(ontology.elements[i])));
        }
    }

    //Добавляем иерархические связи
    for (var i = 0; i < ontology.structure.length; i++) {
        if (elementsToAdd.indexOf(ontology.structure[i].element_id) >= 0 && elementsToAdd.indexOf(ontology.structure[i].parent_element) >= 0) {
            result.structure.push(JSON.parse(JSON.stringify(ontology.structure[i])));
        }
    }

    //Добавляем все связи
    for (var i = 0; i < ontology.links.length; i++) {
        if (elementsToAdd.indexOf(ontology.links[i].element_id) >= 0 && elementsToAdd.indexOf(ontology.links[i].linked_element_id) >= 0) {
            result.links.push(JSON.parse(JSON.stringify(ontology.links[i])));
        }
    }

    //Добавляем все компетенции
    for (var i = 0; i < ontology.competences.length; i++) {
        if (elementsToAdd.indexOf(ontology.competences[i].element_id) >= 0) {
            result.competences.push(JSON.parse(JSON.stringify(ontology.competences[i])));
        }
    }

    //Добавляем все признаки
    for (var i = 0; i < ontology.signs.length; i++) {
        if (elementsToAdd.indexOf(ontology.signs[i].element_id) >= 0) {
            result.signs.push(JSON.parse(JSON.stringify(ontology.signs[i])));
        }
    }

    //Едва ли здесь нужна проверка на что-то. Метод и так бредовый.
    //Поэтому просто возвращаем новую онтологию
    return result;
}







//Операция объединения

//Функция, реализующая объединение нескольких онтологий (на входе массив)
function MultipleUnion(ontologiesArr) {
    var result;

    //Если на ход поступило меньше двух онтологий, возвращаем ошибку
    if (ontologiesArr.length < 2) {
        return undefined;
    }

    //Вообще говоря, не каждая пара онтологий может быть объединена,
    //но т.к. мы заранее знаем, что хотя бы один общий элемент есть в каждой онтологии (корень - название специализации),
    //то пока что выполнение будет значительно упрощено за счет того, что выщеописанная особенность пропускается

    //Скопируем в текущий результат первую онтологию из списка
    result = JSON.parse(JSON.stringify(ontologiesArr[0]));

    //Т.о. итерации начинаем уже со второго элемента массива
    for (var i = 1; i < ontologiesArr.length; i++) {
        //Объединяем текущий результат со следующей онтологией
        result = BinaryUnion(result, ontologiesArr[i]);

        //Сделаем для приличия такую заглушку:
        //если на каком либо шаге пришла ошибка
        if (result == undefined) {
            //возвращаем фигу
            return undefined;
        }
    }

    //Возвращаем результат
    return result;
}



//Функция, реализующая объединение двух онтологий
function BinaryUnion(ontology1, ontology2) {
    var result = {};

    //Инициализируем все структуры для новой онтологии
    for (var keys in ontology1) {
        result[keys] = [];
    }

    //Далее производим слияние соответствующих массивов.
    //--- !!!ВНИМАНИЕ!!! Предполагается, что массивы упорядочены (по element_id) !!!ВНИМАНИЕ!!! ---

    var i = 0; var j = 0;
    //Условия выглядят очень убого из-за длинных названий, но ничего не поделаешь
    //Пока оба массива не закончились
    while ((i != ontology1.elements.length) || (j != ontology2.elements.length)) {
        //ЕСЛИ (первый массив не закончился) И ((второй массив закончился) ИЛИ (текущий элемент первого массива меньше текущего элемента второго)
        if ((i != ontology1.elements.length) && ((j == ontology2.elements.length) || (ontology1.elements[i].element_id < ontology2.elements[j].element_id))) {
            //берем элемент из первого массива
            result.elements.push(JSON.parse(JSON.stringify(ontology1.elements[i])));
            i++;
        //ИНАЧЕ ЕСЛИ (второй массив не закончился) И ((первый массив закончился) ИЛИ (текущий элемент первого массива больше текущего элемента второго)
        } else if ((j != ontology2.elements.length) && ((i == ontology1.elements.length) || (ontology1.elements[i].element_id > ontology2.elements[j].element_id))) {
            //берем элемент из второго массива
            result.elements.push(JSON.parse(JSON.stringify(ontology2.elements[j])));
            j++;
        //ИНАЧЕ (значит текущие элементы в обоих массивах равны)
        } else {
            //берем элемент из любого массива (например, из первого) и пропускаем элемент в другом
            result.elements.push(JSON.parse(JSON.stringify(ontology1.elements[i])));
            i++; j++;
        }
    }

    //Если количество элементов в новой онтологии равно сумме элементов исходных, значит их пересечение пустое, т.е. объединение невозможно
    if (result.elements.length == (ontology1.elements.length + ontology2.elements.length)) {
        //В таком случае возвращаем ошибку
        return undefined;
    }

    i = 0; j = 0;
    //Далее чуть сложнее, т.к. сравниваем уже пары элементов
    //Пока оба массива не закончились
    while ((i != ontology1.structure.length) || (j != ontology2.structure.length)) {
        //ЕСЛИ (первый массив не закончился) И ((второй массив закончился) ИЛИ ((первый элемент пары из первого массива меньше первого элемента пары из второго) ИЛИ ((первые элементы в парах обоих массивов равны) И (второй элемент пары первого массива меньше второго элемента пары второго массива))))
        if ((i != ontology1.structure.length) && ((j == ontology2.structure.length) || ((ontology1.structure[i].element_id < ontology2.structure[j].element_id) || ((ontology1.structure[i].element_id == ontology2.structure[j].element_id) && (ontology1.structure[i].parent_element < ontology2.structure[j].parent_element))))) {
            //берем пару из первого массива
            result.structure.push(JSON.parse(JSON.stringify(ontology1.structure[i])));
            i++;
        //ИНАЧЕ ЕСЛИ (второй массив не закончился) И ((первый массив закончился) ИЛИ ((первый элемент пары из первого массива больше первого элемента пары из второго) ИЛИ ((первые элементы в парах обоих массивов равны) И (второй элемент пары первого массива больше второго элемента пары второго массива))))
        } else if ((j != ontology2.structure.length) && ((i == ontology1.structure.length) || ((ontology1.structure[i].element_id > ontology2.structure[j].element_id) || ((ontology1.structure[i].element_id == ontology2.structure[j].element_id) && (ontology1.structure[i].parent_element > ontology2.structure[j].parent_element))))) {
            //берем пару из второго массива
            result.structure.push(JSON.parse(JSON.stringify(ontology2.structure[j])));
            j++;
        //ИНАЧЕ (значит текущие пары в обоих массивах одинаковы)
        } else {
            //берем пару из любого массива (например, из первого) и пропускаем пару в другом
            result.structure.push(JSON.parse(JSON.stringify(ontology1.structure[i])));
            i++; j++;
        }
    }

    //Аналогичным образом сливаем оставшиеся массивы:

    //Связи:
    i = 0; j = 0;
    while ((i != ontology1.links.length) || (j != ontology2.links.length)) {
        if ((i != ontology1.links.length) && ((j == ontology2.links.length) || ((ontology1.links[i].element_id < ontology2.links[j].element_id) || ((ontology1.links[i].element_id == ontology2.links[j].element_id) && (ontology1.links[i].linked_element_id < ontology2.links[j].linked_element_id))))) {
            result.links.push(JSON.parse(JSON.stringify(ontology1.links[i])));
            i++;
        } else if ((j != ontology2.links.length) && ((i == ontology1.links.length) || ((ontology1.links[i].element_id > ontology2.links[j].element_id) || ((ontology1.links[i].element_id == ontology2.links[j].element_id) && (ontology1.links[i].linked_element_id > ontology2.links[j].linked_element_id))))) {
            result.links.push(JSON.parse(JSON.stringify(ontology2.links[j])));
            j++;
        } else {
            //Если была найдена связь между двумя одинаковыми элементами в онтологиях, преобразуем ее:
            var tmpLink = JSON.parse(JSON.stringify(ontology1.links[i]));
            //Т.к. атрибут link_type принимает только значения [0, 1, 2], преобразование можно выполнить следующей простой формулой
            //Замечание: считается, что 0 - слабая связь, 2 - сильная связь
            tmpLink.link_type = Math.floor((ontology1.links[i].link_type + ontology2.links[j].link_type) / 2);
            result.links.push(tmpLink);
            i++; j++;
        }
    }

    //Компетенции:
    i = 0; j = 0;
    while ((i != ontology1.competences.length) || (j != ontology2.competences.length)) {
        if ((i != ontology1.competences.length) && ((j == ontology2.competences.length) || ((ontology1.competences[i].element_id < ontology2.competences[j].element_id) || ((ontology1.competences[i].element_id == ontology2.competences[j].element_id) && (ontology1.competences[i].competence_id < ontology2.competences[j].competence_id))))) {
            result.competences.push(JSON.parse(JSON.stringify(ontology1.competences[i])));
            i++;
        } else if ((j != ontology2.competences.length) && ((i == ontology1.competences.length) || ((ontology1.competences[i].element_id > ontology2.competences[j].element_id) || ((ontology1.competences[i].element_id == ontology2.competences[j].element_id) && (ontology1.competences[i].competence_id > ontology2.competences[j].competence_id))))) {
            result.competences.push(JSON.parse(JSON.stringify(ontology2.competences[j])));
            j++;
        } else {
            result.competences.push(JSON.parse(JSON.stringify(ontology1.competences[i])));
            i++; j++;
        }
    }

    //Признаки:
    i = 0; j = 0;
    while ((i != ontology1.signs.length) || (j != ontology2.signs.length)) {
        if ((i != ontology1.signs.length) && ((j == ontology2.signs.length) || ((ontology1.signs[i].element_id < ontology2.signs[j].element_id) || ((ontology1.signs[i].element_id == ontology2.signs[j].element_id) && (ontology1.signs[i].competence_id < ontology2.signs[j].competence_id))))) {
            result.signs.push(JSON.parse(JSON.stringify(ontology1.signs[i])));
            i++;
        } else if ((j != ontology2.signs.length) && ((i == ontology1.signs.length) || ((ontology1.signs[i].element_id > ontology2.signs[j].element_id) || ((ontology1.signs[i].element_id == ontology2.signs[j].element_id) && (ontology1.signs[i].competence_id > ontology2.signs[j].competence_id))))) {
            result.signs.push(JSON.parse(JSON.stringify(ontology2.signs[j])));
            j++;
        } else {
            result.signs.push(JSON.parse(JSON.stringify(ontology1.signs[i])));
            i++; j++;
        }
    }

    //Возвращаем результат
    return result;
}
