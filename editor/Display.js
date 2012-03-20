// View code

var menus = {};

function clearViewScreen() {
    $("#previewNode").empty(); // erase preview resources
    $('#mainDisplay').contents().detach();
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
	menus.spriteMenu = {'maindiv': $('<div id="spriteTab"></div>'), 'spriteDisplays': new Array(),
			   };
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

    sprite.staticImg().appendTo(previewNode);
    mainNode.append(previewNode);

    // edit info
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    $(sprintf("<div class='leftTitle'>Sprite %s</div>", sprite.name)).appendTo(newLeftDiv);
    if(sprite.spriteType == "character") {
        
    } else {
        var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
        var i0 = $('<input type="checkbox">').click(function() { sprite.collidable = this.checked; });
        if(sprite.collidable) {
	    i0.prop("checked", true);
        }
        var i1 = $('<select>\
<option value="0">Background</option>\
<option value="1">Midground</option>\
<option value="2">Foreground</option></select>').change(function() { sprite.depthing = this.val(); }).val(sprite.depthing);
        $("<div>").append(i0).appendTo(options);
        $("<div>").append(i1).appendTo(options);
    }
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