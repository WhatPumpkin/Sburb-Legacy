function Action(name,command,info,sprite,followUp){
	this.sprite = sprite?sprite:null;
	this.name = name;
	this.command = command
	this.info = info;
	this.followUp = followUp?followUp:null;
	
	this.serialize = function(output){
		var spriteName = "null";
		if(sprite){
			spriteName = this.sprite.name;
		}
		output = output.concat("<Action sprite='"+spriteName+"' name='"+this.name+"' command='"+this.command+"'>");
		output = output.concat(info);
		if(followUp){
			output = followUp.serialize(output);
		}
		output = output.concat("</Action>");
		return output;
	}
}
