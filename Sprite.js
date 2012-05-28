//requires Animation.js

var BG_DEPTHING = 0;
var MG_DEPTHING = 1;
var FG_DEPTHING = 2;
function Sprite(name,x,y,width,height,dx,dy,depthing,collidable){
	this.x = x;
	this.y = y;
	this.dx = typeof dx == "number" ? dx : 0;
	this.dy = typeof dy == "number" ? dy : 0;
	this.width = width;
	this.height = height;
	this.depthing = typeof depthing == "number" ? depthing : BG_DEPTHING; //bg, fg, or mg
	this.collidable = typeof collidable == "boolean" ? collidable : false;
	this.animations = {};
	this.animation = null;
	this.state = null;
	this.lastTime = 0;
	this.actions = new Array();
	this.name = name;
	
	this.addAnimation = function(anim){
		this.animations[anim.name] = anim;
	}
	
	this.startAnimation = function(name){
		if(this.state!=name){
			this.animation = this.animations[name];
			this.animation.reset();
			this.state = name;
		}
	}
	
	this.update = function(gameTime){
		if(this.animation.hasPlayed() && this.animation.followUp){
			this.startAnimation(this.animation.followUp);
		}else{
			this.animation.update(1);
		}
	}
	this.staticImg = function() {
		return this.animation.staticImg();
	}
	
	this.draw = function(){
		if(this.animation!=null){
			this.animation.draw(this.x,this.y);
		}
	}
	this.drawMeta = function(){
		stage.save();
			stage.strokeStyle = "rgb(200,40,40)";
			stage.beginPath();
			stage.moveTo(this.x-this.width/2,this.y-this.height/2);
			stage.lineTo(this.x-this.width/2,this.y+this.height/2);
			stage.lineTo(this.x+this.width/2,this.y+this.height/2);
			stage.lineTo(this.x+this.width/2,this.y-this.height/2);	
			stage.lineTo(this.x-this.width/2,this.y-this.height/2);
			stage.closePath();
			stage.stroke();
			
			stage.beginPath();
			stage.moveTo(this.x+3,this.y);
			stage.lineTo(this.x-3,this.y);
			stage.closePath();
			stage.stroke();
			
			stage.beginPath();
			stage.moveTo(this.x,this.y+3);
			stage.lineTo(this.x,this.y-3);
			stage.closePath();
			stage.stroke();
		stage.restore();
	}
	
	this.isBehind = function(other){
		if(this.depthing == other.depthing){
			return this.y+this.dy<other.y+other.dy;
		}else{
			return this.depthing<other.depthing;
		}
	}
	
	this.collides = function(other,dx,dy){
		var x = this.x+(dx?dx:0);
		var y = this.y+(dy?dy:0);
		if(other.collidable){
			if( (x-this.width/2<other.x+other.width/2) &&
				 (x+this.width/2>other.x-other.width/2) &&
				 (y-this.height/2<other.y+other.height/2) &&
				 (y+this.height/2>other.y-other.height/2) ) {
				 return true;
			}
		}
	    return false;
	}
	this.hitsPoint = function(x,y){
	    if( (this.x-this.width/2 <=x) &&
		(this.x+this.width/2 >=x) &&
		(this.y-this.height/2 <=y) &&
		(this.y+this.height/2 >=y) ) {
		return true;
	    }
	    return false;
	}
	
	this.isVisuallyUnder = function(x,y){
		return this.animation.isVisuallyUnder(x-this.x,y-this.y);
	}
	
	this.addAction = function(action){
		this.actions.push(action);
	}
	
	this.removeAction = function(name){
		for(var i=0;i<this.actions.length;i++){
			if(this.actions[i].name==name){
				this.actions.splice(i,1);
				return;
			}
		}
	}
	
	this.getActions = function(sprite){
		var validActions = new Array();
		for(var i=0;i<this.actions.length;i++){
			if(!this.actions[i].sprite || this.actions[i].sprite==sprite){
				validActions.push(this.actions[i]);
			}
		}
		return validActions;
	}
	
	this.serialize = function(output){
		var animationCount = 0;
		for(anim in this.animations){
				animationCount++;
		}
		
		output = output.concat("\n<Sprite "+
			(this.templateClass?"class='"+this.templateClass.templateName+"' ":"")+
			serializeAttributes(this,"name","x","y","dx","dy","width","height","depthing","collidable")+
			(animationCount>1 && !isTemplate(this,"state")?"state='"+this.state+"' ":"")+
			">");

		for(var anim in this.animations){
			if(!this.templateClass || !this.templateClass.animations[anim]){
				output = this.animations[anim].serialize(output);
			}
		}
		for(var action in this.actions){
			output = this.actions[action].serialize(output);
		}
		output = output.concat("\n</Sprite>");
		return output;
	}
	
}

function parseSprite(spriteNode, assetFolder) {
	var attributes = spriteNode.attributes;
	var tClass = attributes.getNamedItem("class");
	if(tClass && templateClasses[tClass.value.trim()]){
		var template = templateClasses[tClass.value.trim()];
		var newName = template.name;
		var newX = template.x;
		var newY = template.y;
		var newWidth = template.width;
		var newHeight = template.height;
		var newDx = template.dx;
		var newDy = template.dy;
		var newDepthing = template.depthing;
		var newCollidable = template.collidable;
		var newState = template.state;
		var newAnimations = template.animations;
	}else{
		var newName = null;
		var newX = 0;
		var newY = 0;
		var newWidth = 0;
		var newHeight = 0;
		var newDx = 0;
		var newDy = 0;
		var newDepthing = 0;
		var newCollidable = false;
		var newState = null;
		var newAnimations = {};
	}
	var temp;
	newName = (temp=attributes.getNamedItem("name"))?temp.value:newName;
	newX = (temp=attributes.getNamedItem("x"))?parseInt(temp.value):newX;
	newY = (temp=attributes.getNamedItem("y"))?parseInt(temp.value):newY;
	newWidth = (temp=attributes.getNamedItem("width"))?parseInt(temp.value):newWidth;
	newHeight = (temp=attributes.getNamedItem("height"))?parseInt(temp.value):newHeight;
	newDx = (temp=attributes.getNamedItem("dx"))?parseInt(temp.value):newDx;
	newDy = (temp=attributes.getNamedItem("dy"))?parseInt(temp.value):newDy;
	newDepthing = (temp=attributes.getNamedItem("depthing"))?parseInt(temp.value):newDepthing;
	newCollidable = (temp=attributes.getNamedItem("collidable"))?temp.value!="false":newCollidable;
	newState = (temp=attributes.getNamedItem("state"))?temp.value:newState;
	
 	var newSprite = new Sprite(newName,newX,newY,newWidth,newHeight,newDx,newDy,newDepthing,newCollidable);

	for(var newAnim in newAnimations){
		newSprite.addAnimation(newAnimations[newAnim].clone(0,0));
	}
	
	var anims = spriteNode.getElementsByTagName("Animation");
	for(var j=0;j<anims.length;j++){
		var newAnim = parseAnimation(anims[j],assetFolder);
		newSprite.addAnimation(newAnim);
		if(newState==null){
			newState = newAnim.name;
		}
	}
	newSprite.startAnimation(newState);
	
	if(template){
		newSprite.templateClass = template;
	}
	
	return newSprite;
}
