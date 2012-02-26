talkCommand = function(info){
	dialoger.queue = info.split("@");
	dialoger.queue.reverse();
	dialoger.queue.pop();
	var nextDialog = dialoger.queue.pop();
	dialoger.dialog.setText(nextDialog.substring(nextDialog.indexOf(" ")+1,nextDialog.length));
	dialoger.dialog.showSubText(0,0);
	dialoger.talking = true;
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
