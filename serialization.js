var Sburb = (function(Sburb){

var templateClasses = {};
var loadedFiles = {};
Sburb.resourcePath = "";

//Save the current state to xml
Sburb.serialize = function(assets,effects,rooms,sprites,hud,dialoger,curRoom,char){
	var out = document.getElementById("serialText");
	var output = "<SBURB"+
		" curRoom='"+curRoom.name+
		"' char='"+char.name+
		(Sburb.bgm?"' bgm='"+Sburb.bgm.asset.name+(Sburb.bgm.startLoop?","+Sburb.bgm.startLoop:""):"")+
		(Sburb.Stage.scaleX!=1?"' scale='"+Sburb.Stage.scaleX:"")+
		"' resourcePath='"+Sburb.resourcePath+
		"'>\n";
	output = serializeAssets(output,assets,effects);
	output = serializeTemplates(output,templateClasses);
	output = serializeHud(output,hud,dialoger);
	output = serializeLooseObjects(output,rooms,sprites);
	output = output.concat("\n<Rooms>\n");
	for(var room in rooms){
		output = rooms[room].serialize(output);
	}
	output = output.concat("\n</Rooms>\n");
	output = output.concat("\n</SBURB>");
	if(out){
		out.value = output;
	}
	return output;
}

//Serialize things that aren't actually in any room
function serializeLooseObjects(output,rooms,sprites){
	for(var sprite in sprites){
		var theSprite = sprites[sprite];
		var contained = false;
		for(var room in rooms){
			if(rooms[room].contains(theSprite)){
				contained = true;
				break;
			}
		}
		if(!contained){
			output = theSprite.serialize(output);
		}
	}
	return output;
}

//Serialize assets
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
			for(var i=0;i<curAsset.points.length;i++){
				output = output.concat(curAsset.points[i].x+","+curAsset.points[i].y);
				if(i!=curAsset.points.length-1){
					output = output.concat(";");
				}
			}
		}else if(curAsset.type=="movie"){
			output = output.concat(curAsset.src);
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

//Serialize template classes
function serializeTemplates(output,templates){
	output = output.concat("\n<Classes>");
	var serialized;
	try {
		// XMLSerializer exists in current Mozilla browsers
		serializer = new XMLSerializer();
		for(var template in templates){
			output = output.concat(serializer.serializeToString(templates[template]));
		}
	}catch (e) {
		// Internet Explorer has a different approach to serializing XML
		for(var template in templates){
			output = output.concat(templates[template].xml);
		}
	}
	output = output.concat("\n</Classes>\n");
	return output;
}

//Serialize Hud
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

//Purge all assets
function purgeAssets() {
    Sburb.assetManager.purge();
    Sburb.assets = Sburb.assetManager.assets;
}

//Purge the game state
function purgeState(){
	if(Sburb.rooms){
		delete Sburb.rooms;
	}
	if(Sburb.sprites){
		delete Sburb.sprites;
	}
	Sburb.rooms = {};
	if(Sburb.bgm){
		Sburb.bgm.stop();
		Sburb.bgm = null;
	}
	document.getElementById("movieBin").innerHTML = "";
	Sburb.globalVolume = 1;
	Sburb.hud = {};
	Sburb.sprites = {};
	Sburb.effects = {};
	Sburb.curAction = null;
	Sburb.pressed = [];
	Sburb.chooser = new Sburb.Chooser();
	Sburb.dialoger = new Sburb.Dialoger();
	Sburb.curRoom = null;
	Sburb.resourcePath = "";
	
	loadedFiles = {};
}

//Load state/assets from file
Sburb.loadSerialFromXML = function(file,keepOld) {
	Sburb.haltUpdateProcess();
	if(keepOld && loadedFiles[file]){
		Sburb.startUpdateProcess();
		return;
	}else{
		loadedFiles[file] = true;
	}
	
	
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
		loadSerial(request.responseText, keepOld);
    }
}

//actually load a file from users file system?
/*
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
}*/

//main serial loading
function loadSerial(serialText, keepOld) {
    var inText = serialText; //document.getElementById("serialText");
    var parser=new DOMParser();
    var input=parser.parseFromString(inText,"text/xml").documentElement;
	
	if(!keepOld){
    	purgeAssets(); 
    	purgeState();
    }
    
    loadSerialAssets(input);

    setTimeout(function() { loadSerialState(input) }, 500);
}

function loadSerialAssets(input){
	var rootAttr = input.attributes;
	
    var resourcePath = rootAttr.getNamedItem("resourcePath");
    if(resourcePath){
    	Sburb.resourcePath = resourcePath.value+"/";
    }
    
    var newAssets = input.getElementsByTagName("Asset");
    for(var i=0;i<newAssets.length;i++){
		var curAsset = newAssets[i];
  		var attributes = curAsset.attributes;
		var name = attributes.getNamedItem("name").value;
		if (!Sburb.assetManager.isLoaded(name)) {
			loadSerialAsset(curAsset);
		}
    }
}

function loadSerialAsset(curAsset){
    var newAsset = parseSerialAsset(curAsset);
    Sburb.assetManager.loadAsset(newAsset);
}

function parseSerialAsset(curAsset) {
	var attributes = curAsset.attributes;
	var name = attributes.getNamedItem("name").value;
	var type = attributes.getNamedItem("type").value;
	var value = curAsset.firstChild.nodeValue.trim();

	var newAsset;
	if(type=="graphic"){
		newAsset = Sburb.createGraphicAsset(name, Sburb.resourcePath+value);
	} else if(type=="audio"){
		var sources = value.split(";");
		newAsset = Sburb.createAudioAsset(name, Sburb.resourcePath+sources[0], Sburb.resourcePath+sources[1]);
	} else if(type=="path"){
		var pts = value.split(";");
		var path = new Sburb.Path();
		for(var j=0;j<pts.length;j++){
			 var point = pts[j].split(",");
			 path.push({x:parseInt(point[0]),y:parseInt(point[1])});
		}
		newAsset = Sburb.createPathAsset(name,path);
	}else if(type=="movie"){
		newAsset = Sburb.createMovieAsset(name, Sburb.resourcePath+value);
	}
	return newAsset;
}



function loadSerialState(input) {
    // don't load state until assets are all loaded
    if(!Sburb.assetManager.finishedLoading()) {
		updateLoop=setTimeout(function() { loadSerialState(input); } ,500);
		return;
    }
    
    //This one has to be first
   	parseTemplateClasses(input);
	
	parseButtons(input);
  	
  	parseSprites(input);
  	
  	parseCharacters(input);
  	
  	parseFighters(input);
  	
  	parseRooms(input);
  	
  	parseDialogBox(input);
	
	//needs to be after parseDialogBox
  	parseDialogSprites(input);
  	
  	parseEffects(input);
  	
  	//should be last
    parseState(input);

    Sburb.startUpdateProcess();
}

function parseDialogSprites(input){
	var hud = input.getElementsByTagName("HUD");
	if(hud.length>0){
		var dialogSprites = hud[0].getElementsByTagName("DialogSprites");
		if(dialogSprites.length>0){
			serialLoadDialogSprites(dialogSprites[0],Sburb.assets);
		}
	}
}

function parseEffects(input){
	var effects = input.getElementsByTagName("Effects");
	if(effects.length>0){
		serialLoadEffects(effects[0],Sburb.assets,Sburb.effects);
	}
}

function parseTemplateClasses(input){
	var templates = input.getElementsByTagName("Classes")[0].childNodes;
    for(var i=0;i<templates.length;i++){
    	var templateNode = templates[i];
    	if(templateNode.nodeName!="#text"){
		 	var tempAttributes = templateNode.attributes;
		 	var tempChildren = templateNode.childNodes;
		 	var candidates = input.getElementsByTagName(templateNode.nodeName);
		 	for(var j=0;j<candidates.length;j++){
		 		var candidate = candidates[j];
		 		var candAttributes = candidate.attributes;
		 		var candClass = candidate.attributes.getNamedItem("class");
		 		var candChildren = candidate.childNodes;
		 		if(candClass && candidate!=templateNode && candClass.value==tempAttributes.getNamedItem("class").value){
		 			for(var k=0;k<tempAttributes.length;k++){
		 				var tempAttribute = tempAttributes[k];
		 				if(!candAttributes.getNamedItem(tempAttribute.name)){
		 					candidate.setAttribute(tempAttribute.name,tempAttribute.value);
		 				}
		 			}
		 			for(var k=0;k<tempChildren.length;k++){
		 				candidate.appendChild(tempChildren[k].cloneNode(true));
		 			}
		 		}
		 	}
		 	templateClasses[tempAttributes.getNamedItem("class").value] = templateNode.cloneNode(true);
    	}
    }
    input.removeChild(input.getElementsByTagName("Classes")[0]);
}

function parseButtons(input){
	var newButtons = input.getElementsByTagName("SpriteButton");
	for(var i=0;i<newButtons.length;i++){
		var curButton = newButtons[i];
		var newButton = Sburb.parseSpriteButton(curButton);
  		Sburb.hud[newButton.name] = newButton;
	}
}

function parseSprites(input){
	var newSprites = input.getElementsByTagName("Sprite");
  	for(var i=0;i<newSprites.length;i++){
  		var curSprite = newSprites[i];
		var newSprite = Sburb.parseSprite(curSprite, Sburb.assets);
  		Sburb.sprites[newSprite.name] = newSprite;
  	}
}

function parseCharacters(input){
	var newChars = input.getElementsByTagName("Character");
  	for(var i=0;i<newChars.length;i++){
  		var curChar = newChars[i];
		var newChar = Sburb.parseCharacter(curChar, Sburb.assets);
  		Sburb.sprites[newChar.name] = newChar;
  	}
}

function parseFighters(input){
	var newFighters = input.getElementsByTagName("Fighter");
  	for(var i=0;i<newFighters.length;i++){
  		var curFighter = newFighters[i];
		var newFighter = Sburb.parseFighter(curFighter, Sburb.assets);
  		Sburb.sprites[newFighter.name] = newFighter;
  	}
}

function parseRooms(input){
	var newRooms = input.getElementsByTagName("Room");
  	for(var i=0;i<newRooms.length;i++){
  		var currRoom = newRooms[i];
		var newRoom = Sburb.parseRoom(currRoom, Sburb.assets, Sburb.sprites);
  		Sburb.rooms[newRoom.name] = newRoom;
  	}
}

function parseState(input){
	var rootInfo = input.attributes;
  	
  	var char = rootInfo.getNamedItem("char");
  	if(char){
	  	Sburb.focus = Sburb.char = Sburb.sprites[char.value];
	  	Sburb.char.becomePlayer();
	}
  	
  	var mode = rootInfo.getNamedItem("mode");
  	if(mode){
  		Sburb.engineMode = mode.value;
  	}
  	
  	var scale = rootInfo.getNamedItem("scale");
  	if(scale){
  		Sburb.Stage.scaleX = Sburb.Stage.scaleY = parseInt(scale.value);
  	}
  	
  	var curRoom = rootInfo.getNamedItem("curRoom");
  	if(curRoom){
  		Sburb.curRoom = Sburb.rooms[curRoom.value];
  	}
  	
  	var bgm = rootInfo.getNamedItem("bgm");
  	if(bgm){
  		var params = bgm.value.split(",");
  		Sburb.changeBGM(new Sburb.BGM(Sburb.assets[params[0]],parseFloat(params.length>1?params[1]:"0")));
  	}
  	
  	var initAction;
    var initActionName;
    if(rootInfo.getNamedItem("startAction")){
    	initActionName = rootInfo.getNamedItem("startAction").value;
		for(var i=0; i<input.childNodes.length; i++) {
			var tmp = input.childNodes[i];
			if(tmp.tagName=="Action" && tmp.attributes.getNamedItem("name").value == initActionName) {
				initAction = Sburb.parseAction(tmp);
				continue;
			}
		}
		if(initAction) {
			Sburb.performAction(initAction);
		}
    }
}

function parseDialogBox(input){
	var dialogBox = new Sburb.Sprite("dialogBox",Stage.width+1,1000,Sburb.assets.dialogBox.width,Sburb.assets.dialogBox.height, null,null,0);
  	dialogBox.addAnimation(new Sburb.Animation("image",Sburb.assets.dialogBox,0,0,Sburb.assets.dialogBox.width,Sburb.assets.dialogBox.height,0,1,1));
	dialogBox.startAnimation("image");
  	Sburb.dialoger.setBox(dialogBox);
}

function serialLoadDialogSprites(dialogSprites,assetFolder){
	Sburb.dialoger.dialogSpriteLeft = new Sburb.Sprite("dialogSprite",-1000,Stage.height,0,0);
	Sburb.dialoger.dialogSpriteRight = new Sburb.Sprite("dialogSprite",Stage.width+1000,Stage.height,0,0);
	var animations = dialogSprites.getElementsByTagName("Animation");
	for(var i=0;i<animations.length;i++){
		Sburb.dialoger.dialogSpriteLeft.addAnimation(Sburb.parseAnimation(animations[i],assetFolder));
		Sburb.dialoger.dialogSpriteRight.addAnimation(Sburb.parseAnimation(animations[i],assetFolder));
	}
}

function serialLoadEffects(effects,assetFolder,effectsFolder){
	var animations = effects.getElementsByTagName("Animation");
	for(var i=0;i<animations.length;i++){
		var newEffect = Sburb.parseAnimation(animations[i],assetFolder);
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
				var newAction = Sburb.parseAction(newActions[k]);
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
				      parseFloat(attributes.getNamedItem("xtox").value), 
				      parseFloat(attributes.getNamedItem("xtoy").value), 
				      parseFloat(attributes.getNamedItem("ytox").value), 
				      parseFloat(attributes.getNamedItem("ytoy").value), 
				      parseFloat(attributes.getNamedItem("dx").value), 
				      parseFloat(attributes.getNamedItem("dy").value));
	}
}

function serialLoadRoomTriggers(newRoom, triggers){
 	var candidates = triggers[0].childNodes;
	for(var i=0;i<candidates.length;i++){
		if(candidates[i].nodeName=="Trigger"){
			newRoom.addTrigger(Sburb.parseTrigger(candidates[i]));
		}
	}
}

Sburb.serializeAttribute = function(base,val){
	var sub;
	return base[val]?" "+val+"='"+base[val]+"' ":"";
}

Sburb.serializeAttributes = function(base){
	str = "";
	for(var i=1;i<arguments.length;i++){
		str = str.concat(Sburb.serializeAttribute(base,arguments[i]));
	}
	return str;
}

Sburb.serialLoadRoomSprites = serialLoadRoomSprites;
Sburb.serialLoadRoomPaths = serialLoadRoomPaths;
Sburb.serialLoadRoomTriggers = serialLoadRoomTriggers;
Sburb.loadSerial = loadSerial;


return Sburb;
})(Sburb || {});
