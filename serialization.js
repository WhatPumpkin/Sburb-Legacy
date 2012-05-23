var templateClasses = {};

function serialize(assets,effects,rooms,hud,dialoger,curRoom,char){
	var out = document.getElementById("serialText");
	var output = "<SBURB curRoom='"+curRoom.name+"' char='"+char.name+"'>\n";
	output = serializeAssets(output,assets,effects);
	output = serializeTemplates(output,templateClasses);
	output = serializeHud(output,hud,dialoger);
	output = output.concat("\n<Rooms>\n");
	for(var room in rooms){
		output = rooms[room].serialize(output);
	}
	output = output.concat("\n</Rooms>\n");
	output = output.concat("\n</SBURB>");
	out.value = output;
	return output;
}

function serializeAssets(output,assets,effects){
	output = output.concat("\n<Assets>");
	for(var asset in assets){
		var curAsset = assets[asset];
		output = output.concat("\n<Asset name='"+curAsset.name+"' type='"+curAsset.type+"'>");
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
	output = output.concat("\n</Assets>\n");
	output = output.concat("\n<Effects>");
	for(var effect in effects){
		var curEffect = effects[effect];
		output = curEffect.serialize(output);
	}
	output = output.concat("\n</Effects>\n");
	return output;
}

function serializeTemplates(output,templates){
	output = output.concat("\n<Classes>");
	for(var template in templates){
		var tempOut = templates[template].serialize("");
		var tempOut = tempOut.substring(0,tempOut.indexOf(" "))+" class='"+template+"' "+tempOut.substring(tempOut.indexOf(" "),tempOut.length);
		output = output.concat(tempOut);
	}
	output = output.concat("\n</Classes>\n");
	return output;
}

function serializeHud(output,hud,dialoger){
	output = output.concat("\n<HUD>");
	for(var content in hud){
		output = hud[content].serialize(output);
	}
	var animations = dialoger.dialogSpriteLeft.animations;
	output = output.concat("\n<DialogSprites>");
	for(var animation in animations){
		output = animations[animation].serialize(output);
	}
	output = output.concat("\n</DialogSprites>");
	output = output.concat("\n</HUD>\n");
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
	effects = {};
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
    request.open('GET', file, false);
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

    var templates = input.getElementsByTagName("Classes")[0].childNodes;
    for(var i=0;i<templates.length;i++){
    	var template = templates[i];
    	if(template.nodeName=="Sprite"){
    		var newSprite = parseSprite(template,assets);
    		templateClasses[template.attributes.getNamedItem("class").value] = newSprite;
    	}
    }
    input.removeChild(input.getElementsByTagName("Classes")[0]);
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
  									attributes.getNamedItem("x")?parseInt(attributes.getNamedItem("x").value):0,
  									attributes.getNamedItem("y")?parseInt(attributes.getNamedItem("y").value):0,
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
  	serialLoadDialogSprites(input.getElementsByTagName("HUD")[0].getElementsByTagName("DialogSprites")[0],assets);
  	
  	serialLoadEffects(input.getElementsByTagName("Effects")[0],assets,effects);
  	
    var initAction;
    var initActionName;
    if(rootInfo.getNamedItem("startAction")){
    	initActionName = rootInfo.getNamedItem("startAction").value;
    }else{
    	initActionName = "none";
    }
    for(var i=0; i<input.childNodes.length; i++) {
			var tmp = input.childNodes[i];
			if(tmp.tagName=="Action" && tmp.attributes.getNamedItem("name").value == initActionName) {
				initAction = parseXMLAction(tmp);
				continue;
			}
    }
    if(initAction) {
			performAction(initAction);
    }

    update(0);
}

function serialLoadDialogSprites(dialogSprites,assetFolder){
	dialoger.dialogSpriteLeft = new Sprite("dialogSprite",-1000,Stage.height,0,0);
	dialoger.dialogSpriteRight = new Sprite("dialogSprite",Stage.width+1000,Stage.height,0,0);
	var animations = dialogSprites.getElementsByTagName("Animation");
	for(var i=0;i<animations.length;i++){
		dialoger.dialogSpriteLeft.addAnimation(parseAnimation(animations[i],assetFolder));
		dialoger.dialogSpriteRight.addAnimation(parseAnimation(animations[i],assetFolder));
	}
}

function serialLoadEffects(effects,assetFolder,effectsFolder){
	var animations = effects.getElementsByTagName("Animation");
	for(var i=0;i<animations.length;i++){
		var newEffect = parseAnimation(animations[i],assetFolder);
		effectsFolder[newEffect.name] = newEffect;
	}
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
			if(newActions[k].nodeName == "Action"){
				var newAction = parseXMLAction(newActions[k]);
				actualSprite.addAction(newAction);
			}
		}
	}
}

function serialLoadRoomPaths(newRoom, paths, assetFolder) {
	var walkables = paths[0].getElementsByTagName("Walkable");
	for(var j=0;j<walkables.length;j++){
		var node = walkables[j];
		var attributes = node.attributes;
		newRoom.addWalkable(assetFolder[attributes.getNamedItem("path").value]);
	}
	
	var unwalkables = paths[0].getElementsByTagName("Unwalkable");
	for(var j=0;j<unwalkables.length;j++){
		var node = unwalkables[j];
		var attributes = node.attributes;
		newRoom.addUnWalkable(assetFolder[attributes.getNamedItem("path").value]);
	}
	
	var motionPaths = paths[0].getElementsByTagName("MotionPath");
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

function serialLoadRoomTriggers(newRoom, triggers){
 	var candidates = triggers[0].childNodes;
	for(var i=0;i<candidates.length;i++){
		if(candidates[i].nodeName=="Trigger"){
			newRoom.addTrigger(parseTrigger(candidates[i]));
		}
	}
}
