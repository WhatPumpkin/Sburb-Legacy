function Trigger(info){
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
}
