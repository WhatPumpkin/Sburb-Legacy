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
	curAction.followUp = new Action(null,"playEffect","teleportEffect,"+params[1]+","+params[2],null,curAction.followUp)
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

cancelCommand = function(){
	//do nothing
}

function buildCommands(){
	commands = {};
	commands.talk = talkCommand;
	commands.changeRoom = changeRoomCommand;
	commands.changeChar = changeCharCommand;
	commands.playSong = playSongCommand;
	commands.playSound = playSoundCommand;
	commands.teleport = teleportCommand;
	commands.playEffect = playEffectCommand;
	commands.cancel = cancelCommand;
	
}
