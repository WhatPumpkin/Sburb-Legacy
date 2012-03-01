var editAssets;

function editMode() {

    editAssets = new EditAssets();

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

    displayAssets();
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
