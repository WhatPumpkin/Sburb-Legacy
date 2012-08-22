var Sburb = (function(Sburb){

function parseParams(info){
	var params = info.split(",");
	params.map(cleanParam);
	return params;
}

function cleanParam(param){
	return param.trim();
}

//params = params.map(function(s) { return s.trim(); });

var commands = {};


//Create a Dialog
//syntax: dialog syntax
commands.talk = function(info){
	Sburb.dialoger.startDialog(info);
}

//Pick a random line of dialog
//syntax: dialog syntax
commands.randomTalk = function(info){
	console.log(info);
	Sburb.dialoger.startDialog(info);
	var randomNum = Math.floor(Math.random()*(Sburb.dialoger.queue.length+1));
	if(randomNum){
		Sburb.dialoger.queue = [Sburb.dialoger.queue[randomNum-1]];
		Sburb.dialoger.nextDialog();
	}else{
		Sburb.dialoger.queue = [];
	}
}

//Change the room and move the character to a new location in that room
//syntax: roomName, newCharacterX, newCharacterY
commands.changeRoom = function(info){
	var params = parseParams(info);
	Sburb.changeRoom(Sburb.rooms[params[0]],parseInt(params[1]),parseInt(params[2]));
}

//Perform changeRoom, and also add teleport effects
//syntax: see changeRoom
commands.teleport = function(info){
	commands.changeRoom(info);
	Sburb.playEffect(Sburb.effects["teleportEffect"],Sburb.char.x,Sburb.char.y);
	var params = parseParams(info);
	Sburb.curAction.followUp = new Sburb.Action("playEffect","teleportEffect,"+params[1]+","+params[2],null,null,Sburb.curAction.followUp);
	//playSound(new BGM(assets["teleportSound"],0));
}

//Set a different Character as the player
//syntax: newPlayerName
commands.changeChar = function(info){
	Sburb.char.becomeNPC();
	Sburb.char.walk();
	Sburb.focus = Sburb.char = Sburb.sprites[info];
	Sburb.char.becomePlayer();
	Sburb.setCurRoomOf(Sburb.char);
}

//Set the given song as the new background music
//syntax: songName, loopingStartPoint (seconds)
commands.playSong = function(info){
	var params = parseParams(info);
	
	Sburb.changeBGM(new Sburb.BGM(Sburb.assets[params[0]],parseFloat(params[1])));
}

//Play the given sound
//syntax: soundName
commands.playSound = function(info){
	Sburb.playSound(new Sburb.Sound(Sburb.assets[info.trim()]));
}

//Play the given effect and the given location
//syntax: effectName, x, y
commands.playEffect = function(info){
	var params = parseParams(info);
	Sburb.playEffect(Sburb.effects[params[0]],parseInt(params[1]),parseInt(params[2]));
}

//Have the specified sprite play the specified animation
//syntax: spriteName, animationName
commands.playAnimation = function(info){
	var params = parseParams(info);
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
commands.openChest = function(info){
	var params = parseParams(info);
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
commands.deltaSprite = function(info){
	var params = parseParams(info);
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
commands.moveSprite = function(info){
	var params = parseParams(info);
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
commands.playMovie = function(info){
	Sburb.playMovie(Sburb.assets[info]);
	Sburb.bgm.pause();
}

//Remove the specified flash movie
//syntax: movieName
commands.removeMovie = function(info){
	document.getElementById(info).style.display = "none";
	document.getElementById("gameDiv").style.display = "block";
	Sburb.bgm.play();
}

//Wait for the specified trigger to be satisfied
//syntax: Trigger syntax
commands.waitFor = function(info){
	Sburb.waitFor = new Sburb.Trigger(info);
}

//Add the specified sprite to the specified room
//syntax: spriteName, roomName
commands.addSprite = function(info){
	var params = parseParams(info);
	var sprite = Sburb.sprites[params[0]];
	var room = Sburb.rooms[params[1]];
	
	room.addSprite(sprite);
}

//Remove the specified sprite from the specified room
//syntax: spriteName, roomName
commands.removeSprite = function(info){
	var params = parseParams(info);
	var sprite = Sburb.sprites[params[0]];
	var room = Sburb.rooms[params[1]];
	room.removeSprite(sprite);
}

//Add the specified path as a walkable to the specified room
//syntax: pathName, roomName
commands.addWalkable = function(info){
	var params = parseParams(info);
	var path = Sburb.assets[params[0]];
	var room = Sburb.rooms[params[1]];
	room.addWalkable(path);
}

//Add the specified path as an unwalkable to the specified room
//syntax: pathName, roomName
commands.addUnwalkable = function(info){
	var params = parseParams(info);
	var path = Sburb.assets[params[0]];
	var room = Sburb.rooms[params[1]];
	room.addUnwalkable(path);
}

//Add the specified path as a motionpath to the specified room
//syntax: pathName, xtox, xtoy, ytox, ytoy, dx, dy roomName
commands.addMotionPath = function(info){
	var params = parseParams(info);
	var path = Sburb.assets[params[0]];
	var room = Sburb.rooms[params[7]];
	room.addMotionPath(path,
		parseFloat(params[1]),parseFloat(params[2]),
		parseFloat(params[3]),parseFloat(params[4]),
		parseFloat(params[5]),parseFloat(params[6]));
}

//Remove the specified walkable from the specified room
//syntax: pathName, roomName
commands.removeWalkable = function(info){
	var params = parseParams(info);
	var path = Sburb.assets[params[0]];
	var room = Sburb.rooms[params[1]];
	room.removeWalkable(path);
}

//Remove the specified unwalkable from the specified room
//syntax: pathName, roomName
commands.removeUnwalkable = function(info){
	var params = parseParams(info);
	var path = Sburb.assets[params[0]];
	var room = Sburb.rooms[params[1]];
	room.removeUnwalkable(path);
}


//Toggle the volume
//syntax: none
commands.toggleVolume = function(){
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
commands.changeMode = function(info){
	Sburb.engineMode = info.trim();
}

//load in an additional SBURBML file
//syntax: path, keepOld
commands.loadStateFile = function(info){
	var params = parseParams(info);
	var path = params[0];
	var keepOld = params[1]=="true";
	Sburb.loadSerialFromXML(path,keepOld);
}

//fade out to black
//syntax: node
commands.fadeOut = function(info){
	Sburb.fading = true;
}

//go to a room that may not have been loaded yet
//syntax: filepath, roomName, newCharacterX, newCharacterY
commands.changeRoomRemote = function(info){
	var params = parseParams(info);
	var lastAction;
	var newAction = lastAction = new Sburb.Action("fadeOut");
	lastAction = lastAction.followUp = new Sburb.Action("loadStateFile",params[0]+","+true);
	lastAction = lastAction.followUp = new Sburb.Action("changeRoom",params[1]+","+params[2]+","+params[3]);
	lastAction.followUp = Sburb.curAction.followUp;
	Sburb.performAction(newAction);
}

//Teleport to a room which may not have been loaded yet
//syntax: filepath, roomName, newCharacterX, newCharacterY
commands.teleportRemote = function(info){
	commands.changeRoomRemote(info);
	
	Sburb.playEffect(Sburb.effects["teleportEffect"],Sburb.char.x,Sburb.char.y);
	
	var params = parseParams(info);
	Sburb.curAction.followUp.followUp.followUp = new Sburb.Action("playEffect","teleportEffect,"+params[2]+","+params[3],null,null,Sburb.curAction.followUp.followUp.followUp);
}


//Change the state of the specified button
//syntax: buttonName, state
commands.setButtonState = function(info){
	var params = parseParams(info);
	Sburb.buttons[params[0]].setState(params[1]);
}

//Skip the current conversation
//syntax: none
commands.skipDialog = function(info){
	Sburb.dialoger.skipAll();
}


//blank utlity function
//syntax: none
commands.cancel = function(){
	//do nothing
}






Sburb.commands = commands;
return Sburb;

})(Sburb || {});
