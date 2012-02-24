//no dependencies
function Animation(sheet,colSize,rowSize,startPos,length,frameInterval){
	this.sheet = sheet;
	this.rowSize = rowSize;
	this.colSize = colSize;
	this.startPos = startPos;
	this.length = length;
	this.frameInterval = frameInterval;
	this.curInterval = 0;
	this.curFrame = 0;
	this.numRows = sheet.height/rowSize;
	this.numCols = sheet.width/colSize;
	
	this.update = function(elapsedTime){
		//alert(this.numRows+" "+this.numCols);
		this.curInterval += elapsedTime;
		while(this.curInterval>this.frameInterval){
			this.curInterval-=this.frameInterval;
			this.curFrame = (this.curFrame+1)%this.length;
		}
	}
	
	
	this.draw = function(x,y){
		var colNum = (this.startPos+this.curFrame)%this.numCols;
		var rowNum = Math.floor((this.startPos+this.curFrame-colNum)/this.numRows);
		var frameX = colNum*this.colSize;
		var frameY = rowNum*this.rowSize;
		
		stage.drawImage(this.sheet,frameX,frameY,this.colSize,this.rowSize,x,y,this.colSize,this.rowSize);

		//sourcerect = frameX,frameY,colSize,rowSize
		//destrect = x,y,colSize,rowSize
	}
	
	this.reset = function(){
		this.curFrame = 0;
		this.curInterval = 0;
	}
}
