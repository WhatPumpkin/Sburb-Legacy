function StaticSprite(x,y,sx,sy,dx,dy,img,depthing,collidable){
	inherit(this,new Sprite(x,y,sx,sy,dx,dy,depthing,collidable));
	this.addAnimation(new Animation(img,img.width,img.height,0,1,1),"image");
	this.width = img.width;
	this.height = img.height;
	this.startAnimation("image");
}
