var Sburb = (function(Sburb){


///////////////////////////////////////
//Chracter Class (inherits Sprite)
///////////////////////////////////////

//constructor
Sburb.Character = function(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet,bootstrap){
	Sburb.Sprite.call(this,name,x,y,width,height,null,null,Sburb.Sprite.prototype.MG_DEPTHING,true);

	this.speed = 12;
	this.vx = 0;
	this.vy = 0;
	this.facing = "Front";
	this.npc = true;
	this.spriteType = "character";
	this.following = null;
	this.followBuffer = null;
	this.follower = null;
	this.lastLeaderPos = null;
	this.handledInput = -1;
	
	if(!bootstrap){ //automagically generate standard animations
		sWidth = typeof sWidth == "number" ? sWidth : width;
		sHeight = typeof sHeight == "number" ? sHeight : height;

		this.addAnimation(new Sburb.Animation("idleFront",sheet,sx,sy,sWidth,sHeight,0,1,2));
		this.addAnimation(new Sburb.Animation("idleRight",sheet,sx,sy,sWidth,sHeight,1,1,2));
		this.addAnimation(new Sburb.Animation("idleBack",sheet,sx,sy,sWidth,sHeight,2,1,2));
		this.addAnimation(new Sburb.Animation("idleLeft",sheet,sx,sy,sWidth,sHeight,3,1,2));
		this.addAnimation(new Sburb.Animation("walkFront",sheet,sx,sy,sWidth,sHeight,4,2,4));
		this.addAnimation(new Sburb.Animation("walkRight",sheet,sx,sy,sWidth,sHeight,6,2,4));
		this.addAnimation(new Sburb.Animation("walkBack",sheet,sx,sy,sWidth,sHeight,8,2,4));
		this.addAnimation(new Sburb.Animation("walkLeft",sheet,sx,sy,sWidth,sHeight,10,2,4));
	

		this.startAnimation("walkFront");
	}else{
		this.bootstrap = true;
	}
	
	this.becomeNPC();
	
}

Sburb.Character.prototype = new Sburb.Sprite();
Sburb.Character.prototype.followBufferLength = 9;

//update as if one frame has passed
Sburb.Character.prototype.update = function(curRoom){
	if(this.following){
		if(this.following.isNPC() && !this.isNPC()){
			this.becomeNPC();
			this.collidable = true;
			this.walk();
		}else if(!this.following.isNPC() && this.isNPC()){
			this.becomePlayer();
			this.collidable = false;
		}
		
		if(this.following.x!=this.lastLeaderPos.x || this.following.y!=this.lastLeaderPos.y){
			this.followBuffer.push({x:this.following.x,y:this.following.y});
			this.lastLeaderPos.x = this.following.x;
			this.lastLeaderPos.y = this.following.y;
			
		}
		while(this.followBuffer.length>this.followBufferLength){
			var destPos = this.followBuffer[0];
			if(Math.abs(destPos.x-this.x)>=this.speed/1.9){
				if(destPos.x>this.x){
					this.moveRight();
				}else{
					this.moveLeft();
				}
			}else if(Math.abs(destPos.y-this.y)>=this.speed/1.9){
				if(destPos.y>this.y){
					this.moveDown();
				}else{
					this.moveUp();
				}
			}else {
				this.followBuffer.splice(0,1);
				continue;
			}
			break;
		}
		if(this.followBuffer.length<=this.followBufferLength && !this.following.isNPC()){
			this.moveNone();
		}
	}
	if(this.handleInput>0){
		--this.handleInput;
		if(this.handleInput==0){
			moveNone();
		}
	}
	this.tryToMove(this.vx,this.vy,curRoom);
	Sburb.Sprite.prototype.update.call(this,curRoom);
}

//impulse character to move up
Sburb.Character.prototype.moveUp = function(){
	this.facing = "Back";
	this.walk();
	this.vx = 0; this.vy = -this.speed;
}

//impulse character to move down
Sburb.Character.prototype.moveDown = function(){
	this.facing = "Front";
	this.walk();
	this.vx = 0; this.vy = this.speed;
}

//impulse character to move left
Sburb.Character.prototype.moveLeft = function(){
	this.facing = "Left";
	this.walk();
	this.vx = -this.speed; this.vy = 0;
}

//impulse character to move right
Sburb.Character.prototype.moveRight = function(){
	this.facing = "Right";
	this.walk();
	this.vx = this.speed; this.vy = 0;
}

//impulse character to stand still
Sburb.Character.prototype.moveNone = function(){
	if(this.animations.walkFront.frameInterval == 4){
		this.idle();
		this.vx = 0; this.vy = 0;
	}
}

//make character walk
Sburb.Character.prototype.walk = function(){
	this.startAnimation("walk"+this.facing);
}

//make character idle
Sburb.Character.prototype.idle = function(){
	this.startAnimation("idle"+this.facing);
}

//behave as an NPC
Sburb.Character.prototype.becomeNPC = function(){
	this.animations.walkFront.frameInterval = 12;
	this.animations.walkBack.frameInterval = 12;
	this.animations.walkLeft.frameInterval = 12;
	this.animations.walkRight.frameInterval = 12;
}

//behave as a PC
Sburb.Character.prototype.becomePlayer = function(){
	this.animations.walkFront.frameInterval = 4;
	this.animations.walkBack.frameInterval = 4;
	this.animations.walkLeft.frameInterval = 4;
	this.animations.walkRight.frameInterval = 4;
}

//parse key inputs into actions
Sburb.Character.prototype.handleInputs = function(pressed, order){
    var down = -1, up = -1, left = -1, right = -1, most = 0;
    down  = Math.max(order.indexOf(Sburb.Keys.down), order.indexOf(Sburb.Keys.s));
    up    = Math.max(order.indexOf(Sburb.Keys.up),   order.indexOf(Sburb.Keys.w));
    left  = Math.max(order.indexOf(Sburb.Keys.left), order.indexOf(Sburb.Keys.a));
    right = Math.max(order.indexOf(Sburb.Keys.right),order.indexOf(Sburb.Keys.d));
    most  = Math.max(down, up, left, right, most);
    if(down == most) {
        this.moveDown();
    } else if(up == most) {
        this.moveUp();
    } else if(left == most) {
        this.moveLeft();
    } else if(right == most) {
        this.moveRight();
    } else {
        this.moveNone();
    }
	this.handledInput = 2;
}

//have character try to move through room
Sburb.Character.prototype.tryToMove = function(vx,vy,room){
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
	var minX = Sburb.Stage.scaleX;
	var minY = Sburb.Stage.scaleY;
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
		
		if(!this.following){
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
				if(!fixed || room.collides(this)){
					this.x-=dx;
					this.y-=dy;
					return false;
				}
			}
		}
	}	
	return true;
}

Sburb.Character.prototype.follow = function(sprite){
	while(sprite.follower!=null){
		sprite = sprite.follower;
	}
	this.following = sprite;
	sprite.follower = this;
	this.followBuffer = [];
	this.lastLeaderPos = {};
	this.collidable = false;
}

Sburb.Character.prototype.unfollow = function(){
	if(this.following){
		this.following.follower = this.follower;
		if(this.follower){
			this.follower.following = this.following;
			this.follower.followBuffer = [];
		}
		this.following = null;
		this.follower = null;
		this.lastLeaderPos = null;
		this.collidable = true;
		this.becomeNPC();
	}
}

//get locations character wishes to query for actions
Sburb.Character.prototype.getActionQueries = function(){
	var queries = [];
	queries.push({x:this.x,y:this.y});
	if(this.facing=="Front"){
		queries.push({x:this.x,y:this.y+(this.height/2+15)});
		queries.push({x:this.x-this.width/2,y:this.y+(this.height/2+15)});
		queries.push({x:this.x+this.width/2,y:this.y+(this.height/2+15)});
	}else if(this.facing=="Back"){
		queries.push({x:this.x,y:this.y-(this.height/2+15)});
		queries.push({x:this.x-this.width/2,y:this.y-(this.height/2+15)});
		queries.push({x:this.x+this.width/2,y:this.y-(this.height/2+15)});
	}else if(this.facing=="Right"){
		queries.push({x:this.x+(this.width/2+15),y:this.y});
		queries.push({x:this.x+(this.width/2+15),y:this.y+this.height/2});
		queries.push({x:this.x+(this.width/2+15),y:this.y-this.height/2});
	}else if(this.facing=="Left"){
		queries.push({x:this.x-(this.width/2+15),y:this.y});
		queries.push({x:this.x-(this.width/2+15),y:this.y+this.height/2});
		queries.push({x:this.x-(this.width/2+15),y:this.y-this.height/2});
	}
	return queries;
}

//serialize character to XML
Sburb.Character.prototype.serialize = function(output){
	output = output.concat("\n<character name='"+this.name+
		"' x='"+this.x+
		"' y='"+this.y+
		"' width='"+this.width+
		"' height='"+this.height+
		"' state='"+this.state+
		"' facing='"+this.facing);
		if(!this.bootstrap){
			output = output.concat("' sx='"+this.animations.walkFront.x+
			"' sy='"+this.animations.walkFront.y+
			"' sWidth='"+this.animations.walkFront.colSize+
			"' sHeight='"+this.animations.walkFront.rowSize+
			"' sheet='"+this.animations.walkFront.sheet.name);
		}else{
			output = output.concat("' bootstrap='true");
		}
		if(this.following){
			output = output.concat("' following='"+this.following.name+"");
		}
		if(this.follower){
			output = output.concat("' follower='"+this.follower.name+"");
		}
		output = output.concat("'>");
	for(var animation in this.animations){
	    if(!this.animations.hasOwnProperty(animation)) continue;
	    var anim = this.animations[animation];
	    if(this.bootstrap || (anim.name.indexOf("idle")==-1 && anim.name.indexOf("walk")==-1)){
		    output = anim.serialize(output);
		}
	}
	for(var i=0; i < this.actions.length; i++){
		output = this.actions[i].serialize(output);
	}
	
	output = output.concat("\n</character>");
	return output;
}



Sburb.Character.prototype.isNPC = function(){
	return this.animations.walkFront.frameInterval == 12;
}





////////////////////////////////////////////
//Related Utiltity functions
////////////////////////////////////////////

//parse character from XML DOM Node
Sburb.parseCharacter = function(charNode, assetFolder) {
  	var attributes = charNode.attributes;
  	var newChar = new Sburb.Character(attributes.getNamedItem("name").value,
  				    attributes.getNamedItem("x")?parseInt(attributes.getNamedItem("x").value):0,
  				    attributes.getNamedItem("y")?parseInt(attributes.getNamedItem("y").value):0,
  				    parseInt(attributes.getNamedItem("width").value),
  				    parseInt(attributes.getNamedItem("height").value),
  				    attributes.getNamedItem("sx")?parseInt(attributes.getNamedItem("sx").value):0,
  				    attributes.getNamedItem("sy")?parseInt(attributes.getNamedItem("sy").value):0,
  				    parseInt(attributes.getNamedItem("sWidth").value),
  				    parseInt(attributes.getNamedItem("sHeight").value),
  				    assetFolder[attributes.getNamedItem("sheet").value]);
  	
  	var temp = attributes.getNamedItem("following");
  	if(temp){
  		var following = Sburb.sprites[temp.value];
  		if(following){
  			newChar.follow(following);
  		}
  	} 			 
  	var temp = attributes.getNamedItem("follower");
  	if(temp){
  		var follower = Sburb.sprites[temp.value];
  		if(follower){
  			follower.follow(newChar);
  		}
  	} 	   
  	
  	var anims = charNode.getElementsByTagName("animation");
	for(var j=0;j<anims.length;j++){
		var newAnim = Sburb.parseAnimation(anims[j],assetFolder);
		newChar.addAnimation(newAnim); 
	}
  	newChar.startAnimation(attributes.getNamedItem("state").value);
  	newChar.facing = attributes.getNamedItem("facing").value;
	return newChar;
}




return Sburb;
})(Sburb || {});
