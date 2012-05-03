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

function buildRooms() {

	function roomMenuDisplay(room) {
		this.maindiv = $('<div class="roomInfo">');
		$(sprintf('<div><a href="javascript:void(0);">%s</a></div>', room.name)).appendTo(this.maindiv);
		this.maindiv.click(function() { roomPreview(room); })
    }	
	
    menus.roomMenu = {'maindiv': $('<div id="roomTab">'),roomDisplays:new Array()};
    $('#mainmenu').append(menus.roomMenu.maindiv);
    if(menus.roomMenu) {
		for(name in editRooms.rooms) {
			var sdisplay = new roomMenuDisplay(editRooms.rooms[name]);
			menus.roomMenu.maindiv.append(sdisplay.maindiv);
			menus.roomMenu.roomDisplays.push(sdisplay);
		}

		$('#mainmenu').append(menus.roomMenu.maindiv);
    }
}

function roomPreview(room) {
    // controller functions go here, then call sprite
    // preview display function
	showRoomPreview(room);
}

function showRoomPreview(room){
	var mainNode = $('#mainDisplay');
    clearViewScreen();
    clearLeftMenu();
	
	toDraw.push(room);
	
    // main screen turn on
    var previewNode = $('<div id="previewNode"></div>');
    mainNode.append(previewNode);

    // edit info
    
    var newLeftDiv = $("<div></div>").appendTo($("#leftmenu"));
    var options = $("<div class='leftOptions'>").appendTo(newLeftDiv);
    addRoomOptions(options,room);
    
    deployStage(previewNode);
}

function addRoomOptions(theOptions,room){
	removeRoomOptions(theOptions);
	var options =  $("<div class='collapsable'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Room %s</div>", room.name)).appendTo(options);
	
	var items = new Array();
	
	items.push($('<input name="width" type="text" />').change(function() { room.width = parseInt(this.value); }).val(room.width));
  items.push($('<input name="height" type="text" />').change(function() { room.height = parseInt(this.value); }).val(room.height));
  
	
	addItems(options,items);
	$("<div id='roomSelection'>").appendTo(options);
}

function removeRoomOptions(theOptions){
	$(theOptions).children().remove('.roomOptions');
}
