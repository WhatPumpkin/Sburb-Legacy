if(typeof String.prototype.trim !== 'function') {
  String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/g, ''); 
  }
}

var Sburb = (function(Sburb){
//650x450 screen
Sburb.Keys = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,escape:27,space:32,left:37,up:38,right:39,down:40,w:87,a:65,s:83,d:68};

Sburb.Stage = null; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
Sburb.stage = null; //its context
Sburb.pressed = null; //the pressed keys
Sburb.assetManager = null; //the asset loader
Sburb.assets = null; //all images, sounds, paths
Sburb.sprites = null; //all sprites that were Serial loaded
Sburb.effects = null; //all effects that were Serial loaded
Sburb.rooms = null; //all rooms
Sburb.char = null; //the player
Sburb.curRoom = null;
Sburb.destRoom = null; //current room, the room we are transitioning to, if it exists.
Sburb.destX = null;
Sburb.destY = null; //the desired location in the room we are transitioning to, if it exists.
Sburb.focus = null; //the focus of the camera (a sprite), usually just the char
Sburb.chooser = null; //the option chooser
Sburb.curAction = null; //the current action being performed
Sburb.bgm = null; //the current background music
Sburb.hud = null; //the hud; help and sound buttons
Sburb.Mouse = {down:false,x:0,y:0}; //current recorded properties of the mouse
Sburb.waitFor = null;
Sburb.engineMode = "wander";

Sburb.updateLoop = null; //the main updateLoop, used to interrupt updating
Sburb.initFinished = null; //only used when _hardcode_load is true
Sburb._hardcode_load = null; //set to 1 when we don't want to load from XML: see initialize()

Sburb.initialize = function(div,levelName,includeDevTools){
	var deploy = ' \
	<div style="padding-left: 0;\
		padding-right: 0;\
		margin-left: auto;\
		margin-right: auto;\
		display: block;\
		width:650px;\
		height:450px;"> \
		<div id="gameDiv" >\
			<canvas id="Stage" width="650" height="450" tabindex="0" \
						onmousedown = "Sburb.onMouseDown(event,this)"\
						onmousemove = "Sburb.onMouseMove(event,this)"\
						onmouseup = "Sburb.onMouseUp(event,this)"\
						>\
			</canvas>\
		</div>\
		<div id="movieBin"></div>\
		</br>';
	if(includeDevTools){
		deploy+='\
		<div> \
			<button id="saveState" onclick="Sburb.serialize(Sburb.assets, Sburb.effects, Sburb.rooms, Sburb.sprites, Sburb.hud, Sburb.dialoger, Sburb.curRoom, Sburb.char)">save state</button>\
			<button id="loadState" onclick="Sburb.loadSerial(document.getElementById(\'serialText\').value)">load state</button>\
			<input type="file" name="level" id="levelFile" />\
			<button id="loadLevelFile" onclick="Sburb.loadLevelFile(document.getElementById(\'levelFile\'))">load level</button>\
			<button id="strifeTest" onclick="Sburb.loadSerialFromXML(\'levels/strifeTest.xml\')">strife test</button>\
			<button id="wanderTest" onclick="Sburb.loadSerialFromXML(\'levels/wanderTest.xml\')">wander test</button>\
			</br>\
			<textarea id="serialText" style="display:inline; width:650; height:100;"></textarea><br/>\
		</div>';
	}
	deploy+='</div>';
	document.getElementById(div).innerHTML = deploy;
	var gameDiv = document.getElementById("gameDiv");
	gameDiv.onkeydown = _onkeydown;
	gameDiv.onkeyup = _onkeyup;
	Sburb.Stage = document.getElementById("Stage");	
	Sburb.Stage.scaleX = Sburb.Stage.scaleY = 3;
	Sburb.Stage.x = Sburb.Stage.y = 0;
	Sburb.Stage.fps = 30;
	Sburb.Stage.fade = 0;
	Sburb.Stage.fadeRate = 0.1;
	
	Sburb.stage = Sburb.Stage.getContext("2d");
	
	Sburb.chooser = new Sburb.Chooser();
	Sburb.dialoger = new Sburb.Dialoger();
    Sburb.assetManager = new Sburb.AssetManager();
	Sburb.assets = Sburb.assetManager.assets; // shortcut for raw asset access
	Sburb.rooms = {};
	Sburb.sprites = {};
	Sburb.effects = {};
	Sburb.hud = {};
	Sburb.pressed = [];
	
    Sburb.loadSerialFromXML(levelName); // comment out this line and
    //loadAssets();                        // uncomment these two lines, to do a standard hardcode load
    //_hardcode_load = 1;
}

function update(){
	//update stuff
	handleInputs();
	handleHud();
	
	Sburb.curRoom.update();
	
	focusCamera();
	handleRoomChange();
	Sburb.chooser.update();
	Sburb.dialoger.update();
	chainAction();
	updateWait();
	
	//must be last
    
	Sburb.updateLoop=setTimeout(update,1000/Sburb.Stage.fps);
	draw();
}

function draw(){
	//stage.clearRect(0,0,Stage.width,Stage.height);
	
	Sburb.stage.save();
	Sburb.Stage.offset = true;
	Sburb.stage.translate(-Stage.x,-Stage.y);
	
	Sburb.curRoom.draw();
	Sburb.chooser.draw();
	
	Sburb.stage.restore();
	Sburb.Stage.offset = false;
	Sburb.dialoger.draw();
	
	if(Sburb.Stage.fade>0.1){
		Sburb.stage.fillStyle = "rgba(0,0,0,"+Sburb.Stage.fade+")";
		Sburb.stage.fillRect(0,0,Sburb.Stage.width,Sburb.Stage.height);
	}
	
	drawHud();
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
	Sburb.dialoger.nudge();
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

Sburb.drawLoader = function(){
	Sburb.stage.fillStyle = "rgb(240,240,240)";
	Sburb.stage.fillRect(0,0,Sburb.Stage.width,Sburb.Stage.height);
	Sburb.stage.fillStyle = "rgb(200,0,0)"
	Sburb.stage.font="30px Arial";
    Sburb.stage.fillText("Loading Assets: "+Sburb.assetManager.totalLoaded+"/"+Sburb.assetManager.totalAssets,100,200);
}

function handleInputs(){
	if(hasControl()){
		Sburb.char.handleInputs(Sburb.pressed);
	}else{
		Sburb.char.moveNone();
	}
}

function handleHud(){
	for(var content in Sburb.hud){
		var obj = Sburb.hud[content];
		if(obj.updateMouse){
			obj.updateMouse(Sburb.Mouse.x,Sburb.Mouse.y,Sburb.Mouse.down);
			obj.update();
			if(obj.clicked && obj.action){
				Sburb.performAction(obj.action);
			}
		}
	}
}

function drawHud(){
	for(var content in Sburb.hud){
		Sburb.hud[content].draw();
	}
}

function hasControl(){
	return !Sburb.dialoger.talking && !Sburb.chooser.choosing && !Sburb.destRoom && !Sburb.waitFor;
}

function focusCamera(){
	//need to divide these by scaleX and scaleY if repurposed
	Sburb.Stage.x = Math.max(0,Math.min(Sburb.focus.x-Sburb.Stage.width/2,Sburb.curRoom.width-Sburb.Stage.width));
	Sburb.Stage.y = Math.max(0,Math.min(Sburb.focus.y-Sburb.Stage.height/2,Sburb.curRoom.height-Sburb.Stage.height));
	Sburb.Stage.x = Math.round(Sburb.Stage.x/3)*3;
	Sburb.Stage.y = Math.round(Sburb.Stage.y/3)*3;
}

function handleRoomChange(){
	if(Sburb.destRoom){
		if(Sburb.Stage.fade<1){
			Sburb.Stage.fade=Math.min(1,Sburb.Stage.fade+Sburb.Stage.fadeRate);
		}else {
			Sburb.char.x = Sburb.destX;
			Sburb.char.y = Sburb.destY;
			Sburb.moveSprite(Sburb.char,Sburb.curRoom,Sburb.destRoom);
			Sburb.curRoom.exit();
			Sburb.curRoom = Sburb.destRoom;
			Sburb.destRoom = null;
		}
	}else if(Sburb.Stage.fade>0.01){
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
			Sburb.performAction(curAction);
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
   }while(Sburb.curAction.times<=0 && Sburb.curAction.followUp && Sburb.curAction.followUp.noDelay);
}

Sburb.performActionSilent = function(action){
	action.times--;
	Sburb.commands[action.command.trim()](action.info.trim());
}



Sburb.changeRoom = function(newRoom,newX,newY){
	Sburb.destRoom = newRoom;
	Sburb.destX = newX;
	Sburb.destY = newY;
}



Sburb.moveSprite = function(sprite,oldRoom,newRoom){
	oldRoom.removeSprite(sprite);
	newRoom.addSprite(sprite);
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
			if (Sburb.bgm == newSong) {
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
	document.getElementById("gameDiv").style.display = "none";
	Sburb.waitFor = new Sburb.Trigger("movie,"+name+",1");
}




Sburb.update = update;

return Sburb;
})(Sburb || {});

    
