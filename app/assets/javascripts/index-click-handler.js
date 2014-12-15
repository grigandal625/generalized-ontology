(function (){

var listElems = document.getElementsByClassName('listElement');

for (var i = 0; i < listElems.length; i++) {
	listElems[i].onclick = function() {
		window.location.href = "/ontologies/" + this.id;
	}

    listElems[i].oncontextmenu = function() {
        ShowActionMenu(this.id);

        return false;
    }
}

var ShowActionMenu = function(id) {
    var ActionMenu = document.getElementById('actionMenu');

    ActionMenu.style.top = event.clientY + 'px';
    ActionMenu.style.left = event.clientX + 'px';
    ActionMenu.style.display = "block";

    var deleteLink = ActionMenu.children[0];
    deleteLink.href = "/ontologies/" + id;

    document.onclick = function() {
        ActionMenu.style.display = "none";
        document.onclick = undefined;
    }
}
})()