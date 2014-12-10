/**
 * Created by Максим on 08.12.14.
 */
var ontologiesToUniteIDs;
var ontologiesToUnite = [];

var ajax = getXmlHttp();
ajax.onreadystatechange = function() {
    if (ajax.readyState == 4) {
        if (ajax.status == 200) {
            var loadedOntology = eval('(' + ajax.responseText + ')');
            ontologiesToUnite.push(loadedOntology);
            if (ontologiesToUniteIDs.length == 0) {
                uniteWithOntologies(ontologiesToUnite);
            }
        }
        else {
            alert('Ошибка: запрос не был выполнен. Попробуйте перезагрузить страницу');
        }
    }
}

for (var i = 0; i < ontologiesToUniteIDs.length){
    ajax.open('GET', '/ontologies' + ontologiesToUniteIDs[i] + '/get', true);
    ajax.send(null);
}

function UniteWithOntologies (ontologiesArr) {
    ontologyBackupStack = JSON.parse(JSON.stringify(ontology));
    for (var i = 0; i < ontologiesArr.length; i++){
        //По идее по порядку может не получиться операция. Нужен циклический обход
        uniteOntologies(ontology, ontologiesArr[i]);
    }
}

function uniteOntologies(ontology1, ontology2) {

}
