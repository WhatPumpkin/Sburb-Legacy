function Animation(name,sheet,x,y,colSize,rowSize,startPos,length,frameInterval,loopNum,followUp,flipX,flipY){
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
	this.flipX = flipX?true:false;
	this.flipY = flipY?true:false;
	
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
		
		if(this.flipX){
			stageX = -stageX-stageWidth;
			x = -x;
		}
		if(this.flipY){
			stageY = -stageY-stageHeight;
			y = -y;
		}
		
		x= Math.round((this.x+x)/Stage.scaleX)*Stage.scaleX;
		y= Math.round((this.y+y)/Stage.scaleY)*Stage.scaleY;
	
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
			if(frameX>=this.sheet.width){
				return;
			}
		}
		
		delta = y-stageY;
		if(delta<0){
			frameY-=delta;
			drawHeight+=delta;
			y=stageY;
			if(frameY>=this.sheet.height){
				return;
			}
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
		
		var scaleX = 1;
		var scaleY = 1;
		
		if(this.flipX){
			scaleX = -1;
		}
		if(this.flipY){
			scaleY = -1;
		}
		if(scaleX!=1 || scaleY!=1){
			stage.scale(scaleX,scaleY);
		}
		stage.drawImage(this.sheet,frameX,frameY,drawWidth,drawHeight,x,y,drawWidth,drawHeight);
		if(scaleX!=1 || scaleY!=1){
			stage.scale(scaleX,scaleY);
		}
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
		output = output.concat("\n<Animation "+
			("sheet='"+this.sheet.name+"' ")+
			((this.name!="image")?"name='"+this.name+"' ":"")+
			serializeAttributes(this,"x","y")+
			((this.rowSize!=this.sheet.height)?"rowSize='"+this.rowSize+"' ":"")+
			((this.colSize!=this.sheet.width)?"colSize='"+this.colSize+"' ":"")+
			serializeAttribute(this,"startPos")+
			((this.length!=1)?"length='"+this.length+"' ":"")+
			((this.frameInterval!=1)?"frameInterval='"+this.frameInterval+"' ":"")+
			((this.loopNum!=-1)?"loopNum='"+this.loopNum+"' ":"")+
			serializeAttributes(this,"folowUp","flipX","flipY")+
			" />");
		return output;
	}
}

function parseAnimation(animationNode, assetFolder){
	var attributes = animationNode.attributes;

	var name = "image";
	var sheet = null;
	var x = 0;
	var y = 0;
	var colSize = null;
	var rowSize = null;
	var startPos = 0;
	var length = 1;
	var frameInterval = 1;
	var loopNum = -1;
	var followUp = null;
	
	var temp;
	name = (temp = attributes.getNamedItem("name"))?temp.value:name;
	sheet = (temp = attributes.getNamedItem("sheet"))?assetFolder[temp.value]:sheet;
	x = (temp = attributes.getNamedItem("x"))?parseInt(temp.value):x;
	y = (temp = attributes.getNamedItem("y"))?parseInt(temp.value):y;
	length = (temp = attributes.getNamedItem("length"))?parseInt(temp.value):length;
	colSize = (temp = attributes.getNamedItem("colSize"))?parseInt(temp.value):Math.round(sheet.width/length);
	rowSize = (temp = attributes.getNamedItem("rowSize"))?parseInt(temp.value):sheet.height;
	startPos = (temp = attributes.getNamedItem("startPos"))?parseInt(temp.value):startPos;
	
	frameInterval = (temp = attributes.getNamedItem("frameInterval"))?parseInt(temp.value):frameInterval;
	loopNum = (temp = attributes.getNamedItem("loopNum"))?parseInt(temp.value):loopNum;
	followUp = (temp = attributes.getNamedItem("followUp"))?temp.value:followUp;
	var flipX = (temp = attributes.getNamedItem("flipX"))?temp.value!="false":false;
	var flipY = (temp = attributes.getNamedItem("flipY"))?temp.value!="false":false;
	
	return new Animation(name,sheet,x,y,colSize,rowSize,startPos,length,frameInterval,loopNum,followUp,flipX,flipY);
}
