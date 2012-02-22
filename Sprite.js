//requires Animation.js

var BG_DEPTHING = 0;
var MG_DEPTHING = 1;
var FG_DEPTHING = 2;
function Sprite(x,y,dx,dy,depthing){
	this.x = x;
	this.y = y;
	this.dx = typeof dx == Number ? dx : x;
	this.dy = typeof dy == Number ? dy : y;
	this.rotation = 0;
	this.depthing = typeof dx == Number ? depthing : BG_DEPTHING; //bg, fg, or mg
	this.animations = {};
	this.animation = null;
	this.lastTime = 0;
	
	this.addAnimation(anim, name){
		animations[name] = anim;
	}
	
	this.startAnimation(name){
		this.animation = this.animations[name];
	}
	
	this.update(gameTime){
		this.animation.update(gameTime);
	}
	
	this.draw(stage){
		this.animation.draw(this.x,this.y,
	}
	
}
