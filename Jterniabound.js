//requires Character.js

var Keys = {backspace:8,tab:9,enter:13,shift:16,ctrl:17,alt:18,escape:27,space:32,left:37,up:38,right:39,down:40};

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
var dialogText;
var chooser;
var talking;


function initialize(){
	Stage = document.getElementById("Stage");	
	Stage.scaleX = Stage.scaleY = 1;
	Stage.x = Stage.y = 0;
	Stage.fps = 30;
	Stage.fade = 0;
	Stage.fadeRate = 0.1;
	
	stage = Stage.getContext("2d");
	
	chooser = {choosing:false,choices:new Array(),choice:0,dialogs:new Array()};
	assets = {};
	rooms = {};
	sprites = {};
	pressed = new Array();
	
	loadAssets();
}

function finishInit(){
	buildSprites();
	buildRooms();
	buildFonts();
	buildActions();
	
	focus = char = sprites.karkat;
	curRoom = rooms.baseRoom;
	
	char.becomePlayer();
	
	update(0);
}

function update(gameTime){
	//update stuff
	handleInputs();
	
	curRoom.update(gameTime);
	
	focusCamera();
	handleRoomChange();
	handleTextUpdates();
	
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
	drawChoices();
	//stage.fillStyle = "#ffffff";
	//stage.fillRect(dialogText.x,dialogText.y,dialogText.width,dialogText.height);
	//dialogText.draw();
	
	stage.restore();
	stage.fillStyle = "rgba(0,0,0,"+Stage.fade+")";
	stage.fillRect(0,0,Stage.width,Stage.height);
}

onkeydown = function(e){
	if(chooser.choosing){
		if(e.keyCode == Keys.down){
			chooser.choice = (chooser.choice+1)%chooser.choices.length;
		}
		if(e.keyCode == Keys.up){
			chooser.choice = (chooser.choice-1+chooser.choices.length)%chooser.choices.length;
		}
		if(e.keyCode == Keys.space && !pressed[Keys.space]){
			performAction(chooser.choices[chooser.choice]);
			chooser.choosing = false;
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
		if(pressed[Keys.down]){
			char.moveDown(curRoom.sprites,curRoom.walkable);
		}else if(pressed[Keys.up]){
			char.moveUp(curRoom.sprites,curRoom.walkable);
		}else if(pressed[Keys.left]){
			char.moveLeft(curRoom.sprites,curRoom.walkable);
		}else if(pressed[Keys.right]){
			char.moveRight(curRoom.sprites,curRoom.walkable);
		}else{
			char.idle();
		}
	}else{
		
	}
	
	
}

function loadAssets(){
	assetLoadStack = new Array();
	assetLoadStack.totalAssets = 0;
	loadAsset("cgSheet","resources/CGsheetBig.png");
	loadAsset("compLabBG","resources/comlab-background.gif");
	loadAsset("compLabWalkable","resources/comlab-walkable.png");
	drawLoader();
}

function loadAsset(name,path){
	assets[name] = new Image();
	assets[name].src = path;
	assets[name].onload = popLoad;
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
	sprites.karkat = new Character(300,501,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone = new Character(201,399,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone2 = new Character(501,399,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.compLabBG = new StaticSprite(0,0,null,null,null,null,assets.compLabBG);
}

function buildRooms(){
	rooms.baseRoom = new Room(sprites.compLabBG.width,sprites.compLabBG.height,assets.compLabWalkable);
	rooms.baseRoom.addSprite(sprites.karkat);
	rooms.baseRoom.addSprite(sprites.karclone);
	rooms.baseRoom.addSprite(sprites.compLabBG);
	
	rooms.cloneRoom = new Room(sprites.compLabBG.width,sprites.compLabBG.height,assets.compLabWalkable);
	rooms.cloneRoom.addSprite(sprites.karclone2);
	rooms.cloneRoom.addSprite(sprites.compLabBG);
}

function buildFonts(){
	dialogText = new FontEngine();
	//dialogText.setDimensions(300,300,200,50);
	//dialogText.setText("This is a test of the FontEngine system which is super baller \namirite? \n \n-Gankro!!!!");
	//dialogText.showSubText(0,0);
}

function buildActions(){
	sprites.karclone.addAction(new Action("talk","talking"),null);
	sprites.karclone.addAction(new Action("fight","fighting"),sprites.karkat);
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

function handleTextUpdates(){
	if(talking){
		dialogText.showSubText(null,dialogText.end+1);
		if(dialogText.isShowingAll()){
			dialogText.nextBatch();
			dialogText.showSubText(0,0);
		}
	}
	if(chooser.choosing){
		for(var i=0;i<chooser.dialogs.length;i++){
			var curDialog = chooser.dialogs[i];
			curDialog.showSubText(null,curDialog.end+1);
			if(i==chooser.choice){
				curDialog.color = "#aaaaaa";	
			}else{
				curDialog.color = "#000000";
			}
		}
	}
}

function moveSprite(sprite,oldRoom,newRoom){
	oldRoom.removeSprite(sprite);
	newRoom.addSprite(sprite);
}
function performAction(action){
	alert(action.info);
}
function beginChoosing(){
	char.idle();
	chooser.choosing = true;
	chooser.choice = 0;
	chooser.dialogs = new Array();
	for(var i=0;i<chooser.choices.length;i++){
		var curEngine = new FontEngine("> "+chooser.choices[i].name);
		curEngine.showSubText(0,1);
		curEngine.setDimensions(char.x,char.y+i*curEngine.lineHeight);
		chooser.dialogs.push(curEngine);
	}
}

function drawChoices(){
	stage.save();
	if(chooser.choosing){
		var x,y,width=0,height=0,i;
		x = chooser.dialogs[0].x;
		y = chooser.dialogs[0].y;
		for(i=0;i<chooser.dialogs.length;i++){
			width = Math.max(width,chooser.dialogs[i].lines[0].length*chooser.dialogs[i].charWidth);
		}
		height = chooser.dialogs[0].lineHeight*chooser.dialogs.length;
		stage.fillStyle = "#ffffff";
		stage.fillRect(x,y,width,height);
		for(i=0;i<chooser.dialogs.length;i++){
			chooser.dialogs[i].draw();
		}
	}
	stage.restore();
}
