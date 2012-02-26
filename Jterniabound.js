//requires Character.js
//650x450 screen
var Keys = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,escape:27,space:32,left:37,up:38,right:39,down:40,w:87,a:65,s:83,d:68};

var Stage; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
var stage; //its context
var updateLoop;
var pressed;
var assetLoadStack;
var assets;
var sprites;
var rooms;
var char;
var curRoom,destRoom;
var destX,destY;
var focus;
var chooser;

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
	assets = {};
	rooms = {};
	sprites = {};
	commands = {};
	pressed = new Array();
	
	loadAssets();
}

function finishInit(){
	buildSprites();
	buildRooms();
	buildActions();
	buildCommands();
	
	focus = char = sprites.karkat;
	curRoom = rooms.baseRoom;
	
	char.becomePlayer();
	serialize();
	update(0);
}

function update(gameTime){
	//update stuff
	handleInputs();
	
	curRoom.update(gameTime);
	
	focusCamera();
	handleRoomChange();
	chooser.update(gameTime);
	dialoger.update(gameTime);
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
			performAction(chooser.choices[chooser.choice]);
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
}

onkeyup = function(e){
	pressed[e.keyCode] = false;
}

function drawLoader(){
	stage.fillStyle = "rgb(240,240,240)";
	stage.fillRect(0,0,Stage.width,Stage.height);
	stage.fillStyle = "rgb(200,0,0)"
	stage.font="30px Arial";
	stage.fillText("Loading Assets: "+(assetLoadStack.totalAssets-assetLoadStack.length)+"/"+assetLoadStack.totalAssets,100,200);
}

function handleInputs(){
	if(!chooser.choosing){
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

function loadAssets(){
	assetLoadStack = new Array();
	assetLoadStack.totalAssets = 0;
	loadAsset("cgSheet","resources/CGsheetBig.png");
	loadAsset("compLabBG","resources/comlab-background.gif");
	loadAsset("compLabWalkable","resources/comlab-walkable.png");
	loadAsset("dialogBox","resources/dialogBoxBig.png");
	assets.compLabWalkable = [{x:70,y:270},{x:800,y:270},{x:800,y:820},{x:70,y:820}];
	assets.compLabWalkable.name = "compLabWalkable";
	drawLoader();
}

function loadAsset(name,path){
	assets[name] = new Image();
	assets[name].src = path;
	assets[name].onload = popLoad;
	assets[name].name = name;
	assetLoadStack.totalAssets++;
	assetLoadStack.push(assets[name]);
}

function popLoad(){
	assetLoadStack.pop();
	drawLoader();
	if(assetLoadStack.length==0){
		finishInit();
	}
}

function buildSprites(){
	sprites.karkat = new Character("karkat",300,501,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone = new Character("karclone",201,399,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone2 = new Character("karclone2",501,399,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.compLabBG = new StaticSprite("compLabBG",0,0,null,null,null,null,assets.compLabBG);
	sprites.dialogBox = new StaticSprite("dialogBox",Stage.width+1,1000,null,null,null,null,assets.dialogBox,FG_DEPTHING);
	dialoger.setBox(sprites.dialogBox);
}

function buildRooms(){
	rooms.baseRoom = new Room("baseRoom",sprites.compLabBG.width,sprites.compLabBG.height,
								assets.compLabWalkable);
	rooms.baseRoom.addSprite(sprites.karkat);
	rooms.baseRoom.addSprite(sprites.karclone);
	rooms.baseRoom.addSprite(sprites.compLabBG);
	
	rooms.cloneRoom = new Room("cloneRoom",sprites.compLabBG.width,sprites.compLabBG.height,assets.compLabWalkable);
	rooms.cloneRoom.addSprite(sprites.karclone2);
	rooms.cloneRoom.addSprite(sprites.compLabBG);
}

function buildActions(){
	sprites.karkat.addAction(new Action("swap","changeChar","karkat"));

	sprites.karclone.addAction(new Action("talk","talk","@CGAngry Lorem ipsum\n\ndolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit\n\nin voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt \n\nmollit anim id\n\nest \n\nlaborum. @CGSpecial hehehe @GGMad whaaaat"));
	sprites.karclone.addAction(new Action("change room","changeRoom","cloneRoom,300,300"));
	sprites.karclone.addAction(new Action("swap","changeChar","karclone"));
	
	sprites.karclone2.addAction(new Action("talk","talk","@! blahblahblah"));
	sprites.karclone2.addAction(new Action("change room","changeRoom","baseRoom,300,300"));
	sprites.karclone2.addAction(new Action("swap","changeChar","karclone2"));
}

function buildCommands(){
	commands.talk = talkCommand;
	commands.changeRoom = changeRoomCommand;
	commands.changeChar = changeCharCommand;
	commands.cancel = cancelCommand;
}

function performAction(action){
	commands[action.command](action.info);
}

function focusCamera(){
	Stage.x = Math.max(0,Math.min(focus.x-Stage.width/2/Stage.scaleX,curRoom.width-Stage.width/Stage.scaleX));
	Stage.y = Math.max(0,Math.min(focus.y-Stage.height/2/Stage.scaleY,curRoom.height-Stage.height/Stage.scaleY));
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
