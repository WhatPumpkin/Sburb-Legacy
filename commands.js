var Sburb = (function(Sburb){




//Create a Dialog
//syntax: dialog syntax
var talk = function(info){
	Sburb.dialoger.startDialog(info);
}

//Change the room and move the character to a new location in that room
//syntax: roomName, newCharacterX, newCharacterY
var changeRoom = function(info){
	var params = info.split(",");
	Sburb.changeRoom(Sburb.rooms[params[0]],parseInt(params[1]),parseInt(params[2]));
}

//Perform changeRoom, and also add teleport effects
//syntax: see changeRoom
var teleport = function(info){
	changeRoom(info);
	Sburb.playEffect(Sburb.effects["teleportEffect"],Sburb.char.x,Sburb.char.y);
	var params = info.split(",");
	Sburb.curAction.followUp = new Sburb.Action("playEffect","teleportEffect,"+params[1]+","+params[2],null,null,Sburb.curAction.followUp);
	//playSound(new BGM(assets["teleportSound"],0));
}

//Set a different Character as the player
//syntax: newPlayerName
var changeChar = function(info){
	Sburb.char.becomeNPC();
	Sburb.char.walk();
	Sburb.focus = Sburb.char = Sburb.sprites[info];
	Sburb.char.becomePlayer();
	Sburb.setCurRoomOf(Sburb.char);
}

//Set the given song as the new background music
//syntax: songName, loopingStartPoint (seconds)
var playSong = function(info){
	var params = info.split(",");
	params = params.map(function(s) { return s.trim(); });
	Sburb.changeBGM(new Sburb.BGM(Sburb.assets[params[0]],parseFloat(params[1])));
}

//Play the given sound
//syntax: soundName
var playSound = function(info){
	Sburb.playSound(new Sburb.Sound(Sburb.assets[info.trim()]));
}

//Play the given effect and the given location
//syntax: effectName, x, y
var playEffect = function(info){
	var params = info.split(",");
	Sburb.playEffect(Sburb.effects[params[0]],parseInt(params[1]),parseInt(params[2]));
}

//Have the specified sprite play the specified animation
//syntax: spriteName, animationName
var playAnimation = function(info){
	var params = info.split(",");
	var sprite;
	if(params[0]=="char"){
		sprite = Sburb.char;
	}else{
		sprite = Sburb.sprites[params[0]];
	}
	sprite.startAnimation(params[1]);
}

//Open the specified chest, revealing the specified item, and with the specified text
//Syntax: chestName, itemName, message
var openChest = function(info){
	var params = info.split(",");
	var chest = Sburb.sprites[params[0]];
	var item = Sburb.sprites[params[1]];
	chest.startAnimation("open");
	chest.removeAction(Sburb.curAction.name);
	var lastAction;
	var newAction = lastAction = new Sburb.Action("waitFor","played,"+chest.name,null,null);
	lastAction = lastAction.followUp = new Sburb.Action("waitFor","time,13");
	lastAction = lastAction.followUp = new Sburb.Action("addSprite",item.name+","+Sburb.curRoom.name,null,null,null,true);
	lastAction = lastAction.followUp = new Sburb.Action("moveSprite",item.name+","+chest.x+","+(chest.y-60),null,null,null,true,true);
	lastAction = lastAction.followUp = new Sburb.Action("deltaSprite",item.name+",0,-3",null,null,null,true,null,10);
	lastAction = lastAction.followUp = new Sburb.Action("talk","@! "+params[2],null,null,null,true);
	lastAction = lastAction.followUp = new Sburb.Action("removeSprite",item.name+","+Sburb.curRoom.name);
	lastAction.followUp = Sburb.curAction.followUp;
	Sburb.performAction(newAction);
}

//Move the specified sprite by the specified amount
//syntax: spriteName, dx, dy
var deltaSprite = function(info){
	var params = info.split(",");
	var sprite = null;
	if(params[0]=="char"){
		sprite = Sburb.char;
	}else{
		sprite = Sburb.sprites[params[0]];
	}
	var dx = parseInt(params[1]);
	var dy = parseInt(params[2]);
	sprite.x+=dx;
	sprite.y+=dy;
}

//Move the specified sprite to the specified location
//syntax: spriteName, x, y
var moveSprite = function(info){
	var params = info.split(",");
	var sprite = null;
	if(params[0]=="char"){
		sprite = Sburb.char;
	}else{
		sprite = Sburb.sprites[params[0]];
	}
	var newX = parseInt(params[1]);
	var newY = parseInt(params[2]);
	sprite.x = newX;
	sprite.y = newY;
}

//Play the specified flash movie
//syntax: movieName
var playMovie = function(info){
	Sburb.playMovie(Sburb.assets[info]);
	Sburb.bgm.pause();
}

//Remove the specified flash movie
//syntax: movieName
var removeMovie = function(info){
	document.getElementById(info).style.display = "none";
	document.getElementById("gameDiv").style.display = "block";
	Sburb.bgm.play();
}

//Wait for the specified trigger to be satisfied
//syntax: Trigger syntax
var waitFor = function(info){
	Sburb.waitFor = new Sburb.Trigger(info);
}

//Add the specified sprite to the specified room
//syntax: spriteName, roomName
var addSprite = function(info){
	params = info.split(",");
	var sprite = Sburb.sprites[params[0]];
	var room = Sburb.rooms[params[1]];
	room.addSprite(sprite);
}

//Remove the specified sprite from the specified room
//syntax: spriteName, roomName
var removeSprite = function(info){
	params = info.split(",");
	var sprite = Sburb.sprites[params[0]];
	var room = Sburb.rooms[params[1]];
	room.removeSprite(sprite);
}

//Toggle the volume
//syntax: none
var toggleVolume = function(){
	if(Sburb.globalVolume>=1){
		Sburb.globalVolume=0;
	}else if(Sburb.globalVolume>=0.6){
		Sburb.globalVolume = 1;
	}else if(Sburb.globalVolume>=0.3){
		Sburb.globalVolume = 0.66;
	}else {
		Sburb.globalVolume = 0.33;
	}
	if(Sburb.bgm){
		Sburb.bgm.fixVolume();
	}
}

//change the engine mode
//syntax: modeName
var changeMode = function(info){
	Sburb.engineMode = info.trim();
}

//load in an additional SBURBML file
//syntax: path, keepOld
var loadStateFile = function(info){
	var args = info.split(",");
	var path = args[0];
	var keepOld = args[1]=="true";
	Sburb.loadSerialFromXML(path,keepOld);
}

//fade out to black
//syntax: node
var fadeOut = function(info){
	Sburb.fading = true;
}

//go to a room that may not have been loaded yet
//syntax: filepath, roomName, newCharacterX, newCharacterY
var changeToRemoteRoom = function(info){
	var args = info.split(",");
	var lastAction;
	var newAction = lastAction = new Sburb.Action("fadeOut");
	lastAction = lastAction.followUp = new Sburb.Action("loadStateFile",args[0]+","+true);
	lastAction = lastAction.followUp = new Sburb.Action("changeRoom",args[1]+","+args[2]+","+args[3]);
	lastAction.followUp = Sburb.curAction.followUp;
	Sburb.performAction(newAction);
}

//Teleport to a room which may not have been loaded yet
//syntax: filepath, roomName, newCharacterX, newCharacterY
var teleportToRemoteRoom = function(info){
	changeToRemoteRoom(info);
	
	Sburb.playEffect(Sburb.effects["teleportEffect"],Sburb.char.x,Sburb.char.y);
	
	var params = info.split(",");
	Sburb.curAction.followUp.followUp.followUp = new Sburb.Action("playEffect","teleportEffect,"+params[2]+","+params[3],null,null,Sburb.curAction.followUp.followUp.followUp);
}


//Change the state of the specified button
//syntax: buttonName, state
var setButtonState = function(info){
	var params = info.split(",");
	Sburb.buttons[params[0].trim()].setState(params[1].trim());
}

//Skip the current conversation
//syntax: none
var skipDialog = function(info){
	Sburb.dialoger.skipAll();
}


//blank utlity function
//syntax: none
var cancel = function(){
	//do nothing
}


var commands = {};
commands.talk = talk;

commands.changeRoom = changeRoom;
commands.teleport = teleport;

commands.changeToRemoteRoom = changeToRemoteRoom;
commands.teleportToRemoteRoom = teleportToRemoteRoom;

commands.playAnimation = playAnimation;
commands.playEffect = playEffect;
commands.playSong = playSong;
commands.playSound = playSound;
commands.playMovie = playMovie;
commands.changeChar = changeChar;


commands.openChest = openChest;
commands.waitFor = waitFor;

commands.addSprite = addSprite;
commands.removeSprite = removeSprite;
commands.deltaSprite = deltaSprite;
commands.moveSprite = moveSprite;

commands.changeMode = changeMode;
commands.loadStateFile = loadStateFile;

commands.fadeOut = fadeOut;
commands.removeMovie = removeMovie;
commands.toggleVolume = toggleVolume;
commands.setButtonState = setButtonState;

commands.skipDialog = skipDialog
commands.cancel = cancel;

Sburb.commands = commands;
return Sburb;

})(Sburb || {});
