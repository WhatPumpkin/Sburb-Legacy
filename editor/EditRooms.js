function EditRooms() {
    this.rooms = {}
    
    this.add = function (roomObj) {
		var name = roomObj.name;
		this.rooms[name] = roomObj;
    }
    
    this.remove = function (name) {
		this.rooms[name] = undefined;
    }
}

function roomPreview(room) {
    // controller functions go here, then call sprite
    // preview display function
	showRoomPreview(room);
}
