//requires Character.js

var Stage; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
var stage; //its context
var updateLoop;
var fps;
var pressed;
var keyRight = 39, keyUp = 38, keyLeft = 37, keyDown = 40;
var cgSheet;
var imageLoadStack;
var assets;
var sprites;
var rooms;
var char;
var curRoom;
var totalAssets;
var focus;
var specCol;


function initialize(){
	Stage = document.getElementById("Stage");	
	Stage.scaleX = Stage.scaleY = 1;
	Stage.x = Stage.y = 0;
	Stage.fps = 30;
	
	stage = Stage.getContext("2d");
	
	assets = {};
	rooms = {};
	sprites = {};
	pressed = new Array();
	
	loadAssets();
}

function finishInit(){
	buildSprites();
	buildRooms();
	
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
	stage.restore();
}

function drawLoader(){
	stage.fillStyle = "rgb(240,240,240)";
	stage.fillRect(0,0,Stage.width,Stage.height);
	stage.fillStyle = "rgb(200,0,0)"
	stage.font="30px Arial";
	stage.fillText("Loading Assets: "+(totalAssets-imageLoadStack.length)+"/"+totalAssets,100,200);
}

function handleInputs(){
	if(pressed[keyDown]){
		char.moveDown(curRoom.sprites);
	}else if(pressed[keyUp]){
		char.moveUp(curRoom.sprites);
	}else if(pressed[keyLeft]){
		char.moveLeft(curRoom.sprites);
	}else if(pressed[keyRight]){
		char.moveRight(curRoom.sprites);
	}else{
		char.idle();
	}
}

function loadAssets(){
	totalAssets = 0;
	imageLoadStack = new Array();
	loadAsset("cgSheet","resources/CGsheetBig.png");
	loadAsset("compLabBG","resources/comlab-background.gif");
	drawLoader();
}

function loadAsset(name,path){
	assets[name] = new Image();
	assets[name].src = path;
	assets[name].onload = popLoad;
	totalAssets++;
	imageLoadStack.push(assets[name]);
}

function popLoad(){
	imageLoadStack.pop();
	if(imageLoadStack.length==0){
		finishInit();
	}
	drawLoader();
}

function buildSprites(){
	sprites.karkat = new Character(300,501,39,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone = new Character(201,399,39,21,-36,-87,66,96,assets.cgSheet);
	sprites.compLabBG = new StaticSprite(0,0,null,null,null,null,assets.compLabBG);
}

function buildRooms(){
	rooms.baseRoom = new Room(sprites.compLabBG.width,sprites.compLabBG.height);
	rooms.baseRoom.addSprite(sprites.karkat);
	rooms.baseRoom.addSprite(sprites.karclone);
	rooms.baseRoom.addSprite(sprites.compLabBG);
}

function focusCamera(){
	Stage.x = Math.max(0,Math.min(focus.x-Stage.width/2/Stage.scaleX,curRoom.width-Stage.width/Stage.scaleX));
	Stage.y = Math.max(0,Math.min(focus.y-Stage.height/2/Stage.scaleY,curRoom.height-Stage.height/Stage.scaleY));
}

onkeydown = function(e){
	pressed[e.keyCode] = true;
}

onkeyup = function(e){
	pressed[e.keyCode] = false;
}
