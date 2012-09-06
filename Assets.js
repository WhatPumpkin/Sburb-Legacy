var Sburb = (function(Sburb){




////////////////////////////////////////////
//AssetManager Class
////////////////////////////////////////////

//Constructor
Sburb.AssetManager = function() {
    // Asset tracking
    this.totalAssets = 0; // Used in calculation of "Are we done yet?"
    this.totalLoaded = 0; // Used in calculation of "Are we done yet?"
    this.totalSize = 0;   // Used in progress bar
    this.loadedSize = 0;  // Used in progress bar
    this.assets = {};
    this.loaded = {};
    this.recurrences = {};
    this.error = [];
    this.failed = [];
    // Master blob map
    this.blobs = {}
    // Descriptors
    this.description = "";
    this.resourcePath = "";
    this.levelPath = "";
    this.mimes = {
        "jpg": "image/jpeg",
        "gif": "image/gif",
        "png": "image/png",
        "svg": "image/svg+xml",
        "mp3": "audio/mpeg",
        "oga": "audio/ogg",
        "ogg": "audio/ogg",
        "ttf": "application/x-font-ttf",
        "woff": "application/x-font-woff",
        "swf": "application/x-shockwave-flash",
        "flv": "application/x-shockwave-flash"
    };
}

Sburb.AssetManager.prototype.resolvePath = function(path){
    if(path.indexOf(this.resourcePath)==-1){
        return this.resourcePath+"/"+path+"?"+Sburb.version;
    }else{
        return path+"?"+Sburb.version; // Only cache resources of the same version
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
      if(!this.refreshButton && this.failed.length) {
          var refreshButton = document.createElement("button");
          var assetManager = this;
          refreshButton.onclick = function() {
              assetManager.error = ["Refreshing..."];
              this.parentNode.removeChild(this);
              assetManager.refreshButton = null;
              for(var i=0; i<assetManager.failed.length;i++)
                assetManager.assets[assetManager.failed[i]].reload();
              assetManager.failed = [];
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
    for(var k in this.recurrences) {
        if(this.recurrences.hasOwnProperty(k))
            clearTimeout(this.recurrences[k]);
    }
    this.totalLoaded = 0;
    this.totalAssets = 0;
    this.totalSize = 0;
    this.loadedSize = 0;
    this.assets = {}
    this.loaded = {}
    this.recurrences = {};
    this.error = [];
    this.failed = [];
}

//load the given asset
Sburb.AssetManager.prototype.loadAsset = function(assetObj) {
    var name = assetObj.name;
    this.assets[name] = assetObj;
    if(assetObj.instant) {
        return;
    }

    var oThis = this;
    this.assetAdded(name);
    var loadedAsset = this.assets[name].assetOnLoadFunction(function() { oThis.assetLoaded(name); });
    if(!loadedAsset)
        this.assets[name].assetOnFailFunction(function() { oThis.assetFailed(name); });
    this.draw();
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
    this.failed.push(name);
    this.draw();
};




////////////////////////////////////////////
//Related Utility functions
////////////////////////////////////////////

Sburb.loadGenericAsset = function(asset, path, id) {
    var URL = window.URL || window.webkitURL;  // Take care of vendor prefixes.
    var assetPath = Sburb.assetManager.resolvePath(path);
    if(assetPath in Sburb.assetManager.blobs) {
        var blob_url = Sburb.assetManager.blobs[assetPath];
        // This may be overkill
        var blob_xhr = new XMLHttpRequest();
        blob_xhr.open("GET", blob_url, false);
        blob_xhr.send();
        if(blob_xhr.status == 200) {
            setTimeout(function() { asset.success(blob_url, id); }, 0); // Async call success so things don't blow up
            return;
        }
    }
    var xhr = new XMLHttpRequest();
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
            var sliceMethod = false;
            if("mozSlice" in this.response)    sliceMethod = "mozSlice";
            if("webkitSlice" in this.response) sliceMethod = "webkitSlice";
            if("slice" in this.response)       sliceMethod = "slice";
            if(!sliceMethod) {
                console.log("No way to generate blob properly. Aborting.");
                asset.failure(id);
                return;
            }
            var ext = path.substring(path.indexOf(".")+1,path.length);
            var type = Sburb.assetManager.mimes[ext];
            var blob = this.response[sliceMethod](0,this.response.size,type); //new Blob([this.response],{type: type});
            var url = URL.createObjectURL(blob); // Apparently we can't do this yet, {"autoRevoke": false}); // Make the blob persist until page unload
            Sburb.assetManager.blobs[assetPath] = url; // Save for later use
            var diff = xhr.total - xhr.loaded;
            xhr.loaded = xhr.total;
            Sburb.assetManager.loadedSize += diff;

            asset.success(url,id);
        } else {
            asset.failure(id);
        }
    }

    xhr.onabort = function() { asset.failure(id) };
    xhr.onerror = function() { asset.failure(id) };
    xhr.send();
};

//Create a graphic Asset
Sburb.createGraphicAsset = function(name, path) {
    // Actual image stuff
    var ret = new Image();
    ret.type = "graphic";
    ret.name = name;
    ret.originalVals = path; // Save for serialization
    // AJAX pre-load shenanigans
    // Load via AJAX, call success or failure
    // If success, set src attribute, call onload or onerror
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
    ret.reload = function() {
        ret.loaded = false;
        ret.failed = false;
        Sburb.loadGenericAsset(ret, path);
    };
    ret.reload();
    return ret;
}

//create an audio Asset
Sburb.createAudioAsset = function(name,sources) {
    var ret = new Audio();
    ret.name = name
    ret.type = "audio";
    ret.preload = true;
    ret.originalVals = sources;
    // Ajax Shenanigans
    // Load each source, call success or failure for each
    // On success, add as a source
    // When all sources are added add an event listener and timeout
    // If resource isn't loaded by the timeout, fail
    ret.failure = function() { ret.failed = true; };
    ret.isLoaded = function() { ret.loaded = true; };
    // Check multiple times to speed up loading where the event listener fails
    ret.checkLoaded = function() {
        if(!ret.loaded) {
            ret.check_count -= 1;
            if(ret.readyState == 4) {
                delete Sburb.assetManager.recurrences[name];
                ret.isLoaded();
            } else if(!ret.check_count) {
                delete Sburb.assetManager.recurrences[name];
                ret.failure();
            } else {
                Sburb.assetManager.recurrences[name] = setTimeout(ret.checkLoaded, ret.check_interval);
            }
        } else {
            delete Sburb.assetManager.recurrences[name];
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
	        if(window.chrome) ret.load();
            ret.addEventListener('loadeddata', ret.isLoaded, false);
            Sburb.assetManager.recurrences[name] = setTimeout(ret.checkLoaded, ret.check_interval);
        }
    }
    ret.reload = function() {
        ret.remaining = 0; // How many sources we have left to load
        ret.check_interval = 800; // How long to wait between checks
        ret.check_count = 5; // How many checks to make
        ret.loaded = false;
        ret.failed = false;
        for (var a=0; a < sources.length; a++) {
            var ext = sources[a].substring(sources[a].indexOf(".")+1,sources[a].length);
            var type = Sburb.assetManager.mimes[ext];
            if(type == "audio/mpeg") {
                if(Modernizr.audio.mp3) {
                    ret.remaining++;
                    Sburb.loadGenericAsset(ret, sources[a]);
                }
            } else if(type == "audio/ogg") {
                if(Modernizr.audio.ogg) {
                    ret.remaining++;
                    Sburb.loadGenericAsset(ret, sources[a]);
                }
            } else {
                ret.remaining++;
                Sburb.loadGenericAsset(ret, sources[a]);
            }
        }
    };
    ret.reload();
    return ret;
}

//create a flash movie Asset
Sburb.createMovieAsset = function(name,path){
    var ret = {}; //src:Sburb.assetManager.resolvePath(path)};
    ret.name = name;
    ret.type = "movie";
    ret.originalVals = path;
    
    ret.done = function(url) {
        ret.src = url;
        document.getElementById("SBURBmovieBin").innerHTML += '<div id="'+name+'"><object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" id="movie" width="'+Sburb.Stage.width+'" height="'+Sburb.Stage.height+'"><param name="allowScriptAccess" value="always" /\><param name="wmode" value="transparent"/\><param name="movie" value="'+name+'" /\><param name="quality" value="high" /\><embed src="'+ret.src+'" quality="high" WMODE="transparent" width="'+Sburb.Stage.width+'" height="'+Sburb.Stage.height+'" swLiveConnect="true" id="movie'+name+'" name="movie'+name+'" allowScriptAccess="always" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" /\></object></div>';
        document.getElementById(name).style.display = "none";
    }
    ret.success = function(url) { ret.done(url); ret.loaded = true; };
    ret.failure = function() { ret.failed = true; };
    ret.assetOnLoadFunction = function(fn) {
        if(ret.loaded) {
            if(fn) { fn(); }
            return true;
        } else {
            ret.success = function (url) {
                ret.done(url);
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
    ret.reload = function() {
        ret.loaded = false;
        ret.failed = false;
        Sburb.loadGenericAsset(ret, path);
    };
    
    ret.reload();

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
    ret.done = function(url) { ret.loaded = true; };
    ret.failure = function() { ret.failed = true; };
    ret.success = function(url, id) {
        var font = "url('"+url+"') format('"+ret.sources[id]+"')";
        ret.sources[id] = font;
        ret.remaining -= 1;
        if(!ret.remaining) {
            document.getElementById("SBURBfontBin").innerHTML += '<style type="text/css">@font-face{ font-family: '+ret.name+'; src: '+ret.sources.join(',')+'; '+ret.extra+'}</style>';
            Sburb.stage.font="10px "+name;
            ret.done();
        }
    };
    ret.assetOnLoadFunction = function(fn) {
        if(ret.loaded) {
            if(fn) { fn(); }
            return true;
        } else {
            ret.done = function (url) {
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
    ret.reload = function() {
        ret.loaded = false;
        ret.failed = false;
        var sourceList = sources.split(',');
        ret.remaining = 0
        ret.sources = [];
        ret.extra = "";
        for(var i=0;i<sourceList.length;i++){
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
                ret.remaining += 1;
                Sburb.loadGenericAsset(ret, path, ret.sources.length);
                ret.sources.push(format);
            }else if(type == "local"){
                ret.sources.push("local('"+path+"')");
            }else if(type == "weight"){
                ret.extra+= "font-weight:"+path+"; "
            }
        }
    };
    
    ret.reload();
    
    return ret
}

return Sburb;
})(Sburb || {});
