(function (){	
	var textField = document.getElementsByClassName('textField')[0];
	var elems = document.getElementsByClassName('list')[0].children;

	textField.onkeyup = function () {
        var textInput = this.value;
        for (var i = 0; i < elems.length; i++){
            if (elems[i].innerHTML.toLowerCase().indexOf(textInput.toLowerCase()) == -1){
                elems[i].style.display = "none";
            }
            else {
                elems[i].style.display = "block";
            }
        }
    }
})()