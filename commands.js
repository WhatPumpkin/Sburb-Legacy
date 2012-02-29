talkCommand = function(info){
	dialoger.startDialog(info);
}

changeRoomCommand = function(info){
	var params = info.split(",");
	changeRoom(rooms[params[0]],parseInt(params[1]),parseInt(params[2]));
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

cancelCommand = function(){
	//do nothing
}
