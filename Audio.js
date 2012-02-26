function BGM(asset, startLoop, priority) {
    this.asset = asset;
    this.priority = priority ? priority : 0;
    this.startLoop = startLoop ? startLoop: 0;
    asset.addEventListener('ended', function() {
	if(startLoop) {
	    asset.currentTime = startLoop;
	}
    },
			   false);
    this.setLoopPoints = function(start, end) {
	this.startLoop = start;
	this.endLoop = end;
	// do we need to have an end point? does that even make sense
    };
    this.play = function() {
	this.asset.play();
    }
    this.pause = function() {
	this.asset.pause();
    }
    this.stop = function() {
	this.pause();
	this.asset.currentTime = 0;
    }
    this.loop = function() {
	this.asset.currentTime = this.startLoop;
	this.asset.play();
    }
    this.ended = function() {
	return this.asset.ended;
    }
}