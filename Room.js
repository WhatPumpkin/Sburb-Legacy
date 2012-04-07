function Room(name,width,height){
	this.width = width;
	this.height = height;
	this.sprites = new Array();
	this.walkables = new Array();
	this.unwalkables = new Array();
	this.name = name;
    this.motionPaths = new Array();
	
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
		var queries = {upRight:{x:sprite.x+sprite.width/2,y:sprite.y-sprite.height/2},
					 upLeft:{x:sprite.x-sprite.width/2,y:sprite.y-sprite.height/2},
					 downLeft:{x:sprite.x-sprite.width/2,y:sprite.y+sprite.height/2},
					 downRight:{x:sprite.x+sprite.width/2,y:sprite.y+sprite.height/2}}
		var result = this.isInBoundsBatch(queries);
		return result.upRight && result.upLeft && result.downRight && result.downLeft;
	}
	
	this.isInBoundsBatch = function(queries,results){
		if(typeof results != "object"){
			results = {};
			for(var queryName in queries){
				results[queryName] = false;
			}
		}
		for(var i=0;i<this.walkables.length;i++){
			this.buildPath(this.walkables[i]);
			for(var queryName in queries){
				var query = queries[queryName];
				results[queryName] = results[queryName] || stage.isPointInPath(query.x,query.y);
			}
			this.clearPath();
		}
		for(var i=0;i<this.unwalkables.length;i++){
			this.buildPath(this.unwalkables[i]);
			for(var queryName in queries){
				var query = queries[queryName];
				results[queryName] = results[queryName] && !stage.isPointInPath(query.x,query.y);
			}
			this.clearPath();
		}
		return results;
	}
	
	this.isInPathsBatch = function(queries,paths){
		var results = {};
		for(var queryName in queries){
			results[queryName] = false;
		}
		for(var i=0;i<paths.length;i++){
			this.buildPath(paths[i]);
			for(var queryName in queries){
				var query = queries[queryName];
				results[queryName] = results[queryName] || stage.isPointInPath(query.x,query.y);
			}
			this.clearPath();
		}
	}
	
	this.buildPath = function(path){
		stage.save();
		stage.beginPath();
		stage.moveTo(path[0].x,path[0].y);
		for(var i=1;i<path.length;i++){
			stage.lineTo(path[i].x,path[i].y);
		}
	}
	
	this.clearPath = function(path){
		stage.restore();
	}
	
	this.isBufferable = function(sprite){
		for(i=0; i<this.motionPaths.length; i++) {
			var motionPath = this.motionPaths[i];
			var path = motionPath.path;
			stage.save();
			stage.beginPath();
			stage.moveTo(path[0].x, path[0].y);
			for(var j=1;j<path.length;j++) {
				stage.lineTo(path[j].x, path[j].y);
			}
			var result = stage.isPointInPath(sprite.x+sprite.width/2,sprite.y+sprite.height/2)
					|| stage.isPointInPath(sprite.x-sprite.width/2,sprite.y+sprite.height/2)
					|| stage.isPointInPath(sprite.x-sprite.width/2,sprite.y-sprite.height/2)
					|| stage.isPointInPath(sprite.x+sprite.width/2,sprite.y-sprite.height/2);
			stage.restore();
			if(result){
				return true;
			}
		}
		return false;
	}
	
	this.getMovementBuffer = function(sprite){
		var result = {x:0,y:0}
		stage.save();
		stage.beginPath();
		stage.moveTo(this.walkable[0].x,this.walkable[0].y);
		for(var i=1;i<this.walkable.length;i++){
			stage.lineTo(this.walkable[i].x,this.walkable[i].y);
		}
		do{
			var downRightIn = stage.isPointInPath(sprite.x+result.x+sprite.width/2,sprite.y+result.y+sprite.height/2);
			var downLeftIn = stage.isPointInPath(sprite.x+result.x-sprite.width/2,sprite.y+result.y+sprite.height/2);
			var upLeftIn = stage.isPointInPath(sprite.x+result.x-sprite.width/2,sprite.y+result.y-sprite.height/2);
			var upRightIn = stage.isPointInPath(sprite.x+result.x+sprite.width/2,sprite.y+result.y-sprite.height/2);
			if(!upLeftIn){
				result.x+=3;
				result.y+=3;
			}
			if(!upRightIn){
				result.x-=3;
				result.y+=3;
			}
			if(!downLeftIn){
				result.x+=3;
				result.y-=3;
			}
			if(!downRightIn){
				result.x-=3;
				result.y-=3;
			}
		}while(!downRightIn || !downLeftIn || !upLeftIn || !downRightIn);
		stage.restore();
		return result;
	}
	
    this.getMoveFunction = function(sprite) {
		var result;
		for(i=0; i<this.motionPaths.length; i++) {
			var motionPath = this.motionPaths[i];
			var path = motionPath.path;
			stage.save();
			stage.beginPath();
			stage.moveTo(path[0].x, path[0].y);
			for(var j=1;j<path.length;j++) {
				stage.lineTo(path[j].x, path[j].y);
			}
			var shouldMove = stage.isPointInPath(sprite.x,sprite.y);
			if(shouldMove) {
				result = function(ax, ay) {
					var fx,fy;
					fx = Math.round((ax*motionPath.xtox + ay*motionPath.ytox + motionPath.dx)/3)*3;
					fy = Math.round((ax*motionPath.xtoy + ay*motionPath.ytoy + motionPath.dy)/3)*3;
					return {x:fx,y:fy};
				};
				stage.restore();
				return result;

			}
			stage.restore();
		}	
    }
    
	this.serialize = function(output){
		output = output.concat("<Room name='"+this.name+"' width='"+this.width+"' height='"+this.height+"'>");
		output = output.concat("<Paths>");
		for(var i=0;i<this.walkables.length;i++){
			var walkable = this.walkables[i];
			output = output.concat("<Walkable path='"+walkable.name+"'/>");
		}
		for(var i=0;i<this.unwalkables.length;i++){
			var unwalkable = this.unwalkables[i];
			output = output.concat("<Unwalkable path='"+unwalkable.name+"'/>");
		}
		for(var i=0;i<this.motionPaths.length;i++){
			var motionPath = this.motionPaths[i];
			 output = output.concat("<MotionPath path='"+motionPath.path.name+"' xtox='"+motionPath.xtox+"' xtoy='"+motionPath.xtoy+
			 "' ytox='"+motionPath.ytox+"' ytoy='"+motionPath.ytoy+"' dx='"+motionPath.dx+"' dy='"+motionPath.dy+"'/>");
		}
		output = output.concat("</Paths>");
		
		for(var sprite in this.sprites){
			output = this.sprites[sprite].serialize(output);
		}
		
		output = output.concat("</Room>");
		return output;
	}
	
	
}
