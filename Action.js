function Action(command,info,name,sprite,followUp,noWait,noDelay){
	this.sprite = sprite?sprite:null;
	this.name = name?name:null;
	this.command = command
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.noWait = noWait?noWait:false;
	this.noDelay = noDelay?noDelay:false;
	
	this.serialize = function(output){
		output = output.concat("\n<Action "+
			"command='"+this.command+
			(this.sprite?"sprite='"+this.sprite.name:"")+
			(this.name?"' name='"+this.name:"")+
			(this.noWait?"' noWait='"+this.noWait:"")+
			(this.noDelay?"' noDelay='"+this.noDelay:"")+
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
					 attributes.getNamedItem("command").value,
					 node.firstChild.nodeValue.trim(),
					 attributes.getNamedItem("name")?attributes.getNamedItem("name").value:null,
					 targSprite,
					 null,
					 attributes.getNamedItem("noWait")?attributes.getNamedItem("noWait").value=="true":false,
					 attributes.getNamedItem("noDelay")?attributes.getNamedItem("noDelay").value=="true":false);
					 
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
