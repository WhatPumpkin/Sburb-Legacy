//requires Sprite.js, inheritance.js

function Character(x,y,width,height,sx,sy,sWidth,sHeight,sheet){
inherit(this,new Sprite(x,y,sx,sy,null,null,MG_DEPTHING));

this.width = width;
this.height = height;
this.speed = 9;

sWidth = typeof sWidth == Number ? sWidth : width;
sHeight = typeof sHeight == Number ? sHeight : height;

this.addAnimation(new Animation(sheet,sWidth,sHeight,0,1,2),"idleFront");
this.addAnimation(new Animation(sheet,sWidth,sHeight,1,1,2),"idleRight");
this.addAnimation(new Animation(sheet,sWidth,sHeight,2,1,2),"idleBack");
this.addAnimation(new Animation(sheet,sWidth,sHeight,3,1,2),"idleLeft");
this.addAnimation(new Animation(sheet,sWidth,sHeight,4,2,4),"walkFront");
this.addAnimation(new Animation(sheet,sWidth,sHeight,6,2,4),"walkRight");
this.addAnimation(new Animation(sheet,sWidth,sHeight,8,2,4),"walkBack");
this.addAnimation(new Animation(sheet,sWidth,sHeight,10,2,4),"walkLeft");

this.startAnimation("walkFront");
}
