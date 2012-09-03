var Sburb = (function(Sburb){




////////////////////////////////////////////
//AssetManager Class
////////////////////////////////////////////

//Constructor
Sburb.AssetManager = function() {
	this.totalAssets = 0; // Used in calculation of "Are we done yet?"
	this.totalLoaded = 0; // Used in calculation of "Are we done yet?"
	this.totalSize = 0;   // Used in progress bar
	this.loadedSize = 0;  // Used in progress bar
	this.assets = {};
	this.loaded = {};
	this.recurrences = {};
	this.description = "";
	this.resourcePath = "";
	this.levelPath = "";
	this.error = [];
}

Sburb.AssetManager.prototype.resolvePath = function(path){
	if(path.indexOf(this.resourcePath)==-1){
		return this.resourcePath+"/"+path;
	}else{
		return path;
		
	}
}

//get the remaining assets to be loaded
Sburb.AssetManager.prototype.totalAssetsRemaining = function() {
	return this.totalAssets - this.totalLoaded;
}

//have all the assets been loaded
Sburb.AssetManager.prototype.finishedLoading = function() {
	return (this.totalAssets && (this.totalAssets == this.totalLoaded));
}

Sburb.AssetManager.prototype.draw = function(){
	Sburb.stage.fillStyle = "rgb(0,0,0)";
	Sburb.stage.fillRect(-3,-3,Sburb.Stage.width+6,Sburb.Stage.height+6);
	if(this.loaded["preloaderBG"]){
		var preloaderBG = Sburb.assets["preloaderBG"];
		Sburb.stage.drawImage(preloaderBG,0,0,preloaderBG.width,preloaderBG.height,0,0,preloaderBG.width,preloaderBG.height);
	}
	Sburb.stage.fillStyle = "rgb(255,255,255)"
	Sburb.stage.font="10px Verdana";
	Sburb.stage.textAlign = "center";
  //Sburb.stage.fillText("Loading "+this.description,Stage.width/2,Stage.height-80);
  var percent = 0;
  if(this.totalSize){
  	percent =Math.floor((this.loadedSize/this.totalSize)*100);
  }
  Sburb.stage.fillText(percent+"%",Sburb.Stage.width/2,Sburb.Stage.height-50);
  if(this.error.length) {
      Sburb.stage.textAlign = "left";
      for(var i = 0; i < this.error.length; i++)
          Sburb.stage.fillText("Error: "+this.error[i],10,20+15*i);
      Sburb.stage.textAlign = "center";
      if(!this.refreshButton) {
	  var refreshButton = document.createElement("button");
	  var assetManager = this;
	  refreshButton.onclick = function() {
	      for(assetName in assetManager.assets) {
		  var asset = assetManager.assets[assetName];
		  if(asset.failed) {
		      Sburb.reloadSerialAsset(asset._raw_xml);
		  }
	      }
	      this.parentNode.removeChild(this);
	      assetManager.refreshButton = null;
	      assetManager.error = ["Refreshing..."];
	  };
	  refreshButton.appendChild(document.createTextNode("REFRESH"));
	  document.body.appendChild(refreshButton);
	  this.refreshButton = refreshButton;
      }
  }
}

//check if a specific asset has been loaded
Sburb.AssetManager.prototype.isLoaded = function(name) {
	// turn undefined into false
	return this.loaded[name] ? true : false;
}

//reset the asset manager to have no assets
Sburb.AssetManager.prototype.purge = function() {
	this.assets = {}
	this.loaded = {}
	this.totalLoaded = 0;
	this.totalAssets = 0;
	this.totalSize = 0;
	this.loadedSize = 0;
	this.error = [];
}

//load the given asset
Sburb.AssetManager.prototype.loadAsset = function(assetObj, reload) {
	var name = assetObj.name;
	this.assets[name] = assetObj;
	if(assetObj.instant) {
		return;
	}

	var oThis = this;
    if(!reload) {
	this.assetAdded(name);
    }
	var loadedAsset = this.assets[name].assetOnLoadFunction(function() { oThis.assetLoaded(name); });
        if(!loadedAsset)
	    this.assets[name].assetOnFailFunction(function() { oThis.assetFailed(name); });
	if(!loadedAsset && assetObj.checkLoaded){
		this.recurrences[assetObj.name] = assetObj.checkLoaded;
	}
	this.draw();
}
Sburb.AssetManager.prototype.reloadAsset = function(assetObj) {
    console.log("reloading");
    return this.loadAsset(assetObj, true);
}

//log that the asset was added
Sburb.AssetManager.prototype.assetAdded = function(name) {
	this.totalAssets++;
	this.loaded[name] = false;
}

//log that the asset was loaded
Sburb.AssetManager.prototype.assetLoaded = function(name){
	if(this.assets[name]){
		if(!this.loaded[name]){
			this.loaded[name] = true
			this.totalLoaded++;
			
			/*
			var unloaded = [];
			for(var k in this.loaded) {
			    if(this.loaded.hasOwnProperty(k) && this.loaded[k] == false)
			        unloaded.push(k);
	        }
	        console.log(unloaded);
			*/
			
			this.draw();
			
			if(this.finishedLoading() && Sburb._hardcode_load){
				// only really here to work for old hard-loading
				Sburb.finishInit();
				initFinished = true;
				
			}
		}
	}
};

Sburb.AssetManager.prototype.assetFailed = function(name) {
    var msg = name + " failed to load"
    console.log(msg);
    this.error.push(msg);
    this.draw();
};




////////////////////////////////////////////
//Related Utility functions
////////////////////////////////////////////

Sburb.loadGenericAsset = function(asset, path, type) {
    var URL = window.URL || window.webkitURL;  // Take care of vendor prefixes.
    var xhr = new XMLHttpRequest();
    var assetPath = Sburb.assetManager.resolvePath(path);
    xhr.total = 0;
    xhr.loaded = 0;
    xhr.open('GET', assetPath, true);
    xhr.responseType = 'blob';
    xhr.onprogress = function(e) {
        if(e.lengthComputable) {
            if(!xhr.total) {
                Sburb.assetManager.totalSize += e.total;
                xhr.total = e.total;
            }
            var diff = e.loaded - xhr.loaded;
            xhr.loaded = e.loaded;
            Sburb.assetManager.loadedSize += diff;
        } else {
            console.log("ERROR: Length not computable for " + path);
        }
    }
    xhr.onload = function() {
    	var status = this.status;

    	if(this.status === 0 && this.response)
    	{
    		status = 200;
    	}

        if (status == 200) {
            var blob = new Blob([this.response],{type: type});
            var url = assetPath;
            var diff = xhr.total - xhr.loaded;
            xhr.loaded = xhr.total;
            Sburb.assetManager.loadedSize += diff;
            asset.success(url);
        } else {
            asset.failure();
        }
    }

    xhr.onabort = function() { asset.failure() };
    xhr.onerror = function() { asset.failure() };
    xhr.send();
};

//Create a graphic Asset
Sburb.createGraphicAsset = function(name, path) {
    var ret = new Image();
    ret.type = "graphic";
    ret.name = name;
    ret.loaded = false;
    ret.failed = false;
    ret.success = function(url) { ret.src = url; };
    ret.failure = function() { ret.failed = true; };
    ret.onload = function() { ret.loaded = true; }
    ret.onerror = ret.failure;
    ret.assetOnLoadFunction = function(fn) {
		if(ret.loaded) {
			if(fn) { fn(); }
			return true;
		} else {
			ret.onload = function () {
				ret.loaded = true
				if(fn) { fn(); }
			}
			return false;
		}
    };
    ret.assetOnFailFunction = function(fn) {
        if(ret.failed) {
            if(fn) { fn(); }
            return true;
        } else {
            ret.failure = function() {
                if(!ret.failed && fn) { fn(); }
                ret.failed = true;
            }
            return false;
        }
    };
    Sburb.loadGenericAsset(ret, path, "image/"+path.substr(-3));
    return ret;
}

//create an audio Asset
Sburb.createAudioAsset = function(name,sources) {
    var ret = new Audio();
    ret.name = name
    ret.type = "audio";
    ret.preload = true;
    ret.remaining = sources.length
    ret.loaded = false;
    ret.failed = false;
    ret.failure = function() { ret.failed = true; };
    ret.isLoaded = function() { ret.loaded = true; };
    ret.checkLoaded = function() {
        if(!ret.loaded) {
            if(ret.readyState == 4) {
                ret.isLoaded();
            } else {
                //ret.failure();
            }
        }
    };
    ret.assetOnLoadFunction = function(fn) {
		if(ret.loaded) {
			if(fn) { fn(); }
			return true;
		} else {
			ret.isLoaded = function () {
				ret.loaded = true
				if(fn) { fn(); }
			}
			return false;
		}
    };
    ret.assetOnFailFunction = function(fn) {
        if(ret.failed) {
            if(fn) { fn(); }
            return true;
        } else {
            ret.failure = function() {
                if(!ret.failed && fn) { fn(); }
                ret.failed = true;
            }
            return false;
        }
    };
    ret.success = function(url) {
		var tmp = document.createElement("source");
		tmp.src = url;
		ret.appendChild(tmp);
        ret.remaining -= 1;
        if(!ret.remaining) {
            ret.addEventListener('loadeddata', ret.isLoaded, false);
            setTimeout(ret.checkLoaded, 1000);
        }
    }
    for (var a=0; a < sources.length; a++)
        Sburb.loadGenericAsset(ret, sources[a],"audio/"+sources[a].substr(-3));
    return ret;
}

//create a flash movie Asset
Sburb.createMovieAsset = function(name,path){
	var ret = {src:Sburb.assetManager.resolvePath(path)};
	document.getElementById("SBURBmovieBin").innerHTML += '<div id="'+name+'"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" id="movie" width="'+Sburb.Stage.width+'" height="'+Sburb.Stage.height+'"><param name="allowScriptAccess" value="always" /\><param name="wmode" value="transparent"/\><param name="movie" value="'+name+'" /\><param name="quality" value="high" /\><embed src="'+Sburb.assetManager.resolvePath(path)+'" quality="high" WMODE="transparent" width="'+Sburb.Stage.width+'" height="'+Sburb.Stage.height+'" swLiveConnect="true" id="movie'+name+'" name="movie'+name+'" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /\></object></div>';
	
	
	ret.name = name;
	ret.type = "movie";
	ret.instant = true;
	
	document.getElementById(name).style.display = "none";

	return ret;
	
}

//create a path asset
Sburb.createPathAsset = function(name, path) {
    var ret = path;
    ret.name = name;
    ret.type = "path";
    ret.instant = true;
    ret.assetOnLoadFunction = function(fn) {
		if(fn) { fn(); }
		return;
    }
    ret.assetOnFailFunction = function(fn) { return false; }
    return ret
}

//create a font
Sburb.createFontAsset = function(name, sources){
	var ret = {font:sources[0]};
	ret.name = name;
	ret.originalVals = sources;
	ret.type = "font";
	ret.instant = true;
	
	var source = "";
	var extra = "";
	var sourceList = sources.split(',');
	for(var i=0;i<sourceList.length;i++){
		var result = "";
		var values = sourceList[i].split(':');
		var type = values[0].trim();
		var path = values[1].trim();
		if(type == "url"){
			var extension = path.substring(path.indexOf(".")+1,path.length);
			var format = "";
			if(extension=="ttf"){
				format = "truetype";
			}else if(extension=="woff"){
				format = "woff";
			}else if(extension=="svg"){
				format = "svg";
			}
			path = Sburb.assetManager.resolvePath(path);
			result = "url('"+path+"') format('"+format+"')";
		}else if(type == "local"){
			result = "local('"+path+"')";
		}else if(type == "weight"){
			extra+= "font-weight:"+path+"; "
		}
		
		if(result!=""){
			source+=result+",";
		}

	}
	source = source.substring(0,source.length-1);
	var style = 
	'<style type="text/css">'+
		'@font-face{ font-family: '+name+'; src: '+source+'; '+extra+'}'+
	'</style>';
	//console.log(style);
	
	document.getElementById("SBURBfontBin").innerHTML += style;
	
	Sburb.stage.font="10px "+name;
  Sburb.stage.fillText("load font",-100,-100);
	
	ret.assetOnLoadFunction = function(fn) {
		if(fn) { fn(); }
		return;
    }
    ret.assetOnFailFunction = function(fn) { return false; }
    return ret
}

return Sburb;
})(Sburb || {});
