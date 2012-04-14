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
    var previewNode = $('<div id="previewNode"><canvas id="Stage" width="650" height="450" tabindex="0" </canvas></div>');
    toDraw.push(sprite);
    //sprite.staticImg().appendTo(previewNode);
    mainNode.append(previewNode);

    // edit info
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    $(sprintf("<div class='leftTitle'>Sprite %s</div>", sprite.name)).appendTo(newLeftDiv);
    var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
    if(sprite.spriteType == "character") {
    	var c0 = $('sx: <input type="text" /></br>').change(function() { sprite.animation.sx = parseInt(this.value); }).val(sprite.animation.sx);
    	var c1 = $('sy: <input type="text" /></br>').change(function() { sprite.animation.sy = parseInt(this.value); }).val(sprite.animation.sy);
    	var c2 = $('sWidth: <input type="text" /></br>').change(function() { sprite.animation.colSize = parseInt(this.value); }).val(sprite.animation.colSize);
    	var c3 = $('sHeight: <input type="text" /></br>').change(function() { sprite.animation.rowSize = parseInt(this.value); }).val(sprite.animation.rowSize);
    	var c4 = $('<select>\
					<option value="Front">Front</option>\
					<option value="Back">Back</option>\
					<option value="Left">Left</option>\
					<option value="Right">Right</option></select>').change(function() { sprite.facing = this.value; sprite.walk();}).val(sprite.facing);
    	
    	$("<div>").append(c0).appendTo(options);
		$("<div>").append(c1).appendTo(options);
		$("<div>").append(c2).appendTo(options);
		$("<div>").append(c3).appendTo(options);
		$("<div>").append(c4).appendTo(options);
    } else {
        var i0 = $('<input type="checkbox" />Collidable</br>').click(function() { sprite.collidable = this.checked; });
        if(sprite.collidable) {
	    	i0.prop("checked", true);
        }
        var i1 = $('<select>\
					<option value="0">Background</option>\
					<option value="1">Midground</option>\
					<option value="2">Foreground</option></select>').change(function() { sprite.depthing = this.value; }).val(sprite.depthing);
        $("<div>").append(i0).appendTo(options);
        $("<div>").append(i1).appendTo(options);
    }
    var s0 = $('x: <input type="text" /></br>').change(function() { sprite.x = parseInt(this.value); }).val(sprite.x);
    var s1 = $('y:  <input type="text" /></br>').change(function() { sprite.y = parseInt(this.value); }).val(sprite.y);
    var s2 = $('width:  <input type="text" /></br>').change(function() { sprite.width = parseInt(this.value); }).val(sprite.width);
    var s3 = $('height:  <input type="text" /></br>').change(function() { sprite.width = parseInt(this.value); }).val(sprite.height);
    
    
    $("<div>").append(s0).appendTo(options);
    $("<div>").append(s1).appendTo(options);
    $("<div>").append(s2).appendTo(options);
    $("<div>").append(s3).appendTo(options);
    
    Stage  = document.getElementById("Stage");	
	Stage.fps = 30;
    stage = Stage.getContext("2d"); 
    drawingOne = true;
    update(0);
}

function buildRooms() {

    menus.roomMenu = {'maindiv': $('<div id="roomTab">'),
		     };
    $('#mainmenu').append(menus.roomMenu.maindiv);
    if(!menus.roomMenu) {
		for(name in editRooms.rooms) {
			var sdisplay = new roomMenuDisplay(editRooms.rooms[name]);
			menus.roomMenu.maindiv.append(sdisplay.maindiv);
			menus.roomMenu.roomDisplays.push(sdisplay);
		}
		$('#mainmenu').append(menus.roomMenu.maindiv);
    }
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
		stage.translate(-toDraw[0].x+Stage.width/2,-toDraw[0].y+Stage.height/2);
	}
	for(var i=0;i<toDraw.length;i++){
		toDraw[i].draw();
		toDraw[i].drawMeta();
	}
	stage.restore();
}
