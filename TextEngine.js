var Sburb = (function(Sburb){



////////////////////////////////////////////////
//TextEngine class
////////////////////////////////////////////////

//constructor
Sburb.TextEngine = function(parsing, parser, renderer){
	this.parsing = parsing?parsing:this.PARSE_NONE;
	this.parser = parser?parser:this.PARSER_DEFAULT;
	this.renderer = renderer?renderer:this.RENDERER_DEFAULT;
}

//static constants
Sburb.TextEngine.prototype.PARSE_NONE = "none";
Sburb.TextEngine.prototype.PARSE_SINGLE = "single";
Sburb.TextEngine.prototype.PARSE_MULTI = "multi";

Sburb.TextEngine.prototype.PARSER_DEFAULT = null;
Sburb.TextEngine.prototype.RENDERER_DEFAULT = null;

//draw the text
Sburb.TextEngine.prototype.draw = function(){
	this.renderer.draw();
}

//set the default style
//underline: false, true
//colour: #000000
//font: font
Sburb.TextEngine.prototype.setStyle = function(styleName, value){
	this.parser.setStyle(styleName,value);
}

//set if any parsing should apply (PARSE_NONE, PARSE_SINGLE, PARSE_MULTI)
Sburb.TextEngine.prototype.setParsing = function(parsing){
	this.parsing = parsing;
}

Sburb.TextEngine.prototype.setTextSpeed = function(textSpeed){
	this.renderer.setTextSpeed(textSpeed);
}

//set the text
Sburb.TextEngine.prototype.setText = function(text){
	if(this.parsing==this.PARSE_NONE){
		this.parser.parseNone(text);
	}else if(this.parsing==this.PARSE_SINGLE){
		this.parser.parseNoWindow(text);
	}else if(this.parsing==this.PARSE_MULTI){
		this.parser.parseFull(text);
	}
	this.renderer.setBatches(this.parser.getBatches());
	this.renderer.setActors(this.parser.getActors());
	this.renderer.setAnimations(this.parser.getAnimations());
	this.renderer.setBoxes(this.parser.getBoxes());
	this.renderer.setBackgrounds(this.parser.getBackgrounds());
	this.renderer.setExtras(this.parser.getExtras());
	this.renderer.setStyles(this.parser.getStyles());
}

//show a substring of the text
Sburb.TextEngine.prototype.showSubText = function(start,end){
	this.renderer.showSubText(start,end);
}

//set the dimensions
Sburb.TextEngine.prototype.setDimensions = function(x,y,width,height){
	this.renderer.setDimensions(x,y,width,height);
}

//is all the text that can fit in the current box showing?
Sburb.TextEngine.prototype.isShowingWholeBox = function(){
	return this.renderer.isShowingAll();
}

//show all the text that can fit in the current box
Sburb.TextEngine.prototype.showWholeBox = function(){
	return this.renderer.showAll();
}

//show a bit more of the text
Sburb.TextEngine.prototype.showMoreOfBox = function(){
	this.renderer.showMoreOfBox();
}

//is there another box of text in this batch?
Sburb.TextEngine.prototype.hasNextBox = function(){
	return this.renderer.hasNextBox();
}

//show the next box
Sburb.TextEngine.prototype.nextBox = function(){
	return this.renderer.nextBox();
}

//show the next batch of text
Sburb.TextEngine.prototype.nextBatch = function(){
	this.renderer.nextBatch();
}

//is there another batch of text (e.g. each time the character changes that's usually a "batch")?
Sburb.TextEngine.prototype.hasNextBatch = function(){
	return this.renderer.hasNextBatch();
}

//get the actor assigned to the current batch
Sburb.TextEngine.prototype.getActor = function(){
	return this.renderer.getActor();
}

//get the animation assigned to the current batch
Sburb.TextEngine.prototype.getAnimation = function(){
	return this.renderer.getAnimation();
}

//get the box assigned to the current batch
Sburb.TextEngine.prototype.getBox = function(){
	return this.renderer.getBox();
}

//get the background assigned to the current batch
Sburb.TextEngine.prototype.getBackground = function(){
	return this.renderer.getBackground();
}

//get any extra information assigned to the current batch
Sburb.TextEngine.prototype.getExtra = function(){
	return this.renderer.getExtra();
}

//get the style assigned to the current batch
Sburb.TextEngine.prototype.getStyle = function(){
	return this.renderer.getStyle();
}





////////////////////////////////////////////////////////
//Abstract TextParser
////////////////////////////////////////////////////////

//Constructor
Sburb.TextParser = function(){
	this.batches = null;
	this.actors = null;
	this.animations = null;
	this.boxes = null;
	this.backgrounds = null;
	this.extras = null;
	this.styles = null;
	this.defaultStyles = {};
}

//static constants
Sburb.TextParser.ACTOR_COLORS = {	
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


//////////////ABSTRACT METHODS////////////////////////////////

//Text should come back as-is, still apply default styles
Sburb.TextParser.prototype.parseNone = function(text){}
//Text should come back with styles applied, but nothing to do with batches
Sburb.TextParser.prototype.parseNoBatch = function(text){}
//Text should come back with styles applied, and batching applied
Sburb.TextParser.prototype.parseFull = function(text){}


/////////////NON-ABSTRACT METHODS/////////////////////////////

//Set the default value for the given style
Sburb.TextParser.prototype.setStyle = function(styleName, value){
	this.defaultStyles[styleName] = value;
}

//Array of cleaned text, as it should be rendered
Sburb.TextParser.prototype.getBatches = function(){return this.batches}
//Array of actors associated with each batch
Sburb.TextParser.prototype.getActors = function(){return this.actors}
//Array of animations associated with each batch
Sburb.TextParser.prototype.getAnimations = function(){return this.animations}
//Array of boxes associated with each batch
Sburb.TextParser.prototype.getBoxes = function(){return this.boxes}
//Array of backgrounds associated with each batch
Sburb.TextParser.prototype.getBackgrounds = function(){return this.backgrounds}
//Array of extras associated with each batch
Sburb.TextParser.prototype.getExtras = function(){return this.extras}
//Array of Arrays of TextStyleTokens (sorted by increasing index) associated with each batch
Sburb.TextParser.prototype.getStyles = function(){return this.styles}





///////////////////////////////////////////////////////
//TextStyleToken
///////////////////////////////////////////////////////

//constructor
Sburb.TextStyleToken = function(index, styles){
	this.index = index; //index of character where it comes into effect
	this.styles = styles; //map of styleNames to values (e.g. {font:"Courier", color:"#00ff00", italic:"false"})
}





///////////////////////////////////////////////////////
//Abstract TextRenderer
///////////////////////////////////////////////////////

//constructor
Sburb.TextRenderer = function(){
	this.batches = [];
	this.actors = [];
	this.animations = [];
	this.boxes = [];
	this.backgrounds = [];
	this.extras = [];
	this.styles = [];
	
	this.currentBatch = 0;
	this.textSpeed = 2; //rate at which characters are revealed in showMoreOfBox()
	
	this.x = 0;
	this.y = 0;
	this.width = 0; //if <=0, unbounded width
	this.height = 0; //if <=0, unbounded height
}

/////////////////////ABSTRACT METHODS//////////////////////

//show a substring of the text
Sburb.TextRenderer.prototype.showSubText = function(start,end){}

//is all the text that can fit in the current box showing?
Sburb.TextRenderer.prototype.isShowingWholeBox = function(){}

//show all the text that can fit in the current box
Sburb.TextRenderer.prototype.showWholeBox = function(){}

//show a bit more of the text
Sburb.TextRenderer.prototype.showMoreOfBox = function(){}

//is there another box of text in this batch?
Sburb.TextRenderer.prototype.hasNextBox = function(){}

//show the next box
Sburb.TextRenderer.prototype.nextBox = function(){}

//show the next batch of text
Sburb.TextRenderer.prototype.nextBatch = function(){}

//draw the text
Sburb.TextRenderer.prototype.draw = function(){}

//reset back to batch 0
Sburb.TextRenderer.prototype.reset = function(){}

/////////////////////////NON-ABSTRACT METHODS///////////////////////////

//set the dimensions
Sburb.TextRenderer.prototype.setDimensions = function(x,y,width,height){
	this.x = typeof x == "number" ? x : this.x;
	this.y = typeof y == "number" ? y : this.y;
	this.width = typeof width == "number" ? width : this.width;
	this.height = typeof height == "number" ? height : this.height;
}

Sburb.TextRenderer.prototype.setBatches = function(batches){this.batches = batches;}
Sburb.TextRenderer.prototype.setActors = function(actors){this.actors = actors;}
Sburb.TextRenderer.prototype.setAnimations = function(animations){this.animations = animations;}
Sburb.TextRenderer.prototype.setBoxes = function(boxes){this.boxes = boxes;}
Sburb.TextRenderer.prototype.setBackgrounds = function(backgrounds){this.backgrounds = backgrounds;}
Sburb.TextRenderer.prototype.setExtras = function(extras){this.extras = extras;}
Sburb.TextRenderer.prototype.setStyles = function(styles){this.styles = styles;}
Sburb.TextRenderer.prototype.setTextSpeed = function(textSpeed){this.textSpeed = textSpeed;}

//is there another batch of text (e.g. each time the character changes that's usually a "batch")?
Sburb.TextRenderer.prototype.hasNextBatch = function(){return this.batches.length-1<this.currentBatch}

//get the actor assigned to the current batch
Sburb.TextRenderer.prototype.getActor = function(){return this.actors[this.currentBatch]}

//get the animation assigned to the current batch
Sburb.TextRenderer.prototype.getAnimation = function(){return this.animations[this.currentBatch]}

//get the box assigned to the current batch
Sburb.TextRenderer.prototype.getBox = function(){return this.boxes[this.currentBatch]}

//get the background assigned to the current batch
Sburb.TextRenderer.prototype.getBackground = function(){return this.boxes[this.currentBatch]}

//get any extra information assigned to the current batch
Sburb.TextRenderer.prototype.getExtra = function(){return this.extras[this.currentBatch]}

//get the style assigned to the current batch
Sburb.TextRenderer.prototype.getStyle = function(){return this.styles[this.currentBatch]}






return Sburb;
})(Sburb || {});
