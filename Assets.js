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
	this.assets[name] = new Image();
	this.assets[name].src = path;
	oThis = this;
	this.assets[name].onload = function () {
	    oThis.assetLoaded(name);
	};
	this.assets[name].type = "graphic";
	this.assets[name].name = name;
	this.assetAdded(name);
    };
    
    this.loadAudioAsset = function (name) {
	this.assets[name] = new Audio();
	// no builtin onload function for audio
	oThis = this;
	this.assets[name].addEventListener('canplaythrough', function() { oThis.assetLoaded(name); });
	this.assets[name].name = name
	this.assets[name].type = "audio";
	this.assets[name].preload = true;
	for (a=1; a < arguments.length; a++) {
	    var tmp = document.createElement("source")
	    tmp.src = arguments[a];
	    this.assets[name].appendChild(tmp);
	}
	this.assetAdded(name);
    };

    this.loadPathAsset = function (name,path){
	this.assets[name] = path;
	this.assets[name].name = name;
	this.assets[name].type = "path";
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