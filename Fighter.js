function Fighter(name,x,y,width,height){
	inherit(this,new Sprite(name,x,y,width,height,null,null,MG_DEPTHING,true));
	
	this.accel = 1.5;
	this.decel = 1;
	this.friction = 0.87;
	this.vx = 0;
	this.vy = 0;
	this.facing = "Right";
	
	this.spriteUpdate = this.update;
	
	this.update = function(curRoom){
		this.tryToMove(curRoom);
		this.spriteUpdate(curRoom);
		this.animation.flipX = (this.facing=="Left");
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
		if(pressed[Keys.space]){
			this.attack();
		}
		if(!moved){
			this.idle();
		}
	}
	
	this.idle = function(){
		if(this.state=="walk"){
			this.startAnimation("idle");
		}
	}
	
	this.walk = function(){
		if(this.state=="idle"){
			this.startAnimation("walk");
		}
	}
	
	this.attack = function(){
		this.startAnimation("attack");
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
		this.facing = "Left";
	}
	this.moveRight = function(room){
		this.walk();
		this.vx+=this.accel;
		this.facing = "Right";
	}
	
	this.becomePlayer = function(){
	
	}
	
	this.becomeNPC = function(){
	}
	
	this.getActionQueries = function(){
		var queries = new Array();
		return queries;
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
	
	this.serialize = function(output){
		output = output.concat("<Fighter "+
			serializeAttributes(this,"name","x","y","width","height","state")+
			(animationCount>1?"state='"+this.state+"' ":"")+
			">");
		for(animation in this.animations){
			output = this.animations[animation].serialize(output);
		}
		for(action in this.actions){
			output = this.actions[action].serialize(output);
		}
		output = output.concat("</Fighter>");
	}
}

function parseFighter(spriteNode, assetFolder) {
	var attributes = spriteNode.attributes;
	
	var newName = null;
	var newX = 0;
	var newY = 0;
	var newWidth = 0;
	var newHeight = 0;
	var newState = null;

	var temp;
	newName = (temp=attributes.getNamedItem("name"))?temp.value:newName;
	newX = (temp=attributes.getNamedItem("x"))?parseInt(temp.value):newX;
	newY = (temp=attributes.getNamedItem("y"))?parseInt(temp.value):newY;
	newWidth = (temp=attributes.getNamedItem("width"))?parseInt(temp.value):newWidth;
	newHeight = (temp=attributes.getNamedItem("height"))?parseInt(temp.value):newHeight;
	newState = (temp=attributes.getNamedItem("state"))?temp.value:newState;
	
 	var newSprite = new Fighter(newName,newX,newY,newWidth,newHeight);
	
	var anims = spriteNode.getElementsByTagName("Animation");
	for(var j=0;j<anims.length;j++){
		var newAnim = parseAnimation(anims[j],assetFolder);
		newSprite.addAnimation(newAnim);
		if(newState==null){
			newState = newAnim.name;
		}
	}
	newSprite.startAnimation(newState);
	
	return newSprite;
}

