function Action(name,command,info,sprite){
	this.sprite = sprite?sprite:null;
	this.name = name;
	this.command = command
	this.info = info;
	
	this.serialize = function(output){
		var spriteName = "null";
		if(sprite){
			spriteName = this.sprite.name;
		}
		output = output.concat("<Action sprite='"+spriteName+"' name='"+this.name+"' command='"+this.command+"' info='"+this.info+"' />");
		return output;
	}
}
