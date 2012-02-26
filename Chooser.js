function Chooser(){
	this.choosing = false;
	this.choices = new Array();
	this.choice = 0;
	this.dialogs = new Array();
	
	this.nextChoice = function(){
		this.choice = (this.choice+1)%this.choices.length;
	}
	
	this.prevChoice = function(){
		this.choice = (this.choice-1+this.choices.length)%this.choices.length;
	}
	
	this.beginChoosing = function(x,y){
		this.choosing = true;
		this.choice = 0;
		this.dialogs = new Array();
		for(var i=0;i<this.choices.length;i++){
			var curEngine = new FontEngine(" > "+this.choices[i].name);
			curEngine.showSubText(0,1);
			curEngine.setDimensions(x,y+i*curEngine.lineHeight);
			this.dialogs.push(curEngine);
		}
	}
	
	this.draw = function(){
		stage.save();
		if(this.choosing){
			var x,y,width=160,height=0,i;
			x = this.dialogs[0].x;
			y = this.dialogs[0].y-1;
			for(i=0;i<this.dialogs.length;i++){
				width = Math.max(width,this.dialogs[i].lines[0].length*this.dialogs[i].charWidth);
			}
			height = this.dialogs[0].lineHeight*this.dialogs.length;
			stage.fillStyle = "#ff9900";
			stage.fillRect(x-6,y-6,width+12,height+13);
			stage.fillStyle = "#ffff00";
			stage.fillRect(x-2,y-2,width+4,height+5);
			stage.fillStyle = "#000000";
			stage.fillRect(x,y,width,height);
			for(i=0;i<this.dialogs.length;i++){
				this.dialogs[i].draw();
			}
		}
		stage.restore();
	}
	
	this.update = function(gameTime){
		if(this.choosing){
			for(var i=0;i<this.dialogs.length;i++){
				var curDialog = this.dialogs[i];
				curDialog.showSubText(null,curDialog.end+1);
				if(i==this.choice){
					if(gameTime%Stage.fps<Stage.fps/2){
						curDialog.start = 2;
					}else{
						curDialog.start = 0;
					}
					curDialog.color = "#cccccc";	
				}else{
					curDialog.start = 0;
					curDialog.color = "#ffffff";
				}
			}
		}
	}
}
