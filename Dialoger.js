var Sburb = (function(Sburb){





///////////////////////////////////
//Dialoger Class
///////////////////////////////////

//Constructor
Sburb.Dialoger = function(hiddenPos, alertPos, talkPosLeft, talkPosRight,
	spriteStartRight, spriteEndRight, spriteStartLeft, spriteEndLeft,
	alertTextDimensions, leftTextDimensions, rightTextDimensions, type){
	
	this.name="default";
	
	this.talking = false;
	this.queue = [];
	this.extraArgs = null;
	this.dialog = new Sburb.FontEngine();
	
	this.hiddenPos = hiddenPos;
	this.alertPos = alertPos;
	this.talkPosLeft = talkPosLeft;
	this.talkPosRight = talkPosRight;
	
	this.spriteStartRight = spriteStartRight;
	this.spriteEndRight = spriteEndRight;
	
	this.spriteStartLeft = spriteStartLeft;
	this.spriteEndLeft = spriteEndLeft;
	
	this.alertTextDimensions = alertTextDimensions;
	this.leftTextDimensions = leftTextDimensions;
	this.rightTextDimensions = rightTextDimensions;
	
	this.pos = {x:hiddenPos.x,y:hiddenPos.y}
	
	this.actor = null;
	this.dialogSide = "Left";
	this.graphic = null;
	this.box = null;
	this.defaultBox = null;
	
	this.type = type;
}

Sburb.Dialoger.prototype.dialogSpriteLeft = null;
Sburb.Dialoger.prototype.dialogSpriteRight = null;

//nudge the dialoger forward
Sburb.Dialoger.prototype.nudge = function(){
	if(this.dialog.isShowingAll()){
		if(this.dialog.nextBatch()){
			this.dialog.showSubText(0,0);
		}else{
			if(this.queue.length>0){
				this.nextDialog();
			}else{
				this.talking = false;
			}
		}
	}else{
		this.dialog.showAll();
	}
}

//start the provided dialog
Sburb.Dialoger.prototype.startDialog = function(info){
	this.actor = null;
	this.queue = info.split("@");
	this.queue.reverse();
	this.queue.pop();
	this.nextDialog();
	this.box.x=-this.box.width;
	this.talking = true;
}

//start the next dialog
Sburb.Dialoger.prototype.nextDialog = function(){
	var nextDialog = this.queue.pop();
	this.dialog.setText(nextDialog);
	this.dialog.showSubText(0,0);
	var prefix = nextDialog.substring(0,nextDialog.indexOf(" "));
	if(prefix.indexOf("~")>=0){
		var firstIndex = prefix.indexOf("~");
		var lastIndex = prefix.length;
		var ampIndex = prefix.indexOf("&");
		if(ampIndex>firstIndex){
			lastIndex = ampIndex;
		}
		var colIndex = prefix.indexOf(":");
		if(colIndex>=0 && colIndex<lastIndex){
			lastIndex = colIndex;
		}
		var resource = prefix.substring(firstIndex+1,lastIndex);	
		prefix = prefix.substring(0,firstIndex)+prefix.substring(lastIndex,prefix.length);	
		
		var img = Sburb.assets[resource];
		this.graphic = new Sburb.Sprite();
		this.graphic.addAnimation(new Sburb.Animation("image",img,0,0,img.width,img.height,0,1,1));
		this.graphic.startAnimation("image");
	}else{
		this.graphic = null;
	}
	
	if(prefix.indexOf("&")>=0){
		var firstIndex = prefix.indexOf("&");
		var lastIndex = prefix.length;

		var colIndex = prefix.indexOf(":");
		if(colIndex>=0 && colIndex<lastIndex){
			lastIndex = colIndex;
		}
		var resource = prefix.substring(firstIndex+1,lastIndex);	
		prefix = prefix.substring(0,firstIndex)+prefix.substring(lastIndex,prefix.length);
			
		this.setBox(resource);
	}else{
		this.box = this.defaultBox;
	}
	
	if(prefix.indexOf(":")>=0){
		var firstIndex = prefix.indexOf(":");
		var lastIndex = prefix.length;

		var resource = prefix.substring(firstIndex+1,lastIndex);	
		prefix = prefix.substring(0,firstIndex)+prefix.substring(lastIndex,prefix.length);	
		
		this.extraArgs = resource;
	}else{
		this.extraArgs = null;
	}
	
	if(prefix=="!"){
		this.actor = null;
		this.dialogSide = "Left";
	}else{
		var newActor;
		if(prefix.indexOf("_")>=0){
			newActor = prefix.substring(0,prefix.indexOf("_"));	
		}else{
			newActor = prefix.substring(0,2);
		}
		if(this.actor==null){
			this.dialogSide = "Left";
			var sprite = this.dialogOnSide(this.dialogSide);
			var desiredPos = this.startOnSide(this.oppositeSide(this.dialogSide));
			sprite.x = desiredPos.x;
			sprite.y = desiredPos.y;
		}else if(this.actor!=newActor){
			this.dialogSide = this.oppositeSide(this.dialogSide);
			var sprite = this.dialogOnSide(this.dialogSide)
			var desiredPos = this.startOnSide(this.dialogSide);
			sprite.x = desiredPos.x;
			sprite.y = desiredPos.y;
			
		}
		this.actor = newActor;
		this.dialogOnSide(this.dialogSide).startAnimation(prefix);
	}
	
}

//get the string suffix for the opposite side to that is currently talking
Sburb.Dialoger.prototype.oppositeSide = function(side){
	if(side=="Left"){
		return "Right";
	}else{
		return "Left";
	}
}

//get the dialogSprite on the specified side
Sburb.Dialoger.prototype.dialogOnSide = function(side){
	return this["dialogSprite"+side];
}

//get the start position of a dialog on the specified side
Sburb.Dialoger.prototype.startOnSide = function(side){
	return this["spriteStart"+side];
}

//get the end position of a dialog on the specified side
Sburb.Dialoger.prototype.endOnSide = function(side){
	return this["spriteEnd"+side];
}

//move the specified sprite towards the specified location at the specified speed
Sburb.Dialoger.prototype.moveToward = function(sprite,pos,speed){
	if(typeof speed != "number"){
		speed = 100;
	} 
	if(Math.abs(sprite.x-pos.x)>speed){
		sprite.x+=speed*Math.abs(pos.x-sprite.x)/(pos.x-sprite.x);
	}else{
		sprite.x = pos.x;
	}
	
	if(Math.abs(sprite.y-pos.y)>speed){
		sprite.y+=speed*Math.abs(pos.y-sprite.y)/(pos.y-sprite.y);
	}else{
		sprite.y = pos.y;
	}
	return sprite.y == pos.y && sprite.x == pos.x;
}

//update the Dialoger one frame
Sburb.Dialoger.prototype.update = function(){
	if(this.talking){
		var desiredPos;
		var ready = true;
		if(this.actor==null){
			desiredPos = this.alertPos;
		}else{
			desiredPos = this["talkPos"+this.dialogSide];	
			ready = this.moveToward(this.dialogOnSide(this.dialogSide),this.endOnSide(this.dialogSide));
			this.moveToward(this.dialogOnSide(this.oppositeSide(this.dialogSide)),this.startOnSide(this.oppositeSide(this.dialogSide)));
		}
			
		if(this.moveToward(this.pos,desiredPos,110) && ready){
			if(this.dialog.start==this.dialog.end){
				var dialogDimensions = this.decideDialogDimensions();
				this.dialog.setDimensions(dialogDimensions.x,dialogDimensions.y,dialogDimensions.width,dialogDimensions.height);
			}
			this.dialog.showSubText(null,this.dialog.end+2);
			if(this.actor){
				this.dialogOnSide(this.dialogSide).update();
			}
		}
		
		if(this.graphic){
			this.graphic.x = this.pos.x;
			this.graphic.y = this.pos.y;
		}
		
	}else {
		this.moveToward(this.pos,this.hiddenPos,120);

		if(this.actor!=null){
			if(this.moveToward(this.dialogOnSide(this.dialogSide),this.startOnSide(this.oppositeSide(this.dialogSide)))){
				this.actor = null;
			}
		}
	}
	this.box.x = this.pos.x;
	this.box.y = this.pos.y;
	this.box.update();
}

//get what the dimensions of the dialog should be
Sburb.Dialoger.prototype.decideDialogDimensions = function(){
	if(this.actor==null){
		return {x:this.pos.x+this.alertTextDimensions.x,
				y:this.pos.y+this.alertTextDimensions.y,
				width:this.alertTextDimensions.width,
				height:this.alertTextDimensions.height};
	}else if(this.dialogSide=="Left"){
		return {x:this.pos.x+this.leftTextDimensions.x,
				y:this.pos.y+this.leftTextDimensions.y,
				width:this.leftTextDimensions.width,
				height:this.leftTextDimensions.height};
	}else{
		return {x:this.pos.x+this.rightTextDimensions.x,
				y:this.pos.y+this.rightTextDimensions.y,
				width:this.rightTextDimensions.width,
				height:this.rightTextDimensions.height};
	}
}

//set the dialog box graphic
Sburb.Dialoger.prototype.setBox = function(box){
	var boxAsset = Sburb.assets[box];
	
	var dialogBox = new Sburb.Sprite("dialogBox",Stage.width+1,1000,boxAsset.width,boxAsset.height, null,null,0);
  	dialogBox.addAnimation(new Sburb.Animation("image",boxAsset,0,0,boxAsset.width,boxAsset.height,0,1,1));
	dialogBox.startAnimation("image");
	
	if(!this.box){
		this.defaultBox = dialogBox;
	}
	this.box = dialogBox;
}

//draw the dialog box
Sburb.Dialoger.prototype.draw = function(){
	this.box.draw();
	if(this.graphic){
		this.graphic.draw();
	}
	if(this.talking){
		this.dialog.draw();
	}
	if(this.actor!=null){
		this.dialogSpriteLeft.draw();
		if(this.dialogSpriteRight.animation){
			this.dialogSpriteRight.animation.flipX=true;
		}
		this.dialogSpriteRight.draw();
	}
}

Sburb.parseDialoger = function(dialoger){
	var attributes = dialoger.attributes;
	
	var hiddenPos = parseDimensions(attributes.getNamedItem("hiddenPos").value);
	var alertPos = parseDimensions(attributes.getNamedItem("alertPos").value);
	var talkPosLeft = parseDimensions(attributes.getNamedItem("talkPosLeft").value);
	var talkPosRight = parseDimensions(attributes.getNamedItem("talkPosRight").value);
	var spriteStartRight = parseDimensions(attributes.getNamedItem("spriteStartRight").value);
	var spriteEndRight = parseDimensions(attributes.getNamedItem("spriteEndRight").value);
	var spriteStartLeft = parseDimensions(attributes.getNamedItem("spriteStartLeft").value);
	var spriteEndLeft = parseDimensions(attributes.getNamedItem("spriteEndLeft").value);
	var alertTextDimensions = parseDimensions(attributes.getNamedItem("alertTextDimensions").value);
	var leftTextDimensions = parseDimensions(attributes.getNamedItem("leftTextDimensions").value);
	var rightTextDimensions = parseDimensions(attributes.getNamedItem("rightTextDimensions").value);
	var type = attributes.getNamedItem("type")?attributes.getNamedItem("type").value:"standard";
	
	var newDialoger = new Sburb.Dialoger(hiddenPos, alertPos, talkPosLeft, talkPosRight,
		spriteStartRight, spriteEndRight, spriteStartLeft, spriteEndLeft,
		alertTextDimensions, leftTextDimensions, rightTextDimensions,type);
	
	var box = attributes.getNamedItem("box").value;
  	newDialoger.setBox(box);

  	return newDialoger;
  	
}

Sburb.Dialoger.prototype.serialize = function(input){
	input+="<Dialoger "+Sburb.serializeAttributes(this,"hiddenPos", "alertPos", "talkPosLeft", "talkPosRight",
		"spriteStartRight", "spriteEndRight", "spriteStartLeft", "spriteEndLeft",
		"alertTextDimensions", "leftTextDimensions", "rightTextDimensions","type");
	input+="box='"+box.animation.sheet.name+"' ";
	input+=">";
	input+="</Dialoger>";
	return input;
}

function parseDimensions(input){
	var values = input.split(",");
	var dimensions = {};
	switch(values.length){
		case 4:
			dimensions.height = parseInt(values[3]);
		case 3:
			dimensions.width = parseInt(values[2]);
		case 2:
			dimensions.y = parseInt(values[1]);
		case 1:
			dimensions.x = parseInt(values[0]);
	}
	return dimensions;
}

return Sburb;
})(Sburb || {});
