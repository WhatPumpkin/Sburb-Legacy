var Sburb = (function(Sburb){






/////////////////////////////////////////
//Trigger Class
/////////////////////////////////////////

//constructor
Sburb.Trigger = function(info,action,followUp,restart,detonate){
	//console.log("Trigger constructor with: "+info, info);
	if(typeof info == "string"){
		info = [info];
	}
	
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.action = action?action:null;
	this.restart = restart?restart:false;
	this.detonate = detonate?detonate:false;
	
	this.events = [];
	for(var i=0;i<info.length;i++){
		var inf = this.info[i].trim();
		var params = inf.split(",");
		var type = params[0];
		//console.log("parsed trigger args: "+type+"("+inf+")");
		this.events[i] = new Sburb.events[type](inf);
	}
	this.reset();
}

//parse the trigger info into an actual event to watch
Sburb.Trigger.prototype.reset = function(){
	for(var i=0; i<this.events.length; i++){
		this.events[i].reset();
	}
}

Sburb.Trigger.prototype.checkCompletion = function() {
	var result = true;
	for(var i=0;i<this.events.length;i++){
		result = result && this.events[i].checkCompletion();
	}
	return result;
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
		for(var i=0;i<this.info.length;i++){
			output = output.concat("<args>"+escape(this.info[i])+"</args>");
		}
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
		var info = getNodeText(triggerNode);
		for(var i=0;i<info.length;i++){
			info[i] = unescape(info[i]);
		}
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
  if(!xmlNode) return [];
  var outputs = [];
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
					outputs.push(output);
				}
			}
			if(typeof(child.textContent) != "undefined"){
				outputs.push(child.textContent);
			}else{
				outputs.push(child.firstChild.nodeValue);
			}
		}
	}
	if(outputs.length==0){
		outputs.push(xmlNode.firstChild.nodeValue);
	}
	return outputs;
}


return Sburb;
})(Sburb || {});
