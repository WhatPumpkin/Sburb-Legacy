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
	serialize();
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
	if(e.keyCode==Keys.escape && !pressed[Keys.escape]){
		//loadSerial();
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
}

function buildRooms(){
	rooms.baseRoom = new Room("baseRoom",sprites.compLabBG.width,sprites.compLabBG.height,assets.compLabWalkable);
	rooms.baseRoom.addSprite(sprites.karkat);
	rooms.baseRoom.addSprite(sprites.karclone);
	rooms.baseRoom.addSprite(sprites.compLabBG);
	
	rooms.cloneRoom = new Room("cloneRoom",sprites.compLabBG.width,sprites.compLabBG.height,assets.compLabWalkable);
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
	sprites.karclone.addAction(new Action("talk",null,"talk","blahblahblah"));
	sprites.karclone.addAction(new Action("fight",sprites.karkat,"fight"));
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

function serialize(){
	var out = document.getElementById("serialText");
	var output = "<SBURB curRoom='"+curRoom.name+"' char='"+char.name+"'>";
	for(var room in rooms){
		output = rooms[room].serialize(output);
	}
	output = output.concat("</SBURB>");
	out.value = output;
	return output;
}

function loadSerial(){
	clearTimeout(updateLoop);
	var inText = document.getElementById("serialText");
	delete rooms;
	delete sprites;
	rooms = {};
	sprites = {};
	pressed = new Array();
	curRoom = null;
	
	var parser=new DOMParser();
  	var input=parser.parseFromString(inText.value,"text/xml");
  	
  	input = input.documentElement;
  	var newSprites = input.getElementsByTagName("Sprite");
  	for(var i=0;i<newSprites.length;i++){
  		var curSprite = newSprites[i];
  		var attributes = curSprite.attributes;
  		var newSprite = new Sprite(attributes.getNamedItem("name").value,
  									parseInt(attributes.getNamedItem("x").value),
  									parseInt(attributes.getNamedItem("y").value),
  									parseInt(attributes.getNamedItem("width").value),
  									parseInt(attributes.getNamedItem("height").value),
  									parseInt(attributes.getNamedItem("sx").value),
  									parseInt(attributes.getNamedItem("sy").value),
  									parseInt(attributes.getNamedItem("dx").value),
  									parseInt(attributes.getNamedItem("dy").value),
  									parseInt(attributes.getNamedItem("depthing").value),
  									attributes.getNamedItem("collidable").value=="true");
  		sprites[newSprite.name] = newSprite;
  		var state = attributes.getNamedItem("state").value;
  		var anims = curSprite.getElementsByTagName("Animation");
  		for(var j=0;j<anims.length;j++){
  			var curAnim = anims[j];
  			var attributes = curAnim.attributes;
  			var newAnim = new Animation(attributes.getNamedItem("name").value,
  										assets[attributes.getNamedItem("sheet").value],
  										parseInt(attributes.getNamedItem("colSize").value),
  										parseInt(attributes.getNamedItem("rowSize").value),
  										parseInt(attributes.getNamedItem("startPos").value),
  										parseInt(attributes.getNamedItem("length").value),
  										parseInt(attributes.getNamedItem("frameInterval").value));
  			newSprite.addAnimation(newAnim);
  		}
  		newSprite.startAnimation(state);
  	}
  	var newChars = input.getElementsByTagName("Character");
  	for(var i=0;i<newChars.length;i++){
  		var curChar = newChars[i];
  		var attributes = curChar.attributes;
  		var newChar = new Character(attributes.getNamedItem("name").value,
  									parseInt(attributes.getNamedItem("x").value),
  									parseInt(attributes.getNamedItem("y").value),
  									parseInt(attributes.getNamedItem("width").value),
  									parseInt(attributes.getNamedItem("height").value),
  									parseInt(attributes.getNamedItem("sx").value),
  									parseInt(attributes.getNamedItem("sy").value),
  									parseInt(attributes.getNamedItem("sWidth").value),
  									parseInt(attributes.getNamedItem("sHeight").value),
  									assets[attributes.getNamedItem("sheet").value]);
  		sprites[newChar.name] = newChar;
  		newChar.startAnimation(attributes.getNamedItem("state").value);
  		newChar.facing = attributes.getNamedItem("facing").value;
  	}
  	var newRooms = input.getElementsByTagName("Room");
  	for(var i=0;i<newRooms.length;i++){
  		var currRoom = newRooms[i];
  		var attributes = currRoom.attributes;
  		var newRoom = new Room(attributes.getNamedItem("name").value,
  								parseInt(attributes.getNamedItem("width").value),
  								parseInt(attributes.getNamedItem("height").value));
  		rooms[newRoom.name] = newRoom;
  		var roomSprites = currRoom.getElementsByTagName("Sprite");
  		for(var j=0;j<roomSprites.length;j++){
  			var curSprite = roomSprites[j];
  			var actualSprite = sprites[curSprite.attributes.getNamedItem("name").value];
  			newRoom.addSprite(actualSprite);
  			var newActions = curSprite.getElementsByTagName("Action");
  			for(var k=0;k<newActions.length;k++){
  				var curAction = newActions[k];
  				var attributes = curAction.attributes;
  				var targSprite;
  				if(attributes.getNamedItem("sprite").value=="null"){
  					targSprite = null;
  				}else{
  					targSprite = sprites[attributes.getNamedItem("sprite").value];
  				}
  				var newAction = new Action(attributes.getNamedItem("name").value,
  											targSprite,
  											attributes.getNamedItem("command").value,
  											attributes.getNamedItem("info").value);
  				actualSprite.addAction(newAction);
  			}
  		}
  		var roomSprites = currRoom.getElementsByTagName("Character");
  		for(var j=0;j<roomSprites.length;j++){
  			var curSprite = roomSprites[j];
  			var actualSprite = sprites[curSprite.attributes.getNamedItem("name").value];
  			newRoom.addSprite(actualSprite);
  			var newActions = curSprite.getElementsByTagName("Action");
  			for(var k=0;k<newActions.length;k++){
  				var curAction = newActions[k];
  				var attributes = curAction.attributes;
  				var targSprite;
  				if(attributes.getNamedItem("sprite").value=="null"){
  					targSprite = null;
  				}else{
  					targSprite = sprites[attributes.getNamedItem("sprite").value];
  				}
  				var newAction = new Action(attributes.getNamedItem("name").value,
  											targSprite,
  											attributes.getNamedItem("command").value,
  											attributes.getNamedItem("info").value);
  				actualSprite.addAction(newAction);
  			}
  		}
  	}
  	var rootInfo = input.attributes;
  	focus = char = sprites[rootInfo.getNamedItem("char").value];
  	char.becomePlayer();
  	curRoom = rooms[rootInfo.getNamedItem("curRoom").value];
  	update(0);
}
