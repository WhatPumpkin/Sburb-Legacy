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
	this.type = null;
	
	this.reset();
}

//parse the trigger info into an actual event to watch
Sburb.Trigger.prototype.reset = function(){
	var params = this.info.split(",");
	this.type = params[0];

	if(this.type=="spriteProperty"){
		if(params[1]=="char"){
			this.entity = params[1];
		}else{
			this.entity = Sburb.sprites[params[1]];
		}
		var token;	
		var query = params[2];
		if(query.indexOf(">")>-1){
			token = ">";
			this.trigger = function(entity,property,target){
				return entity[property]>target;
			};		
		}else if(query.indexOf("<")>-1){
			token = "<";
			this.trigger = function(entity,property,target){
				return entity[property]<target;
			};		
		}else if(query.indexOf("=")>-1){
			token = "=";
			this.trigger = function(entity,property,target){
				return entity[property]==target;
			};		
		}
		var queryParts = query.split(token);
		this.property = queryParts[0].trim();
		this.target = parseInt(queryParts[1].trim());
	
		this.checkCompletion = function(){
			var entity = this.entity;
			if(this.entity=="char"){
				entity = Sburb.char;
			}
			return this.trigger(entity,this.property,this.target);
		}
	
	}else if(this.type=="time"){
		this.time = parseInt(params[1]);
	
		this.checkCompletion = function(){
			this.time--;
			return this.time<=0;
		};
	
	}else if(this.type=="played"){
		this.entity = Sburb.sprites[params[1]];
		this.checkCompletion = function(){
			var entity = this.entity;
			if(this.entity=="char"){
				entity = Sburb.char;
			}
			return entity.animation.hasPlayed();
		};
	}else if(this.type=="movie"){
		this.movie = window.document.getElementById("movie"+params[1]);
		this.threshold = parseInt(params[2]);
		this.checkCompletion = function(){
			if(this.movie && this.movie.TotalFrames()>0 && this.movie.TotalFrames()-1-this.movie.CurrentFrame()<=this.threshold){
				Sburb.commands.removeMovie(params[1]);
				return true;
			}
			return false;
		}
	}
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
	output = output.concat(this.info);
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
		var info = triggerNode.firstChild.nodeValue.trim();
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

return Sburb;
})(Sburb || {});
