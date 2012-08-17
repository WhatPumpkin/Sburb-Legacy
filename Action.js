var Sburb = (function(Sburb){




///////////////////////////////////////////////
//Action Class
///////////////////////////////////////////////

//Constructor
Sburb.Action = function(command,info,name,sprite,followUp,noWait,noDelay,times,soft,silent){
	this.sprite = sprite?sprite:null;
	this.name = name?name:null;
	this.command = command
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.noWait = noWait?noWait:false;
	this.noDelay = noDelay?noDelay:false;
	this.soft = soft?soft:false;
	this.silent = silent?silent:false;
	this.times = times?times:1;
}

//Make an exact copy
Sburb.Action.prototype.clone = function(){
	return new Sburb.Action(this.command, this.info, this.name, this.sprite, this.followUp, this.noWait, this.noDelay, this.times, this.soft, this.silent);
}

//Serialize to XML (see serialization.js)
Sburb.Action.prototype.serialize = function(output){
	output = output.concat("\n<Action "+
		"command='"+this.command+
		(this.sprite?"sprite='"+this.sprite.name:"")+
		(this.name?"' name='"+this.name:"")+
		(this.noWait?"' noWait='"+this.noWait:"")+
		(this.noDelay?"' noDelay='"+this.noDelay:"")+
		(this.soft?"' soft='"+this.soft:"")+
		(this.silent?"' silent='"+this.silent:"")+
		(this.times!=1?"' times='"+this.times:"")+
		"'>");
	output = output.concat(this.info.trim());
	if(this.followUp){
		output = this.followUp.serialize(output);
	}
	output = output.concat("</Action>");
	return output;
}





//////////////////////////////////////////////////
//Related utility functions
//////////////////////////////////////////////////

//Parse a serialized Action from an XML DOM node
Sburb.parseAction = function(node) {
	var targSprite = null;
	var firstAction = null;
	var oldAction = null;
	do{
	  	var attributes = node.attributes;
		
		if(attributes.getNamedItem("sprite") && attributes.getNamedItem("sprite").value!="null"){
			targSprite = sprites[attributes.getNamedItem("sprite").value];
		}

		var newAction = new Sburb.Action(
					 attributes.getNamedItem("command").value,
					 node.firstChild?getNodeText(node).trim():"",
					 attributes.getNamedItem("name")?attributes.getNamedItem("name").value:null,
					 targSprite,
					 null,
					 attributes.getNamedItem("noWait")?attributes.getNamedItem("noWait").value=="true":false,
					 attributes.getNamedItem("noDelay")?attributes.getNamedItem("noDelay").value=="true":false,
					 attributes.getNamedItem("times")?parseInt(attributes.getNamedItem("times").value):1,
					 attributes.getNamedItem("soft")?attributes.getNamedItem("soft").value=="true":false,
					 attributes.getNamedItem("silent")?attributes.getNamedItem("silent").value=="true":false);
					 
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

function getNodeText(xmlNode){
    if(!xmlNode) return '';
    if(typeof(xmlNode.textContent) != "undefined") return xmlNode.textContent;
    return xmlNode.firstChild.nodeValue;
}



return Sburb;
})(Sburb || {});
