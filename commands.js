talkCommand = function(info){
	dialoger.startDialog(info);
}

changeRoomCommand = function(info){
	var params = info.split(",");
	changeRoom(rooms[params[0]],parseInt(params[1]),parseInt(params[2]));
}

teleportCommand = function(info){
	changeRoomCommand(info);
	playEffect(effects["teleportEffect"],char.x,char.y);
	var params = info.split(",");
	curAction.followUp = new Action("playEffect","teleportEffect,"+params[1]+","+params[2],null,null,curAction.followUp);
	//playSound(new BGM(assets["teleportSound"],0));
}

changeCharCommand = function(info){
	char.becomeNPC();
	char.walk();
	focus = char = sprites[info];
	char.becomePlayer();
	setCurRoomOf(char);
}

playSongCommand = function(info){
	var params = info.split(",");
  params = params.map(function(s) { return s.trim(); });
  changeBGM(new BGM(assets[params[0]],parseFloat(params[1])));
}

playSoundCommand = function(info){
	playSound(new Sound(assets[info.trim()]));
}

playEffectCommand = function(info){
	var params = info.split(",");
	playEffect(effects[params[0]],parseInt(params[1]),parseInt(params[2]));
}

playAnimationCommand = function(info){
	var params = info.split(",");
	var sprite;
	if(params[0]=="char"){
		sprite = char;
	}else{
		sprite = sprites[params[0]];
	}
	sprite.startAnimation(params[1]);
}

openChestCommand = function(info){
	var params = info.split(",");
	var chest = sprites[params[0]];
	var item = sprites[params[1]];
	chest.startAnimation("open");
	chest.removeAction(curAction.name);
	var lastAction;
	var newAction = lastAction = new Action("waitFor","played,"+chest.name,null,null);
	lastAction = lastAction.followUp = new Action("waitFor","time,13");
	lastAction = lastAction.followUp = new Action("addSprite",item.name+","+curRoom.name,null,null,null,true);
	lastAction = lastAction.followUp = new Action("moveSprite",item.name+","+chest.x+","+(chest.y-60),null,null,null,true,true);
	lastAction = lastAction.followUp = new Action("deltaSprite",item.name+",0,-3",null,null,null,true,null,10);
	lastAction = lastAction.followUp = new Action("talk","@! "+params[2],null,null,null,true);
	lastAction = lastAction.followUp = new Action("removeSprite",item.name+","+curRoom.name);
	lastAction.followUp = curAction.followUp;
	performAction(newAction);
}

deltaSpriteCommand = function(info){
	var params = info.split(",");
	var sprite = null;
	if(params[0]=="char"){
		sprite = char;
	}else{
		sprite = sprites[params[0]];
	}
	var dx = parseInt(params[1]);
	var dy = parseInt(params[2]);
	sprite.x+=dx;
	sprite.y+=dy;
}

moveSpriteCommand = function(info){
	var params = info.split(",");
	var sprite = null;
	if(params[0]=="char"){
		sprite = char;
	}else{
		sprite = sprites[params[0]];
	}
	var newX = parseInt(params[1]);
	var newY = parseInt(params[2]);
	sprite.x = newX;
	sprite.y = newY;
}

playMovieCommand = function(info){
	playMovie(assets[info]);
	bgm.pause();
}

removeMovieCommand = function(info){
	document.getElementById(info).style.display = "none";
	document.getElementById("gameDiv").style.display = "block";
	bgm.play();
}

waitForCommand = function(info){
	waitFor = new Trigger(info);
}

addSpriteCommand = function(info){
	params = info.split(",");
	var sprite = sprites[params[0]];
	var room = rooms[params[1]];
	room.addSprite(sprite);
}

removeSpriteCommand = function(info){
	params = info.split(",");
	var sprite = sprites[params[0]];
	var room = rooms[params[1]];
	room.removeSprite(sprite);
}

toggleVolumeCommand = function(){
	if(globalVolume>=1){
		globalVolume=0;
	}else if(globalVolume>=0.6){
		globalVolume = 1;
	}else if(globalVolume>=0.3){
		globalVolume = 0.66;
	}else {
		globalVolume = 0.33;
	}
	if(bgm){
		bgm.fixVolume();
	}
}

cancelCommand = function(){
	//do nothing
}

function buildCommands(){
	commands = {};
	commands.talk = talkCommand;
	commands.changeRoom = changeRoomCommand;
	commands.playAnimation = playAnimationCommand;
	commands.changeChar = changeCharCommand;
	commands.playSong = playSongCommand;
	commands.playSound = playSoundCommand;
	commands.teleport = teleportCommand;
	commands.playEffect = playEffectCommand;
	commands.cancel = cancelCommand;
	commands.openChest = openChestCommand;
	commands.waitFor = waitForCommand;
	commands.deltaSprite = deltaSpriteCommand;
	commands.moveSprite = moveSpriteCommand;
	commands.addSprite = addSpriteCommand;
	commands.removeSprite = removeSpriteCommand;
	commands.playMovie = playMovieCommand;
	commands.removeMovie = removeMovieCommand;
	commands.toggleVolume = toggleVolumeCommand;
}
