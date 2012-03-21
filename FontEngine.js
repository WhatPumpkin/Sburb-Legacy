function FontEngine(text){
	//This is intended for monospace fonts
	this.font = "bold 14px Courier New";
	this.color = "#000000";
	this.text = typeof text == "string"?text:"";
	this.x=0;
	this.y=0;
	this.width=999999;
	this.height=999999;
	this.start=0;
	this.end=999999;
	this.lines = new Array();
	this.lineHeight = 17;
	this.charWidth = 8;
	
	this.formatQueue = new Array();
	
	this.prefixColours = {	aa : "#a10000",
							ac : "#416600",
							ag : "#005682",
							at : "#a15000",
							ca : "#6a006a",
							cc : "#77003c",
							cg : "#626262",
							ct : "#000056",
							ga : "#008141",
							gc : "#008282",
							ta : "#a1a100",
							tc : "#2b0057"
						  }
	
	this.setStyle = function(font,color,lineHeight,charWidth){
		this.font = typeof font == "string" ? font:this.font;
		this.color = typeof color == "string" ? color:this.color;
		this.lineHeight = typeof lineHeight == "number" ? lineHeight:this.lineHeight;
		this.charWidth = typeof charWidth == "number" ? charWidth:this.charWidth;
		this.parseText();
	}
	
	this.setText = function(text){
		this.text = text;
		this.parseEverything();
	}
	
	this.showSubText = function(start,end){
		this.start = typeof start == "number" ? start:this.start;
		this.end = typeof end == "number" ? end:this.end;
	}
	
	this.setDimensions = function(x,y,width,height){
		this.x = typeof x == "number" ? x:this.x;
		this.y = typeof y == "number" ? y:this.y;
		this.width = typeof width == "number" ? width:this.width;
		this.height = typeof height == "number" ? height:this.height;
		this.parseText();
	}
	this.parseEverything = function(){
		this.parseFormatting();
		this.parseText();
	}
	
	this.parseText = function(){ //break it up into lines
		this.lines = new Array();
		var i = 0;
		var lastSpace = 0;
		var lineStart = 0;
		for(i=0;i<this.text.length;i++){
			if(this.text.charAt(i)==" "){
				lastSpace = i;
			}else if(this.text.charAt(i)=="\n"){
				this.lines.push(this.text.substring(lineStart,i));
				lineStart = i+1;
				lastSpace = lineStart;
				continue;
			}
			if(i-lineStart>this.width/this.charWidth){
				if(lineStart==lastSpace){
					this.lines.push(this.text.substring(lineStart,i));
					lineStart = i;
					lastSpace = i;
				}else{
					this.lines.push(this.text.substring(lineStart,lastSpace));
					lineStart = lastSpace+1;
					lastSpace = lineStart;
				}
			}
		}
		this.lines.push(this.text.substring(lineStart,i));
	}
	
	this.parseFormatting = function(){
		this.formatQueue = new Array();
		var prefix = this.text.substring(0,this.text.indexOf(" "));
		var actor;
		if(prefix!="!"){
			if(prefix.indexOf("_")>=0){
				actor = prefix.substring(0,this.text.indexOf("_"));	
			}else{
				actor = prefix.substring(0,2);
			}
			this.parsePrefix(actor);
		}
		this.text = this.text.substring(this.text.indexOf(" ")+1,this.text.length);
		
		var index= this.text.indexOf("_");
		while(index>=0){
			var closing = false;
			for(var i=this.formatQueue.length-1;i>=0;i--){
				if(this.formatQueue[i].type=="italic" && this.formatQueue[i].maxIndex==999999){
					this.formatQueue[i].maxIndex=index;
					closing = true;
					break;
				}
			}
			if(!closing){
				this.addToFormatQueue(new FormatRange(index,999999,"italic"));
			}
			this.text = this.text.substring(0,index)+this.text.substring(index+1,this.text.length);
			this.realignFormatQueue(index,1);
			index = this.text.indexOf("_");
		}
		index = this.text.indexOf("/0x");
		while(index>=0){
			if(this.text.indexOf("/0x/")==index){
				for(var i=this.formatQueue.length-1;i>=0;i--){
					if(this.formatQueue[i].type=="colour" && this.formatQueue[i].maxIndex==999999){
						this.formatQueue[i].maxIndex=index;
						break;
					}
				}
				this.text = this.text.substring(0,index)+this.text.substring(index+4,this.text.length);
				this.realignFormatQueue(index,4);
			}else{
				this.addToFormatQueue(new FormatRange(index,999999,"colour","#"+this.text.substring(index+3,index+9)));
				this.text = this.text.substring(0,index)+this.text.substring(index+9,this.text.length);
				this.realignFormatQueue(index,9);
			}
			
			index = this.text.indexOf("/0x");
		}
	}
	
	this.addToFormatQueue = function(format){
		var newPlace = this.formatQueue.length;
		for(var i=0;i<this.formatQueue.length;i++){
			if(this.formatQueue[i].minIndex>format.minIndex){
				newPlace = i;
				break;
			}
		}
		this.formatQueue.splice(newPlace,0,format);
	}
	
	this.realignFormatQueue = function(startPos,shiftSize){
		for(var i=0;i<this.formatQueue.length;i++){
			var curFormat = this.formatQueue[i];
			if(curFormat.maxIndex>startPos && curFormat.maxIndex!=999999){
				curFormat.maxIndex-=shiftSize;
			}
			if(curFormat.minIndex>startPos){
				curFormat.minIndex-=shiftSize;
			}
		}
	}
	
	this.parsePrefix = function(prefix){
		this.formatQueue.push(new FormatRange(0,this.text.length,"colour",this.prefixColouration(prefix)));
	}
	
	this.prefixColouration = function(prefix){
		if(this.prefixColours[prefix.toLowerCase()]){
			return this.prefixColours[prefix.toLowerCase()];
		}else{
			return "#000000";
		}
	}
	
	this.nextBatch = function(){
		this.realignFormatQueue(-1,this.batchLength());
		this.lines.splice(0,Math.min(this.lines.length,Math.floor(this.height/this.lineHeight)));
		return this.lines.length;
	}
	
	this.draw = function(){
		var i;
		var lenCount;
		var linePos=0;
		var strStart,strEnd;
		var currentFormat = 0;
		var currentFormats = new Array();
		var nextStop;
		var curLine;
		stage.save();
		stage.textBaseline = "top";
		i=0;
		lenCount=0;
		
		while(i<Math.floor(this.height/this.lineHeight) && i<this.lines.length){
			curLine = this.lines[i];
			stage.fillStyle = this.color;
			stage.font = this.font;
			
			nextStop = curLine.length;
			
			if(currentFormat<this.formatQueue.length && this.formatQueue[currentFormat].minIndex<=lenCount+linePos){
				currentFormats.push(this.formatQueue[currentFormat]);
				currentFormat++;
			}
			for(var k=currentFormats.length-1;k>=0;k--){
				if(currentFormats[k].maxIndex<=lenCount+linePos){
					currentFormats.splice(k,1);
				}
			}
			for(var k=0;k<currentFormats.length;k++){
				if(currentFormats[k].type=="colour"){
					stage.fillStyle = currentFormats[k].extra;
				}else if(currentFormats[k].type=="italic"){
					stage.font = "italic "+this.font;
				}
			}
			if(currentFormat<this.formatQueue.length && this.formatQueue[currentFormat].minIndex<lenCount+curLine.length){
				if(this.formatQueue[currentFormat].minIndex<this.end){
					nextStop = Math.min(nextStop,this.formatQueue[currentFormat].minIndex-lenCount);
				}
			}
			for(var k=0;k<currentFormats.length;k++){
				if(currentFormats[k].maxIndex<this.end){
					nextStop = Math.min(nextStop,currentFormats[k].maxIndex-lenCount);
				}
			}
			if(nextStop!=curLine.length){
				strStart = linePos;
				strEnd = nextStop;
				linePos+=strEnd-strStart;
			}else{
				if(lenCount+curLine.length<=this.end){ //if the line wouldn't take me past the displayed length
					strEnd = curLine.length; //do the whole line
				}else{ //otherwise, if the line would take me past the displayed length
					strEnd = this.end-lenCount; //only show up to the limit
				}
				if(lenCount+linePos>=this.start){ //if the start of the line is within the bounds of the displayed length
					strStart = linePos; //display from the start of the line
				}else if(lenCount+curLine.length>=this.start){ //otherwise, if any part of the line should be displayed
					strStart = this.start-(lenCount)+linePos; //display from where we should start
				}else{ //otherwise, don't show this line at all
					strStart = linePos;
					strEnd = linePos;
				}
				linePos = -1;
			}
			stage.fillText(curLine.substring(strStart,strEnd),this.x+strStart*this.charWidth,this.y+i*this.lineHeight);
			if(linePos==-1){
				lenCount+=this.lines[i].length;
				linePos = 0;
				i++;
			}
		}
		stage.restore();
	}
	
	this.isShowingAll = function(){
		return this.end>=this.batchLength();
	}
	
	this.batchLength = function(){
		var len = 0;
		var i;
		for(i=0;i<Math.floor(this.height/this.lineHeight) && i<this.lines.length;i++){
			len+=this.lines[i].length;
		}
		return len;
	}
	
	this.showAll = function(){
		this.end = this.batchLength();
	}
	
	function FormatRange(minIndex,maxIndex,type,extra){
		this.minIndex = minIndex;
		this.maxIndex = maxIndex;
		this.type = type;
		this.extra = typeof extra == "string"?extra:"";
	}
}

/* Talking text markup
@ denotes a new dialogue box, the string following it indicates character animation, 
the first two characters indicating character specific formatting.
Alternatively, you can use an underscore to override the two character identifier
limit.

EX:

@CGIdle wordwordswords
@TTAngry Blahblahblah
@CGBored snoooooze
@Karkat_Stupid blarhagahl

Inserting underscores italicizes the text between them, e.g. _blah blah blah_
Inserting /0xff00ff colours all following text with the specificed colour.
Insterting /0x/ ends the previously specified behaviour.
*/
