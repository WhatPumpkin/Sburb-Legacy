var globalVolume = 1;

function BGM(asset, startLoop, priority) {
    inherit(this,new Sound(asset));
    this.startLoop;
    this.endLoop;
    
    this.setLoopPoints = function(start, end) {
			tmpAsset = this.asset
			tmpAsset.addEventListener('ended', function() {
				tmpAsset.currentTime = start;
				tmpAsset.play();
			},false);
			this.startLoop = start;
			this.endLoop = end;
			// do we need to have an end point? does that even make sense
    };
    
    this.loop = function() {
			this.asset.currentTime = this.startLoop;
			this.asset.play();
    }
    
    this.setLoopPoints(startLoop);
    
}

function Sound(asset){
	this.asset = asset;
	
	this.play = function() {
		this.fixVolume();
		this.asset.play();	
  }
  
  this.pause = function() {
		this.asset.pause();
  }
  
  this.stop = function() {
		this.pause();
		this.asset.currentTime = 0;
  }
  this.ended = function() {
		return this.asset.ended;
  }
  this.fixVolume = function(){
  	this.asset.volume = globalVolume;
  }
}
