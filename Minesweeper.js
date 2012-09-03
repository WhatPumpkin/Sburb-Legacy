var Sburb = (function(Sburb) {

	// //////////////////////////////////
	// Minesweeper Class
	// Copyright (c) 2012, Volker Schuller
	// Same licensing terms as in README-ownership-liscensing.txt
	// //////////////////////////////////

	Minesweeper = function(width, heigth, number) {
		this.width = width;
		this.heigth = heigth;
		this.number = number;
		this.mines = [];
		this.visited = [];
		var x;
		var y;
		for (x = 0; x < width; x++) {
			var mineRow = [];
			var visitedrow = [];
			for (y = 0; y < heigth; y++) {
				mineRow.push(false);
				visitedrow.push(false);
			}
			this.mines.push(mineRow);
			this.visited.push(visitedrow);
		}
		for ( var i = 0; i < number; i++) {
			do {
				x = Math.floor((Math.random() * width));
				y = Math.floor((Math.random() * heigth));
			} while (this.mines[x][y] == true);
			this.mines[x][y] = true;
		}
	};

	Minesweeper.prototype.checkForMines = function(x, y, foundnumbers) {
		if ((x < 0) || (y < 0) || (x > this.width - 1) || (y > this.heigth - 1))
			return;
		if (this.visited[x][y])
			return;
		if (this.mines[x][y])
			throw "mine";
		this.calculateNumberOfMines(x, y, foundnumbers);
	}

	Minesweeper.prototype.calculateNumberOfMines = function(x, y, foundnumbers) {
		var minenum = 0;
		for ( var xx = x - 1; xx <= x + 1; xx++) {
			if ((xx < 0) || (xx > this.width - 1))
				continue;
			for ( var yy = y - 1; yy <= y + 1; yy++) {
				if ((yy < 0) || (yy > this.heigth - 1) || ((x == xx) && (y == yy)))
					continue;
				if (this.mines[xx][yy])
					minenum++;
			}
		}
		this.visited[x][y] = true;
		foundnumbers.push([x,y,minenum]);
		if (minenum == 0) {
			for ( var xx = x - 1; xx <= x + 1; xx++) {
				for ( var yy = y - 1; yy <= y + 1; yy++) {
					if (!((x == xx) && (y == yy)))
						this.checkForMines(xx, yy, foundnumbers);
				}
			}
		}
	}

	Minesweeper.prototype.isWon = function() {
		var num = 0;
		for ( var x = 0; x < this.width; x++)
			for ( var y = 0; y < this.heigth; y++)
				if (!this.visited[x][y])
					num++;
		return num == this.number;
	}






	Sburb.commands.createMineChests = function(info) {
		var params = info.split(",");
		var prefix=params[0];
		var chest=Sburb.sprites[params[1]];
		var rows=parseInt(params[2]);
		var cols=parseInt(params[3]);
		var mines=parseInt(params[4]);
		var x=parseInt(params[5]);
		var y=parseInt(params[6]);
		var dx=parseInt(params[7]);
		var dy=parseInt(params[8]);
		var mine=params[9];
		var generator=params[10];
		var onWin=params[11];
		var onLoose=params[12];
		if(!Sburb.sweeper)
			Sburb.sweeper=[];
		Sburb.sweeper[prefix] = new Minesweeper(rows,cols,mines);
		for(var r=0;r<rows;r++) {
			for(var c=0;c<cols;c++) {
				var newchest=chest.clone(prefix+r+"_"+c);
				newchest.actions[0].info=prefix+","+r+","+c+","+mine+","+onWin+","+onLoose;
				newchest.actions[1].info=prefix+","+r+","+c+",true";
				newAction = lastAction = new Sburb.Action("addSprite",newchest.name+","+Sburb.curRoom.name,null,null,null,true);
				lastAction = lastAction.followUp = new Sburb.Action("moveSprite",newchest.name+","+(x+r*dx)+","+(y+c*dy),null,null,null,true,true);
				Sburb.performAction(newAction);
			}
		}
		Sburb.performAction(new Sburb.Action("removeSprite",generator+","+Sburb.curRoom.name));
	}

	Sburb.commands.openMineChest = function(info) {
		var params = info.split(",");
		var foundnumbers=[];
		var prefix=params[0].trim();
		var cx=parseInt(params[1]);
		var cy=parseInt(params[2]);
		var mine=params[3];
		var onWin=params[4];
		var onLoose=params[5];
		var loose=false;
		try {
			Sburb.sweeper[prefix].checkForMines(cx,cy,foundnumbers);
		}
		catch(e) {
			foundnumbers.push([cx,cy,-1]);
		}
		var newAction;
		var lastAction;
		for(var i=0;i<foundnumbers.length;i++) {
			var x=foundnumbers[i][0];
			var y=foundnumbers[i][1];
			var number=foundnumbers[i][2];
			var chest = Sburb.sprites[prefix+x+"_"+y];
			if(chest.animations["open"]) {
				chest.startAnimation("open");
				if(Sburb.assets["openSound"]){
					if(!newAction) {
						newAction = lastAction = new Sburb.Action("playSound","openSound",null,null,null,true,null,1,true);
						lastAction = lastAction.followUp = new Sburb.Action("waitFor","played,"+chest.name,null,null,null,null,null,1,true);
					}
				}
			}
			chest.removeAction(Sburb.curAction.name);
			if(number==0) {
				if(!newAction)
					newAction = lastAction = new Sburb.Action("removeSprite",chest.name+","+Sburb.curRoom.name,null,null,null,true,true,1,true);
				else
					lastAction = lastAction.followUp = new Sburb.Action("removeSprite",chest.name+","+Sburb.curRoom.name,null,null,null,true,true,1,true);
				var flag = Sburb.sprites[prefix+"_flag"+x+"_"+y];
				if(flag)
					lastAction = lastAction.followUp = new Sburb.Action("removeSprite",flag.name+","+Sburb.curRoom.name,null,null,null,true,true,1,true);
				continue;
			}
			var item = Sburb.sprites[(number==-1)?mine:("nr"+number)].clone("minesweep"+x+"_"+y);
			item.collidable=false;
			if(Sburb.char.y>chest.y)
				item.depthing = 1;
			else
				item.depthing = 2;
			if(!newAction)
				newAction = lastAction = new Sburb.Action("waitFor","played,"+chest.name,null,null,null,null,null,1,true);
			else
				lastAction.followUp = new Sburb.Action("waitFor","played,"+chest.name,null,null,null,null,null,1,true);
			lastAction = lastAction.followUp = new Sburb.Action("addSprite",item.name+","+Sburb.curRoom.name,null,null,null,true,true,1,true);
			lastAction = lastAction.followUp = new Sburb.Action("moveSprite",item.name+","+chest.x+","+(chest.y-35),null,null,null,true,true,1,true);
			lastAction = lastAction.followUp = new Sburb.Action("deltaSprite",item.name+",0,-8",null,null,null,true,null,5);
			lastAction = lastAction.followUp = new Sburb.Action("removeSprite",chest.name+","+Sburb.curRoom.name,null,null,null,true,true,1,true);
			var flag = Sburb.sprites[prefix+"_flag"+x+"_"+y];
			if(flag)
				lastAction = lastAction.followUp = new Sburb.Action("removeSprite",flag.name+","+Sburb.curRoom.name,null,null,null,true,true,1,true);
			lastAction = lastAction.followUp = new Sburb.Action("deltaSprite",item.name+",0,12",null,null,null,true,null,8);
			lastAction = lastAction.followUp = new Sburb.Action("changeDepthing",item.name+",0",null,null,null,true,null,1,true);
			if(Sburb.assets["itemGetSound"]){
				lastAction = lastAction.followUp = new Sburb.Action("playSound","itemGetSound",null,null,null,true,null,1,true);
			}
			if(number==-1) {
				loose=true;
			    var dom=new DOMParser().parseFromString(onLoose,"text/xml").documentElement;
				lastAction = lastAction.followUp = Sburb.parseAction(dom);
			}
		}
		if((!loose)&&Sburb.sweeper[prefix].isWon()) {
		    var dom=new DOMParser().parseFromString(onWin,"text/xml").documentElement;
			lastAction = lastAction.followUp = Sburb.parseAction(dom);
		}
		while(lastAction.followUp)
			lastAction=lastAction.followUp;
		Sburb.curAction.followUp = newAction;
	}

	Sburb.commands.markMineChest = function(info) {
		var params = info.split(",");
		var prefix=params[0];
		var cx=parseInt(params[1]);
		var cy=parseInt(params[2]);
		var chest = Sburb.sprites[prefix+cx+"_"+cy];
		if(params[3]=="true") {
			var flag = Sburb.sprites["flag"].clone(prefix+"_flag"+cx+"_"+cy);
			Sburb.curRoom.addSprite(flag);
			flag.x=chest.x+30;
			flag.y=chest.y;
			chest.removeAction("mark");
			chest.addAction(new Sburb.Action("markMineChest",prefix+","+cx+","+cy+",false","unmark",null,null,true,null,1,null,true));
		} else {
			Sburb.curRoom.removeSprite(Sburb.sprites[prefix+"_flag"+cx+"_"+cy]);
			chest.removeAction("unmark");
			chest.addAction(new Sburb.Action("markMineChest",prefix+","+cx+","+cy+",true","mark",null,null,true,true,1,null,true));
		}
	}

	Sburb.commands.changeDepthing = function(info){
		var params = info.split(",");
		Sburb.sprites[params[0].trim()].depthing=parseInt(params[1]);
	}

	Sburb.Sprite.prototype.clone = function(newname) {
		var newSprite = new Sburb.Sprite(newname,this.x,this.y,this.width,this.height,this.dx,this.dy,this.depthing,this.collidable);
		for(var anim in this.animations) {
			if(this.animations.hasOwnProperty(anim)) {
				newSprite.addAnimation(this.animations[anim].clone());
			}
		}
		for(var action in this.actions) {
			if(this.actions.hasOwnProperty(action)) {
				newSprite.addAction(this.actions[action].clone());
			}
		}
		newSprite.startAnimation(this.animation.name);
		Sburb.sprites[newname]=newSprite;
		return newSprite;
	}

	Sburb.Animation.prototype.clone = function() {
		return new Sburb.Animation(this.name,this.sheet,this.x,this.y,this.colSize,this.rowSize,this.startPos,this.length,this.frameInterval,this.loopNum,this.followUp,this.flipX,this.flipY);
	}
	return Sburb;
})(Sburb || {});
