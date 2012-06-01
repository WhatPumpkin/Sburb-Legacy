// put these functions here so editor can use them
function createGraphicAsset(name, path) {
    var ret = new Image();
    ret.loaded = false;
    ret.onload = function() {
			ret.loaded = true;
    }
    ret.src = path;
    ret.type = "graphic";
    ret.name = name;
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
    return ret;
}

function createAudioAsset(name) {
    var ret = new Audio();
    ret.name = name
    ret.type = "audio";
    ret.preload = true;
    //ret.needsTimeout = true;
    for (a=1; a < arguments.length; a++) {
			var tmp = document.createElement("source")
			tmp.src = arguments[a];
			ret.appendChild(tmp);
    }
    ret.assetOnLoadFunction = function(fn) {
			this.checkLoaded = function(){
				//console.log("check!",ret.name);
				if (ret.readyState==4) {
					//console.log("good!");
					if(fn) { fn(); }
					return true;
				}
				return false;
			}
			if(!this.checkLoaded()){
				ret.addEventListener('loadeddata', fn);
				return false;
			}else{
				return true;
			}
    };
    return ret;
}

function createMovieAsset(name,path){
	var ret = {src:path};
	document.getElementById("movieBin").innerHTML += '<div id="'+name+'"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" id="movie" width="550" height="400"><param name="allowScriptAccess" value="always" /\><param name="movie" value="'+name+'" /\><param name="quality" value="high" /\><param name="bgcolor" value="#ffffff" /\><embed src="'+path+'" quality="high" bgcolor="#ffffff" width="550" height="400" swLiveConnect=true id="movie'+name+'" name="movie'+name+'" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /\></object></div>';
	
	
	ret.name = name;
	ret.type = "movie";
	ret.instant = true;
	
	document.getElementById(name).style.display = "none";
	
	//ret.preload = true;
	//ret.needsTimeout = true;
	
	/*
	var movie = document.getElementById("movie"+name);
	ret.assetOnLoadFunction = function(fn) {
		//console.log(movie);
		if(movie.PercentLoaded()==100){
			if(fn) { fn(); }
			return true;
		}else{
			ret.checkLoaded = function(){
    			if(movie.PercentLoaded()==100){
    				document.getElementById(name).style.display = "none";
					if(fn) { fn(); }
					return true;
				}
    		}
			return false;
		}
    }*/
    
	
	return ret;
	
}

function preloadSwf(){
	
}

function createPathAsset(name, path) {
    var ret = path;
    ret.name = name;
    ret.type = "path";
    ret.instant = true;
    ret.assetOnLoadFunction = function(fn) {
		if(fn) { fn(); }
		return;
    }
    return ret
}
function AssetManager() {
	this.totalAssets = 0;
	this.totalLoaded = 0;
	this.assets = {};
	this.loaded = {};
	this.recurrences = {};
	
	this.totalAssetsRemaining = function() {
		return this.totalAssets - this.totalLoaded;
	}
	
	this.finishedLoading = function() {
		return (this.totalAssets && (this.totalAssets == this.totalLoaded));
	}
	
	this.isLoaded = function(name) {
		// turn undefined into false
		return this.loaded[name] ? true : false;
	}

	this.purge = function() {
		this.assets = {}
		this.loaded = {}
		this.totalLoaded = 0;
		this.totalAssets = 0;
	}
	
	this.loadAsset = function(assetObj) {
		var name = assetObj.name;
		this.assets[name] = assetObj;
		if(assetObj.instant) {
			return;
		}
	
		var oThis = this;
		this.assetAdded(name);	
		var loadedAsset = this.assets[name].assetOnLoadFunction(function() { oThis.assetLoaded(name); });
		if(!loadedAsset && assetObj.needsTimeout && assetObj.checkLoaded){
			this.recurrences[assetObj.name] = assetObj.checkLoaded;
		}
	}
	
	this.assetAdded = function(name) {
		this.totalAssets++;
		this.loaded[name] = false;
	}
	
	this.assetLoaded = function(name){
		//console.log(name,this.loaded);
		if(this.assets[name]){
			if(!this.loaded[name]){
				this.loaded[name] = true
				this.totalLoaded++;
				
				// Jterniabound.js
				drawLoader();
				
				if(this.finishedLoading() && _hardcode_load){
					// only really here to work for old hard-loading
					finishInit();
					initFinished = true;
					
				}
			}
		}

		 
		
	};
}
