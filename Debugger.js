var Sburb = (function(Sburb){

////////////////////////////////////////////
//Debugger Class
////////////////////////////////////////////

Sburb.Debugger = function() {
    this.url = "http://homestuck.org/SburbDebugger/report.php";
    this.fps = 0;
    this.errors = [];
    this.xhrs = [];
    this.tests = {};
    this.open = false;
    this.tilde = false; // Has tilde already been pushed?
    this.space = false; // Has space already been pushed?
    this.colors = {
        // Console messages
        "error":     "#CC0000",
        "exception": "#990000",
        "warn":      "#CCCC00",
        "info":      "#000099",
        "log":       "#AAAAAA",
        "debug":     "#777777",
        // Test messages
        "success":   "#00CC00",
        "failure":   "#CC0000",
        "variant11": "#00CC00",
        "variant10": "#00CC00",
        "variant9":  "#00CC00",
        "variant8":  "#00CC00",
        "variant7":  "#CCAA00",
        "variant6":  "#CCAA00",
        "variant5":  "#CCAA00",
        "variant4":  "#CCAA00",
        "variant3":  "#FF6600",
        "variant2":  "#FF6600",
        "variant1":  "#FF6600",
        "variant12": "#FF6600",
        "variant0":  "#CC0000",
    };
    // Run tests
    this.tests["Audio Support"] = Sburb.tests.audio ? "success" : "failure";
    this.tests["Save Support"] = Sburb.tests.storage ? "success" : "failure";
    this.tests["File Loading ["+Sburb.tests.loading+"]"] = "variant"+Sburb.tests.loading;
    // Get them errors
    var that = this;
    this.console = new Sburb.Console();
    this.XMLHttpRequest = window.XMLHttpRequest; // Save real XMLHttpRequest
    window.XMLHttpRequest = function() { return new Sburb.XMLHttpRequest(); }; // Replace real XMLHttpRequest
    window.addEventListener("error",function(e) { that.errors.push({"type":e.type,"text":e.message,"url":e.filename,"line":e.lineno,"time":e.timeStamp}); },false);
}

Sburb.Debugger.prototype.handleInputs = function(pressed) {
    if(pressed[Sburb.Keys.tilde] && !this.tilde) {
        this.tilde = true;
        this.open = !this.open;
    }
    if(pressed[Sburb.Keys.space] && !this.space && this.open) {
        this.space = true;
        this.sendDebugReport();
    }
    if(!pressed[Sburb.Keys.tilde])
        this.tilde = false;
    if(!pressed[Sburb.Keys.space])
        this.space = false;
    if(pressed[Sburb.Keys.escape])
        this.open = false;
}

Sburb.Debugger.prototype.draw = function() {
    // Track FPS
    this.fps++;
    var that = this;
    setTimeout(function() { that.fps--; }, 1000);
    // Draw
    if(this.open) {
        // Obscure the game
        var lineWidth = Sburb.stage.lineWidth;
        var strokeStyle = Sburb.stage.strokeStyle;
        Sburb.stage.lineWidth = 9;
        Sburb.stage.strokeStyle = "#000000";
        Sburb.stage.beginPath();
        for(var i = 0; i <= 450; i += 10) {
            Sburb.stage.moveTo(0,i);
            Sburb.stage.lineTo(650,i);
        }
        Sburb.stage.closePath();
        Sburb.stage.stroke();
        Sburb.stage.lineWidth = lineWidth;
        Sburb.stage.strokeStyle = strokeStyle;
        // Dump the errors
        Sburb.stage.textAlign = "left";
        Sburb.stage.font="bold 18px Verdana";
        for(var error = this.errors.length - 1, y = 435; error >= 0; error--, y -= 24) {
            if(this.errors[error].type in this.colors) {
                Sburb.stage.fillStyle = this.colors[this.errors[error].type];
            } else {
                Sburb.stage.fillStyle = "#000000";
            }
            Sburb.stage.fillText(this.errors[error].text,10,y);
        }
        // Display test status
        var y = 70;
        Sburb.stage.textAlign = "right";
        Sburb.stage.font="bold 18px Verdana";
        for(var test in this.tests) {
            if(!this.tests.hasOwnProperty(test)) continue;
            var color = this.tests[test];
            var width = Sburb.stage.measureText(test).width;
            Sburb.stage.fillStyle = this.colors[color];
            Sburb.stage.fillRect(630-width,y,width+10,24);
            Sburb.stage.fillStyle = "#FFFFFF";
            Sburb.stage.fillText(test,635,y+18);
            y += 26;
        }
        // Add title
        Sburb.stage.fillStyle = "#000000";
        Sburb.stage.fillRect(200,10,250,65);
        Sburb.stage.textAlign = "center";
        Sburb.stage.fillStyle = "#FFFFFF";
        Sburb.stage.font="bold 28px Verdana";
        Sburb.stage.fillText("Sburb Debugger",325,33);
        Sburb.stage.font="14px Verdana";
        Sburb.stage.fillText("Press SPACE to send bug report",325,51);
        Sburb.stage.fillText("Press ~ or ESC to exit",325,67);
        // Add FPS
        Sburb.stage.fillStyle = "#000000";
        Sburb.stage.fillRect(600,425,50,25);
        Sburb.stage.textAlign = "right";
        Sburb.stage.fillStyle = "#FFFFFF";
        Sburb.stage.font="bold 16px Verdana";
        Sburb.stage.fillText(this.fps+"fps",642,440);
        // Reset
        Sburb.stage.textAlign = "center";
        Sburb.stage.fillStyle = "#000000";
    }
}

Sburb.Debugger.prototype.sendDebugReport = function() {
    console.debug("sendDebugReport not yet implemented");
}

// ===================
// = Replace Console =
// ===================
Sburb.Console = function() {
    var console = this._console = window.console; // Save the real console
    var that = this;
    window.console = this;
    // Utilities
    var ignore = {
        "log": 1,
        "debug": 1,
        "info": 1,
        "warn": 1,
        "error": 1,
        "exception": 1
    };
    var isFunction = function(obj) { return obj && {}.toString.call(obj) === "[object Function]"; }
    var addError = function(type,args) {
        var largs = Array.prototype.slice.call(args);
        Sburb.debugger.errors.push({type:type,text:largs.join(', ')});
    }
    var proxy = function(method, args) {
        return console[method].apply(console, args);
    }
    // Import all of console
    for (var prop in console) {
        if (prop in ignore) continue;
        try {
            if (isFunction(console[prop])) {
                if (typeof this[prop] == "undefined") {
                    this[prop] = (function(name, func){
                        return function() { return func(name, arguments); };
                    })(prop, proxy);
                } 
            }
            else
                this[prop] = console[prop];
        } catch(E) {}
    }
    // Override logging functions
    this.log       = function() { addError("log",arguments);       return proxy("log",arguments);       }
    this.debug     = function() { addError("debug",arguments);     return proxy("debug",arguments);     }
    this.info      = function() { addError("info",arguments);      return proxy("info",arguments);      }
    this.warn      = function() { addError("warn",arguments);      return proxy("warn",arguments);      }
    this.error     = function() { addError("error",arguments);     return proxy("error",arguments);     }
    this.exception = function() { addError("exception",arguments); return proxy("exception",arguments); }
    return this;
}

// ==========================
// = Replace XMLHttpRequest =
// ==========================
Sburb.XMLHttpRequest = function() {
    // Public fun
    var self = this;
    var xhr = self._xhr = new Sburb.debugger.XMLHttpRequest();
    self.reqType = null;
    self.reqUrl = null;
    self.reqStart = null;
    self.readyState = 0;
    self.onreadystatechange = function(){};
    self.spy = {
        requestHeaders: [],
        responseHeaders: [],
        method: null,
        url: null,
        async: null,
        xhr: null,
        loaded: false,
        responseText: null,
        status: null,
        statusText: null
    };
    // Private fun
    var supportsApply = self.xhr && self.xhr.open && self.xhr.open.apply != "undefined";
    var isFunction = function(obj) { return obj && {}.toString.call(obj) === "[object Function]"; }
    var ignoreSelf = {
        abort: 1,
        channel: 1,
        getInterface: 1,
        mozBackgroundRequest: 1,
        multipart: 1,
        onreadystatechange: 1,
        open: 1,
        send: 1,
        setRequestHeader: 1
    };
    var ignoreXHR = {
        channel: 1,
        onreadystatechange: 1,
        readyState: 1,
        responseBody: 1,
        responseText: 1,
        responseXML: 1,
        status: 1,
        statusText: 1,
        upload: 1,
        spy: 1,
        _xhr: 1
    };
    var updateSelfProperties = function() {
        for(var prop in xhr) {
            if (prop in ignoreSelf) continue;
            try {
                if(xhr[prop] && !isFunction(xhr[prop])) {
                    self[prop] = xhr[prop];
                }
            } catch(E) {}
        }
    }
    var updateXHRProperties = function() {
        for(var prop in self) {
            if (prop in ignoreXHR) continue;
            try {
                if(self[prop] && !xhr[prop]) {
                    xhr[prop] = self[prop];
                }
            } catch(E) {}
        }
    }
    var finishXHR = function() {
        var duration = new Date().getTime() - self.reqStart;
        var success = xhr.status == 200 || xhr.status == 0;
        var status = xhr.status + " " + xhr.statusText;
        var responseHeadersText = xhr.getAllResponseHeaders();
        var responses = responseHeadersText ? responseHeadersText.split(/[\n\r]/) : [];
        var reHeader = /^(\S+):\s*(.*)/;
        for (var i=0, l=responses.length; i<l; i++) {
            var text = responses[i];
            var match = text.match(reHeader);
            if (match) {
                var name = match[1];
                var value = match[2];
                if (name == "Content-Type")
                    self.spy.mimeType = value;
                self.spy.responseHeaders.push({name: name, value: value});
            }
        }
        //self.spy.responseText = xhr.responseText;
        self.spy.loaded = true;
        self.spy.status = xhr.status;
        self.spy.statusText = status;
        updateSelfProperties();
        Sburb.debugger.xhrs.push(self.spy);
        if(!success)
            console.warn("XHR for "+self.spy.url+" failed");
    }
    var handleStateChange = function() {
        self.readyState = xhr.readyState;
        if (xhr.readyState == 4) {
            finishXHR();
            xhr.onreadystatechange = function(){};
        }
        self.onreadystatechange();
    }
    // Overwrite specific functions
    this.open = function(method, url, async, user, password) {
        updateSelfProperties();
        self.spy.method = method;
        self.spy.url = url;
        self.spy.async = async;
        self.spy.xhr = xhr;
        if (async)
            xhr.onreadystatechange = handleStateChange;
        if (this.supportsApply)
            xhr.open.apply(xhr, arguments);
        else
            xhr.open(method, url, async, user, password);
    }
    this.send = function(data) {
        self.spy.data = data;
        self.reqStart = new Date().getTime();
        updateXHRProperties();
        try {
            xhr.send(data);
        } catch(e) {
            throw e; 
        } finally {
            if (!self.spy.async) {
                self.readyState = xhr.readyState;
                finishXHR();
            }
        }
    }  
    this.setRequestHeader = function(header, value) {
        self.spy.requestHeaders.push({name: header, value: value});
        return xhr.setRequestHeader(header, value);
    }    
    this.abort = function() {
        xhr.abort();
        updateSelfProperties();
        handleRequestStatus(false, "Aborted");
    }
    // Import XHR stuff
    for (var prop in xhr) {
        if (prop in ignoreSelf) continue;
        try {
            if (isFunction(xhr[prop])) {
                if (typeof self[prop] == "undefined") {
                    self[prop] = (function(name, xhr){
                        return this.supportsApply ? function() { return xhr[name].apply(xhr, arguments); } : function(a,b,c,d,e) { return xhr[name](a,b,c,d,e); };
                    })(prop, xhr);
                } 
            }
            else
                self[prop] = xhr[prop];
        } catch(E) {}
    }
    return this;
}

return Sburb;
})(Sburb || {});
