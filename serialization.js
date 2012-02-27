function serialize(){
	var out = document.getElementById("serialText");
	var output = "<SBURB curRoom='"+curRoom.name+"' char='"+char.name+"'>";
	output = serializeAssets(output);
	for(var room in rooms){
		output = rooms[room].serialize(output);
	}
	output = output.concat("</SBURB>");
	out.value = output;
	return output;
}

function serializeAssets(output){
	for(var asset in assets){
		var curAsset = assets[asset];
		output = output.concat("<Asset name='"+curAsset.name+"' type='"+curAsset.type+"'>");
		if(curAsset.type=="graphic"){
			
			output = output.concat(curAsset.src.substring(curAsset.src.indexOf("resources/"),curAsset.src.length));
		}else if(curAsset.type=="audio"){
			var sources = curAsset.innerHTML.split('"');
			var s1 = sources[1];
			var s2 = sources[3];
			output = output.concat(s1+";"+s2);

		}else if(curAsset.type=="path"){
			for(var i=0;i<curAsset.length;i++){
				output = output.concat(curAsset[i].x+","+curAsset[i].y);
				if(i!=curAsset.length-1){
					output = output.concat(";");
				}
			}
		}
		output = output.concat("</Asset>");
	}
	return output;
}

function purgeState(){
	if(updateLoop){
		clearTimeout(updateLoop);
	}
	if(rooms){
		delete rooms;
	}
	if(sprites){
		delete sprites;
	}
	rooms = {};
	if(bgm){
		bgm.stop();
		bgm = null;
	}
	sprites = {};
	pressed = new Array();
	curRoom = null;
	assetLoadStack = new Array();
	assetLoadStack.totalAssets = 0;
}
function loadSerialWithAssets(serialText){
	purgeState();
	loadSerialAssets(serialText);
	loadSerialState(serialText);
}
function loadSerialWithoutAssets(serialText){
	purgeState();
	loadSerialState(serialText);
}

function loadSerialAssets(serialText){
	var inText = serialText; //document.getElementById("serialText");
	var parser=new DOMParser();
  	var input=parser.parseFromString(inText,"text/xml");
  	
  	input = input.documentElement;
  	var newAssets = input.getElementsByTagName("Asset");
  	for(var i=0;i<newAssets.length;i++){
  		var curAsset = newAssets[i];
  		var attributes = curAsset.attributes;
  		var name = attributes.getNamedItem("name").value;
  		var type = attributes.getNamedItem("type").value;
  		var value = curAsset.firstChild.nodeValue;
  		if(type=="graphic"){
  			loadGraphicAsset(name,value);
  		}else if(type=="audio"){
  			var sources = value.split(";");
  			
  			loadAudioAsset(name,sources[0],sources[1]);
  		}else if(type=="path"){
  			var pts = value.split(";");
  			var path = new Array();
  			for(var j=0;j<pts.length;j++){
  				var point = pts[j].split(",");
  				path.push({x:parseInt(point[0]),y:parseInt(point[1])});
  			}
  			loadPathAsset(name,path);
  		}
  	}
}

function loadSerialState(serialText){
	if(assetLoadStack.length!=0){
		updateLoop=setTimeout('loadSerialState("'+serialText+'")',500);
		return;
	}
	var inText = serialText; //document.getElementById("serialText");
	var parser=new DOMParser();
  	var input=parser.parseFromString(inText,"text/xml");
  	
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
  		var bgm = attributes.getNamedItem("bgm").value;
  		if(bgm!="null"){
  			var start = parseFloat(attributes.getNamedItem("bgStart").value);
  			var priority = parseFloat(attributes.getNamedItem("bgPriority").value);
  			newRoom.setBGM(new BGM(assets[bgm],start,priority));
  		}
  		serialLoadRoomSprites(newRoom,currRoom.getElementsByTagName("Sprite"));
  		serialLoadRoomSprites(newRoom,currRoom.getElementsByTagName("Character"));	
  	}
  	var rootInfo = input.attributes;
  	focus = char = sprites[rootInfo.getNamedItem("char").value];
  	char.becomePlayer();
  	curRoom = rooms[rootInfo.getNamedItem("curRoom").value];
  	curRoom.initialize();
  	sprites.dialogBox = new StaticSprite("dialogBox",Stage.width+1,1000,null,null,null,null,assets.dialogBox,FG_DEPTHING);
  	dialoger.setBox(sprites.dialogBox);
  	update(0);
}

function serialLoadRoomSprites(newRoom,roomSprites){
	for(var j=0;j<roomSprites.length;j++){
		var curSprite = roomSprites[j];
		var actualSprite = sprites[curSprite.attributes.getNamedItem("name").value];
		newRoom.addSprite(actualSprite);
		var newActions = curSprite.childNodes;
		for(var k=0;k<newActions.length;k++){
			if(newActions[k].attributes.getNamedItem("command")){
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
											curAction.firstChild.nodeValue,
											targSprite);
				actualSprite.addAction(newAction);
			
				while(curAction.getElementsByTagName("Action").length>0){
					var oldAction = newAction;
					var subAction = curAction.getElementsByTagName("Action")[0];
					var attributes = subAction.attributes;
					var targSprite;
					if(attributes.getNamedItem("sprite").value=="null"){
						targSprite = null;
					}else{
						targSprite = sprites[attributes.getNamedItem("sprite").value];
					}
					var newAction = new Action(attributes.getNamedItem("name").value,
												attributes.getNamedItem("command").value,
												subAction.firstChild.nodeValue,
												targSprite);
					oldAction.followUp = newAction;
					curAction = subAction;
				}
			}
		}
	}
}
