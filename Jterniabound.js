if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

var Sburb = (function(Sburb){
//650x450 screen
Sburb.Keys = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,escape:27,space:32,left:37,up:38,right:39,down:40,w:87,a:65,s:83,d:68};

Sburb.name = 'Jterniabound';
Sburb.Stage = null; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
Sburb.cam = {x:0,y:0}
Sburb.stage = null; //its context
Sburb.pressed = null; //the pressed keys
Sburb.assetManager = null; //the asset loader
Sburb.assets = null; //all images, sounds, paths
Sburb.sprites = null; //all sprites that were Serial loaded
Sburb.effects = null; //all effects that were Serial loaded
Sburb.buttons = null; //all buttons that were Serial loaded
Sburb.rooms = null; //all rooms 
Sburb.char = null; //the player
Sburb.curRoom = null;
Sburb.destRoom = null; //current room, the room we are transitioning to, if it exists.
Sburb.destX = null;
Sburb.destY = null; //the desired location in the room we are transitioning to, if it exists.
Sburb.focus = null; //the focus of the camera (a sprite), usually just the char
Sburb.destFocus = null;
Sburb.chooser = null; //the option chooser
Sburb.curAction = null; //the current action being performed
Sburb.bgm = null; //the current background music
Sburb.hud = null; //the hud; help and sound buttons
Sburb.Mouse = {down:false,x:0,y:0}; //current recorded properties of the mouse
Sburb.waitFor = null;
Sburb.engineMode = "wander";
Sburb.fading = false;
Sburb.lastMusicTime = -1;
Sburb.musicStoppedFor = 0;

Sburb.updateLoop = null; //the main updateLoop, used to interrupt updating
Sburb.initFinished = null; //only used when _hardcode_load is true
Sburb._hardcode_load = null; //set to 1 when we don't want to load from XML: see initialize()
Sburb._include_dev = false;
var lastDrawTime = 0;

Sburb.initialize = function(div,levelName,includeDevTools){
	var deploy = '   \
	<div style="padding-left: 0;\
		padding-right: 0;\
		margin-left: auto;\
		margin-right: auto;\
		display: block;\
		width:650px;\
		height:450px;"> \
		<div id="SBURBgameDiv" style="position: absolute; z-index:100">\
			<canvas id="SBURBStage" width="650" height="450" tabindex="0" \
						onmousedown = "Sburb.onMouseDown(event,this)"\
						onmousemove = "Sburb.onMouseMove(event,this)"\
						onmouseup = "Sburb.onMouseUp(event,this)"\
						>\
						ERROR: Your browser is too old to display this content!\
			</canvas>\
			<canvas id="SBURBMapCanvas" width="1" height="1" style="display:none"/> \
		</div>\
		<div id="SBURBmovieBin" style="position: absolute; z-index:200"> </div>\
		<div id="SBURBfontBin"></div>\
		</br>';
	if(includeDevTools){
		Sburb._include_dev = true;
		deploy+='\
		<div> \
			<button id="saveState" onclick="Sburb.serialize(Sburb)">save state</button>\
			<button id="loadState" onclick="Sburb.loadSerial(document.getElementById(\'serialText\').value)">load state</button>\
			<input type="file" name="level" id="levelFile" />\
			<button id="loadLevelFile" onclick="Sburb.loadLevelFile(document.getElementById(\'levelFile\'))">load level</button>\
			<button id="strifeTest" onclick="Sburb.loadSerialFromXML(\'levels/strifeTest.xml\')">strife test</button>\
			<button id="wanderTest" onclick="Sburb.loadSerialFromXML(\'levels/wanderTest.xml\')">wander test</button>\
			</br>\
			<textarea id="serialText" style="display:inline; width:650px; height:100px;"></textarea><br/>\
		</div>';
	}
	deploy+='</div>';
	document.getElementById(div).innerHTML = deploy;
	var gameDiv = document.getElementById("SBURBgameDiv");
	gameDiv.onkeydown = _onkeydown;
	gameDiv.onkeyup = _onkeyup;
	Sburb.Stage = document.getElementById("SBURBStage");	
	Sburb.Stage.scaleX = Sburb.Stage.scaleY = 3;
	Sburb.Stage.x = Sburb.Stage.y = 0;
	Sburb.Stage.fps = 30;
	Sburb.Stage.fade = 0;
	Sburb.Stage.fadeRate = 0.1;
	
	Sburb.stage = Sburb.Stage.getContext("2d");
	
	Sburb.chooser = new Sburb.Chooser();
	Sburb.dialoger = null;
    Sburb.assetManager = new Sburb.AssetManager();
	Sburb.assets = Sburb.assetManager.assets; // shortcut for raw asset access
	Sburb.rooms = {};
	Sburb.sprites = {};
	Sburb.effects = {};
	Sburb.buttons = {};
	Sburb.hud = {};
	Sburb.pressed = [];
	
    Sburb.loadSerialFromXML(levelName); // comment out this line and
    //loadAssets();                        // uncomment these two lines, to do a standard hardcode load
    //_hardcode_load = 1;
}

function startUpdateProcess(){
	haltUpdateProcess();
	Sburb.updateLoop=setInterval(update,1000/Sburb.Stage.fps);
	Sburb.drawLoop=setInterval(draw,1000/Sburb.Stage.fps);
}

function haltUpdateProcess(){
	if(Sburb.updateLoop){
		clearInterval(Sburb.updateLoop);
		clearInterval(Sburb.drawLoop);
		Sburb.updateLoop = Sburb.drawLoop = null;
	}
}

function update(){
	//update stuff
	handleAudio();
	handleInputs();
	handleHud();
	
	Sburb.curRoom.update();
	
	focusCamera();
	handleRoomChange();
	Sburb.chooser.update();
	Sburb.dialoger.update();
	chainAction();
	updateWait();
}

function draw(){
	//stage.clearRect(0,0,Stage.width,Stage.height);
	if(!Sburb.playingMovie){
		Sburb.stage.save();
		Sburb.Stage.offset = true;
		Sburb.stage.translate(-Sburb.Stage.x,-Sburb.Stage.y);
	
		Sburb.curRoom.draw();
	
		Sburb.stage.restore();
		Sburb.Stage.offset = false;
	
		if(Sburb.Stage.fade>0.1){
			Sburb.stage.fillStyle = "rgba(0,0,0,"+Sburb.Stage.fade+")";
			Sburb.stage.fillRect(0,0,Sburb.Stage.width,Sburb.Stage.height);
		}
	
		Sburb.dialoger.draw();
		drawHud();
	
		Sburb.stage.save();
		Sburb.Stage.offset = true;
		Sburb.stage.translate(-Sburb.Stage.x,-Sburb.Stage.y);
	
		Sburb.chooser.draw();
	
		Sburb.stage.restore();
		Sburb.Stage.offset = false;
	}
}

var _onkeydown = function(e){
	if(Sburb.chooser.choosing){
		if(e.keyCode == Sburb.Keys.down || e.keyCode==Sburb.Keys.s){
			Sburb.chooser.nextChoice();
		}
		if(e.keyCode == Sburb.Keys.up || e.keyCode==Sburb.Keys.w){
			Sburb.chooser.prevChoice();
		}
		if(e.keyCode == Sburb.Keys.space && !Sburb.pressed[Sburb.Keys.space]){
			Sburb.performAction(Sburb.chooser.choices[Sburb.chooser.choice]);
			Sburb.chooser.choosing = false;
		}
	}else if(Sburb.dialoger.talking){
		if(e.keyCode == Sburb.Keys.space && !Sburb.pressed[Sburb.Keys.space]){
			Sburb.dialoger.nudge();
		}
	}else if(hasControl()){
		if(e.keyCode == Sburb.Keys.space && !Sburb.pressed[Sburb.Keys.space] && Sburb.engineMode=="wander"){
			Sburb.chooser.choices = [];
			var queries = Sburb.char.getActionQueries();
			for(var i=0;i<queries.length;i++){
				Sburb.chooser.choices = Sburb.curRoom.queryActions(Sburb.char,queries[i].x,queries[i].y);
				if(Sburb.chooser.choices.length>0){
					break;
				}
			}
			if(Sburb.chooser.choices.length>0){
				Sburb.chooser.choices.push(new Sburb.Action("cancel","cancel","cancel"));
				beginChoosing();
			}
		}
	}
	Sburb.pressed[e.keyCode] = true;
    // return true if we want to pass keys along to the browser, i.e. Ctrl-N for a new window
    if(e.altKey || e.ctrlKey || e.metaKey) {
		// don't muck with system stuff
		return true;
    }
    return false;
}

var _onkeyup = function(e){
	Sburb.pressed[e.keyCode] = false;
}

Sburb.onMouseMove = function(e,canvas){
	var point = relMouseCoords(e,canvas);
	Sburb.Mouse.x = point.x;
	Sburb.Mouse.y = point.y;
}

Sburb.onMouseDown = function(e,canvas){
	if(Sburb.engineMode=="strife" && hasControl()){
		Sburb.chooser.choices = Sburb.curRoom.queryActionsVisual(Sburb.char,Sburb.Stage.x+Sburb.Mouse.x,Sburb.Stage.y+Sburb.Mouse.y);
		if(Sburb.chooser.choices.length>0){
			Sburb.chooser.choices.push(new Sburb.Action("cancel","cancel","cancel"));
			beginChoosing();
		}
	}
	Sburb.Mouse.down = true;
	
}

Sburb.onMouseUp = function(e,canvas){
	Sburb.Mouse.down = false;
	if(Sburb.dialoger && Sburb.dialoger.box && Sburb.dialoger.box.isVisuallyUnder(Sburb.Mouse.x,Sburb.Mouse.y)){
		Sburb.dialoger.nudge();
	}
}

function relMouseCoords(event,canvas){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)
    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    return {x:canvasX,y:canvasY};
}

function handleAudio(){
	if(Sburb.bgm && Sburb.bgm.asset){
		if(Sburb.bgm.asset.ended || Sburb.bgm.asset.currentTime>=Sburb.bgm.asset.duration ){
			Sburb.bgm.loop();
		}
		if (Sburb.lastMusicTime == Sburb.bgm.asset.currentTime){
			Sburb.musicStoppedFor++;
			if(Sburb.musicStoppedFor>4){
		    Sburb.bgm.asset.pause(); 
		    Sburb.bgm.asset.play(); // asset.play() because sometimes this condition is true on startup
		  }
    }else{
    	Sburb.musicStoppedFor = 0;
    }
		if(Sburb.bgm.asset.paused){
		//	console.log("The sound is paused??? THIS SHOULD NOT BE.");
			Sburb.bgm.play();
		}
		Sburb.lastMusicTime = Sburb.bgm.asset.currentTime;
	}else{
		//console.log("The music doesn't exist!");
	}
}

function handleInputs(){
	if(Sburb.Stage){
		Sburb.Stage.style.cursor = "default";
	}
	if(hasControl()){
		Sburb.char.handleInputs(Sburb.pressed);
	}else{
		Sburb.char.moveNone();
	}
}

function handleHud(){
	for(var content in Sburb.hud){
		var obj = Sburb.hud[content];
		obj.update();
	}
}

function drawHud(){
	for(var content in Sburb.hud){
		Sburb.hud[content].draw();
	}
}

function hasControl(){
	return !Sburb.dialoger.talking 
		&& !Sburb.chooser.choosing 
		&& !Sburb.destRoom 
		&& !Sburb.waitFor 
		&& !Sburb.fading 
		&& !Sburb.destFocus;
}

function focusCamera(){
	//need to divide these by scaleX and scaleY if repurposed
	if(!Sburb.destFocus){
		Sburb.cam.x = Sburb.focus.x-Sburb.Stage.width/2;
		Sburb.cam.y = Sburb.focus.y-Sburb.Stage.height/2;
	}else if(Math.abs(Sburb.destFocus.x-Sburb.cam.x-Sburb.Stage.width/2)>8 || Math.abs(Sburb.destFocus.y-Sburb.cam.y-Sburb.Stage.height/2)>8){
		Sburb.cam.x += (Sburb.destFocus.x-Sburb.Stage.width/2-Sburb.cam.x)/5;
		Sburb.cam.y += (Sburb.destFocus.y-Sburb.Stage.height/2-Sburb.cam.y)/5;
	}else{
		Sburb.focus = Sburb.destFocus;
		Sburb.destFocus = null;
	}
	Sburb.Stage.x = Math.max(0,Math.min(Math.round(Sburb.cam.x/Sburb.Stage.scaleX)*Sburb.Stage.scaleX,Sburb.curRoom.width-Sburb.Stage.width));
	Sburb.Stage.y = Math.max(0,Math.min(Math.round(Sburb.cam.y/Sburb.Stage.scaleX)*Sburb.Stage.scaleX,Sburb.curRoom.height-Sburb.Stage.height));
}

function handleRoomChange(){
	if(Sburb.destRoom || Sburb.fading){
		if(Sburb.Stage.fade<1.1){
			Sburb.Stage.fade=Math.min(1.1,Sburb.Stage.fade+Sburb.Stage.fadeRate);
		}else if(Sburb.destRoom){
			var deltaX = Sburb.destX-Sburb.char.x; 
			var deltaY = Sburb.destY-Sburb.char.y; 
			var curSprite = Sburb.char;
			while(curSprite){
				curSprite.x+=deltaX;
				curSprite.y+=deltaY;
				curSprite.followBuffer = [];
				curSprite = curSprite.follower;
			}
			Sburb.moveSprite(Sburb.char,Sburb.curRoom,Sburb.destRoom);
			Sburb.curRoom.exit();
			Sburb.curRoom = Sburb.destRoom;
			Sburb.curRoom.enter();
			Sburb.destRoom = null;
		}else{
			Sburb.fading = false;
		}
	}else if(hasControl() && Sburb.Stage.fade>0.01){
		Sburb.Stage.fade=Math.max(0.01,Sburb.Stage.fade-Sburb.Stage.fadeRate);
		//apparently alpha 0 is buggy?
	}
}

function beginChoosing(){
	Sburb.char.idle();
	Sburb.chooser.beginChoosing(Sburb.char.x,Sburb.char.y);
}

function chainAction(){
	if(Sburb.curAction){
		if(Sburb.curAction.times<=0){
			if(Sburb.curAction.followUp){
				if(hasControl() || Sburb.curAction.followUp.noWait){
					Sburb.performAction(Sburb.curAction.followUp);
				}
			}else{
				Sburb.curAction = null;
			}
		}else if(hasControl() || Sburb.curAction.noWait){
			Sburb.performAction(Sburb.curAction);
		}
	}
}    

function updateWait(){
	if(Sburb.waitFor){
		if(Sburb.waitFor.checkCompletion()){
			Sburb.waitFor = null;
		}
	}
}

Sburb.performAction = function(action){
	if(action.silent){
		Sburb.performActionSilent(action);
		return;
	}
	if(((Sburb.curAction && Sburb.curAction.followUp!=action) || !hasControl()) && action.soft){
		return;
	}
	
	var looped = false;
	Sburb.curAction = action.clone();
	do{
		if(looped){
			Sburb.curAction = Sburb.curAction.followUp.clone();
		}
   	Sburb.performActionSilent(Sburb.curAction);
   	looped = true;
	}while(Sburb.curAction && Sburb.curAction.times<=0 && Sburb.curAction.followUp && Sburb.curAction.followUp.noDelay);
}
Sburb.performActionSilent = function(action){
	action.times--;
	var info = action.info;
	if(info){
		info = info.trim();
	}
	Sburb.commands[action.command.trim()](info);
}



Sburb.changeRoom = function(newRoom,newX,newY){
	Sburb.destRoom = newRoom;
	Sburb.destX = newX;
	Sburb.destY = newY;
}



Sburb.moveSprite = function(sprite,oldRoom,newRoom){
	var curSprite = sprite;
	while(curSprite){
		oldRoom.removeSprite(curSprite);
		newRoom.addSprite(curSprite);
		curSprite = curSprite.follower;
	}
}



Sburb.setCurRoomOf = function(sprite){
	if(!Sburb.curRoom.contains(sprite)){
		for(var room in Sburb.rooms){
			if(Sburb.rooms[room].contains(sprite)){
				Sburb.changeRoom(Sburb.rooms[room],Sburb.char.x,Sburb.char.y);
				return;
			}
		}
	}
}

Sburb.changeBGM = function(newSong) {
    if(newSong){
		if(Sburb.bgm) {
			if (Sburb.bgm.asset == newSong.asset && Sburb.bgm.startLoop == newSong.startLoop) {
				// maybe check for some kind of restart value
				return;
			}
			Sburb.bgm.stop();
		}
		Sburb.bgm = newSong;
		Sburb.bgm.stop();
		Sburb.bgm.play();
    }
}

Sburb.playEffect = function(effect,x,y){
	Sburb.curRoom.addEffect(effect.clone(x,y));
}

Sburb.playSound = function(sound){
	sound.stop();
	sound.play();
}

Sburb.playMovie = function(movie){
	var name = movie.name;
	document.getElementById(name).style.display = "block";
	Sburb.waitFor = new Sburb.Trigger("movie,"+name+",5");
	Sburb.playingMovie = true;
}

Sburb.startUpdateProcess = startUpdateProcess;
Sburb.haltUpdateProcess = haltUpdateProcess;
Sburb.draw = draw;
return Sburb;
})(Sburb || {});

    
