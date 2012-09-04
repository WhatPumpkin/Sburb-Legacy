var Sburb = (function(Sburb){






/////////////////////////////////////////
//Trigger Class
/////////////////////////////////////////

//constructor
Sburb.Trigger = function(info,action,followUp,restart,detonate){
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.action = action?action:null;
	this.restart = restart?restart:false;
	this.detonate = detonate?detonate:false;

	var params = this.info.split(",");
	this.type = params[0];

	this.event = new Sburb.events[this.type](this.info);
	this.reset();
}

//parse the trigger info into an actual event to watch
Sburb.Trigger.prototype.reset = function(){
	return this.event.reset();
}

Sburb.Trigger.prototype.checkCompletion = function(){
	return this.event.checkCompletion();
}

//check if the trigger has been satisfied
Sburb.Trigger.prototype.tryToTrigger = function(){
	if(this.checkCompletion()){
		if(this.action){
			Sburb.performAction(this.action);
		}
		if(this.followUp){
			if(this.followUp.tryToTrigger()){
				this.followUp = null;
			}
		}
		if(this.restart){
			reset();
		}
		return this.detonate;
	}
}

//Serialize the Trigger to XML
Sburb.Trigger.prototype.serialize = function(output){
	output = output.concat("\n<trigger"+
		(this.restart?" restart='true'":"")+
		(this.detonate?" detonate='true'":"")+
		">");
	output = output.concat("<args>"+escape(this.info)+"</args>");
	if(this.action){
		output = this.action.serialize(output);
	}
	if(this.followUp){
		output = this.followUp.serialize(output);
	}
	output = output.concat("\n</trigger>");
	return output;
}







////////////////////////////////////////on
//Related Utility Functions
////////////////////////////////////////

//Parse a Trigger from XML
Sburb.parseTrigger = function(triggerNode){
	var firstTrigger = null;
	var oldTrigger = null;
	do{
		var attributes = triggerNode.attributes;
		var info = unescape(getNodeText(triggerNode).trim());
		var actions = triggerNode.getElementsByTagName("action");
		
		var action = null;
		var restart = false;
		var detonate = false;
		if(actions.length>0 && actions[0].parentNode==triggerNode){
			action = Sburb.parseAction(actions[0]);
		}
		restart = attributes.getNamedItem("restart")?attributes.getNamedItem("restart").value=="true":restart;
		detonate = attributes.getNamedItem("detonate")?attributes.getNamedItem("detonate").value=="true":detonate;
		
		var trigger = new Sburb.Trigger(info,action,null,restart,detonate);
		
		if(!firstTrigger){
			firstTrigger = trigger;
		}
		if(oldTrigger){
			oldTrigger.followUp = trigger;
		}
		oldTrigger = trigger;
		var triggerNodes = triggerNode.getElementsByTagName("trigger");
		if(triggerNodes){
			triggerNode = triggerNodes[0];
		}else{
			break;
		}
	}while(triggerNode)
	return firstTrigger;
}



function getNodeText(xmlNode){
  if(!xmlNode) return '';
  for(var i=0;i<xmlNode.childNodes.length;i++){
  	var child = xmlNode.childNodes[i];
  	if(child.tagName=="args"){
  		for(var k=0;k<child.childNodes.length;k++){
				if(child.childNodes[k].firstChild){
					serializer = new XMLSerializer();
					var output = "";
					for(var j=0; j<child.childNodes.length; j++){
						output += serializer.serializeToString(child.childNodes[j]);
					}
					return output;
				}
			}
			if(typeof(child.textContent) != "undefined"){
				return child.textContent;
			}
			return child.firstChild.nodeValue;
		}
	}
	return xmlNode.firstChild.nodeValue;
}


return Sburb;
})(Sburb || {});
