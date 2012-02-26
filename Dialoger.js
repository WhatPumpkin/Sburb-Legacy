function Dialoger(){
	this.talking = false;
	this.queue = new Array();
	this.dialog = new FontEngine();
	this.colorMap = {CG:"#000000"};
	this.box = null;
	this.alertPos = {x:56, y:140}
	this.talkPos1 = {x:0, y:140}
	this.talkPos2 = {x:112, y:140}
	this.hiddenPos = {x:-1000, y:140}
	
	this.nudge = function(){
		if(this.dialog.isShowingAll()){
			if(this.dialog.nextBatch()){
				this.dialog.showSubText(0,0);
			}else{
				if(this.queue.length>0){
					this.nextDialog();
				}else{
					this.talking = false;
				}
			}
		}else{
			this.dialog.showAll();
		}
	}
	
	this.startDialog = function(info){
		this.queue = info.split("@");
		this.queue.reverse();
		this.queue.pop();
		this.nextDialog();
		this.box.x=-this.box.width;
		this.talking = true;
	}
	
	this.nextDialog = function(){
		var nextDialog = this.queue.pop();
		this.dialog.setText(nextDialog.substring(nextDialog.indexOf(" ")+1,nextDialog.length));
		this.dialog.showSubText(0,0);
	}
	
	this.update = function(gameTime){
		if(this.talking){
			this.box.y = this.alertPos.y;	
			if(this.box.x<this.alertPos.x){
				this.box.x+=110;
				if(this.box.x>=this.alertPos.x){
					this.box.x=this.alertPos.x;
					this.dialog.setDimensions(this.box.x+30,this.box.y+30,this.box.width-80,this.box.height-50);
				}
			}else {
				this.dialog.showSubText(null,this.dialog.end+2);
			}
		}else {
			if(this.box.x>this.hiddenPos.x){
				this.box.x-=120;
			}
		}
	}
	
	this.setBox = function(box,x,y){
		this.box = box;
		this.hiddenPos = {x: (typeof x == "number" ? x:-box.width), y: (typeof y == "number" ? y:this.hiddenPos.y)};
	}
	
	this.draw = function(){
		this.box.draw();
		if(this.talking){
			this.dialog.draw();
		}
	}
}
