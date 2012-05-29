function Room(name,width,height){
	this.name = name;
	this.width = width;
	this.height = height;
	this.sprites = new Array();
	this.effects = new Array();
	this.walkables = new Array();
	this.unwalkables = new Array();
	this.motionPaths = new Array();
	this.triggers = new Array();
	
	this.addEffect = function(effect){
		this.effects.push(effect);
	}
	
	this.addTrigger = function(trigger){
		this.triggers.push(trigger);
	}
	
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
	
	this.addWalkable = function(path){
		this.walkables.push(path);
	}
	
	this.addUnwalkable = function(path){
		this.unwalkables.push(path);
	}
	
    this.addMotionPath = function(path, xtox,xtoy,ytox,ytoy,dx,dy) {
		var motionPath = new function (){
			this.path = path;
			this.xtox = xtox; this.xtoy = xtoy;
			this.ytox = ytox; this.ytoy = ytoy;
			this.dx = dx; this.dy = dy;
		};
		this.motionPaths.push(motionPath);
    }
    
    this.initialize = function() {
		// do we need this method anymore?
		// chained actions might make this obsolete
		return;
    }
    
    this.exit = function(){
    	this.effects = new Array();
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
		for(i=this.effects.length-1;i>=0;i--){
			if(this.effects[i].hasPlayed()){
				this.effects.splice(i,1);
			}else{
				this.effects[i].update(1);
			}
		}
		for(i=this.triggers.length-1;i>=0;i--){
			if(this.triggers[i].tryToTrigger()){
				this.triggers.splice(i,1);
			}
		}
	}
	
	this.draw = function(){
		this.sortDepths();
		
		for(var i=0;i<this.sprites.length;i++){
			this.sprites[i].draw();
		}
		for(i=0;i<this.effects.length;i++){
			this.effects[i].draw(0,0);
		}
	}
	/*
	this.drawMeta = function(){
		stage.fillStyle = "rgba(50,200,50,0.2)";
		for(var i=0;i<this.walkables.length;i++){
			this.buildPath(this.walkables[i]);
			stage.closePath();
			stage.stroke();
			stage.fill();
			this.clearPath();
		}
		stage.fillStyle = "rgba(200,50,50,0.2)";
		for(var i=0;i<this.unwalkables.length;i++){
			this.buildPath(this.unwalkables[i]);
			stage.closePath();
			stage.stroke();
			stage.fill();
			this.clearPath();
		}
		stage.fillStyle = "rgba(50,50,200,0.2)";
		for(var i=0;i<this.motionPaths.length;i++){
			this.buildPath(this.motionPaths[i].path);
			stage.closePath();
			stage.stroke();
			stage.fill();
			this.clearPath();
		}
		for(var i=0;i<this.sprites.length;i++){
			this.sprites[i].drawMeta();
		}
	}*/
	
	this.sortDepths = function(){
		//insertion sort?!?
		var i,j;
		for(i=1,j=1;i<this.sprites.length;i++,j=i){
			var temp = this.sprites[j];
			while(j>0 && temp.isBehind(this.sprites[j-1])){
				this.sprites[j] = this.sprites[j-1]
				j--;
			}
			this.sprites[j] = temp;
		}
	}
	
	this.queryActions = function(query,x,y){
		var validActions = new Array();
		for(var i=0;i<this.sprites.length;i++){
			var sprite = this.sprites[i];
			if(sprite!=query && sprite.hitsPoint(x,y)){
				validActions = validActions.concat(sprite.getActions(query));
			}
		}
		return validActions;
	}
	
	this.isInBounds = function(sprite,dx,dy){
		
		var queries = sprite.getBoundaryQueries(dx,dy);
		var result = this.isInBoundsBatch(queries);
		for(var point in result){
			if(!result[point]){
				return false;
			}
		}
		return true;
	}
	
	this.isInBoundsBatch = function(queries,results){
		if(typeof results != "object"){
			results = {};
			for(var queryName in queries){
				results[queryName] = false;
			}
		}
		for(var i=0;i<this.walkables.length;i++){
			this.walkables[i].queryBatchPos(queries,results);
		}
		for(var i=0;i<this.unwalkables.length;i++){
			this.unwalkables[i].queryBatchNeg(queries,results);
		}
		return results;
	}
	
	this.getMoveFunction = function(sprite) {
		var result;
		for(i=0; i<this.motionPaths.length; i++) {
			var motionPath = this.motionPaths[i];
			var shouldMove = motionPath.path.query({x:sprite.x,y:sprite.y});
			if(shouldMove) {
				result = function(ax, ay) {
					var fx,fy;
					fx = (ax*motionPath.xtox + ay*motionPath.ytox + motionPath.dx);
					fy = (ax*motionPath.xtoy + ay*motionPath.ytoy + motionPath.dy);
					return {x:fx,y:fy};
				};
				return result;
			}
		}	
	}
    
	this.collides = function(sprite){
		for(var i=0;i<this.sprites.length;i++){
			var theSprite = this.sprites[i];
			if(theSprite.collidable && sprite!=theSprite){
				if( sprite.collides(theSprite)){
					return theSprite;
				}
			}
		}
		return null;
	}
    
	this.serialize = function(output){
		output = output.concat("\n<Room name='"+this.name+"' width='"+this.width+"' height='"+this.height+"'>");
		output = output.concat("\n<Paths>");
		for(var i=0;i<this.walkables.length;i++){
			var walkable = this.walkables[i];
			output = output.concat("\n<Walkable path='"+walkable.name+"'/>");
		}
		for(var i=0;i<this.unwalkables.length;i++){
			var unwalkable = this.unwalkables[i];
			output = output.concat("\n<Unwalkable path='"+unwalkable.name+"'/>");
		}
		for(var i=0;i<this.motionPaths.length;i++){
			var motionPath = this.motionPaths[i];
			 output = output.concat("\n<MotionPath path='"+motionPath.path.name+"' xtox='"+motionPath.xtox+"' xtoy='"+motionPath.xtoy+
			 "' ytox='"+motionPath.ytox+"' ytoy='"+motionPath.ytoy+"' dx='"+motionPath.dx+"' dy='"+motionPath.dy+"'/>");
		}
		output = output.concat("\n</Paths>");
		output = output.concat("\n<Triggers>");
		for(var i=0;i<this.triggers.length;i++){
			otuput = this.triggers[i].serialize(output);
		}
		output = output.concat("\n</Triggers>");
		for(var sprite in this.sprites){
			output = this.sprites[sprite].serialize(output);
		}
		
		output = output.concat("\n</Room>");
		return output;
	}
}

function parseRoom(roomNode, assetFolder, spriteFolder) {
  	var attributes = roomNode.attributes;
  	var newRoom = new Room(attributes.getNamedItem("name").value,
  			       parseInt(attributes.getNamedItem("width").value),
  			       parseInt(attributes.getNamedItem("height").value));
  	serialLoadRoomSprites(newRoom,roomNode.getElementsByTagName("Sprite"), spriteFolder);
  	serialLoadRoomSprites(newRoom,roomNode.getElementsByTagName("Character"), spriteFolder);
	serialLoadRoomPaths(newRoom, roomNode.getElementsByTagName("Paths"), assetFolder);
	serialLoadRoomTriggers(newRoom,roomNode.getElementsByTagName("Triggers"),spriteFolder);
	return newRoom;
}
