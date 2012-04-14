//requires Animation.js

var BG_DEPTHING = 0;
var MG_DEPTHING = 1;
var FG_DEPTHING = 2;
function Sprite(name,x,y,width,height,dx,dy,depthing,collidable){
	this.x = x;
	this.y = y;
	this.dx = typeof dx == "number" ? dx : 0;
	this.dy = typeof dy == "number" ? dy : 0;
	this.width = width;
	this.height = height;
	this.depthing = typeof depthing == "number" ? depthing : BG_DEPTHING; //bg, fg, or mg
	this.collidable = typeof collidable == "boolean" ? collidable : false;
	this.animations = {};
	this.animation = null;
	this.state = null;
	this.lastTime = 0;
	this.actions = new Array();
	this.name = name;
	
	this.addAnimation = function(anim){
		this.animations[anim.name] = anim;
	}
	
	this.startAnimation = function(name){
		if(this.state!=name){
			this.animation = this.animations[name];
			this.animation.reset();
			this.state = name;
		}
	}
	
	this.update = function(gameTime){
		this.animation.update(1);
	}
	this.staticImg = function() {
		return this.animation.staticImg();
	}
	
	this.draw = function(){
		if(this.animation!=null){
			this.animation.draw(this.x,this.y);
		}
	}
	this.drawMeta = function(){
		stage.save();
			stage.strokeStyle = "rgb(200,40,40)";
			stage.beginPath();
			stage.moveTo(this.x-this.width/2,this.y-this.height/2);
			stage.lineTo(this.x-this.width/2,this.y+this.height/2);
			stage.lineTo(this.x+this.width/2,this.y+this.height/2);
			stage.lineTo(this.x+this.width/2,this.y-this.height/2);	
			stage.lineTo(this.x-this.width/2,this.y-this.height/2);
			stage.closePath();
			stage.stroke();
			
			stage.beginPath();
			stage.moveTo(this.x+3,this.y);
			stage.lineTo(this.x-3,this.y);
			stage.closePath();
			stage.stroke();
			
			stage.beginPath();
			stage.moveTo(this.x,this.y+3);
			stage.lineTo(this.x,this.y-3);
			stage.closePath();
			stage.stroke();
		stage.restore();
	}
	
	this.isBehind = function(other){
		if(this.depthing == other.depthing){
			return this.y+this.dy<other.y+other.dy;
		}else{
			return this.depthing<other.depthing;
		}
	}
	
	this.collides = function(other){
	    if(other.collidable){
		if( (this.x-this.width/2<other.x+other.width/2) &&
		    (this.x+this.width/2>other.x-other.width/2) &&
		    (this.y-this.height/2<other.y+other.height/2) &&
		    (this.y+this.height/2>other.y-other.height/2) ) {
		    return true;
		}
	    }
	    return false;
	}
	this.hitsPoint = function(x,y){
	    if( (this.x-this.width/2 <=x) &&
		(this.x+this.width/2 >=x) &&
		(this.y-this.height/2 <=y) &&
		(this.y+this.height/2 >=y) ) {
		return true;
	    }
	    return false;
	}
	
	this.tryToMove = function(vx,vy,room){
	    var i;
	    var moveMap = room.getMoveFunction(this);
	    var wasShifted = false;
	    if(moveMap) {
	    	//console.log("stairs!");
			l = moveMap(vx, vy);
			if(vx!=l.x || vy!=l.y){
				wasShifted = true;
			}
			vx = l.x;
			vy = l.y;
	    }
		this.x += vx;
		this.y += vy;
		if(this.collidable){
			for(i=0;i<room.sprites.length;i++){
				if(room.sprites[i]!=this){
				    if(this.collides(room.sprites[i])){
						this.x -=vx;
						this.y -=vy;
						return false;
					}
				}
			}
			if(!room.isInBounds(this)){
				if((moveMap && wasShifted) || (!moveMap && room.isBufferable(this))){
					//console.log("no clip!");
					var adjustment = room.getMovementBuffer(this);
					this.x += adjustment.x;
					this.y += adjustment.y;
				}else{
					//console.log("no move!");
					this.x -=vx;
					this.y -=vy;
					return false;
				}
			}
		}
		return true;
	}
	
	this.addAction = function(action){
		this.actions.push(action);
	}
	
	this.getActions = function(sprite){
		var validActions = new Array();
		for(var i=0;i<this.actions.length;i++){
			if(!this.actions[i].sprite || this.actions[i].sprite==sprite){
				validActions.push(this.actions[i]);
			}
		}
		return validActions;
	}
	
	this.serialize = function(output){
		output = output.concat("<Sprite name='"+this.name+"' x='"+this.x+"' y='"+this.y+
									"' dx='"+this.dx+"' dy='"+this.dy+"' width='"+this.width+"' height='"+this.height+
									"' depthing='"+this.depthing+"' collidable='"+this.collidable+"' state='"+this.state+"'>");
		for(var anim in this.animations){
			output = this.animations[anim].serialize(output);
		}
		for(var action in this.actions){
			output = this.actions[action].serialize(output);
		}
		output = output.concat("</Sprite>");
		return output;
	}
	
}
