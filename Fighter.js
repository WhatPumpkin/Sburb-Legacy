function Fighter(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet){
	inherit(new Character(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet));
	
	this.accel = 1;
	this.decel = 1;
	this.friction = 0.8;
}
