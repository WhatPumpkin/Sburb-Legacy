function Action(name,command,info,sprite,followUp,noWait){
	this.sprite = sprite?sprite:null;
	this.name = name;
	this.command = command
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.noWait = noWait?noWait:false;
	
	this.serialize = function(output){
		output = output.concat("\n<Action "+
			"command='"+this.command+
			(this.sprite?"sprite='"+this.sprite.name:"")+
			(this.name?"' name='"+this.name:"")+
			(this.noWait?"' noWait='"+this.noWait:"")+
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
	var targSprite = null;
	var firstAction = null;
	var oldAction = null;
	do{
	  	var attributes = node.attributes;
		
		if(attributes.getNamedItem("sprite") && attributes.getNamedItem("sprite").value!="null"){
			targSprite = sprites[attributes.getNamedItem("sprite").value];
		}

		var newAction = new Action(
					 attributes.getNamedItem("name")?attributes.getNamedItem("name").value:null,
					 attributes.getNamedItem("command").value,
					 node.firstChild.nodeValue.trim(),
					 targSprite,
					 null,
					 attributes.getNamedItem("noWait")?attributes.getNamedItem("noWait").value=="true":false);
					 
		if(oldAction){
			oldAction.followUp = newAction;
		}
		if(!firstAction){
			firstAction = newAction;
		}
		oldAction = newAction;
		var nodes = node.getElementsByTagName("Action");
		if(nodes){
			node = nodes[0];
		}else{
			break;
		}
	}while(node);
	
	return firstAction;
}
