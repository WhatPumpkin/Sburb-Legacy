//requires Sprite.js, inheritance.js

function Character(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet){
	inherit(this,new Sprite(name,x,y,width,height,null,null,MG_DEPTHING,true));

	this.speed = 9;
	this.vx = 0;
	this.vy = 0;
	this.facing = "Front";
	this.npc = true;
	this.spriteType = "character";

	sWidth = typeof sWidth == "number" ? sWidth : width;
	sHeight = typeof sHeight == "number" ? sHeight : height;

	this.addAnimation(new Animation("idleFront",sheet,sx,sy,sWidth,sHeight,0,1,2));
	this.addAnimation(new Animation("idleRight",sheet,sx,sy,sWidth,sHeight,1,1,2));
	this.addAnimation(new Animation("idleBack",sheet,sx,sy,sWidth,sHeight,2,1,2));
	this.addAnimation(new Animation("idleLeft",sheet,sx,sy,sWidth,sHeight,3,1,2));
	this.addAnimation(new Animation("walkFront",sheet,sx,sy,sWidth,sHeight,4,2,4));
	this.addAnimation(new Animation("walkRight",sheet,sx,sy,sWidth,sHeight,6,2,4));
	this.addAnimation(new Animation("walkBack",sheet,sx,sy,sWidth,sHeight,8,2,4));
	this.addAnimation(new Animation("walkLeft",sheet,sx,sy,sWidth,sHeight,10,2,4));

	this.startAnimation("walkFront");
	
	this.spriteUpdate = this.update;
	
	this.update = function(curRoom){
		this.tryToMove(this.vx,this.vy,curRoom);
		this.spriteUpdate(curRoom);
	}

	this.moveUp = function(){
		this.facing = "Back";
		this.walk();
		this.vx = 0; this.vy = -this.speed;
	}
	this.moveDown = function(){
		this.facing = "Front";
		this.walk();
		this.vx = 0; this.vy = this.speed;
	}
	this.moveLeft = function(){
		this.facing = "Left";
		this.walk();
		this.vx = -this.speed; this.vy = 0;
	}
	this.moveRight = function(){
		this.facing = "Right";
		this.walk();
		this.vx = this.speed; this.vy = 0;
	}
	this.moveNone = function(){
		this.idle();
		this.vx = 0; this.vy = 0;
	}

	this.walk = function(){
		this.startAnimation("walk"+this.facing);
	}
	this.idle = function(){
		this.startAnimation("idle"+this.facing);
	}

	this.becomeNPC = function(){
		this.animations.walkFront.frameInterval = 12;
		this.animations.walkBack.frameInterval = 12;
		this.animations.walkLeft.frameInterval = 12;
		this.animations.walkRight.frameInterval = 12;
	}

	this.becomePlayer = function(){
		this.animations.walkFront.frameInterval = 4;
		this.animations.walkBack.frameInterval = 4;
		this.animations.walkLeft.frameInterval = 4;
		this.animations.walkRight.frameInterval = 4;
	}
	
	this.handleInputs = function(pressed){
		if(pressed[Keys.down] || pressed[Keys.s]){
			this.moveDown();
		}else if(pressed[Keys.up] || pressed[Keys.w]){
			this.moveUp();
		}else if(pressed[Keys.left] || pressed[Keys.a]){
			this.moveLeft();
		}else if(pressed[Keys.right] || pressed[Keys.d]){
			this.moveRight();
		}else{
			this.moveNone();
		}
	}
	
	this.tryToMove = function(vx,vy,room){
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
	
	this.getActionQueries = function(){
		var queries = new Array();
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
	
	this.serialize = function(output){
		output = output.concat("\n<Character name='"+this.name+
			"' x='"+this.x+
			"' y='"+this.y+
			"' sx='"+this.animations.walkFront.x+
			"' sy='"+this.animations.walkFront.y+
			"' sWidth='"+this.animations.walkFront.colSize+
			"' sHeight='"+this.animations.walkFront.rowSize+
			"' width='"+this.width+
			"' height='"+this.height+
			"' sheet='"+this.animations.walkFront.sheet.name+
			"' state='"+this.state+
			"' facing='"+this.facing+
			"'>");
		for(var animation in this.animations){
			var anim = this.animations[animation];
			if(anim.name.indexOf("idle")==-1 && anim.name.indexOf("walk")==-1){
				output = anim.serialize(output);
			}
		}
		for(var action in this.actions){
			output = this.actions[action].serialize(output);
		}
		
		output = output.concat("\n</Character>");
		return output;
	}

	this.becomeNPC();

}

function parseCharacter(charNode, assetFolder) {
  	var attributes = charNode.attributes;
  	var newChar = new Character(attributes.getNamedItem("name").value,
  				    attributes.getNamedItem("x")?parseInt(attributes.getNamedItem("x").value):0,
  				    attributes.getNamedItem("y")?parseInt(attributes.getNamedItem("y").value):0,
  				    parseInt(attributes.getNamedItem("width").value),
  				    parseInt(attributes.getNamedItem("height").value),
  				    attributes.getNamedItem("sx")?parseInt(attributes.getNamedItem("sx").value):0,
  				    attributes.getNamedItem("sy")?parseInt(attributes.getNamedItem("sy").value):0,
  				    parseInt(attributes.getNamedItem("sWidth").value),
  				    parseInt(attributes.getNamedItem("sHeight").value),
  				    assetFolder[attributes.getNamedItem("sheet").value]);
  				    
  	var anims = charNode.getElementsByTagName("Animation");
	for(var j=0;j<anims.length;j++){
		var newAnim = parseAnimation(anims[j],assetFolder);
		newChar.addAnimation(newAnim); 
	}
  	newChar.startAnimation(attributes.getNamedItem("state").value);
  	newChar.facing = attributes.getNamedItem("facing").value;
	return newChar;
}
