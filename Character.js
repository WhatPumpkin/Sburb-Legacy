//requires Sprite.js, inheritance.js

function Character(x,y,width,height,sx,sy,sWidth,sHeight,sheet){
inherit(this,new Sprite(x,y,sx,sy,null,null,MG_DEPTHING,true));

this.width = width;
this.height = height;
this.speed = 9;
this.facing = "Front";
this.npc = true;

sWidth = typeof sWidth == "number" ? sWidth : width;
sHeight = typeof sHeight == "number" ? sHeight : height;

this.addAnimation(new Animation(sheet,sWidth,sHeight,0,1,2),"idleFront");
this.addAnimation(new Animation(sheet,sWidth,sHeight,1,1,2),"idleRight");
this.addAnimation(new Animation(sheet,sWidth,sHeight,2,1,2),"idleBack");
this.addAnimation(new Animation(sheet,sWidth,sHeight,3,1,2),"idleLeft");
this.addAnimation(new Animation(sheet,sWidth,sHeight,4,2,8),"walkFront");
this.addAnimation(new Animation(sheet,sWidth,sHeight,6,2,8),"walkRight");
this.addAnimation(new Animation(sheet,sWidth,sHeight,8,2,8),"walkBack");
this.addAnimation(new Animation(sheet,sWidth,sHeight,10,2,8),"walkLeft");

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
	this.animations.walkFront.frameInterval = 8;
	this.animations.walkBack.frameInterval = 8;
	this.animations.walkLeft.frameInterval = 8;
	this.animations.walkRight.frameInterval = 8;
}

this.becomePlayer = function(){
	this.animations.walkFront.frameInterval = 4;
	this.animations.walkBack.frameInterval = 4;
	this.animations.walkLeft.frameInterval = 4;
	this.animations.walkRight.frameInterval = 4;
}

}
