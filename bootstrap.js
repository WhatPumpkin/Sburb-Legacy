// old static functions; makes inital room
function finishInit(){
    if(initFinished) {
		return;
    }
    initFinished = true;
	buildSprites();
	buildRooms();
	buildActions();
	sprites.dialogBox = new StaticSprite("dialogBox",Stage.width+1,1000,null,null,null,null,assets.dialogBox,FG_DEPTHING);
	dialoger.setBox(sprites.dialogBox);
	
	focus = char = sprites.karkat;
	curRoom = rooms.baseRoom;
    curRoom.initialize();
	char.becomePlayer();
	serialize();
	update(0);
}

function loadAssets(){
    assetManager.loadGraphicAsset(createGraphicAsset("cgSheet","resources/CGsheetBig.png"));
    assetManager.loadGraphicAsset(createGraphicAsset("compLabBG","resources/comlab-background.gif"));
    assetManager.loadGraphicAsset(createGraphicAsset("dialogBox","resources/dialogBoxBig.png"));
    assetManager.loadAudioAsset(createAudioAsset("karkatBGM", "resources/karkat.ogg", "resources/karkat.mp3"));
    assetManager.loadAudioAsset(createAudioAsset("tereziBGM", "resources/terezi.ogg", "resources/terezi.mp3"));
    assetManager.loadPathAsset(createPathAsset("compLabWalkable",[{x:70,y:270},{x:800,y:270},{x:800,y:820},{x:70,y:820}]));
    drawLoader();
}



function buildSprites(){
	sprites.karkat = new Character("karkat",300,501,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone = new Character("karclone",201,399,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.karclone2 = new Character("karclone2",501,399,45,21,-36,-87,66,96,assets.cgSheet);
	sprites.compLabBG = new StaticSprite("compLabBG",0,0,null,null,null,null,assets.compLabBG);
}

function buildRooms(){
	rooms.baseRoom = new Room("baseRoom",sprites.compLabBG.width,sprites.compLabBG.height,
								assets.compLabWalkable);
	rooms.baseRoom.addSprite(sprites.karkat);
	rooms.baseRoom.addSprite(sprites.karclone);
	rooms.baseRoom.addSprite(sprites.compLabBG);
	
	rooms.cloneRoom = new Room("cloneRoom",sprites.compLabBG.width,sprites.compLabBG.height,assets.compLabWalkable);
	rooms.cloneRoom.addSprite(sprites.karclone2);
	rooms.cloneRoom.addSprite(sprites.compLabBG);
}

function buildActions(){
	sprites.karkat.addAction(new Action("swap","changeChar","karkat"));

	sprites.karclone.addAction(new Action("talk","talk","@CGAngry Lorem ipsum\n\ndolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit\n\nin voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt \n\nmollit anim id\n\nest \n\nlaborum. @CGAngry hehehe @CGAngry whaaaat"));
	sprites.karclone.addAction(new Action("change room","changeRoom","cloneRoom,300,300"));
	sprites.karclone.addAction(new Action("swap","changeChar","karclone"));
	sprites.karclone.addAction(new Action("T3R3Z1 TH3M3 4LL D4Y", "playSong", "tereziBGM, 1.9, 2",null,new Action("talk","talk","@! Nice choice!")));
 	
	sprites.karclone2.addAction(new Action("talk","talk","@! blahblahblah"));
	sprites.karclone2.addAction(new Action("change room","changeRoom","baseRoom,300,300"));
	sprites.karclone2.addAction(new Action("swap","changeChar","karclone2"));
}
