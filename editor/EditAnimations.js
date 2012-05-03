function addAnimationOptions(theOptions,animation){
	removeAnimationOptions(theOptions);
	var options =  $("<div class='collapsable animationOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Animation %s</div>", animation.name)).appendTo(options);
	
	var items = new Array();
	items.push(graphicSelect("sheet",function() { animation.setSheet(editAssets.assets[this.value]);},animation.sheet.name));
	//items.push($('<input name="sheet" type="text" />').change(function() { animation.setSheet(editAssets.assets[this.value]);}).val(animation.sheet.name));
	items.push($('<input name="sx" type="text" />').change(function() { animation.sx = parseInt(this.value); }).val(animation.sx));
	items.push($('<input name="sy" type="text" />').change(function() { animation.sy = parseInt(this.value); }).val(animation.sy));
	items.push($('<input name="colSize" type="text" />').change(function() { animation.setColSize(parseInt(this.value)); }).val(animation.colSize));
	items.push($('<input name="rowSize" type="text" />').change(function() { animation.setRowSize(parseInt(this.value)); }).val(animation.rowSize));
	items.push($('<input name="startPos" type="text" />').change(function() { animation.startPos = parseInt(this.value); this.animation.reset();}).val(animation.startPos));
	items.push($('<input name="length" type="text" />').change(function() { animation.length = parseInt(this.value); this.animation.reset();}).val(animation.length));
	items.push($('<input name="frameInterval" type="text" />').change(function() { animation.frameInterval = parseInt(this.value); this.animation.reset();}).val(animation.frameInterval));
	items.push($('<input name="loops" type="text" />').change(function() { animation.loopNum = parseInt(this.value); this.animation.reset();}).val(animation.loopNum));
	
	addItems(options,items);
}

function removeAnimationOptions(theOptions){
	$(theOptions).children().remove('.animationOptions');
}
