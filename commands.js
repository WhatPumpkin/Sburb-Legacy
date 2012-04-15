talkCommand = function(info){
	dialoger.startDialog(info);
}

changeRoomCommand = function(info){
	var params = info.split(",");
	changeRoom(rooms[params[0]],parseInt(params[1]),parseInt(params[2]));
}

teleportCommand = function(info){
	changeRoomCommand(info);
	playEffectCommand("teleport",char.x,char.y);
	playSound(new BGM(assets["teleportSound"],0));
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
	playSound(new BGM(assets[info],0));
}

playEffectCommand = function(info){
	
}

cancelCommand = function(){
	//do nothing
}

function buildCommands(){
	commands.talk = talkCommand;
	commands.changeRoom = changeRoomCommand;
	commands.changeChar = changeCharCommand;
	commands.playSong = playSongCommand;
	commands.playSound = playSoundCommand;
	commands.teleport = teleportCommand;
	commands.cancel = cancelCommand;
	
}
