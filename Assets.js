// put these functions here so editor can use them
function createGraphicAsset(name, path) {
    ret = new Image();
    ret.src = path;
    ret.type = "graphic";
    ret.name = name;
    return ret;
}

function createAudioAsset(name) {
    ret = new Audio();
    ret.name = name
    ret.type = "audio";
    ret.preload = true;
    for (a=1; a < arguments.length; a++) {
	var tmp = document.createElement("source")
	tmp.src = arguments[a];
	ret.appendChild(tmp);
    }
    return ret;
}

function createPathAsset(name, path) {
    ret = path;
    ret.name = name;
    ret.type = "path";
    return ret
}
function AssetManager() {
    this.totalAssets = 0;
    this.totalLoaded = 0;
    this.assets = {};
    this.loaded = {};
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
    this.loadGraphicAsset = function (name,path){
	this.assets[name] = createGraphicAsset(name, path);
	oThis = this;
	this.assets[name].onload = function () {
	    oThis.assetLoaded(name);
	};
	this.assetAdded(name);
    };
    
    this.loadAudioAsset = function (name) {
	this.assets[name] = createAudioAsset.apply(this, arguments);
	// no builtin onload function for audio
	oThis = this;
	this.assets[name].addEventListener('canplaythrough', function() { oThis.assetLoaded(name); });
	this.assetAdded(name);
    };

    this.loadPathAsset = function (name,path){
	this.assets[name] = createPathAsset(name, path);
    };
    this.assetAdded = function(name) {
	this.totalAssets++;
	this.loaded[name] = false;
    }
    this.assetLoaded = function(name){
	this.loaded[name] = true
	this.totalLoaded++;

	drawLoader(); // Jterniabound.js
	if(this.finishedLoading() && _hardcode_load){
	    // only really here to work for old hard-loading
	    finishInit();
	    initFinished = true;
	}
    };
}