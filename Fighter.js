function Fighter(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet){
	inherit(this,new Character(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet));
	
	this.accel = 1.5;
	this.decel = 1;
	this.friction = 0.9;
	this.vx = 0;
	this.vy = 0;
	
	this.baseUpdate = this.update;
	
	this.update = function(){
		this.tryToMove(curRoom);
		this.baseUpdate();
	}
	
	this.handleInputs = function(pressed){
		var moved = false;
		if(pressed[Keys.down] || pressed[Keys.s]){
			this.moveDown(curRoom); moved = true;
		}else if(pressed[Keys.up] || pressed[Keys.w]){
			this.moveUp(curRoom); moved = true;
		}
		if(pressed[Keys.left] || pressed[Keys.a]){
			this.moveLeft(curRoom); moved = true;
		}else if(pressed[Keys.right] || pressed[Keys.d]){
			this.moveRight(curRoom); moved = true;
		}
		if(!moved){
			this.idle();
		}
	}
	
	this.moveUp = function(room){
		this.walk();
		this.vy-=this.accel;
	}
	this.moveDown = function(room){
		this.walk();
		this.vy+=this.accel;
	}
	this.moveLeft = function(room){
		this.walk();
		this.vx-=this.accel;
	}
	this.moveRight = function(room){
		this.walk();
		this.vx+=this.accel;
	}
	
	this.collides = function(sprite,dx,dy){
		if(!this.width || !sprite.width){
			return false;
		}
		var x1 = this.x+(dx?dx:0);
		var y1 = this.y+(dy?dy:0);
		var w1 = this.width/2;
		var h1 = this.height/2;
		
		var x2 = sprite.x;
		var y2 = sprite.y;
		var w2 = sprite.width/2;
		var h2 = sprite.height/2;
		
		var xDiff = x2-x1;
		var yDiff = y2-y1;
		return Math.sqrt(xDiff*xDiff/w2/w1+yDiff*yDiff/h2/h1)<2;
	}
	
	this.getBoundaryQueries = function(){
		var queries = {};
		var queryCount = 10;
		var angleDiff = 2*Math.PI/queryCount;
		for(var i=0,theta=0;i<queryCount;i++,theta+=angleDiff){
			queries["pt"+i] = {x:this.x+Math.cos(theta)*this.width/2 ,y:this.y+Math.sin(theta)*this.height/2};
		}
		return queries;
	}
	
	this.tryToMove = function(room){
		this.vx*=this.friction;
		this.vy*=this.friction;
		var vx = this.vx;
		var vy = this.vy;
		var i;
		var moveMap = room.getMoveFunction(this);
		var wasShifted = false;
		if(moveMap) { //our motion could be modified somehow
			l = moveMap(vx, vy);
			if(vx!=l.x || vy!=l.y){
				wasShifted = true;
			}
			vx = l.x;
			vy = l.y;
		}
		var minX = Stage.scaleX;
		var minY = Stage.scaleY;
		while(Math.abs(vx)>=minX || Math.abs(vy)>=minY){
			var dx = 0;
			var dy = 0;
			if(Math.abs(vx)>=minX){
				dx=Math.round((minX)*vx/Math.abs(vx));
				this.x+=dx;
				vx-=dx;
			}
			if(Math.abs(vy)>=minY){
				dy=Math.round((minY)*vy/Math.abs(vy));
				this.y+=dy;
				vy-=dy;
			}
			
			var collision;
			if(collision = room.collides(this)){
				var fixed = false;
				if(dx!=0){
					if(!this.collides(collision,0,minY)){
						dy+=minY;
						this.y+=minY;
						fixed = true;
					}else if(!this.collides(collision,0,-minY)){
						dy-=minY;
						this.y-=minY;
						fixed = true;
					}
				}
				if(!fixed && dy!=0){
					if(!this.collides(collision,minX,0)){
						dx+=minX;
						this.x+=minX;
						fixed = true;
					}else if(!this.collides(collision,-minX,0)){
						dx-=minX;
						this.x-=minX;
						fixed = true;
					}
				}
				if(!fixed || room.collides(this)){
					this.x-=dx;
					this.y-=dy;
					return false;
				}
			}
			
			if(!room.isInBounds(this)){
				var fixed = false;
				if(dx!=0){
					if(room.isInBounds(this,0,minY)){
						dy+=minY;
						this.y+=minY;
						fixed = true;
					}else if(room.isInBounds(this,0,-minY)){
						dy-=minY;
						this.y-=minY;
						fixed = true;
					}
				}
				if(!fixed && dy!=0){
					if(room.isInBounds(this,minX,0)){
						dx+=minX;
						this.x+=minX;
						fixed = true;
					}else if(room.isInBounds(this,-minX,0)){
						dx-=minX;
						this.x-=minX;
						fixed = true;
					}
				}
				if(!fixed){
					this.x-=dx;
					this.y-=dy;
					return false;
				}
			}
		}	
		return true;
	}
}
