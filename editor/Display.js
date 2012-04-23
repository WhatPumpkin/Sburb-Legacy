// View code

var menus = {};
var stage;
var toDraw = new Array();
var drawingOne = false;
var updateLoop;
var Stage = {width:650,height:450,color:"rgb(0,0,0)"};
var Mouse = {x:0,y:0,down:false};
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
    buildDialogs();
    buildEffects();
    $("#assetTabLink").click(function() { showMenu(menus.assetMenu); });
    $("#spriteTabLink").click(function() { showMenu(menus.spriteMenu); });
    $("#roomTabLink").click(function() { showMenu(menus.roomMenu); });
    $("#dialogTabLink").click(function() { showMenu(menus.dialogMenu); });
    $("#effectTabLink").click(function() { showMenu(menus.effectMenu); });
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
    
    deployStage(previewNode,"rgb(200,200,200)",true);
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
		for(name in editRooms.rooms) {
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

function deployStage(area,color,oneObject){
	var canvas = $('<canvas id="Stage" width="650" height="450" tabindex="0"\
								onmousedown = "onMouseDown(event,this)"\
								onmousemove = "onMouseMove(event,this)"\
								onmouseup = "onMouseUp(event,this)"></canvas>');
	$("<div>").append(canvas).appendTo(area);
	Stage  = document.getElementById("Stage");	
	Stage.fps = 30;
	Stage.x = Stage.y = 0;
    stage = Stage.getContext("2d"); 
    
    if(oneObject){
    	drawingOne = true;
    }else{
    	drawingOne = false;
    }
    
    if(color){
    	Stage.color = color;
    }else{
    	Stage.color = "rgb(0,0,0)";
    }
    
    update(0);
}

function addRoomOptions(theOptions,room){
	removeRoomOptions(theOptions);
	theOptions.remove('roomOptions');
	var options =  $("<div class='collapsable'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Room %s</div>", room.name)).appendTo(options);
	
	var items = new Array();
	
	items.push($('<input name="width" type="text" />').change(function() { room.width = parseInt(this.value); }).val(room.width));
  items.push($('<input name="height" type="text" />').change(function() { room.height = parseInt(this.value); }).val(room.height));
  
	
	addItems(options,items);
	$("<div id='roomSelection'>").appendTo(options);
}

function addSpriteOptions(theOptions,sprite){
	function rebuildCharAnims(sprite){
		if(sprite.spriteType=="character"){
			sprite.animations = (new Character(sprite.name,sprite.x,sprite.y,sprite.width,sprite.height,sprite.animation.sx, sprite.animation.sy, sprite.animation.colSize, sprite.animation.rowSize,editAssets.assets[sprite.animation.sheet.name])).animations;
			sprite.animation = sprite.animations[sprite.animation.name];
		}
	}
	removeSpriteOptions(theOptions);
	var options =  $("<div class='collapsable' id='spriteOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Sprite %s</div>", sprite.name)).appendTo(options);
	
	var items = new Array();
	
	items.push($('<input name="x" type="text" />').change(function() { sprite.x = spriteSnap(parseInt(this.value)); }).val(sprite.x));
    items.push($('<input name="y" type="text" />').change(function() { sprite.y = spriteSnap(parseInt(this.value)); }).val(sprite.y));
    items.push($('<input name="width" type="text" />').change(function() { sprite.width = parseInt(this.value); }).val(sprite.width));
    items.push($('<input name="height" type="text" />').change(function() { sprite.height = parseInt(this.value); }).val(sprite.height));
	
	var animationSelect = $('<select name="animation">');
    for(animation in sprite.animations){
    	$('<option value="'+animation+'">'+animation+'</option>').appendTo(animationSelect);
    }
    animationSelect.change(function(){sprite.startAnimation(this.value);if(sprite.spriteType!="character"){addAnimationOptions(options,sprite.animation);}}).val(sprite.animation.name);
	
	if(sprite.spriteType == "character") {
    	items.push($('<input name="sx" type="text" />').change(function() { sprite.animation.sx = spriteSnap(parseInt(this.value)); rebuildCharAnims(sprite);}).val(sprite.animation.sx));
    	items.push($('<input name="sy" type="text" />').change(function() { sprite.animation.sy = spriteSnap(parseInt(this.value)); rebuildCharAnims(sprite);}).val(sprite.animation.sy));
    	items.push($('<input name="sWidth" type="text" />').change(function() { sprite.animation.colSize = spriteSnap(parseInt(this.value)); rebuildCharAnims(sprite);}).val(sprite.animation.colSize));
    	items.push($('<input name="sHeight" type="text" />').change(function() { sprite.animation.rowSize = spriteSnap(parseInt(this.value)); rebuildCharAnims(sprite);}).val(sprite.animation.rowSize));
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

function addItems(options,items){
	for(var i=0;i<items.length;i++){
  	var item = items[i];
  	var name = item.attr("name");
  	var label = name?name+":" : "";
  	$("<div>"+label+"</div>").append(item).appendTo(options);
  }
  $(".leftTitle").unbind();
  $(".leftTitle").click(function(){ 
  	console.log("toggle!");
  	if(!this.hidden){
  		console.log("hide!");
			this.hidden = true;
			$(this).parent().children().hide();
			$(this).parent().children(".leftTitle").show();
		}else{
			console.log("show!");
			this.hidden = false;
			$(this).parent().children().show();
		}
	});
}

function addAnimationOptions(theOptions,animation){
	removeAnimationOptions(theOptions);
	var options =  $("<div class='collapsable' id='animationOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Animation %s</div>", animation.name)).appendTo(options);
	
	var items = new Array();
	items.push(graphicSelect("sheet",function() { animation.setSheet(editAssets.assets[this.value]);},animation.sheet.name));
	//items.push($('<input name="sheet" type="text" />').change(function() { animation.setSheet(editAssets.assets[this.value]);}).val(animation.sheet.name));
	items.push($('<input name="sx" type="text" />').change(function() { animation.sx = parseInt(this.value); }).val(animation.sx));
	items.push($('<input name="sy" type="text" />').change(function() { animation.sy = parseInt(this.value); }).val(animation.sy));
	items.push($('<input name="colSize" type="text" />').change(function() { animation.setColSize(parseInt(this.value)); }).val(animation.colSize));
	items.push($('<input name="rowSize" type="text" />').change(function() { animation.setRowSize(parseInt(this.value)); }).val(animation.rowSize));
	items.push($('<input name="startPos" type="text" />').change(function() { animation.startPos = parseInt(this.value); this.animation.reset();}).val(animation.startPos));
	items.push($('<input name="length" type="text" />').change(function() { animation.length = parseInt(this.value); this.animation.reset();}).val(animation.length));
	items.push($('<input name="frameInterval" type="text" />').change(function() { animation.frameInterval = parseInt(this.value); this.animation.reset();}).val(animation.frameInterval));
	items.push($('<input name="loops" type="text" />').change(function() { animation.loopNum = parseInt(this.value); this.animation.reset();}).val(animation.loopNum));
	
	addItems(options,items);
}

function addActionOptions(theOptions,action){
	var options =  $("<div class='collapsable' id='actionOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Action %s</div>", action.name)).appendTo(options);
	
	var items = new Array();
	items.push(commandSelect("command",function() { action.command=this.value;},action.command));
	items.push($('<textarea name="info"/>').change(function() { action.command=this.value;}).val(action.info.trim()));
	items.push(spriteSelect("sprite",function() { action.sprite = editSprites.sprites[this.value]; },action.sprite?action.sprite.name:"null"));
	items.push($('<div name="followUp"/>').change(function() { action.followUp=this.value;}).val(action.followUp?action.followUp.name:"null"));
	
	addItems(options,items);
}


function addPathOptions(theOptions,path){
	var options =  $("<div class='collapsable' id='pathOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Path %s</div>", path.name)).appendTo(options);
}

function addMotionPathOptions(theOptions,motionPath){
	var options =  $("<div class='collapsable' id='motionPathOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>MotionPath</div>")).appendTo(options);
	
	var items = new Array();
	items.push($('<input name="xtox" type="text" />').change(function() { motionPath.xtox = parseInt(this.value);}).val(motionPath.xtox));
	items.push($('<input name="xtoy" type="text" />').change(function() { motionPath.xtoy = parseInt(this.value);}).val(motionPath.xtoy));
	items.push($('<input name="ytox" type="text" />').change(function() { motionPath.ytox = parseInt(this.value);}).val(motionPath.ytox));
	items.push($('<input name="ytoy" type="text" />').change(function() { motionPath.ytoy = parseInt(this.value);}).val(motionPath.ytoy));
	items.push($('<input name="dx" type="text" />').change(function() { motionPath.dx = parseInt(this.value);}).val(motionPath.dx));
	items.push($('<input name="dy" type="text" />').change(function() { motionPath.dy = parseInt(this.value);}).val(motionPath.dy));
	addItems(options,items);
	addPathOptions(options,motionPath.path);
}

function removeRoomOptions(theOptions){
	$('div').remove('#roomOptions');
}

function removeSpriteOptions(theOptions){
	$('div').remove('#spriteOptions');
}

function removeAnimationOptions(theOptions){
	$('div').remove('#animationOptions');
}
function removeActionOptions(theOptions){
	$('div').remove('#actionOptions');
}

function spriteSelect(name,change,value){
	var select = $('<select name="'+name+'">');
    for(sprite in editSprites.sprites){
    	$('<option value="'+sprite+'">'+sprite+'</option>').appendTo(select);
    }
    $('<option value="null">null</option>').appendTo(select);
    select.change(change);
    select.val(value);
    return select;
}

function graphicSelect(name,change,value){
	var select = $('<select name="'+name+'">');
    for(asset in editAssets.assets){
    	if(editAssets.assets[asset].type=="graphic"){
    		$('<option value="'+asset+'">'+asset+'</option>').appendTo(select);
    	}
    }
    select.change(change);
    select.val(value);
    return select;
}

function commandSelect(name,change,value){
	var select = $('<select name="'+name+'">');
    for(command in commands){
    	$('<option value="'+command+'">'+command+'</option>').appendTo(select);
    }
    select.change(change);
    select.val(value);
    return select; 
}

function spriteSnap(val){
	return Math.round(val/3)*3;
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
	stage.fillStyle = Stage.color;
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
		stage.translate(newX+Stage.x,newY+Stage.y);
		
	}
	for(var i=0;i<toDraw.length;i++){
		toDraw[i].draw();
		toDraw[i].drawMeta();
	}
	stage.restore();
}

function onMouseMove(e,canvas){
	point = relMouseCoords(e,canvas);
	Mouse.x = point.x;
	Mouse.y = point.y;
	//console.log(Mouse.x+" "+Mouse.y);
}

function onMouseDown(e,canvas){
	if(!Mouse.down){
		if(toDraw.length>0){
			if(toDraw[0] instanceof Room){
				var room = toDraw[0];
				selectObjectUnderMouse(room,Stage.x+Mouse.x,Stage.y+Mouse.y);
			}
		}
	}
	Mouse.down = true;
}

function onMouseUp(e,canvas){
	Mouse.down = false;
}

function relMouseCoords(event,canvas){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)
    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    return {x:canvasX,y:canvasY};
}

function selectObjectUnderMouse(room,x,y){
	console.log("selectObject "+x+" "+y);
	/*this.sprites = new Array();
	this.effects = new Array();
	this.walkables = new Array();
	this.unwalkables = new Array();
	this.motionPaths = new Array();*/
	for(var i=room.sprites.length-1;i>=0;i--){
		var curSprite = room.sprites[i];
		if(curSprite.isVisuallyUnder(x,y)){
			addSpriteOptions($("#roomSelection"),curSprite);
			return true;
		}
	}
}
