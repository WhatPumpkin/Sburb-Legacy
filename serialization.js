function serialize(){
	var out = document.getElementById("serialText");
	var output = "<SBURB curRoom='"+curRoom.name+"' char='"+char.name+"'>";
	for(var room in rooms){
		output = rooms[room].serialize(output);
	}
	output = output.concat("</SBURB>");
	out.value = output;
	return output;
}

function loadSerial(){
	clearTimeout(updateLoop);
	var inText = document.getElementById("serialText");
	delete rooms;
	delete sprites;
	rooms = {};
	sprites = {};
	pressed = new Array();
	curRoom = null;
	
	var parser=new DOMParser();
  	var input=parser.parseFromString(inText.value,"text/xml");
  	
  	input = input.documentElement;
  	var newSprites = input.getElementsByTagName("Sprite");
  	for(var i=0;i<newSprites.length;i++){
  		var curSprite = newSprites[i];
  		var attributes = curSprite.attributes;
  		var newSprite = new Sprite(attributes.getNamedItem("name").value,
  									parseInt(attributes.getNamedItem("x").value),
  									parseInt(attributes.getNamedItem("y").value),
  									parseInt(attributes.getNamedItem("width").value),
  									parseInt(attributes.getNamedItem("height").value),
  									parseInt(attributes.getNamedItem("sx").value),
  									parseInt(attributes.getNamedItem("sy").value),
  									parseInt(attributes.getNamedItem("dx").value),
  									parseInt(attributes.getNamedItem("dy").value),
  									parseInt(attributes.getNamedItem("depthing").value),
  									attributes.getNamedItem("collidable").value=="true");
  		sprites[newSprite.name] = newSprite;
  		var state = attributes.getNamedItem("state").value;
  		var anims = curSprite.getElementsByTagName("Animation");
  		for(var j=0;j<anims.length;j++){
  			var curAnim = anims[j];
  			var attributes = curAnim.attributes;
  			var newAnim = new Animation(attributes.getNamedItem("name").value,
  										assets[attributes.getNamedItem("sheet").value],
  										parseInt(attributes.getNamedItem("colSize").value),
  										parseInt(attributes.getNamedItem("rowSize").value),
  										parseInt(attributes.getNamedItem("startPos").value),
  										parseInt(attributes.getNamedItem("length").value),
  										parseInt(attributes.getNamedItem("frameInterval").value));
  			newSprite.addAnimation(newAnim);
  		}
  		newSprite.startAnimation(state);
  	}
  	var newChars = input.getElementsByTagName("Character");
  	for(var i=0;i<newChars.length;i++){
  		var curChar = newChars[i];
  		var attributes = curChar.attributes;
  		var newChar = new Character(attributes.getNamedItem("name").value,
  									parseInt(attributes.getNamedItem("x").value),
  									parseInt(attributes.getNamedItem("y").value),
  									parseInt(attributes.getNamedItem("width").value),
  									parseInt(attributes.getNamedItem("height").value),
  									parseInt(attributes.getNamedItem("sx").value),
  									parseInt(attributes.getNamedItem("sy").value),
  									parseInt(attributes.getNamedItem("sWidth").value),
  									parseInt(attributes.getNamedItem("sHeight").value),
  									assets[attributes.getNamedItem("sheet").value]);
  		sprites[newChar.name] = newChar;
  		newChar.startAnimation(attributes.getNamedItem("state").value);
  		newChar.facing = attributes.getNamedItem("facing").value;
  	}
  	var newRooms = input.getElementsByTagName("Room");
  	for(var i=0;i<newRooms.length;i++){
  		var currRoom = newRooms[i];
  		var attributes = currRoom.attributes;
  		var newRoom = new Room(attributes.getNamedItem("name").value,
  								parseInt(attributes.getNamedItem("width").value),
  								parseInt(attributes.getNamedItem("height").value),
  								assets[attributes.getNamedItem("walkable").value]);
  		rooms[newRoom.name] = newRoom;
  		var roomSprites = currRoom.getElementsByTagName("Sprite");
  		for(var j=0;j<roomSprites.length;j++){
  			var curSprite = roomSprites[j];
  			var actualSprite = sprites[curSprite.attributes.getNamedItem("name").value];
  			newRoom.addSprite(actualSprite);
  			var newActions = curSprite.getElementsByTagName("Action");
  			for(var k=0;k<newActions.length;k++){
  				var curAction = newActions[k];
  				var attributes = curAction.attributes;
  				var targSprite;
  				if(attributes.getNamedItem("sprite").value=="null"){
  					targSprite = null;
  				}else{
  					targSprite = sprites[attributes.getNamedItem("sprite").value];
  				}
  				var newAction = new Action(attributes.getNamedItem("name").value,
  											attributes.getNamedItem("command").value,
  											attributes.getNamedItem("info").value,
  											targSprite);
  				actualSprite.addAction(newAction);
  			}
  		}
  		var roomSprites = currRoom.getElementsByTagName("Character");
  		for(var j=0;j<roomSprites.length;j++){
  			var curSprite = roomSprites[j];
  			var actualSprite = sprites[curSprite.attributes.getNamedItem("name").value];
  			newRoom.addSprite(actualSprite);
  			var newActions = curSprite.getElementsByTagName("Action");
  			for(var k=0;k<newActions.length;k++){
  				var curAction = newActions[k];
  				var attributes = curAction.attributes;
  				var targSprite;
  				if(attributes.getNamedItem("sprite").value=="null"){
  					targSprite = null;
  				}else{
  					targSprite = sprites[attributes.getNamedItem("sprite").value];
  				}
  				var newAction = new Action(attributes.getNamedItem("name").value,
  											attributes.getNamedItem("command").value,
  											attributes.getNamedItem("info").value,
  											targSprite);
  				actualSprite.addAction(newAction);
  			}
  		}
  	}
  	var rootInfo = input.attributes;
  	focus = char = sprites[rootInfo.getNamedItem("char").value];
  	char.becomePlayer();
  	curRoom = rooms[rootInfo.getNamedItem("curRoom").value];
  	update(0);
}
