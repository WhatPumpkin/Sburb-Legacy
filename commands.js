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
	curAction = new Action(curAction.name,curAction.command,curAction.info,curAction.sprite,new Action(null,"playEffect","teleportEffect,"+params[1]+","+params[2],null,curAction.followUp));
	//playSound(new BGM(assets["teleportSound"],0));
}

playEffectCommand = function(info){
	var params = info.split(",");
	playEffect(effects[params[0]],parseInt(params[1]),parseInt(params[2]));
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
	sprites[params[0]].startAnimation(params[1]);
}

openChestCommand = function(info){
	var params = info.split(",");
	sprites[params[0]].startAnimation("open");
	sprites[params[0]].removeAction(curAction.name);
}

deltaSpriteCommand = function(info){
	var params = info.split(",");
	var sprite = sprites[params[0]];
	var dx = parseInt(params[1]);
	var dy = parseInt(params[2]);
	sprite.x+=dx;
	sprite.y+=dy;
}

deltaForSpriteCommand = function(info){
	var noWait = curAction.noWait;
	var followUp = curAction.followUp;
	var iterations = parseInt(info.substring(info.lastIndexOf(",")+1,info.length));
	var oldAction = null;
	var firstAction = null;
	for(var i=0;i<iterations;i++){
		var newAction = new Action(null,"deltaSprite",info,oldAction,noWait);
		if(!firstAction){
			firstAction = newAction;
		}
		oldAction = newAction;
	}
	oldAction.followUp = followUp;
	performAction(firstAction);
}

moveSpriteCommand = function(info){
	var params = info.split(",");
	var sprite = sprites[params[0]];
	var newX = parseInt(params[1]);
	var newY = parseInt(params[2]);
	sprite.x = newX;
	sprite.y = newY;
}

waitForCommand = function(info){
	waitFor = new Trigger(info);
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
	commands.deltaForSprite = deltaForSpriteCommand;
	commands.moveSprite = moveSpriteCommand;
}
