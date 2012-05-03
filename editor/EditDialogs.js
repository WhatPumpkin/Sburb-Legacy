function buildDialogs(){
	function dialogMenuDisplay(animation){
		this.maindiv = $('<div class="dialogInfo">');
		$(sprintf('<div><a href="javascript:void(0);">%s</a></div>', animation.name)).appendTo(this.maindiv);
		this.maindiv.click(function() { showDialogPreview(animation); })
	}
	menus.dialogMenu = {'maindiv': $('<div id="dialogTab">'),dialogDisplays:new Array()};
    $('#mainmenu').append(menus.dialogMenu.maindiv);
    if(menus.dialogMenu) {
		for(name in dialoger.dialogSpriteLeft.animations) {
			var sdisplay = new dialogMenuDisplay(dialoger.dialogSpriteLeft.animations[name]);
			menus.dialogMenu.maindiv.append(sdisplay.maindiv);
			menus.dialogMenu.dialogDisplays.push(sdisplay);
		}
		$('#mainmenu').append(menus.dialogMenu.maindiv);
    }
}

function showDialogPreview(animation){
	var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();
	
	toDraw.push(dialoger);
	dialoger.startDialog("@"+animation.name+" Lorem Ipsum...");
	
    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');
    mainNode.append(previewNode);

    // edit info
    
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
    addAnimationOptions(options,animation);
    
    deployStage(previewNode,"rgb(170,170,170)");
}
