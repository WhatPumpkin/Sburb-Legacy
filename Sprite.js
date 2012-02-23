//requires Animation.js

var BG_DEPTHING = 0;
var MG_DEPTHING = 1;
var FG_DEPTHING = 2;
function Sprite(x,y,sx,sy,dx,dy,depthing){
	this.x = x;
	this.y = y;
	this.sx = typeof sx == Number ? sx : 0;
	this.sy = typeof sy == Number ? sy : 0;
	this.dx = typeof dx == Number ? dx : 0;
	this.dy = typeof dy == Number ? dy : 0;
	this.rotation = 0;
	this.depthing = typeof dx == Number ? depthing : BG_DEPTHING; //bg, fg, or mg
	this.animations = {};
	this.animation = null;
	this.state = null;
	this.lastTime = 0;
	
	this.addAnimation = function(anim, name){
		this.animations[name] = anim;
	}
	
	this.startAnimation = function(name){
		this.animation = this.animations[name];
		this.animation.reset();
		this.state = name;
	}
	
	this.update = function(gameTime){
		this.animation.update(1);
	}
	
	this.draw = function(){
		this.animation.draw(this.x+this.sx,this.y+this.sy)
	}
	
}
