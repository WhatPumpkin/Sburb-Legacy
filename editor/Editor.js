var editAssets;
var editSprites;
var editRooms;

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
}

function editSerial(serialText, sburbID) {
    var inText = serialText; //document.getElementById("serialText");
    var parser=new DOMParser();
    var input=parser.parseFromString(inText,"text/xml");

    if(sburbID) {
		input = input.getElementById(sburbID);
    } else {
  		input = input.documentElement;
    }
    // add assets
    assetsNodes = input.getElementsByTagName("Asset")
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
