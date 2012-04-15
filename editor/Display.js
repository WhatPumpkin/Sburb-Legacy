// View code

var menus = {};
var stage;
var Stage;
var toDraw = new Array();
var drawingOne = false;
var updateLoop;

function clearViewScreen() {
    $("#previewNode").empty(); // erase preview resources
    $('#mainDisplay').contents().detach();
    clearTimeout(updateLoop);
    stage = null;
    Stage = null;
    toDraw = new Array();
    drawingOne = false;
}

function clearLeftMenu() {
    $("#leftmenu").empty();
}

function showMenu(menu) {
    for(m in menus) {
		var curMenu = menus[m];
		if(curMenu == menu) {
			curMenu.maindiv.show();
		} else {
			curMenu.maindiv.hide();
		}
    }
}
function displayMainMenu() {
    buildAssets();
    buildSprites();
    buildRooms();
    $("#assetTabLink").click(function() { showMenu(menus.assetMenu); });
    $("#spriteTabLink").click(function() { showMenu(menus.spriteMenu); });
    $("#roomTabLink").click(function() { showMenu(menus.roomMenu); });
    showMenu(menus.assetMenu);
}

function buildAssets() {
    function AssetDisplay(asset) {
	if(asset.type == "path") {
	    return; // dont display path assets
	}
	this.asset = asset;
	this.assetname = asset.name; //convenience
	// create asset div
	this.maindiv = $("<div class='assetTag' id='asset_"+asset.name+"'>");
	this.thumbdiv = $("<div class='thumbDiv'></div>").appendTo(this.maindiv);
	var infodiv = $("<div class='assetInfo'></div>").appendTo(this.maindiv);
	this.ok = $("<img src='editor/imgs/check.png' />");
	this.no = $("<img src='editor/imgs/check.png' />");
	this.loadedDiv = $("<div class='assetLoaded'></div>");
	var name = $("<div class='assetName'>"+asset.name+" ("+asset.type+")</div>").appendTo(infodiv);
	var sourcesdiv = $("<div></div>").appendTo(infodiv);
	if(asset.type == "graphic") {
	    var src = abs2relURL(asset.src);
	    $("<div class='assetSource'>"+src+"</div>").appendTo(sourcesdiv);
	    this.thumbdiv.append($("<img src='"+asset.src+"'>"));
	} else if(asset.type == "audio") {
	    var srcs = asset.childNodes;
	    for(i=0;i<srcs.length;i++) {
			n = srcs[i];
			var src = abs2relURL(n.src);
			$("<div class='assetSource'>"+src+"</div>").appendTo(sourcesdiv);
	    }
	}
	this.loadedDiv.append(this.no);
	var oThis = this;
	loaded = asset.assetOnLoadFunction(function() { 
	    oThis.loadedDiv.contents().replaceWith(oThis.ok); 
	});
	this.maindiv.append(this.loadedDiv);
	this.maindiv.click(function () { assetPreview(asset); });
     }
    if(!menus.assetMenu) {
		// create asset menu
		menus.assetMenu = {'maindiv': $('<div id="assetTab"></div>'), 'assetDisplays': new Array(),
				  };
		for(name in editAssets.assets) {
			var adisplay = new AssetDisplay(editAssets.assets[name]);
			menus.assetMenu.maindiv.append(adisplay.maindiv);
			menus.assetMenu.assetDisplays.push(adisplay);
		}
		$('#mainmenu').append(menus.assetMenu.maindiv);
    }
}

function showAssetPreview(asset) {
    var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();

    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');

    // edit info
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    $(sprintf("<div class='leftTitle'>Asset %s</div>", asset.name)).appendTo(newLeftDiv);

    if(asset.type == "graphic") {
		$('<img src="'+asset.src+'" />').appendTo(previewNode);
		$("<div class='srcInput'><input type='text' value='"+abs2relURL(asset.src)+"' name='srcInput1' size='35' /></div>").appendTo(newLeftDiv);
    } else if(asset.type == "audio") {
		var audiodiv = $('<audio controls="controls" autoplay="autoplay"></audio>').appendTo(previewNode);
		var srcs = asset.childNodes;
		for(i=0;i<srcs.length;i++) {
	    	var newsrc = $(srcs[i]).clone();
	    	audiodiv.append(newsrc);
	    	$("<div class='srcInput'><input type='text' value='"+abs2relURL(srcs[i].src)+"' name='srcInput1' size='35' /></div>").appendTo(newLeftDiv);
		}
    }
    mainNode.append(previewNode);
}

function buildSprites() {
    function spriteMenuDisplay(sprite) {
		var className = 'Sprite';
		if(sprite.spriteType == 'character') {
			var className = 'Character';
		}
		this.maindiv = $('<div class="spriteInfo">');
		$(sprintf('<div><a href="javascript:void(0);">%s (%s)</a></div>', sprite.name, className)).appendTo(this.maindiv);
		this.maindiv.click(function() { spritePreview(sprite); })
    }
    if(!menus.spriteMenu) {
		// create asset menu
		menus.spriteMenu = {'maindiv': $('<div id="spriteTab"></div>'), 'spriteDisplays': new Array()};
		for(name in editSprites.sprites) {
			var sdisplay = new spriteMenuDisplay(editSprites.sprites[name]);
			menus.spriteMenu.maindiv.append(sdisplay.maindiv);
			menus.spriteMenu.spriteDisplays.push(sdisplay);
		}
		$('#mainmenu').append(menus.spriteMenu.maindiv);
    }
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
    
    deployStage(previewNode,true);
}

function buildRooms() {

	function roomMenuDisplay(room) {
		this.maindiv = $('<div class="roomInfo">');
		$(sprintf('<div><a href="javascript:void(0);">%s</a></div>', room.name)).appendTo(this.maindiv);
		this.maindiv.click(function() { roomPreview(room); })
    }	
	
    menus.roomMenu = {'maindiv': $('<div id="roomTab">'),roomDisplays:new Array()};
    $('#mainmenu').append(menus.roomMenu.maindiv);
    if(menus.roomMenu) {
    	console.log("room menu");
		for(name in editRooms.rooms) {
			console.log("room: "+name);
			var sdisplay = new roomMenuDisplay(editRooms.rooms[name]);
			menus.roomMenu.maindiv.append(sdisplay.maindiv);
			menus.roomMenu.roomDisplays.push(sdisplay);
		}
		$('#mainmenu').append(menus.roomMenu.maindiv);
    }
}

function showRoomPreview(room){
	var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();
	
	toDraw.push(room);
	
    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');
    mainNode.append(previewNode);

    // edit info
    
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
    addRoomOptions(options,room);
    
    deployStage(previewNode);
}

function deployStage(area,oneObject){
	var canvas = $('<canvas id="Stage" width="650" height="450" tabindex="0" </canvas>');
	$("<div>").append(canvas).appendTo(area);
	Stage  = document.getElementById("Stage");	
	Stage.fps = 30;
    stage = Stage.getContext("2d"); 
    
    if(oneObject){
    	drawingOne = true;
    }else{
    	drawingOne = false;
    }
    
    update(0);
}

function addRoomOptions(theOptions,room){
	removeRoomOptions(theOptions);
	theOptions.remove('roomOptions');
	var options =  $("<div class='roomOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Room %s</div>", room.name)).appendTo(options);
	
	var items = new Array();
	
	items.push($('<input name="width" type="text" />').change(function() { room.width = parseInt(this.value); }).val(room.width));
    items.push($('<input name="height" type="text" />').change(function() { room.height = parseInt(this.value); }).val(room.height));
	
	addItems(options,items);
}

function addSpriteOptions(theOptions,sprite){
	function rebuildCharAnims(sprite){
		if(sprite.spriteType=="character"){
			sprite.animations = (new Character(sprite.name,sprite.x,sprite.y,sprite.width,sprite.height,sprite.animation.sx, sprite.animation.sy, sprite.animation.colSize, sprite.animation.rowSize,editAssets.assets[animation.sheet])).animations;
			sprite.animation = sprite.animations[sprite.animation.name];
		}
	}
	removeSpriteOptions(theOptions);
	var options =  $("<div class='spriteOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Sprite %s</div>", sprite.name)).appendTo(options);
	
	var items = new Array();
	
	items.push($('<input name="x" type="text" />').change(function() { sprite.x = parseInt(this.value); }).val(sprite.x));
    items.push($('<input name="y" type="text" />').change(function() { sprite.y = parseInt(this.value); }).val(sprite.y));
    items.push($('<input name="width" type="text" />').change(function() { sprite.width = parseInt(this.value); }).val(sprite.width));
    items.push($('<input name="height" type="text" />').change(function() { sprite.height = parseInt(this.value); }).val(sprite.height));
	
	var animationSelect = $('<select>');
    for(animation in sprite.animations){
    	$('<option value="'+animation+'">'+animation+'</option>').appendTo(animationSelect);
    }
    animationSelect.change(function(){sprite.startAnimation(this.value);if(sprite.spriteType!="character"){addAnimationOptions(options,sprite.animation);}}).val(sprite.animation.name);
	
	if(sprite.spriteType == "character") {
    	items.push($('<input name="sx" type="text" />').change(function() { sprite.animation.sx = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.sx));
    	items.push($('<input name="sy" type="text" />').change(function() { sprite.animation.sy = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.sy));
    	items.push($('<input name="sWidth" type="text" />').change(function() { sprite.animation.colSize = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.colSize));
    	items.push($('<input name="sHeight" type="text" />').change(function() { sprite.animation.rowSize = parseInt(this.value); rebuildCharAnims(sprite);}).val(sprite.animation.rowSize));
    	items.push($('<input name="sheet" type="text" />').change(function() { sprite.animation.sheet = editAssets.assets[this.value]; rebuildCharAnims(sprite);}).val(sprite.animation.sheet.name));
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
    
    addItems(options,items);
    
    if(sprite.spriteType!="character"){
    addAnimationOptions(options,sprite.animation);
    }
}

function addItems(options,items){
	for(var i=0;i<items.length;i++){
    	var item = items[i];
    	var name = item.attr("name");
    	var label = name?name+":" : "";
    	$("<div>"+label+"</div>").append(item).appendTo(options);
    }
}

function addAnimationOptions(theOptions,animation){
	removeAnimationOptions(theOptions);
	var options =  $("<div class='animationOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Animation %s</div>", animation.name)).appendTo(options);
	
	var items = new Array();
	items.push($('<input name="sheet" type="text" /></br>').change(function() { animation.setSheet(editAssets.assets[this.value]);}).val(animation.sheet.name));
	items.push($('<input name="sx" type="text" /></br>').change(function() { animation.sx = parseInt(this.value); }).val(animation.sx));
	items.push($('<input name="sy" type="text" /></br>').change(function() { animation.sy = parseInt(this.value); }).val(animation.sy));
	items.push($('<input name="colSize" type="text" /></br>').change(function() { animation.setColSize(parseInt(this.value)); }).val(animation.colSize));
	items.push($('<input name="rowSize" type="text" /></br>').change(function() { animation.setRowSize(parseInt(this.value)); }).val(animation.rowSize));
	items.push($('<input name="startPos" type="text" /></br>').change(function() { animation.startPos = parseInt(this.value); this.animation.reset();}).val(animation.startPos));
	items.push($('<input name="length" type="text" /></br>').change(function() { animation.length = parseInt(this.value); this.animation.reset();}).val(animation.length));
	items.push($('<input name="frameInterval" type="text" /></br>').change(function() { animation.frameInterval = parseInt(this.value); this.animation.reset();}).val(animation.frameInterval));
	items.push($('<input name="loops" type="text" /></br>').change(function() { animation.loopNum = parseInt(this.value); this.animation.reset();}).val(animation.loopNum));
	
	addItems(options,items);
}

function removeRoomOptions(theOptions){
	$('div').remove('.roomOptions');
}

function removeSpriteOptions(theOptions){
	$('div').remove('.spriteOptions');
}

function removeAnimationOptions(theOptions){
	$('div').remove('.animationOptions');
}




function update(gameTime){
	for(var i=0;i<toDraw.length;i++){
		toDraw[i].update(gameTime);
	}
	updateLoop=setTimeout("update("+(gameTime+1)+")",1000/Stage.fps);
	draw(gameTime);
}

function draw(gameTime){
	stage.save();
	stage.fillStyle = "rgb(255,255,255)";
	stage.fillRect(0,0,Stage.width,Stage.height);
	if(drawingOne && toDraw.length>0){
		var specialOne = toDraw[0];
		var specialAnim = specialOne.animation;
		
		var scaleFactor = 1;
		if(specialAnim.colSize>Stage.width*scaleFactor){
			scaleFactor = specialAnim.colSize/Stage.width;
		}
		if(specialAnim.rowSize>Stage.height*scaleFactor){
			scaleFactor = specialAnim.rowSize/Stage.height;
		}
		var newX = Stage.width*scaleFactor/2-specialOne.x-specialAnim.sx-specialAnim.colSize/2;
		var newY = Stage.height*scaleFactor/2-specialOne.y-specialAnim.sy-specialAnim.rowSize/2;
		stage.scale(1/scaleFactor,1/scaleFactor);
		stage.translate(newX,newY);
		
	}
	for(var i=0;i<toDraw.length;i++){
		toDraw[i].draw();
		toDraw[i].drawMeta();
	}
	stage.restore();
}
