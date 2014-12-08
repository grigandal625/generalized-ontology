(function (){	
	var textField = document.getElementsByClassName('textField')[0];
	var elems = document.getElementsByClassName('listElement');

	textField.onkeyup = function () {
        var textInput = this.value;
        for (var i = 0; i < elems.length; i++){
            if (elems[i].innerHTML.toLowerCase().indexOf(textInput.toLowerCase()) == -1){
                elems[i].parentNode.style.backgroundColor = "rgba(0,0,0,0.5)";
            }
            else {
                elems[i].parentNode.style.backgroundColor = "transparent";
            }
        }
    }
})()