var Sburb = (function(Sburb){

////////////////////////////////////////////
//Debugger Class
////////////////////////////////////////////

Sburb.Debugger = function() {
    this.url = "http://homestuck.org/SburbDebugger/report.php";
    this.console = window.console; // Save the real console
    this.fps = 0;
    this.errors = [];
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
    };
    // Run tests
    this.tests["Audio Support"] = !!(Modernizr.audio.ogg || Modernizr.audio.mp3);
    this.tests["Save Support"] = Modernizr.sessionstorage;
    this.tests["Better File Loading"] = Modernizr.xhr2 && Modernizr.blob_slice;
    // Replace the console with this
    var that = this;
    window.__defineGetter__('console',function() { return that; });
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
            var color = this.tests[test] ? "success" : "failure";
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
    this.console.log("sendDebugReport not yet implemented");
}

Sburb.Debugger.prototype.addError = function(type,args) {
    var largs = Array.prototype.slice.call(args);
    this.errors.push({type:type,text:largs.join(', ')});
    this.console.log(type,args);
}

// ===================
// = Replace Console =
// ===================
Sburb.Debugger.prototype.log = function() {
    this.addError("log",arguments);
}
Sburb.Debugger.prototype.debug = function() {
    this.addError("debug",arguments);
}
Sburb.Debugger.prototype.info = function() {
    this.addError("info",arguments);
}
Sburb.Debugger.prototype.warn = function() {
    this.addError("warn",arguments);
}
Sburb.Debugger.prototype.error = function() {
    this.addError("error",arguments);
}
Sburb.Debugger.prototype.exception = function() {
    this.addError("exception",arguments);
}
Sburb.Debugger.prototype.assert = function() {
    this.addError("assert",arguments);
}
Sburb.Debugger.prototype.dir = function() {
}
Sburb.Debugger.prototype.dirxml = function() {
}
Sburb.Debugger.prototype.trace = function() {
}
Sburb.Debugger.prototype.group = function() {
}
Sburb.Debugger.prototype.groupEnd = function() {
}
Sburb.Debugger.prototype.groupCollapsed = function() {
}
Sburb.Debugger.prototype.time = function() {
}
Sburb.Debugger.prototype.timeEnd = function() {
}
Sburb.Debugger.prototype.profile = function() {
}
Sburb.Debugger.prototype.profileEnd = function() {
}
Sburb.Debugger.prototype.count = function() {
}
Sburb.Debugger.prototype.clear = function() {
}
Sburb.Debugger.prototype.table = function() {
}

return Sburb;
})(Sburb || {});
