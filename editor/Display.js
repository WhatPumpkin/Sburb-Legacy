// View code

var menus = {};
var stage;
var toDraw = new Array();
var drawingOne = false;
var updateLoop;
var Stage = {width:650,height:450,color:"rgb(0,0,0)",scaleX:3,scaleY:3};
var Mouse = {x:0,y:0,down:false};
function clearViewScreen() {
    $("#previewNode").empty(); // erase preview resources
    $('#mainDisplay').contents().detach();
    clearTimeout(updateLoop);
    stage = null;
    Stage = null;
    toDraw = new Array();
    drawingOne = false;
}

function clearLeftMenu() {
    $("#leftmenu").empty();
}

function showMenu(menu) {
    for(m in menus) {
			var curMenu = menus[m];
			if(curMenu == menu) {
				curMenu.maindiv.show();
			} else {
				curMenu.maindiv.hide();
			}
    }
}
function displayMainMenu() {
    buildAssets();
    buildSprites();
    buildRooms();
    buildDialogs();
    buildEffects();
    $("#assetTabLink").click(function() { showMenu(menus.assetMenu); });
    $("#spriteTabLink").click(function() { showMenu(menus.spriteMenu); });
    $("#roomTabLink").click(function() { showMenu(menus.roomMenu); });
    $("#dialogTabLink").click(function() { showMenu(menus.dialogMenu); });
    $("#effectTabLink").click(function() { showMenu(menus.effectMenu); });
    showMenu(menus.assetMenu);
}

function deployStage(area,color,oneObject){
	var canvas = $('<canvas id="Stage" width="650" height="450" tabindex="0"\
								onmousedown = "onMouseDown(event,this)"\
								onmousemove = "onMouseMove(event,this)"\
								onmouseup = "onMouseUp(event,this)"></canvas>');
	$("<div>").append(canvas).appendTo(area);
	Stage  = document.getElementById("Stage");	
	Stage.fps = 30;
	Stage.x = Stage.y = 0;
	Stage.scaleX = Stage.scaleY = 3;
  stage = Stage.getContext("2d"); 
  
  if(oneObject){
  	drawingOne = true;
  }else{
  	drawingOne = false;
  }
  
  if(color){
  	Stage.color = color;
  }else{
  	Stage.color = "rgb(0,0,0)";
  }
  
  update(0);
}

function addItems(options,items){
	for(var i=0;i<items.length;i++){
  	var item = items[i];
  	var name = item.attr("name");
  	var label = name?name+":" : "";
  	$("<div>"+label+"</div>").append(item).appendTo(options);
  }
  $(".leftTitle").unbind();
  $(".leftTitle").click(function(){ 
  	if(!this.hidden){
			this.hidden = true;
			$(this).parent().children().hide();
			$(this).parent().children(".leftTitle").show();
		}else{
			this.hidden = false;
			$(this).parent().children().show();
		}
	});
}

function spriteSelect(name,change,value){
	var select = $('<select name="'+name+'">');
    for(sprite in editSprites.sprites){
    	$('<option value="'+sprite+'">'+sprite+'</option>').appendTo(select);
    }
    $('<option value="null">null</option>').appendTo(select);
    select.change(change);
    select.val(value);
    return select;
}

function graphicSelect(name,change,value){
	var select = $('<select name="'+name+'">');
    for(asset in editAssets.assets){
    	if(editAssets.assets[asset].type=="graphic"){
    		$('<option value="'+asset+'">'+asset+'</option>').appendTo(select);
    	}
    }
    select.change(change);
    select.val(value);
    return select;
}

function commandSelect(name,change,value){
	var select = $('<select name="'+name+'">');
    for(command in commands){
    	$('<option value="'+command+'">'+command+'</option>').appendTo(select);
    }
    select.change(change);
    select.val(value);
    return select; 
}

function spriteSnap(val){
	return Math.round(val/3)*3;
}


function update(gameTime){
	for(var i=0;i<toDraw.length;i++){
		toDraw[i].update(gameTime);
	}
	updateLoop=setTimeout("update("+(gameTime+1)+")",1000/Stage.fps);
	draw(gameTime);
}

function draw(gameTime){
	stage.save();
	stage.fillStyle = Stage.color;
	stage.fillRect(0,0,Stage.width,Stage.height);
	if(drawingOne && toDraw.length>0){
		var specialOne = toDraw[0];
		var specialAnim = specialOne.animation;
		
		var scaleFactor = 1;
		if(specialAnim.colSize>Stage.width*scaleFactor){
			scaleFactor = specialAnim.colSize/Stage.width;
		}
		if(specialAnim.rowSize>Stage.height*scaleFactor){
			scaleFactor = specialAnim.rowSize/Stage.height;
		}
		var newX = Stage.width*scaleFactor/2-specialOne.x-specialAnim.x-specialAnim.colSize/2;
		var newY = Stage.height*scaleFactor/2-specialOne.y-specialAnim.y-specialAnim.rowSize/2;
		//console.log(specialAnim);
		//console.log(Stage.width,scaleFactor,specialOne.x,specialAnim.x,specialAnim.colSize);
		stage.scale(1/scaleFactor,1/scaleFactor);
		stage.translate(newX+Stage.x,newY+Stage.y);
		
	}
	for(var i=0;i<toDraw.length;i++){
		toDraw[i].draw();
		toDraw[i].drawMeta();
	}
	stage.restore();
}

function onMouseMove(e,canvas){
	point = relMouseCoords(e,canvas);
	Mouse.x = point.x;
	Mouse.y = point.y;
	//console.log(Mouse.x+" "+Mouse.y);
}

function onMouseDown(e,canvas){
	if(!Mouse.down){
		if(toDraw.length>0){
			if(toDraw[0] instanceof Room){
				var room = toDraw[0];
				selectObjectUnderMouse(room,Stage.x+Mouse.x,Stage.y+Mouse.y);
			}
		}
	}
	Mouse.down = true;
}

function onMouseUp(e,canvas){
	Mouse.down = false;
}

function relMouseCoords(event,canvas){
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = canvas;

    do{
        totalOffsetX += currentElement.offsetLeft;
        totalOffsetY += currentElement.offsetTop;
    }
    while(currentElement = currentElement.offsetParent)
    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;
    return {x:canvasX,y:canvasY};
}

function selectObjectUnderMouse(room,x,y){
	console.log("selectObject "+x+" "+y);
	/*this.sprites = new Array();
	this.effects = new Array();
	this.walkables = new Array();
	this.unwalkables = new Array();
	this.motionPaths = new Array();*/
	for(var i=room.sprites.length-1;i>=0;i--){
		var curSprite = room.sprites[i];
		if(curSprite.isVisuallyUnder(x,y)){
			addSpriteOptions($("#roomSelection"),curSprite);
			return true;
		}
	}
}
