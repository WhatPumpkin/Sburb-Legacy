var Sburb = (function(Sburb){

Sburb.globalVolume = 1;




///////////////////////////////////////
//Sound Class
///////////////////////////////////////

//Constructor
Sburb.Sound = function(asset){
	this.asset = asset;
}

//play this sound
Sburb.Sound.prototype.play = function() {
	this.fixVolume();
	this.asset.play();	
	//console.log("starting the sound...");
}

//pause this sound
Sburb.Sound.prototype.pause = function() {
	this.asset.pause();
	//console.log("pausing the sound...");
}

//stop this sound
Sburb.Sound.prototype.stop = function() {
	this.pause();
	this.asset.currentTime = 0;
	//console.log("stopping the sound...");
}

//has the sound stopped
Sburb.Sound.prototype.ended = function() {
	return this.asset.ended;
}

//ensure the sound is playing at the global volume
Sburb.Sound.prototype.fixVolume = function(){
	this.asset.volume = Sburb.globalVolume;
	//console.log("fixing the volume...");
}





/////////////////////////////////////
//BGM Class (inherits Sound)
/////////////////////////////////////

//constructor
Sburb.BGM = function(asset, startLoop, priority) {
    Sburb.Sound.call(this,asset);
    this.startLoop = 0;
    this.endLoop = 0;
    
    this.setLoopPoints(startLoop?startLoop:0); 
}

Sburb.BGM.prototype = new Sburb.Sound();

//set the points in the sound to loop
Sburb.BGM.prototype.setLoopPoints = function(start, end) {
	tmpAsset = this.asset
	tmpAsset.addEventListener('ended', function() {
	//	console.log("I'm loopin' as hard as I can cap'n! (via event listener)");
		tmpAsset.currentTime = start;
		tmpAsset.play();
	},false);
	this.startLoop = start;
	this.endLoop = end;
	// do we need to have an end point? does that even make sense
}

//loop the sound
Sburb.BGM.prototype.loop = function() {
	//	console.log("looping...");
		this.asset.currentTime = this.startLoop;
		this.asset.play();
}



return Sburb;
})(Sburb || {});
