//requires Sprite.js, inheritance.js

function Character(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet){
	inherit(this,new Sprite(name,x,y,width,height,sx,sy,null,null,MG_DEPTHING,true));

	this.speed = 9;
	this.facing = "Front";
	this.npc = true;

	sWidth = typeof sWidth == "number" ? sWidth : width;
	sHeight = typeof sHeight == "number" ? sHeight : height;

	this.addAnimation(new Animation("idleFront",sheet,sWidth,sHeight,0,1,2));
	this.addAnimation(new Animation("idleRight",sheet,sWidth,sHeight,1,1,2));
	this.addAnimation(new Animation("idleBack",sheet,sWidth,sHeight,2,1,2));
	this.addAnimation(new Animation("idleLeft",sheet,sWidth,sHeight,3,1,2));
	this.addAnimation(new Animation("walkFront",sheet,sWidth,sHeight,4,2,4));
	this.addAnimation(new Animation("walkRight",sheet,sWidth,sHeight,6,2,4));
	this.addAnimation(new Animation("walkBack",sheet,sWidth,sHeight,8,2,4));
	this.addAnimation(new Animation("walkLeft",sheet,sWidth,sHeight,10,2,4));

	this.startAnimation("walkFront");

	this.moveUp = function(sprites){
		this.facing = "Back";
		this.walk();
		this.tryToMove(0,-this.speed,sprites);
	}
	this.moveDown = function(sprites){
		this.facing = "Front";
		this.walk();
		this.tryToMove(0,this.speed,sprites);
	}
	this.moveLeft = function(sprites){
		this.facing = "Left";
		this.walk();
		this.tryToMove(-this.speed,0,sprites);
	}
	this.moveRight = function(sprites){
		this.facing = "Right";
		this.walk();
		this.tryToMove(this.speed,0,sprites);
	}

	this.walk = function(){
		this.startAnimation("walk"+this.facing);
	}
	this.idle = function(){
		this.startAnimation("idle"+this.facing);
	}

	this.becomeNPC = function(){
		this.animations.walkFront.frameInterval = 12;
		this.animations.walkBack.frameInterval = 12;
		this.animations.walkLeft.frameInterval = 12;
		this.animations.walkRight.frameInterval = 12;
	}

	this.becomePlayer = function(){
		this.animations.walkFront.frameInterval = 4;
		this.animations.walkBack.frameInterval = 4;
		this.animations.walkLeft.frameInterval = 4;
		this.animations.walkRight.frameInterval = 4;
	}
	
	this.serialize = function(output){
		output = output.concat("<Character name='"+this.name+"' x='"+this.x+"' y='"+this.y+"' sx='"+this.sx+"' sy='"+this.sy+
									"' sWidth='"+this.animations.walkFront.colSize+
									"' sHeight='"+this.animations.walkFront.rowSize+"' width='"+this.width+"' height='"+this.height+
									"' sheet='"+this.animations.walkFront.sheet.name+"' state='"+this.state+"' facing='"+this.facing+"'>");
		//for(var anim in this.animations){
		//	output = this.animations[anim].serialize(output);
		//}
		for(var action in this.actions){
			output = this.actions[action].serialize(output);
		}
		output = output.concat("</Character>");
		return output;
	}

	this.becomeNPC();

}
