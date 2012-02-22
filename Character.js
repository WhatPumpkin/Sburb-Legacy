//requires Sprite.js, inheritance.js

function Character(x,y){
inherit(this,new Sprite(x,y,null,null,MG_DEPTHING));
addAnimation(new Animation(),"idleLeft");
addAnimation(new Animation(),"idleRight");
addAnimation(new Animation(),"idleFront");
addAnimation(new Animation(),"idleBack");
addAnimation(new Animation(),"walkLeft");
addAnimation(new Animation(),"walkRight");
addAnimation(new Animation(),"walkFront");
addAnimation(new Animation(),"walkBack");
}
