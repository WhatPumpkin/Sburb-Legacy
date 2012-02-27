function BGM(asset, startLoop, priority) {
    this.asset = asset;
    this.priority = priority ? priority : 0;
    this.setLoopPoints = function(start, end) {
	this.asset.startLoop = start;
	this.asset.endLoop = end;
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
	this.asset.currentTime = this.asset.startLoop;
	this.asset.play();
    }
    this.ended = function() {
	return this.asset.ended;
    }
}