function EditAssets() {
    this.assets = {};
    
    this.add = function (assetObj) {
		var name = assetObj.name;
		this.assets[name] = assetObj;
    }
    
	this.remove = function (name) {
		this.assets[name] = undefined;
    }

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
		menus.assetMenu = {'maindiv': $('<div id="assetTab"></div>'), 'assetDisplays': new Array()};
		for(name in editAssets.assets) {
			var adisplay = new AssetDisplay(editAssets.assets[name]);
			menus.assetMenu.maindiv.append(adisplay.maindiv);
			menus.assetMenu.assetDisplays.push(adisplay);
		}
		$('#mainmenu').append(menus.assetMenu.maindiv);
	}
}


function assetPreview(asset) {
    // i guess this could've gone directly in Display?
    // but we should keep this in case we want to do stuff here
    // like save work, clear variables, init other stuff...who knows
   showAssetPreview(asset);
}

function showAssetPreview(asset) {
    var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();

    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');

    // edit info
    var newLeftDiv = $("<div class='collapsable'></div>").appendTo($("#leftmenu"));
    $("<div class='leftTitle'>Asset </div>").append($("<input type='text'/>").change(function() {delete editAssets.assets[asset.name]; asset.name = this.value; editAssets.assets[asset.name] = asset; }).val(asset.name)).appendTo(newLeftDiv);

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
