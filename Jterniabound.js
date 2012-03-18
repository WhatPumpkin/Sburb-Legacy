//requires Character.js
//650x450 screen
var Keys = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,escape:27,space:32,left:37,up:38,right:39,down:40,w:87,a:65,s:83,d:68};

var Stage; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
var stage; //its context
var updateLoop;
var pressed;
var assetManager;
var assets;
var sprites;
var rooms;
var char;
var curRoom,destRoom;
var destX,destY;
var focus;
var chooser;
var curAction;
var bgm;
var hud;
var Mouse = {down:false,x:0,y:0};

var initFinished;
var _hardcode_load;

function initialize(){
	Stage = document.getElementById("Stage");	
	Stage.scaleX = Stage.scaleY = 1;
	Stage.x = Stage.y = 0;
	Stage.fps = 30;
	Stage.fade = 0;
	Stage.fadeRate = 0.1;
	
	stage = Stage.getContext("2d");
	
	chooser = new Chooser();
	dialoger = new Dialoger();
    assetManager = new AssetManager();
	assets = assetManager.assets; // shortcut for raw asset access
	rooms = {};
	sprites = {};
	commands = {};
	hud = {}
	pressed = new Array();
	buildCommands();
	
    loadSerialFromXML("levels/test1.xml"); // comment out this line and
    //loadAssets();                        // uncomment these two lines, to do a standard hardcode load
    //_hardcode_load = 1;
}

function update(gameTime){
	//update stuff
	handleInputs();
	handleHud();
	
	curRoom.update(gameTime);
	
	focusCamera();
	handleRoomChange();
	chooser.update(gameTime);
	dialoger.update(gameTime);
	chainAction();
	
	//must be last
    
	updateLoop=setTimeout("update("+(gameTime+1)+")",1000/Stage.fps);
	draw(gameTime);
}

function draw(gameTime){
	stage.fillStyle = "rgb(0,0,0)";
	stage.fillRect(0,0,Stage.width,Stage.height);
	
	stage.save();
	stage.scale(Stage.scaleX,Stage.scaleY);
	stage.translate(-Stage.x,-Stage.y);
	
	curRoom.draw();
	chooser.draw();
	
	stage.restore();
	dialoger.draw();
	
	stage.fillStyle = "rgba(0,0,0,"+Stage.fade+")";
	stage.fillRect(0,0,Stage.width,Stage.height);
	
	drawHud();
}

onkeydown = function(e){
	if(chooser.choosing){
		if(e.keyCode == Keys.down || e.keyCode==Keys.s){
			chooser.nextChoice();
		}
		if(e.keyCode == Keys.up || e.keyCode==Keys.w){
			chooser.prevChoice();
		}
		if(e.keyCode == Keys.space && !pressed[Keys.space]){
			curAction = chooser.choices[chooser.choice];
			performAction(curAction);
			chooser.choosing = false;
		}
	}else if(dialoger.talking){
		if(e.keyCode == Keys.space && !pressed[Keys.space]){
			dialoger.nudge();
		}
	}else{
		if(e.keyCode == Keys.space && !pressed[Keys.space]){
			chooser.choices = new Array();
			if(char.facing=="Front"){
				chooser.choices = curRoom.queryActions(char,char.x,char.y+char.height/2+15);
			}else if(char.facing=="Back"){
				chooser.choices = curRoom.queryActions(char,char.x,char.y-char.height/2-15);
			}else if(char.facing=="Right"){
				chooser.choices = curRoom.queryActions(char,char.x+char.width/2+15,char.y);
			}else if(char.facing=="Left"){
				chooser.choices = curRoom.queryActions(char,char.x-char.width/2-15,char.y);
			}
			if(chooser.choices.length>0){
				chooser.choices.push(new Action("cancel","cancel","cancel"));
				beginChoosing();
			}
		}
	}
	pressed[e.keyCode] = true;
    // return true if we want to pass keys along to the browser, i.e. Ctrl-N for a new window
    if(e.altKey || e.ctrlKey || e.metaKey) {
	// don't muck with system stuff
	return true;
    }
    return false;
}

onkeyup = function(e){
	pressed[e.keyCode] = false;
}

function onMouseMove(e,canvas){
	point = relMouseCoords(e,canvas);
	Mouse.x = point.x;
	Mouse.y = point.y;
	//console.log(Mouse.x+" "+Mouse.y);
}

function onMouseDown(e,canvas){
	Mouse.down = true;
}

function onMouseUp(e,canvas){
	Mouse.down = false;
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

function drawLoader(){
	stage.fillStyle = "rgb(240,240,240)";
	stage.fillRect(0,0,Stage.width,Stage.height);
	stage.fillStyle = "rgb(200,0,0)"
	stage.font="30px Arial";
    // stage.fillText("Loading Assets: "+(assetLoadStack.totalAssets-assetLoadStack.length)+"/"+assetLoadStack.totalAssets,100,200);
    stage.fillText("Loading Assets: "+assetManager.totalLoaded+"/"+assetManager.totalAssets,100,200);
}

function handleInputs(){
	if(hasControl()){
		if(pressed[Keys.down] || pressed[Keys.s]){
			char.moveDown(curRoom);
		}else if(pressed[Keys.up] || pressed[Keys.w]){
			char.moveUp(curRoom);
		}else if(pressed[Keys.left] || pressed[Keys.a]){
			char.moveLeft(curRoom);
		}else if(pressed[Keys.right] || pressed[Keys.d]){
			char.moveRight(curRoom);
		}else{
			char.idle();
		}
	}
}

function handleHud(){
	hud.volumeButton.updateMouse(Mouse.x,Mouse.y,Mouse.down);
	hud.helpButton.updateMouse(Mouse.x,Mouse.y,Mouse.down);
	hud.volumeButton.update(1);
	hud.helpButton.update(1);
	if(hasControl){
		if(hud.helpButton.clicked){
			performAction(new Action("helpAction","talk","@! HELP!"));
		}
		if(hud.volumeButton.clicked){
			
		}
	}
}

function drawHud(){
	hud.volumeButton.draw();
	hud.helpButton.draw();
}

function hasControl(){
	return !dialoger.talking && !chooser.choosing && !destRoom;
}

function buildCommands(){
	commands.talk = talkCommand;
	commands.changeRoom = changeRoomCommand;
	commands.changeChar = changeCharCommand;
	commands.playSong = playSongCommand;
	commands.cancel = cancelCommand;
}

function performAction(action){
    commands[action.command.trim()](action.info.trim());
}

function focusCamera(){
	Stage.x = Math.max(0,Math.min(focus.x-Stage.width/2/Stage.scaleX,curRoom.width-Stage.width/Stage.scaleX));
	Stage.y = Math.max(0,Math.min(focus.y-Stage.height/2/Stage.scaleY,curRoom.height-Stage.height/Stage.scaleY));
	Stage.x = Math.round(Stage.x/3)*3;
	Stage.y = Math.round(Stage.y/3)*3;
}

function changeRoom(newRoom,newX,newY){
	destRoom = newRoom;
	destX = newX;
	destY = newY;
}

function handleRoomChange(){
	if(destRoom){
		if(Stage.fade<1){
			Stage.fade=Math.min(1,Stage.fade+Stage.fadeRate);
		}else {
			char.x = destX;
			char.y = destY;
			moveSprite(char,curRoom,destRoom);
			curRoom = destRoom;
		    curRoom.initialize();
			destRoom = null;
		}
	}else if(Stage.fade>0.01){
		Stage.fade=Math.max(0.01,Stage.fade-Stage.fadeRate);
		//apparently alpha 0 is buggy?
	}
}

function moveSprite(sprite,oldRoom,newRoom){
	oldRoom.removeSprite(sprite);
	newRoom.addSprite(sprite);
}

function beginChoosing(){
	char.idle();
	chooser.beginChoosing(char.x,char.y);
}

function setCurRoomOf(sprite){
	if(!curRoom.contains(sprite)){
		for(var room in rooms){
			if(rooms[room].contains(sprite)){
				changeRoom(rooms[room],char.x,char.y);
				return;
			}
		}
	}
}

function changeBGM(newSong) {
    if(newSong){
		if(bgm) {
			if (bgm.priority > newSong.priority) {
				return;
			}
			if (bgm == newSong) {
				// maybe check for some kind of restart value
				return;
			}
			bgm.stop();
		}
		bgm = newSong;
		bgm.play();
		setTimeout("checkBGMLoop()", 100);
    }
}

function checkBGMLoop() {
    // this is just until we can figure out if Chrome loops things
    // or is just broken?
    if(bgm && bgm.ended()) {
		bgm.loop();
    }
    setTimeout("checkBGMLoop()", 100);
}
    
function chainAction(){
	if(hasControl()){
		if(curAction && curAction.followUp){
			curAction = curAction.followUp;
			performAction(curAction);
		}
	}
}    
    
