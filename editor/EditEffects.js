function EditEffects() {
    this.effects = {};
    
    this.add = function (animaiton) {
		var name = animation.name;
		this.effects[name] = animation;
    }
    
    this.remove = function (name) {
		this.effects[name] = undefined;
    }
}

function buildEffects(){
	function effectMenuDisplay(animation){
		this.maindiv = $('<div class="effectInfo">');
		$(sprintf('<div><a href="javascript:void(0);">%s</a></div>', animation.name)).appendTo(this.maindiv);
		this.maindiv.click(function() { effectPreview(animation); })
	}
	menus.effectMenu = {'maindiv': $('<div id="effectTab">'),effectDisplays:new Array()};
    $('#mainmenu').append(menus.effectMenu.maindiv);
    if(menus.effectMenu) {
		for(name in editEffects.effects) {
			var sdisplay = new effectMenuDisplay(editEffects.effects[name]);
			menus.effectMenu.maindiv.append(sdisplay.maindiv);
			menus.effectMenu.effectDisplays.push(sdisplay);
		}
		$('#mainmenu').append(menus.effectMenu.maindiv);
    }
}

function effectPreview(effect) {
    // controller functions go here, then call sprite
    // preview display function
    showEffectPreview(effect);
}

function showEffectPreview(animation){
	var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();
	
	var holder = new Sprite("blah",0,0,0,0);
	holder.addAnimation(animation);
	holder.startAnimation(animation.name);
	
	toDraw.push(holder);
	
    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');
    mainNode.append(previewNode);

    // edit info
    
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
    addAnimationOptions(options,animation);
    
    deployStage(previewNode,"rgb(170,170,170)",true);
}
