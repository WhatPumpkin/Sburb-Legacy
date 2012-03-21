function serialize(){
	var out = document.getElementById("serialText");
	var output = "<SBURB curRoom='"+curRoom.name+"' char='"+char.name+"'>";
	output = serializeAssets(output);
	output = serializeHud(output);
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

function serializeHud(output){
	output = output.concat("<HUD>");
	for(var content in hud){
		output = hud[content].serialize(output);
	}
	output = output.concat("</HUD>");
	return output;
}

function purgeAssets() {
    assetManager.purge();
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
	hud = {};
	sprites = {};
	pressed = new Array();
	chooser = new Chooser();
	dialoger = new Dialoger();
	curRoom = null;
}
function loadSerialFromXML(file, savedStateID) {
    if(window.ActiveXObject) {
	var request = new ActiveXObject("MSXML2.XMLHTTP");
    } else {
	var request = new XMLHttpRequest();
    }
    request.open('GET', "levels/test1.xml", false);
    try {
	request.send(null);
    } catch(err) {
	console.log("If you are running Google Chrome, you need to run it with the -allow-file-access-from-files switch to load this.");
	fi = document.getElementById("levelFile");
	return;
    }
    if (request.status === 200 || request.status == 0) {  
	loadSerial(request.responseText, savedStateID);
    }
}
function loadLevelFile(node) {
    if (!window.FileReader) {
	alert("This browser doesn't support reading files");
    }
    oFReader = new FileReader();
    if (node.files.length === 0) { return; }  
    var oFile = node.files[0];
    oFReader.onload = function() { loadSerial(this.result); };
    oFReader.onerror = function(e) {console.log(e); }; // this should pop up an alert if googlechrome
    oFReader.readAsText(oFile);
}

function loadSerial(serialText, sburbID) {
    var inText = serialText; //document.getElementById("serialText");
    var parser=new DOMParser();
    var input=parser.parseFromString(inText,"text/xml");

    if(sburbID) {
	input = input.getElementById(sburbID);
    } else {
  	input = input.documentElement;
    }

    // should we assume that all assets with the same name
    // have the same data? if so we don't need this next line
    // purgeAssets(); 

    purgeState();
    var newAssets = input.getElementsByTagName("Asset");
    for(var i=0;i<newAssets.length;i++){
	var curAsset = newAssets[i];
  	var attributes = curAsset.attributes;
	var name = attributes.getNamedItem("name").value;
	if (!assetManager.isLoaded(name)) {
	    loadSerialAsset(curAsset);
	}
    }
    setTimeout(function() { loadSerialState(input) }, 500);
}

function loadSerialAsset(curAsset){
    var newAsset = parseSerialAsset(curAsset);
    assetManager.loadAsset(newAsset);
/*
    if(newAsset.type == "graphic") {
	assetManager.loadGraphicAsset(newAsset);
    } else if(newAsset.type == "audio") {
	assetManager.loadAudioAsset(newAsset);
    } else if(newAsset.type == "path") {
	assetManager.loadPathAsset(newAsset);
    }
*/
}
function parseSerialAsset(curAsset) {
    var attributes = curAsset.attributes;
    var name = attributes.getNamedItem("name").value;
    var type = attributes.getNamedItem("type").value;
    var value = curAsset.firstChild.nodeValue;

    var newAsset;
    if(type=="graphic"){
	newAsset = createGraphicAsset(name,value);
    } else if(type=="audio"){
  	var sources = value.split(";");
	newAsset = createAudioAsset(name,sources[0],sources[1]);
    } else if(type=="path"){
  	var pts = value.split(";");
  	var path = new Array();
  	for(var j=0;j<pts.length;j++){
  	    var point = pts[j].split(",");
  	    path.push({x:parseInt(point[0]),y:parseInt(point[1])});
  	}
	newAsset = createPathAsset(name,path);
    }
    return newAsset;
}

function parseSprite(spriteNode, assetFolder) {

  	var attributes = spriteNode.attributes;
 	var newSprite = new Sprite(attributes.getNamedItem("name").value,
  				   parseInt(attributes.getNamedItem("x").value),
  				   parseInt(attributes.getNamedItem("y").value),
  				   parseInt(attributes.getNamedItem("width").value),
  				   parseInt(attributes.getNamedItem("height").value),
  				   parseInt(attributes.getNamedItem("dx").value),
  				   parseInt(attributes.getNamedItem("dy").value),
  				   parseInt(attributes.getNamedItem("depthing").value),
  				   attributes.getNamedItem("collidable").value=="true");
  	var state = attributes.getNamedItem("state").value;
  	var anims = spriteNode.getElementsByTagName("Animation");
  	for(var j=0;j<anims.length;j++){
  		var curAnim = anims[j];
  		var attributes = curAnim.attributes;
  		var newAnim = new Animation(attributes.getNamedItem("name").value,
  					    assetFolder[attributes.getNamedItem("sheet").value],
  					    parseInt(attributes.getNamedItem("sx").value),
  					    parseInt(attributes.getNamedItem("sy").value),
  					    parseInt(attributes.getNamedItem("colSize").value),
  					    parseInt(attributes.getNamedItem("rowSize").value),
  					    parseInt(attributes.getNamedItem("startPos").value),
  					    parseInt(attributes.getNamedItem("length").value),
  					    parseInt(attributes.getNamedItem("frameInterval").value));
  		newSprite.addAnimation(newAnim);
  	}
  	newSprite.startAnimation(state);
	return newSprite;
}
function parseCharacter(charNode, assetFolder) {
  	var attributes = charNode.attributes;
  	var newChar = new Character(attributes.getNamedItem("name").value,
  				    parseInt(attributes.getNamedItem("x").value),
  				    parseInt(attributes.getNamedItem("y").value),
  				    parseInt(attributes.getNamedItem("width").value),
  				    parseInt(attributes.getNamedItem("height").value),
  				    parseInt(attributes.getNamedItem("sx").value),
  				    parseInt(attributes.getNamedItem("sy").value),
  				    parseInt(attributes.getNamedItem("sWidth").value),
  				    parseInt(attributes.getNamedItem("sHeight").value),
  				    assetFolder[attributes.getNamedItem("sheet").value]);
  	newChar.startAnimation(attributes.getNamedItem("state").value);
  	newChar.facing = attributes.getNamedItem("facing").value;
	return newChar;
}
function parseRoom(roomNode, assetFolder, spriteFolder) {
  	var attributes = roomNode.attributes;
  	var newRoom = new Room(attributes.getNamedItem("name").value,
  			       parseInt(attributes.getNamedItem("width").value),
  			       parseInt(attributes.getNamedItem("height").value),
  			       assetFolder[attributes.getNamedItem("walkable").value]);
  	serialLoadRoomSprites(newRoom,roomNode.getElementsByTagName("Sprite"), spriteFolder);
  	serialLoadRoomSprites(newRoom,roomNode.getElementsByTagName("Character"), spriteFolder);
	serialLoadRoomMotion(newRoom, roomNode.getElementsByTagName("MotionPath"), assetFolder);
	return newRoom;
}
function loadSerialState(input) {
    // this is more or less this init function for a game
    if(!assetManager.finishedLoading()) {
		updateLoop=setTimeout(function() { loadSerialState(input); } ,500);
		return;
    }
	
	var newButtons = input.getElementsByTagName("SpriteButton");
	for(var i=0;i<newButtons.length;i++){
		var curButton = newButtons[i];
		var attributes = curButton.attributes;
		var newButton = new SpriteButton(attributes.getNamedItem("name").value,
  									parseInt(attributes.getNamedItem("x").value),
  									parseInt(attributes.getNamedItem("y").value),
  									parseInt(attributes.getNamedItem("width").value),
  									parseInt(attributes.getNamedItem("height").value),
  									assets[attributes.getNamedItem("sheet").value]);
  		hud[newButton.name] = newButton;
	}
  	
  	var newSprites = input.getElementsByTagName("Sprite");
  	for(var i=0;i<newSprites.length;i++){
  		var curSprite = newSprites[i];
		var newSprite = parseSprite(curSprite, assets);
		
  		sprites[newSprite.name] = newSprite;
  	}
  	var newChars = input.getElementsByTagName("Character");
  	for(var i=0;i<newChars.length;i++){
  		var curChar = newChars[i];
		var newChar = parseCharacter(curChar, assets);
  		sprites[newChar.name] = newChar;
  	}
  	var newRooms = input.getElementsByTagName("Room");
  	for(var i=0;i<newRooms.length;i++){
  		var currRoom = newRooms[i];
		var newRoom = parseRoom(currRoom, assets, sprites);
  		rooms[newRoom.name] = newRoom;
  	}
  	var rootInfo = input.attributes;
  	focus = char = sprites[rootInfo.getNamedItem("char").value];
  	char.becomePlayer();
  	curRoom = rooms[rootInfo.getNamedItem("curRoom").value];
  	curRoom.initialize();
  	sprites.dialogBox = new StaticSprite("dialogBox",Stage.width+1,1000,null,null,null,null,assets.dialogBox,FG_DEPTHING);
  	dialoger.setBox(sprites.dialogBox);
    var initAction;
    var initActionName = rootInfo.getNamedItem("startAction").value;
    for(var i=0; i<input.childNodes.length; i++) {
	var tmp = input.childNodes[i];
	if(tmp.tagName=="Action" && tmp.attributes.getNamedItem("name").value == initActionName) {
	    initAction = parseXMLAction(tmp);
	    continue;
	}
    }
    if(initAction) {
	curAction = initAction;
	performAction(curAction);
    }

    update(0);
}

function serialLoadRoomSprites(newRoom, roomSprites, spriteFolder){
	for(var j=0;j<roomSprites.length;j++){
		var curSprite = roomSprites[j];
		var actualSprite = spriteFolder[curSprite.attributes.getNamedItem("name").value];
		newRoom.addSprite(actualSprite);
	        var newActions = curSprite.childNodes;
		for(var k=0;k<newActions.length;k++){
		    if(newActions[k].nodeName == "#text") {
			continue;
		    }
		    if(newActions[k].attributes.getNamedItem("command")){
			var newAction = parseXMLAction(newActions[k]);
			actualSprite.addAction(newAction);
		    }
		}
	}
}

function serialLoadRoomMotion(newRoom, motionPaths, assetFolder) {
	for(var j=0;j<motionPaths.length;j++) {
		var node = motionPaths[j];
		var attributes = node.attributes;
		newRoom.addMotionPath(assetFolder[attributes.getNamedItem("path").value], 
				      parseInt(attributes.getNamedItem("xtox").value), 
				      parseInt(attributes.getNamedItem("xtoy").value), 
				      parseInt(attributes.getNamedItem("ytox").value), 
				      parseInt(attributes.getNamedItem("ytoy").value), 
				      parseInt(attributes.getNamedItem("dx").value), 
				      parseInt(attributes.getNamedItem("dy").value));
	}
}
