function Trigger(info,action,followUp,restart,detonate){
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.action = action?action:null;
	this.restart = restart?restart:false;
	this.detonate = detonate?detonate:false;
	this.type = null;
	
	this.reset = function(){
		var params = this.info.split(",");
		this.type = params[0];
	
		if(this.type=="spriteProperty"){
			if(params[1]=="char"){
				this.entity = params[1];
			}else{
				this.entity = sprites[params[1]];
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
					entity = char;
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
			this.entity = sprites[params[1]];
			this.checkCompletion = function(){
				var entity = this.entity;
				if(this.entity=="char"){
					entity = char;
				}
				return entity.animation.hasPlayed();
			};
		}else if(this.type=="movie"){
			this.movie = window.document.movie;
			this.threshold = parseInt(params[2]);
			this.checkCompletion = function(){
				if(this.movie && this.movie.TotalFrames()>0 && this.movie.TotalFrames()-1-this.movie.CurrentFrame()<=this.threshold){
					removeMovieCommand();
					return true;
				}
				return false;
			}
		}
	}
	
	this.reset();
	
	this.tryToTrigger = function(){
		if(this.checkCompletion()){
			if(this.action){
				performAction(this.action);
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
	
	this.serialize = function(output){
		output = output.concat("\n<Trigger"+
			(this.restart?" restart='true'":"")+
			(this.detonate?" detonate='true'":"")+
			">");
		output = output.concat(info);
		if(action){
			output = action.serialize(output);
		}
		if(followUp){
			output = followUp.serialize(output);
		}
		output = output.concat("\n</Trigger>");
		return output;
	}
}

function parseTrigger(triggerNode){
	var firstTrigger = null;
	var oldTrigger = null;
	do{
		var attributes = triggerNode.attributes;
		var info = triggerNode.firstChild.nodeValue.trim();
		var actions = triggerNode.getElementsByTagName("Action");
		
		var action = null;
		var restart = false;
		var detonate = false;
		
		action = actions.length>0?parseAction(actions[0]):action;
		restart = attributes.getNamedItem("restart")?attributes.getNamedItem("restart").value=="true":restart;
		detonate = attributes.getNamedItem("detonate")?attributes.getNamedItem("detonate").value=="true":detonate;
		
		var trigger = new Trigger(info,action,null,restart,detonate);
		
		if(!firstTrigger){
			firstTrigger = trigger;
		}
		if(oldTrigger){
			oldTrigger.followUp = trigger;
		}
		oldTrigger = trigger;
		var triggerNodes = triggerNode.getElementsByTagName("Trigger");
		if(triggerNodes){
			triggerNode = triggerNodes[0];
		}else{
			break;
		}
	}while(triggerNode)
	return firstTrigger;
}
