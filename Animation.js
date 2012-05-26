function Animation(name,sheet,x,y,colSize,rowSize,startPos,length,frameInterval,loopNum,followUp){
	this.sheet = sheet;
	this.x = x;
	this.y = y;
	this.rowSize = rowSize;
	this.colSize = colSize;
	this.startPos = startPos;
	this.length = length;
	this.frameInterval = frameInterval;
	this.curInterval = 0;
	this.curFrame = 0;
	this.numRows = sheet.height/rowSize;
	this.numCols = sheet.width/colSize;
	this.name = name;
	this.loopNum = typeof loopNum == "number"?loopNum:-1;
	this.curLoop = 0;
	this.followUp = followUp;
	
	this.nextFrame = function() {
		this.curFrame++;
		if(this.curFrame>=this.length){
			if(this.curLoop==this.loopNum){
				this.curFrame = this.length-1;
			}else{
				this.curFrame=0;
				if(this.loopNum>=0){
					this.curLoop++;
				}
			}
		}
	}
	this.update = function(elapsedTime){
		this.curInterval += elapsedTime;
		while(this.curInterval>this.frameInterval){
			this.curInterval-=this.frameInterval;
			this.nextFrame();
		}
	}
	this.staticImg = function(){
		var colNum = (this.startPos+this.curFrame)%this.numCols;
		var rowNum = Math.floor((this.startPos+this.curFrame-colNum)/this.numRows);
		var frameX = colNum*this.colSize;
		var frameY = rowNum*this.rowSize;
		var framediv = $(sprintf('<div class="spriteWindow" style="position:relative;width:%spx;height:%spx;overflow:hidden;"></div>',
					 this.colSize, this.rowSize));
		var spriteimg = $(sprintf('<img src="%s" style="position:absolute;left:-%spx;top:-%spx;" /> ',
					  this.sheet.src, frameX, frameY
					 )
				 ).appendTo(framediv);
		return framediv;
	}
	
	this.draw = function(x,y){
		
		var stageX = Stage.offset?Stage.x:0;
		var stageY = Stage.offset?Stage.y:0;
		var stageWidth = Stage.width;
		var stageHeight = Stage.height;
		
		x=stageSnapX(this.x+x);
		y=stageSnapY(this.y+y);
	
		var colNum = ((this.startPos+this.curFrame)%this.numCols);
		var rowNum = (Math.floor((this.startPos+this.curFrame-colNum)/this.numRows));
		var frameX = colNum*this.colSize;
		var frameY = rowNum*this.rowSize;
		var drawWidth = this.colSize;
		var drawHeight = this.rowSize;
		
		var delta = x-stageX;
		if(delta<0){
			frameX-=delta;
			drawWidth+=delta;
			x=stageX;
		}
		
		if(frameX>=this.sheet.width){
			return;
		}
		
		delta = y-stageY;
		if(delta<0){
			frameY-=delta;
			drawHeight+=delta;
			y=stageY;
		}
		
		if(frameY>=this.sheet.height){
			return;
		}
		
		delta = drawWidth+x-stageX-stageWidth;
		if(delta>0){
			drawWidth-=delta;
		}
		if(drawWidth<=0){
			return;
		}
		
		delta = drawHeight+y-stageY-stageHeight;
		if(delta>0){
			drawHeight-=delta;
		}
		if(drawHeight<=0){
			return;
		}
		
		stage.drawImage(this.sheet,frameX,frameY,drawWidth,drawHeight,x,y,drawWidth,drawHeight);
	}
	/*
	
	this.draw = function(x,y){
		
		x+=this.x;
		y+=this.y;
		var colNum = (this.startPos+this.curFrame)%this.numCols;
		var rowNum = Math.floor((this.startPos+this.curFrame-colNum)/this.numRows);
		var frameX = colNum*this.colSize;
		var frameY = rowNum*this.rowSize;
		
		stage.drawImage(this.sheet,stageSnapX(frameX),stageSnapY(frameY),this.colSize,this.rowSize,stageSnapX(x),stageSnapY(y),this.colSize,this.rowSize);

		//sourcerect = frameX,frameY,colSize,rowSize
		//destrect = x,y,colSize,rowSize
	}*/
	
	this.reset = function(){
		this.curFrame = 0;
		this.curInterval = 0;
		this.curLoop = 0;
	}
	
	this.hasPlayed = function(){
		return this.curLoop == this.loopNum && this.curFrame==this.length-1;
	}
	
	this.setColSize = function(newSize){
		this.colSize = newSize;
		this.numCols = this.sheet.width/this.colSize;
		this.reset();
	}
	
	this.setRowSize = function(newSize){
		this.rowSize = newSize;
		this.numRows = this.sheet.height/this.rowSize;
		this.reset();
	}
	
	this.setSheet = function(newSheet){
		this.sheet = newSheet;
		this.numRows = this.sheet.height/this.rowSize;
		this.numCols = this.sheet.width/this.colSize;
		this.reset();
	}
	
	this.isVisuallyUnder = function(x,y){
		if(x>=this.x && x<=this.x+this.colSize){
			if(y>=this.y && y<=this.y+this.rowSize){
				return true;
			}
		}
		return false;
	}
	
	this.clone = function(x,y){
		return new Animation(this.name, this.sheet, x+this.x, y+this.y, this.colSize,this.rowSize, this.startPos, this.length, this.frameInterval, this.loopNum);
	}
	
	this.serialize = function(output){
		output = output.concat("\n<Animation name='"+this.name+
			"' sheet='"+this.sheet.name+
			(this.x?"' x='"+this.x:"")+
			(this.y?"' y='"+this.y:"")+
			"' rowSize='"+this.rowSize+
			"' colSize='"+this.colSize+
			(this.startPos?"' startPos='"+this.startPos:"")+
			(this.length!=1?"' length='"+this.length:"")+
			(this.frameInterval!=1?"' frameInterval='"+this.frameInterval:"")+
			(this.loopNum!=-1?"' loopNum='"+this.loopNum:"")+
			(this.followUp?"' followUp='"+this.followUp:"")+
			"' />");
		return output;
	}
}

function stageSnap(object){
	object.x = Math.round(object.x/Stage.scaleX)*Stage.scaleX;
	object.y = Math.round(object.y/Stage.scaleY)*Stage.scaleY;
}

function stageSnapX(x){
	return Math.round(x/Stage.scaleX)*Stage.scaleX;
}

function stageSnapY(y){
	return Math.round(y/Stage.scaleY)*Stage.scaleY;
}

function parseAnimation(animationNode, assetFolder){
	var attributes = animationNode.attributes;
	return new Animation(attributes.getNamedItem("name").value,
  					    assetFolder[attributes.getNamedItem("sheet").value],
  					    attributes.getNamedItem("x")?parseInt(attributes.getNamedItem("x").value):0,
  					    attributes.getNamedItem("y")?parseInt(attributes.getNamedItem("y").value):0,
  					    parseInt(attributes.getNamedItem("colSize").value),
  					    parseInt(attributes.getNamedItem("rowSize").value),
  					    attributes.getNamedItem("startPos")?parseInt(attributes.getNamedItem("startPos").value):0,
  					    attributes.getNamedItem("length")?parseInt(attributes.getNamedItem("length").value):1,
  					    attributes.getNamedItem("frameInterval")?parseInt(attributes.getNamedItem("frameInterval").value):1,
  					    attributes.getNamedItem("loopNum")?parseInt(attributes.getNamedItem("loopNum").value):-1,
  					    attributes.getNamedItem("followUp")?attributes.getNamedItem("followUp").value:null);
}
