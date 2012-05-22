function EditSprites() {
    this.sprites = {};
    
    this.add = function (spriteObj) {
			var name = spriteObj.name;
			this.sprites[name] = spriteObj;
			if(menus.spriteMenu){
				appendSprite(spriteObj.name);
			}
    }
    
    this.remove = function (name) {
    	if(menus.spriteMenu){
    		for(var i=0; i<menus.spriteMenu.spriteDisplays.length;i++){
    			if(menus.spriteMenu.spriteDisplays[i].spriteName == name){
    				menus.spriteMenu.spriteDisplays[i].maindiv.remove();
    				break;
    			}
    		}
			}
			this.sprites[name] = undefined;
			
    }
}

function buildSprites() {
    if(!menus.spriteMenu) {
			// create asset menu
			menus.spriteMenu = {'maindiv': $('<div id="spriteTab"></div>'), 'spriteDisplays': new Array()};
			menus.spriteMenu.listdiv = $('<div id="spriteList"></div>');
			menus.spriteMenu.maindiv.append(menus.spriteMenu.listdiv);
			for(name in editSprites.sprites) {
				appendSprite(name);
			}
			$('#mainmenu').append(menus.spriteMenu.maindiv);
			
			menus.spriteMenu.newdiv = $('<div class="spriteAdd">');
    	var newSprite = $('<div><a href="javascript:void(0);">Add Sprite</a></div>');
    	newSprite.click(function(){
    		editSprites.add(newSpriteWizard());
    	});
    	menus.spriteMenu.newdiv.append(newSprite);
    	menus.spriteMenu.maindiv.append(menus.spriteMenu.newdiv);
    }  
}

function spriteMenuDisplay(sprite) { //I AM A CLASS!
		var className = 'Sprite';
		if(sprite.spriteType == 'character') {
			var className = 'Character';
		}
		this.spriteName = sprite.name;
		this.maindiv = $('<div class="spriteInfo">');
		$(sprintf('<div><a href="javascript:void(0);">%s (%s)</a></div>', sprite.name, className)).appendTo(this.maindiv);
		this.maindiv.click(function() { spritePreview(sprite); })
}

function appendSprite(name){
	var sdisplay = new spriteMenuDisplay(editSprites.sprites[name]);
	menus.spriteMenu.listdiv.append(sdisplay.maindiv);
	menus.spriteMenu.spriteDisplays.push(sdisplay);
}

function spritePreview(sprite) {
    // controller functions go here, then call sprite
    // preview display function
    showSpritePreview(sprite);
}

function showSpritePreview(sprite) {
    var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();

    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');
    mainNode.append(previewNode);
    
    toDraw.push(sprite);
    

    // edit info
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
    addSpriteOptions(options,sprite);
    
    deployStage(previewNode,"rgb(200,200,200)",true);
}

function addSpriteOptions(theOptions,sprite){
	function rebuildCharAnims(sprite){
		if(sprite.spriteType=="character"){
			sprite.animations = (new Character(sprite.name,sprite.x,sprite.y,sprite.width,sprite.height,sprite.animation.x, sprite.animation.y, sprite.animation.colSize, sprite.animation.rowSize,editAssets.assets[sprite.animation.sheet.name])).animations;
			sprite.animation = sprite.animations[sprite.animation.name];
		}
	}
	removeSpriteOptions(theOptions);
	var options =  $("<div class='collapsable spriteOptions'>").appendTo(theOptions);
	$("<div class='leftTitle'>Sprite </div>").append($("<input type='text'/>").change(function() {editSprites.remove(sprite.name); sprite.name = this.value; editSprites.add(sprite);}).val(sprite.name)).appendTo(options);
	
	var items = new Array();
	
	items.push($('<input name="x" type="text" />').change(function() { sprite.x = parseInt(this.value); }).val(sprite.x));
    items.push($('<input name="y" type="text" />').change(function() { sprite.y = parseInt(this.value); }).val(sprite.y));
    items.push($('<input name="width" type="text" />').change(function() { sprite.width = parseInt(this.value); }).val(sprite.width));
    items.push($('<input name="height" type="text" />').change(function() { sprite.height = parseInt(this.value); }).val(sprite.height));
	
	var animationSelect = $('<select name="animation">');
    for(animation in sprite.animations){
    	$('<option value="'+animation+'">'+animation+'</option>').appendTo(animationSelect);
    }
    $('<option value="Add Animation">Add Animation</option>').appendTo(animationSelect);
    animationSelect.change(function(){
    	if(this.value!="Add Animation"){
    		sprite.startAnimation(this.value);
		  	if(sprite.spriteType!="character"){
		  		addAnimationOptions(options,sprite.animation);
		  	}
    	}else{
    		//add an animation?
    	}
    }).val(sprite.animation);
	
	if(sprite.spriteType == "character") {
    	items.push($('<input name="sx" type="text" />').change(function() { sprite.animation.x = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.x));
    	items.push($('<input name="sy" type="text" />').change(function() { sprite.animation.y = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.y));
    	items.push($('<input name="sWidth" type="text" />').change(function() { sprite.animation.colSize = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.colSize));
    	items.push($('<input name="sHeight" type="text" />').change(function() { sprite.animation.rowSize = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.rowSize));
    	items.push(graphicSelect("sheet",function() { sprite.animation.sheet = editAssets.assets[this.value]; rebuildCharAnims(sprite);},sprite.animation.sheet.name));
    	items.push($('<select name="facing">\
					<option value="Front">Front</option>\
					<option value="Back">Back</option>\
					<option value="Left">Left</option>\
					<option value="Right">Right</option></select>').change(function() { sprite.facing = this.value; sprite.walk(); animationSelect.val(sprite.animation.name);}).val(sprite.facing));
    } else {
        items.push($('<input name="collidable" type="checkbox" />').click(function() { sprite.collidable = this.checked; }).val(sprite.collidable));
        /*if(sprite.collidable) {
	    	i0.prop("checked", true);
        }*/
        items.push($('<name="depthing" select>\
					<option value="0">Background</option>\
					<option value="1">Midground</option>\
					<option value="2">Foreground</option></select>').change(function() { sprite.depthing = this.value; }).val(sprite.depthing));
    }
    
    items.push(animationSelect);
    if(sprite.actions.length>0){
			var actionSelect = $('<select name="action">');
			for(var i=0;i<sprite.actions.length;i++){
				$('<option value="'+i+'">'+sprite.actions[i].name+'</option>').appendTo(actionSelect);
			}
			actionSelect.change(function(){removeActionOptions(options); addActionOptions(options,sprite.actions[parseInt(this.value)]);}).val(sprite.actions[0]);
			items.push(actionSelect);
    }
    addItems(options,items);
    if(sprite.spriteType!="character"){
    	addAnimationOptions(options,sprite.animation);
    }
    if(actionSelect){
    	addActionOptions(options,sprite.actions[0]);
    }
}

function removeSpriteOptions(theOptions){
	$(theOptions).children().remove('.spriteOptions');
}

function newSpriteWizard(){
	var name = "newSprite";
	var x = 0;
	var y = 0;
	var width = 60;
	var height = 60;
	var dx = 0;
	var dy = 0;
	var depthing = 1;
	var collidable = false;
	var newSprite = new Sprite("newSprite",0,0,100,100);
	return newSprite;
}
