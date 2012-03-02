// View code

var menus = {};

function clearViewScreen() {
    $("#previewNode").empty(); // erase preview resources
    mainNode.contents().detach();
}

function clearLeftMenu() {
    $("#leftmenu").empty();
}

function displayAssets() {
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
	var l = location.href.split("/");
	if(asset.type == "graphic") {
	    var src = asset.src.replace(l.slice(0,l.length-1).join('/')+'/', "");
	    $("<div class='assetSource'>"+src+"</div>").appendTo(sourcesdiv);
	    this.thumbdiv.append($("<img src='"+asset.src+"'>"));
	} else if(asset.type == "audio") {
	    var srcs = asset.childNodes;
	    for(i=0;i<srcs.length;i++) {
		n = srcs[i];
		var src = n.src.replace(l.slice(0,l.length-1).join('/')+'/', "");
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
	menus.assetMenu = {'maindiv': $('<div></div>'), 'assetDisplays': new Array() };
	for(name in editAssets.assets) {
	    var adisplay = new AssetDisplay(editAssets.assets[name]);
	    menus.assetMenu.maindiv.append(adisplay.maindiv);
	    menus.assetMenu.assetDisplays.push(adisplay);
	}
	$('#mainmenu').append(menus.assetMenu.maindiv);
    } else{
	$('#mainmenu').contents().detach();
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
	$("<div class='srcInput'><input type='text' value='%s' name='srcInput1'");
    } else if(asset.type == "audio") {
	var audiodiv = $('<audio controls="controls" autoplay="autoplay"></audio>').appendTo(previewNode);
	var srcs = asset.childNodes;
	for(i=0;i<srcs.length;i++) {
	    var newsrc = $(srcs[i]).clone();
	    audiodiv.append(newsrc);
	}
    }
    mainNode.append(previewNode);

    

}