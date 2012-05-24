var editAssets;
var editSprites;
var editRooms;
var editEffects;
var dialoger;
var hud;
var initState;

// util function
function abs2relURL(url) {
    var l = location.href.split("/");
    url = url.replace(l.slice(0,l.length-1).join('/')+'/', "");
    return url;
}

function editMode() {
	
    editAssets = new EditAssets();
    editSprites = new EditSprites();
    editRooms = new EditRooms();
    editEffects = new EditEffects();
    buildCommands();
    
}

function editSerial(serialText, sburbID) {
	editMode();
    var inText = serialText; //document.getElementById("serialText");
    var parser=new DOMParser();
    var input=parser.parseFromString(inText,"text/xml");
	
    if(sburbID) {
		input = input.getElementById(sburbID);
    } else {
  		input = input.documentElement;
    }
    // add assets
    input.removeChild(input.getElementsByTagName("Classes")[0]);
    assetsNodes = input.getElementsByTagName("Asset")
    console.log(assetsNodes.length);
    for(var i=0; i<assetsNodes.length; i++) {
		aNode = assetsNodes[i];
		editAssets.add(parseSerialAsset(aNode));
    }
    // add sprites and characters
    var spriteNodes = input.getElementsByTagName("Sprite");    
    for(var i=0;i<spriteNodes.length;i++){
	  	var curSpriteNode = spriteNodes[i];
		editSprites.add(parseSprite(curSpriteNode, editAssets.assets));
    }
    var charNodes = input.getElementsByTagName("Character");
    for(var i=0;i<charNodes.length;i++){
	  	var curNode = charNodes[i];
		editSprites.add(parseCharacter(curNode, editAssets.assets));
    }
    // add rooms
    var newRooms = input.getElementsByTagName("Room");
    for(var i=0;i<newRooms.length;i++){
	  	var currRoom = newRooms[i];
		editRooms.add(parseRoom(currRoom, editAssets.assets, editSprites.sprites));
    }
    
    dialoger = new Dialoger();
  	dialoger.setBox(new StaticSprite("dialogBox",Stage.width+1,1000,null,null,null,null,editAssets.assets.dialogBox,FG_DEPTHING));
  	serialLoadDialogSprites(input.getElementsByTagName("HUD")[0].getElementsByTagName("DialogSprites")[0],editAssets.assets);

	serialLoadEffects(input.getElementsByTagName("Effects")[0],editAssets.assets,editEffects.effects);
	hud = {};
	
	var newButtons = input.getElementsByTagName("SpriteButton");
	for(var i=0;i<newButtons.length;i++){
		var curButton = newButtons[i];
		var attributes = curButton.attributes;
		var newButton = new SpriteButton(attributes.getNamedItem("name").value,
  									attributes.getNamedItem("x")?parseInt(attributes.getNamedItem("x").value):0,
  									attributes.getNamedItem("y")?parseInt(attributes.getNamedItem("y").value):0,
  									parseInt(attributes.getNamedItem("width").value),
  									parseInt(attributes.getNamedItem("height").value),
  									editAssets.assets[attributes.getNamedItem("sheet").value]);
  		hud[newButton.name] = newButton;
	}
	
	var rootInfo = input.attributes;
    initState = {};
    
    initState.char = editSprites.sprites[rootInfo.getNamedItem("char").value];
  	initState.curRoom = editRooms.rooms[rootInfo.getNamedItem("curRoom").value];
    
    displayMainMenu();
}

function editLevelFile(node) {
    if (!window.FileReader) {
		alert("This browser doesn't support reading files");
    }
    oFReader = new FileReader();
    if (node.files.length === 0) { return; }  
    var oFile = node.files[0];
    oFReader.onload = function() { editSerial(this.result); };
    oFReader.onerror = function(e) {console.log(e); }; // this should pop up an alert if googlechrome
    oFReader.readAsText(oFile);

}
