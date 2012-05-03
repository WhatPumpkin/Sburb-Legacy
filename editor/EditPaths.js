function addPathOptions(theOptions,path){
	var options =  $("<div class='collapsable pathOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Path %s</div>", path.name)).appendTo(options);
}

function addMotionPathOptions(theOptions,motionPath){
	var options =  $("<div class='collapsable motionPathOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>MotionPath</div>")).appendTo(options);
	
	var items = new Array();
	items.push($('<input name="xtox" type="text" />').change(function() { motionPath.xtox = parseInt(this.value);}).val(motionPath.xtox));
	items.push($('<input name="xtoy" type="text" />').change(function() { motionPath.xtoy = parseInt(this.value);}).val(motionPath.xtoy));
	items.push($('<input name="ytox" type="text" />').change(function() { motionPath.ytox = parseInt(this.value);}).val(motionPath.ytox));
	items.push($('<input name="ytoy" type="text" />').change(function() { motionPath.ytoy = parseInt(this.value);}).val(motionPath.ytoy));
	items.push($('<input name="dx" type="text" />').change(function() { motionPath.dx = parseInt(this.value);}).val(motionPath.dx));
	items.push($('<input name="dy" type="text" />').change(function() { motionPath.dy = parseInt(this.value);}).val(motionPath.dy));
	addItems(options,items);
	addPathOptions(options,motionPath.path);
}
