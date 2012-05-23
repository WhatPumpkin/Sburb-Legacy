function Trigger(info,action,followUp){
	this.info = info;
	this.followUp = followUp?followUp:null;
	this.action = action?action:null;
	var params = info.splice;
	this.type = params[0];
	
	if(this.type=="spriteProperty"){
		this.entity = sprites[params[1]];
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
		var queryParts = query.splice(token);
		this.property = queryParts[0].trim();
		this.target = parseInt(queryParts[1].trim());
		
		this.checkCompletion = function(){
			return this.trigger(this.entity,this.property,this.target);
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
			return entity.animation.hasPlayed();
		};
	}
	
	this.tryToTrigger = function(){
		if(this.checkCompletion()){
			if(this.action){
				curAction = this.action;
				performAction(curAction);
			}
			if(this.followUp){
				this.followUp.tryToTrigger();
			}
		}
	}
	
	this.serialize = function(output){
		output = output.concat("\n<Trigger>");
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
		if(actions.length>0){
			action = parseXMLAction(actions[0]);
		}
		var trigger = new Trigger(info,action);
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
