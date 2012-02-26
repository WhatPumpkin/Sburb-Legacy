function FontEngine(text){
	//This is intended for monospace fonts
	this.font = "11px Courier";
	this.color = "#000000";
	this.text = typeof text == "string"?text:"";
	this.x=0;
	this.y=0;
	this.width=999999;
	this.height=999999;
	this.start=0;
	this.end=999999;
	this.lines = new Array();
	this.lineHeight = 11;
	this.charWidth = 8;
	
	this.setStyle = function(font,color,lineHeight,charWidth){
		this.font = typeof font == "string" ? font:this.font;
		this.color = typeof color == "string" ? color:this.color;
		this.lineHeight = typeof lineHeight == "number" ? lineHeight:this.lineHeight;
		this.charWidth = typeof charWidth == "number" ? charWidth:this.charWidth;
		this.parseText();
	}
	
	this.setText = function(text){
		this.text = text;
		this.parseText();
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
	
	this.nextBatch = function(){
		this.lines.splice(0,Math.min(this.lines.length,Math.floor(this.height/this.lineHeight)));
		return this.lines.length;
	}
	
	this.draw = function(){
		var i;
		var lenCount;
		var strStart,strEnd;
		stage.save();
		stage.textBaseline = "top";
		stage.fillStyle = this.color;
		stage.font = this.font;
		i=0;
		lenCount=0;
		while(i<Math.floor(this.height/this.lineHeight) && i<this.lines.length){
			if(lenCount+this.lines[i].length<=this.end){
				strEnd = this.lines[i].length;
			}else{
				strEnd = this.end-lenCount;
			}
			if(lenCount>=this.start){
				strStart = 0;
			}else if(lenCount+this.lines[i].length>=this.start){
				strStart = this.start-lenCount;
			}else{
				strStart = 0;
				strEnd = 0;
			}
			stage.fillText(this.lines[i].substring(strStart,strEnd),this.x+strStart*this.charWidth,this.y+i*this.lineHeight);
			lenCount+=this.lines[i].length;
			i++
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
*/
