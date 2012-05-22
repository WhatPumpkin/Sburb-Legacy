function Action(name,command,info,sprite,followUp){
	this.sprite = sprite?sprite:null;
	this.name = name;
	this.command = command
	this.info = info;
	this.followUp = followUp?followUp:null;
	
	this.serialize = function(output){
		output = output.concat("\n<Action "+
			(this.sprite?"sprite='"+this.sprite.name:"")+
			(this.name?"' name='"+this.name:"")+
			"' command='"+this.command+
			"'>");
		output = output.concat(info.trim());
		if(this.followUp){
			output = this.followUp.serialize(output);
		}
		output = output.concat("</Action>");
		return output;
	}
}
function parseXMLAction(node) {
  var attributes = node.attributes;
  var targSprite;
  if(attributes.getNamedItem("sprite") && attributes.getNamedItem("sprite").value!="null"){
		targSprite = sprites[attributes.getNamedItem("sprite").value];
  } else {
		targSprite = null;
  }
  
  var newAction = new Action(
  				 (attributes.getNamedItem("name")?attributes.getNamedItem("name").value:null),
		       attributes.getNamedItem("command").value,
		       node.firstChild.nodeValue.trim(),
		       targSprite);
  var curNode = node;
  var curAction = newAction;
  while(curNode.getElementsByTagName("Action").length>0){
		var oldAction = curAction;
		var subNode = curNode.getElementsByTagName("Action")[0];
		var attributes = subNode.attributes;
		var targSprite;
		if(!attributes.getNamedItem("sprite") || attributes.getNamedItem("sprite").value=="null"){
			  targSprite = null;
		}else{
			  targSprite = sprites[attributes.getNamedItem("sprite").value];
		}
		var curAction = new Action(attributes.getNamedItem("name")?attributes.getNamedItem("name").value:null,
						 attributes.getNamedItem("command").value,
						 subNode.firstChild.nodeValue.trim(),
						 targSprite);
		oldAction.followUp = curAction;
		curNode = subNode;
  }
  return newAction;
}
