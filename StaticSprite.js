function StaticSprite(name,x,y,sx,sy,dx,dy,img,depthing,collidable){
	inherit(this,new Sprite(name,x,y,img.width,img.height,sx,sy,dx,dy,depthing,collidable));
	this.addAnimation(new Animation("image",img,sx,sy,img.width,img.height,0,1,1));
	this.startAnimation("image");
}
