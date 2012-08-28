var Sburb = (function(Sburb){

var templateClasses = {};
var loadedFiles = {};
var loadingDepth = 0;
var loadQueue = [];
var updateLoop = null;
//Save the current state to xml
Sburb.serialize = function(assets,effects,rooms,sprites,hud,dialoger,curRoom,char){
	var out = document.getElementById("serialText");
	var output = "<sburb"+
		"' char='"+char.name+
		(Sburb.bgm?"' bgm='"+Sburb.bgm.asset.name+(Sburb.bgm.startLoop?","+Sburb.bgm.startLoop:""):"")+
		(Sburb.Stage.scaleX!=1?"' scale='"+Sburb.Stage.scaleX:"")+
		(Sburb.assetManager.resourcePath?("' resourcePath='"+Sburb.assetManager.resourcePath):"")+
		(Sburb.assetManager.levelPath?("' levelPath='"+Sburb.assetManager.levelPath):"")+
		"'>\n";
	output = serializeAssets(output,assets,effects);
	output = serializeTemplates(output,templateClasses);
	output = serializeHud(output,hud,dialoger);
	output = serializeLooseObjects(output,rooms,sprites);
	output = output.concat("\n<rooms>\n");
	for(var room in rooms){
		output = rooms[room].serialize(output);
	}
	output = output.concat("\n</rooms>\n");
	output = output.concat("\n</sburb>");
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
	for(var button in Sburb.buttons){
		var theButton = Sburb.buttons[button];
		if(!Sburb.hud[theButton.name]){
			output = theButton.serialize(output);
		}
	}

	return output;
}

//Serialize assets
function serializeAssets(output,assets,effects){
	output = output.concat("\n<assets>");
	for(var asset in assets){
		var curAsset = assets[asset];
		output = output.concat("\n<asset name='"+curAsset.name+"' type='"+curAsset.type+"'>");
		if(curAsset.type=="graphic"){
			output = output.concat(curAsset.src);
		}else if(curAsset.type=="audio"){
			var sources = curAsset.innerHTML.split('"');
			var vals = "";
			for(var i=1;i<sources.length;i+=2){
				vals+=sources[i];
				if(i+2<sources.length){
					vals+=";";
				}
			}
			output += vals;

		}else if(curAsset.type=="path"){
			for(var i=0;i<curAsset.points.length;i++){
				output = output.concat(curAsset.points[i].x+","+curAsset.points[i].y);
				if(i!=curAsset.points.length-1){
					output = output.concat(";");
				}
			}
		}else if(curAsset.type=="movie"){
			output = output.concat(curAsset.src);
		}else if(curAsset.type=="font"){
			output += curAsset.originalVals;
		}
		output = output.concat("</asset>");
	}
	output = output.concat("\n</assets>\n");
	output = output.concat("\n<effects>");
	for(var effect in effects){
		var curEffect = effects[effect];
		output = curEffect.serialize(output);
	}
	output = output.concat("\n</effects>\n");
	return output;
}

//Serialize template classes
function serializeTemplates(output,templates){
	output = output.concat("\n<classes>");
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
	output = output.concat("\n</classes>\n");
	return output;
}

//Serialize Hud
function serializeHud(output,hud,dialoger){
	output = output.concat("\n<hud>");
	for(var content in hud){
		output = hud[content].serialize(output);
	}
	output = Sburb.dialoger.serialize(output);
	var animations = dialoger.dialogSpriteLeft.animations;
	output = output.concat("\n<dialogsprites>");
	for(var animation in animations){
		output = animations[animation].serialize(output);
	}
	output = output.concat("\n</dialogsprites>");
	output = output.concat("\n</hud>\n");
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
	Sburb.buttons = {};
	Sburb.effects = {};
	Sburb.curAction = null;
	Sburb.pressed = [];
	Sburb.chooser = new Sburb.Chooser();
	Sburb.dialoger = null;
	Sburb.curRoom = null;
	Sburb.assetManager.resourcePath = "";
	Sburb.assetManager.levelPath = "";
	
	loadedFiles = {};
}

//Load state/assets from file
Sburb.loadSerialFromXML = function(file,keepOld) {
	file = Sburb.assetManager.levelPath+file;
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

//main serial loading
function loadSerial(serialText, keepOld) {
	Sburb.haltUpdateProcess();

    var inText = serialText; //document.getElementById("serialText");
    var parser=new DOMParser();
    var input=parser.parseFromString(inText,"text/xml").documentElement;
	
		if(!keepOld){
    	purgeAssets(); 
    	purgeState();
    }
    
    var rootAttr = input.attributes;
		var levelPath = rootAttr.getNamedItem("levelPath");
    if(levelPath){
    	Sburb.assetManager.levelPath = levelPath.value+"/";
    }
    
    var resourcePath = rootAttr.getNamedItem("resourcePath");
    if(resourcePath){
    	Sburb.assetManager.resourcePath = resourcePath.value;
    }
    loadingDepth++;
    loadDependencies(input);
    
    loadSerialAssets(input);
		loadQueue.push(input);
		loadSerialState(input); 
}

function loadDependencies(input){
    
	var dependenciesNode = input.getElementsByTagName("dependencies")[0];
	if(dependenciesNode){
		var dependencies = dependenciesNode.getElementsByTagName("dependency");
		for(var i=0; i<dependencies.length;i++){
			var dependency = dependencies[i].firstChild.nodeValue.trim();
			Sburb.loadSerialFromXML(dependency,true);
		}
	}
}

function loadSerialAssets(input){
	var rootAttr = input.attributes;
    
  var description = rootAttr.getNamedItem("description");
  if(description){
  	Sburb.assetManager.description = description.value;
  }else{
  	Sburb.assetManager.description = "assets"
  }
  
  var newAssets = input.getElementsByTagName("asset");
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
		newAsset = Sburb.createGraphicAsset(name, value);
	} else if(type=="audio"){
		var sources = value.split(";");
		newAsset = Sburb.createAudioAsset(name, sources);
	} else if(type=="path"){
		var pts = value.split(";");
		var path = new Sburb.Path();
		for(var j=0;j<pts.length;j++){
			 var point = pts[j].split(",");
			 path.push({x:parseInt(point[0]),y:parseInt(point[1])});
		}
		newAsset = Sburb.createPathAsset(name,path);
	}else if(type=="movie"){
		newAsset = Sburb.createMovieAsset(name, value);
	}else if(type=="font"){
		//var sources = value.split(";");
		newAsset = Sburb.createFontAsset(name,value);
	}
	return newAsset;
}



function loadSerialState() {
  // don't load state until assets are all loaded
  if(updateLoop){
  	clearTimeout(updateLoop);
  	updateLoop = null;
  }
  if(!Sburb.assetManager.finishedLoading()) {
		updateLoop=setTimeout(function() { loadSerialState(); } ,500);
		return;
  }
  while(loadQueue.length>0){
		var input = loadQueue[0];
		loadQueue.splice(0,1);
		//These two have to be first
	 	parseTemplateClasses(input);
		applyTemplateClasses(input);

		parseButtons(input);
		parseSprites(input);
		parseCharacters(input);
		parseFighters(input);
		parseRooms(input);
	
	
		parseHud(input);
	
		parseEffects(input);
	
		//should be last
		parseState(input);
		loadingDepth--;
		if(loadingDepth==0){
			Sburb.startUpdateProcess();
		}
  }
}

function parseDialogSprites(input){
	var hud = input.getElementsByTagName("hud");

	if(hud.length>0){
		var dialogSprites = hud[0].getElementsByTagName("dialogsprites");

		if(dialogSprites.length>0){
			serialLoadDialogSprites(dialogSprites[0],Sburb.assets);
		}
	}
}

function parseEffects(input){
	var effects = input.getElementsByTagName("effects");

	if(effects.length>0){
		serialLoadEffects(effects[0],Sburb.assets,Sburb.effects);
	}
}

function parseTemplateClasses(input){
	var classes = input.getElementsByTagName("classes");

	if(classes.length>0){
		var templates = classes[0].childNodes;
		for(var i=0;i<templates.length;i++){
			var templateNode = templates[i];
			
			if(templateNode.nodeName!="#text" && templateNode.nodeName!="#comment"){
				applyTemplateClasses(templateNode);
			 	var tempAttributes = templateNode.attributes;
			 	templateClasses[tempAttributes.getNamedItem("class").value] =
			 		templateNode.cloneNode(true);
			}
		}
		input.removeChild(input.getElementsByTagName("classes")[0]);
	}
}

function applyTemplateClasses(input){
	for(var className in templateClasses){
		var templateNode = templateClasses[className];
	 	var candidates = input.getElementsByTagName(templateNode.nodeName);
	 	for(var j=0;j<candidates.length;j++){
	 		var candidate = candidates[j];
	 		tryToApplyTemplate(templateNode,candidate);
	 	}
	}
}

function tryToApplyTemplate(templateNode,candidate){
	var templateClass = templateNode.attributes.getNamedItem("class").value;
	var candClass = candidate.attributes.getNamedItem("class");
	if(candClass && candClass.value==templateClass){
		applyTemplate(templateNode,candidate);
	}
}

function applyTemplate(templateNode,candidate){
	var tempAttributes = templateNode.attributes;
	var tempChildren = templateNode.childNodes;
	var candAttributes = candidate.attributes;
	var candChildren = candidate.childNodes;
	for(var k=0;k<tempAttributes.length;k++){
		var tempAttribute = tempAttributes[k];
		if(!candAttributes.getNamedItem(tempAttribute.name)){
			candidate.setAttribute(tempAttribute.name, tempAttribute.value);
		}
	}
	for(var k=0;k<tempChildren.length;k++){
		candidate.appendChild(tempChildren[k].cloneNode(true));
	}
}

function parseButtons(input){
	var newButtons = input.getElementsByTagName("spritebutton");
	for(var i=0;i<newButtons.length;i++){
		var curButton = newButtons[i];
		var newButton = Sburb.parseSpriteButton(curButton);
  		Sburb.buttons[newButton.name] = newButton;
	}
}

function parseSprites(input){
	
	var newSprites = input.getElementsByTagName("sprite");
  	for(var i=0;i<newSprites.length;i++){
  		var curSprite = newSprites[i];
		var newSprite = Sburb.parseSprite(curSprite, Sburb.assets);
  		Sburb.sprites[newSprite.name] = newSprite;
  	}
}

function parseCharacters(input){
	var newChars = input.getElementsByTagName("character");
  	for(var i=0;i<newChars.length;i++){
  		var curChar = newChars[i];
		var newChar = Sburb.parseCharacter(curChar, Sburb.assets);
  		Sburb.sprites[newChar.name] = newChar;
  	}
}

function parseFighters(input){
	var newFighters = input.getElementsByTagName("fighter");
  	for(var i=0;i<newFighters.length;i++){
  		var curFighter = newFighters[i];
		var newFighter = Sburb.parseFighter(curFighter, Sburb.assets);
  		Sburb.sprites[newFighter.name] = newFighter;
  	}
}

function parseRooms(input){
	var newRooms = input.getElementsByTagName("room");
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
  		Sburb.curRoom.enter();
  	}else if(Sburb.curRoom==null && Sburb.char!=null){
  		for(var roomName in Sburb.rooms){
  			var room = Sburb.rooms[roomName];
  			if(room.contains(Sburb.char)){
  				Sburb.curRoom = room;
  				Sburb.curRoom.enter();
  				break;
  			}
  		}
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
			if(tmp.tagName=="action" && tmp.attributes.getNamedItem("name").value == initActionName) {
				initAction = Sburb.parseAction(tmp);
				continue;
			}
		}
		if(initAction) {
			Sburb.performAction(initAction);
		}
    }
}

function parseHud(input){
	var hud = input.getElementsByTagName("hud");
	if(hud.length>0){
		var children = hud[0].childNodes;
		for(var i=0;i<children.length;i++){
			var child = children[i];

			if(child.nodeName == "spritebutton"){
				var name = child.attributes.getNamedItem("name").value;
  				Sburb.hud[name] = Sburb.buttons[name];
			}
		}
	}
	parseDialoger(input);
	parseDialogSprites(input);
}

function parseDialoger(input){
	var dialoger = input.getElementsByTagName("dialoger");
	if(dialoger.length>0){
		var dialogSpriteLeft = null;
		var dialogSpriteRight = null;
		if(Sburb.dialoger){
			dialogSpriteLeft = Sburb.dialoger.dialogSpriteLeft;
			dialogSpriteRight = Sburb.dialoger.dialogSpriteRight;
		}
		Sburb.dialoger = Sburb.parseDialoger(dialoger[0]);
		Sburb.dialoger.dialogSpriteLeft = dialogSpriteLeft;
		Sburb.dialoger.dialogSpriteRight = dialogSpriteRight;
	}
}

function serialLoadDialogSprites(dialogSprites,assetFolder){
	if(!Sburb.dialoger){
		Sburb.dialoger = {};
	}
	if(!Sburb.dialoger.dialogSpriteLeft){
		Sburb.dialoger.dialogSpriteLeft = new Sburb.Sprite("dialogSprite",-1000,Stage.height,0,0);
		Sburb.dialoger.dialogSpriteRight = new Sburb.Sprite("dialogSprite",Stage.width+1000,Stage.height,0,0);
	}
	var animations = dialogSprites.getElementsByTagName("animation");
	for(var i=0;i<animations.length;i++){
		Sburb.dialoger.dialogSpriteLeft.addAnimation(Sburb.parseAnimation(animations[i],assetFolder));
		Sburb.dialoger.dialogSpriteRight.addAnimation(Sburb.parseAnimation(animations[i],assetFolder));
	}

}

function serialLoadEffects(effects,assetFolder,effectsFolder){
	var animations = effects.getElementsByTagName("animation");
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
			if(newActions[k].nodeName == "action"){
				var newAction = Sburb.parseAction(newActions[k]);
				actualSprite.addAction(newAction);
			}
		}
	}
}

function serialLoadRoomPaths(newRoom, paths, assetFolder) {
	var walkables = paths[0].getElementsByTagName("walkable");
	for(var j=0;j<walkables.length;j++){
		var node = walkables[j];
		var attributes = node.attributes;
		newRoom.addWalkable(assetFolder[attributes.getNamedItem("path").value]);
	}
	
	var unwalkables = paths[0].getElementsByTagName("unwalkable");
	for(var j=0;j<unwalkables.length;j++){
		var node = unwalkables[j];
		var attributes = node.attributes;
		newRoom.addUnwalkable(assetFolder[attributes.getNamedItem("path").value]);
	}
	
	var motionPaths = paths[0].getElementsByTagName("motionpath");
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
		if(candidates[i].nodeName=="trigger"){
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
