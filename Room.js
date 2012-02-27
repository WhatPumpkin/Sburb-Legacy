function Room(name,width,height,walkable){
	this.width = width;
	this.height = height;
	this.sprites = new Array();
	this.walkable = walkable;
	this.name = name;
	this.bgm = null;
	
	this.addSprite = function(sprite){
		this.sprites.push(sprite);
	}
	this.removeSprite = function(sprite){
		var i;
		for(i=0;i<this.sprites.length;i++){
			if(this.sprites[i]==sprite){
				this.sprites.splice(i,1);
				return true;
			}
		}
		return false;
	}
    this.setBGM = function(audioObj) {
		this.bgm = audioObj;
    }
    this.initialize = function() {
		// turn on BGM if any
		changeBGM(this.bgm);
		// do any script actions there might be
    }
	this.contains = function(sprite){
		for(var i=0;i<this.sprites.length;i++){
			if(this.sprites[i]==sprite){
				return true;
			}
		}
		return false;
	}
	
	this.update = function(gameTime){
		var i;
		for(i=0;i<this.sprites.length;i++){
			this.sprites[i].update(gameTime);
		}
	}
	this.draw = function(){
		this.sortDepths();
		var i;
		for(i=0;i<this.sprites.length;i++){
			this.sprites[i].draw();
		}
	}
	
	this.sortDepths = function(){
		//insertion sort?!?
		var i=0;
		var j=0;
		var temp;
		for(i=1,j=1;i<this.sprites.length;i++,j=i){
			temp = this.sprites[j];
			while(j>0 && this.sprites[j].isBehind(this.sprites[j-1])){
				this.sprites[j] = this.sprites[j-1]
				j--;
			}
			this.sprites[j] = temp;
		}
	}
	
	this.queryActions = function(query,x,y){
		var validActions = new Array();
		for(var i=0;i<this.sprites.length;i++){
			if(this.sprites[i].hitsPoint(x,y)){
				validActions = validActions.concat(this.sprites[i].getActions(query));
			}
		}
		return validActions;
	}
	this.isInBounds = function(sprite){
		stage.save();
		stage.beginPath();
		stage.moveTo(this.walkable[0].x,this.walkable[0].y);
		for(var i=1;i<this.walkable.length;i++){
			stage.lineTo(this.walkable[i].x,this.walkable[i].y);
		}
		var result = stage.isPointInPath(sprite.x+sprite.width/2,sprite.y+sprite.height/2)
				&& stage.isPointInPath(sprite.x-sprite.width/2,sprite.y+sprite.height/2)
				&& stage.isPointInPath(sprite.x-sprite.width/2,sprite.y-sprite.height/2)
				&& stage.isPointInPath(sprite.x+sprite.width/2,sprite.y-sprite.height/2);
		stage.restore();
		return result;
	}
	this.serialize = function(output){
		output = output.concat("<Room name='"+this.name+"' width='"+this.width+"' height='"+this.height+"' walkable='"+this.walkable.name+
								"' bgm='"+this.bgm.asset.name+"' bgStart='"+this.bgm.asset.startLoop+"' bgPriority='"+this.bgm.priority+"'>");
		for(var sprite in this.sprites){
			output = this.sprites[sprite].serialize(output);
		}
		output = output.concat("</Room>");
		return output;
	}
	
	
}
