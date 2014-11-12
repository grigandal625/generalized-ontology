(function (){

var listElems = document.getElementsByClassName('listElement');
for (var i = 0; i < listElems.length; i++) {
	listElems[i].onclick = function() {
		window.location.href = "/ontologies/" + this.id; 
	}
}

})()