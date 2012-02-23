//requires Character.js

var Stage; //the canvas, we're gonna load it up with a bunch of flash-like game data like fps and scale factors
var stage; //its context
var updateLoop;
var fps;
var pressed;
var keyRight = 39, keyUp = 38, keyLeft = 37, keyDown = 40;
var cgSheet = new Image();
var karkat; 
var char;

function initialize(){
	//alert("aa");
	Stage = document.getElementById("Stage");	
	Stage.scaleX = Stage.scaleY = 1;
	Stage.x = Stage.y = 0;
	Stage.fps = 30;
	
	stage = Stage.getContext("2d");
	
	pressed = new Array();
	
	cgSheet.src = "CGsheet.png";
	char = karkat = new Character(200,200,66,96,-33,-81,66,96,cgSheet);
	
	update(0);
}

function update(gameTime){
	//update stuff
	if(pressed[keyDown]){
		char.startAnimation("walkFront");
		char.y+=char.speed;
	}else if(pressed[keyUp]){
		char.startAnimation("walkBack");
		char.y-=char.speed;
	}else if(pressed[keyLeft]){
		char.startAnimation("walkLeft");
		char.x-=char.speed;
	}else if(pressed[keyRight]){
		char.startAnimation("walkRight");
		char.x+=char.speed;
	}else{
		char.startAnimation("idle"+char.state.substring(4,char.state.length));
	}
	karkat.update(gameTime);
	//must be last
	updateLoop=setTimeout("update("+(gameTime+1)+")",1000/Stage.fps);
	draw(gameTime);
}

function draw(gameTime){
	stage.fillStyle = "rgb(250,250,250)";
	stage.fillRect(0,0,Stage.width,Stage.height);
	karkat.draw();
}

onkeydown = function(e){
	pressed[e.keyCode] = true;
}

onkeyup = function(e){
	pressed[e.keyCode] = false;
}
