var Sburb = (function(Sburb){



///////////////////////////////////////
//Chracter Class (inherits Sprite)
///////////////////////////////////////

//constructor
Sburb.Character = function(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet,bootstrap){
	Sburb.Sprite.call(this,name,x,y,width,height,null,null,Sburb.Sprite.prototype.MG_DEPTHING,true);

	this.speed = 9;
	this.vx = 0;
	this.vy = 0;
	this.facing = "Front";
	this.npc = true;
	this.spriteType = "character";
	
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

//update as if one frame has passed
Sburb.Character.prototype.update = function(curRoom){
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
	this.idle();
	this.vx = 0; this.vy = 0;
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
Sburb.Character.prototype.handleInputs = function(pressed){
	if(pressed[Sburb.Keys.down] || pressed[Sburb.Keys.s]){
		this.moveDown();
	}else if(pressed[Sburb.Keys.up] || pressed[Sburb.Keys.w]){
		this.moveUp();
	}else if(pressed[Sburb.Keys.left] || pressed[Sburb.Keys.a]){
		this.moveLeft();
	}else if(pressed[Sburb.Keys.right] || pressed[Sburb.Keys.d]){
		this.moveRight();
	}else{
		this.moveNone();
	}
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
			if(!fixed || room.collides(this)){
				this.x-=dx;
				this.y-=dy;
				return false;
			}
		}
	}	
	return true;
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
	output = output.concat("\n<Character name='"+this.name+
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
		output = output.concat("'>");
	for(var animation in this.animations){
		var anim = this.animations[animation];
		if(this.bootstrap || (anim.name.indexOf("idle")==-1 && anim.name.indexOf("walk")==-1)){
			output = anim.serialize(output);
		}
	}
	for(var action in this.actions){
		output = this.actions[action].serialize(output);
	}
	
	output = output.concat("\n</Character>");
	return output;
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
  				    
  	var anims = charNode.getElementsByTagName("Animation");
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
