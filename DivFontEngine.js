var Sburb = (function(Sburb){

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

Inserting underscores underlines the text between them, e.g. _blah blah blah_
Inserting /0xff00ff colours all following text with the specificed colour.
Insterting /0x/ ends the previously specified behaviour.
*/







////////////////////////////////////////////////
//DivFontEngine class
////////////////////////////////////////////////

//constructor
Sburb.DivFontEngine = function(text){

	//This is intended for monospace fonts
	//this.font-family 
	this.font = "bold 14px SburbFont";
	this.color = "#000000";
	this.text = typeof text == "string"?text:"";
	this.x=0;
	this.y=0;
	this.width=999999;
	this.height=999999;
	this.start=0;
	this.end=999999;
	//this.lines = [];
	//this.lineHeight = 17;
	//this.charWidth = 8;
	this.align = "left";

	this.formatted = true;
	
	this.formatQueue = [];
}

Sburb.DivFontEngine.prototype.prefixColours = {	
	aa : "#a10000",aradia : "#a10000",
	ac : "#416600",nepeta : "#416600",
	ag : "#005682",vriska : "#005682",
	at : "#a15000",tavros : "#a15000",
	ca : "#6a006a",eridan : "#6a006a",
	cc : "#77003c",feferi : "#77003c",
	cg : "#626262",karkat : "#626262",
	ct : "#000056",equius : "#000056",
	ga : "#008141",kanaya : "#008141",
	gc : "#008282",terezi : "#008282",
	ta : "#a1a100",sollux : "#a1a100",
	tc : "#2b0057",gamzee : "#2b0057",
	dave:"#e00707",meenah : "#77003c",
	rose:"#b536da",aranea : "#005682",
	kankri:"#ff0000",porrim: "#008141",
	latula:"#008282"
};

//set the style
Sburb.DivFontEngine.prototype.setStyle = function(font,color,lineHeight,charWidth){
	this.font = typeof font == "string" ? font:this.font;
	this.color = typeof color == "string" ? color:this.color;
	this.lineHeight = typeof lineHeight == "number" ? lineHeight:this.lineHeight;
	this.charWidth = typeof charWidth == "number" ? charWidth:this.charWidth;
	Sburb.dialogBin.style.font = this.font;
	Sburb.dialogBin.style.color = this.color;
	this.parseText();
}

//set formatted
Sburb.DivFontEngine.prototype.setFormatted = function(formatted){
	this.formatted = formatted;
}

//set the text
Sburb.DivFontEngine.prototype.setText = function(text){
	this.text = text;
	this.parseEverything();
	Sburb.dialogBin.innerHTML = this.text;
}

Sburb.DivFontEngine.prototype.setAlign = function(align){
	this.align = align;
	Sburb.dialogBin.style.textAlign = this.align;
}

//show a substring of the text
Sburb.DivFontEngine.prototype.showSubText = function(start,end){
	this.start = typeof start == "number" ? start:this.start;
	this.end = typeof end == "number" ? end:this.end;
}

//set the dimensions
Sburb.DivFontEngine.prototype.setDimensions = function(x,y,width,height){
	this.x = typeof x == "number" ? x:this.x;
	this.y = typeof y == "number" ? y:this.y;
	this.width = typeof width == "number" ? width:this.width;
	this.height = typeof height == "number" ? height:this.height;
	Sburb.dialogBin.style.top = this.y+"px";
	Sburb.dialogBin.style.left = this.x+"px";
	Sburb.dialogBin.style.width = this.width+"px";
	Sburb.dialogBin.style.height = this.height+"px";
	Sburb.dialogBin.style.display = "inline"; //show me.
	Sburb.dialogBin.style.overflow = "auto";
}

//parse and format the current text with the current settings
Sburb.DivFontEngine.prototype.parseEverything = function(){
	this.parseFormatting();
	this.parseText();
}

//parse the text
Sburb.DivFontEngine.prototype.parseText = function(){ 


}

//parse the formatting of the text
Sburb.DivFontEngine.prototype.parseFormatting = function(){
	this.formatQueue = [];
	if(this.formatted){
		
		this.escaped = {};
		
		this.parsePrefixes();
	
		this.parseEscapes();
	
		
	
		this.parseUnderlines();
	
		this.parseColors();
	}
}

Sburb.DivFontEngine.prototype.parseEscapes = function(){

}

Sburb.DivFontEngine.prototype.parsePrefixes = function(){
	var prefix = this.text.split(" ",1)[0];
	var actor;
	if(prefix!="!"){
		if(prefix.indexOf("_")>=0){
			actor = prefix.substring(0,this.text.indexOf("_"));	
		}else{
			actor = prefix.substring(0,2);
		}
	}
	this.text = this.text.substring(prefix.length,this.text.length).trim();
	this.text = "<span style='color:" + this.prefixColouration(actor) + ";font:"+ this.font + "'>" + this.text + "</span>";
}

Sburb.DivFontEngine.prototype.parseUnderlines = function(){
	this.text = this.text.replace("/_","~~UNDERSCORE~~"); //Crude but effective. (SO HACKY OMG)
	this.text = this.text.replace("_([^_]+)_","<span style='text-decoration:underline'>$1</span>");
	this.text = this.text.replace("~~UNDERSCORE~~","_");
}

Sburb.DivFontEngine.prototype.parseColors = function(){
	this.text = this.text.replace("/x((?:[0-9a-fA-F]{6}|0)/?)","</span><span style='color:$1'>");
}


//get the colour of a prefix
Sburb.DivFontEngine.prototype.prefixColouration = function(prefix){
	if(prefix&&this.prefixColours[prefix.toLowerCase()]){
		return this.prefixColours[prefix.toLowerCase()];
	}else{
		return "#000000";
	}
}

//get the next "box" of lines
Sburb.DivFontEngine.prototype.nextBatch = function(){
	Sburb.dialogBin.innerHTML = "";
	Sburb.dialogBin.style.display = "none"; //hide me.
	return false;
}

Sburb.DivFontEngine.prototype.onLastBatch = function(){
	return true;
}
//draw the FontEngine
Sburb.DivFontEngine.prototype.draw = function(){
	//NOPE DIV	
}

//is the contents of the current "box" fully displayed
Sburb.DivFontEngine.prototype.isShowingAll = function(){
	//Yeah at this point I'm just showing all the things all the time
	return true;
}

//get the length of the current "box"
Sburb.DivFontEngine.prototype.batchLength = function(){
	//Sure I'll take whatever.
	return 9999;
}

//show the contents of the current "box"
Sburb.DivFontEngine.prototype.showAll = function(){
	//TODO: Don't always show everything
	//this.end = this.batchLength();
}






////////////////////////////////////
//FormatRange class
////////////////////////////////////

Sburb.FormatRange = function(minIndex,maxIndex,type,extra){
	this.minIndex = minIndex;
	this.maxIndex = maxIndex;
	this.type = type;
	this.extra = typeof extra == "string"?extra:"";
}





return Sburb;
})(Sburb || {});
