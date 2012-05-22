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
		if(this.animation.hasPlayed() && this.animation.followUp){
			this.startAnimation(this.animation.followUp);
		}else{
			this.animation.update(1);
		}
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
	
	this.collides = function(other,dx,dy){
		var x = this.x+(dx?dx:0);
		var y = this.y+(dy?dy:0);
		if(other.collidable){
			if( (x-this.width/2<other.x+other.width/2) &&
				 (x+this.width/2>other.x-other.width/2) &&
				 (y-this.height/2<other.y+other.height/2) &&
				 (y+this.height/2>other.y-other.height/2) ) {
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
	
	this.isVisuallyUnder = function(x,y){
		return this.animation.isVisuallyUnder(x-this.x,y-this.y);
	}
	
	this.addAction = function(action){
		this.actions.push(action);
	}
	
	this.removeAction = function(name){
		for(var i=0;i<this.actions.length;i++){
			if(this.actions[i].name==name){
				this.actions.splice(i,1);
				return;
			}
		}
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
		var animationCount = 0;
		for(anim in this.animations){
				animationCount++;
		}
	
		output = output.concat("\n<Sprite name='"+
			this.name+
			(this.x?"' x='"+this.x:"")+
			(this.y?"' y='"+this.y:"")+
			(this.dx?"' dx='"+this.dx:"")+
			(this.dy?"' dy='"+this.dy:"")+
			("' width='"+this.width)+
			("' height='"+this.height)+
			(this.depthing?"' depthing='"+this.depthing:"")+
			(this.collidable?"' collidable='"+this.collidable:"")+
			(animationCount>1?"' state='"+this.state:"")+
			"'>");

		for(var anim in this.animations){
			output = this.animations[anim].serialize(output);
		}
		for(var action in this.actions){
			output = this.actions[action].serialize(output);
		}
		output = output.concat("\n</Sprite>");
		return output;
	}
	
}
