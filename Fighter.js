function Fighter(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet){
	inherit(this,new Sprite(name,x,y,width,height,null,null,MG_DEPTHING,true));
	
	this.accel = 1.5;
	this.decel = 1;
	this.friction = 0.9;
	this.vx = 0;
	this.vy = 0;
	
	sWidth = typeof sWidth == "number" ? sWidth : width;
	sHeight = typeof sHeight == "number" ? sHeight : height;
	
	this.spriteUpdate = this.update;
	
	this.update = function(curRoom){
		this.tryToMove(curRoom);
		this.spriteUpdate(curRoom);
	}
	
	this.handleInputs = function(pressed){
		var moved = false;
		if(pressed[Keys.down] || pressed[Keys.s]){
			this.moveDown(); moved = true;
		}else if(pressed[Keys.up] || pressed[Keys.w]){
			this.moveUp(); moved = true;
		}
		if(pressed[Keys.left] || pressed[Keys.a]){
			this.moveLeft(); moved = true;
		}else if(pressed[Keys.right] || pressed[Keys.d]){
			this.moveRight(); moved = true;
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
	
	this.getBoundaryQueries = function(dx,dy){
		var x = this.x+(dx?dx:0);
		var y = this.y+(dy?dy:0);
		var queries = {};
		var queryCount = 8;
		var angleDiff = 2*Math.PI/queryCount;
		for(var i=0,theta=0;i<queryCount;i++,theta+=angleDiff){
			queries[i] = {x:x+Math.cos(theta)*this.width/2 ,y:y+Math.sin(theta)*this.height/2};
		}
		return queries;
	}
	
	this.tryToMove = function(room){
		this.vx*=this.friction;
		this.vy*=this.friction;
		if(Math.abs(this.vx)<this.decel){
			this.vx = 0;
		}
		if(Math.abs(this.vy)<this.decel){
			this.vy = 0;
		}
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
		var dx = vx;
		var dy = vy;
		this.x+=vx;
		this.y+=vy;
		
		var collides = room.collides(this);
		if(collides){
			var tx = 0;
			var ty = 0;
			var theta = Math.atan2(this.y-collides.y,this.x-collides.x);
			var xOff = Math.cos(theta);
			var yOff = Math.sin(theta);
			while(this.collides(collides,tx,ty)){
				tx-=(dx-xOff)*0.1;
				ty-=(dy-yOff)*0.1;
			}
			if(room.collides(this,tx,ty)){
				this.x-=dx;
				this.y-=dy;
				return false;
			}
			this.x+=tx;
			this.y+=ty;
			dx+=tx;
			dy+=ty;
			
			var theta = Math.atan2(this.y-collides.y,this.x-collides.x);
			this.vx += tx;
			this.vy += ty;
			this.vx*=0.9;
			this.vy*=0.9;
		}

		var queries = room.isInBoundsBatch(this.getBoundaryQueries());
		var queryCount = 8;
		var collided = false;
		var hitX = 0;
		var hitY = 0;
		var angleDiff = 2*Math.PI/queryCount;
		for(var i=0,theta=0;i<queryCount;i++,theta+=angleDiff){
			var query = queries[i];
			if(!query){
				hitX+=Math.cos(theta);
				hitY+=Math.sin(theta);
				collided = true;
			}
		}
		
		if(collided){
			var tx = 0;
			var ty = 0;
			var theta = Math.atan2(hitY,hitX);
			var xOff = Math.cos(theta);
			var yOff = Math.sin(theta);
			var timeout = 0;
			while(!room.isInBounds(this,tx,ty) && timeout<20){
				tx-=xOff*2;
				ty-=yOff*2;
				timeout++;
			}
			if(timeout>=20 || room.collides(this,tx,ty)){
				console.log(tx,ty);
				this.x-=dx;
				this.y-=dy;
				return false;
			}
			this.x+=tx;
			this.y+=ty;
			dx+=tx;
			dy+=ty;
			
			this.vx += tx;
			this.vy += ty;
			this.vx*=0.9;
			this.vy*=0.9;
		}
		return true;
	}
}
