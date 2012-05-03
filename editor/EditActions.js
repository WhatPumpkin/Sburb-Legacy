function addActionOptions(theOptions,action){
	var nestActionOptions = function(options,action){
		console.log(action.followUp);
		removeActionOptions(options);
		if(action.followUp){
			addActionOptions(options,action.followUp);
		}
	}

	var options =  $("<div class='collapsable actionOptions'>").appendTo(theOptions);
	$(sprintf("<div class='leftTitle'>Action %s</div>", action.name)).appendTo(options);
	
	var items = new Array();
	items.push(commandSelect("command",function() { action.command=this.value;},action.command));
	items.push($('<textarea name="info"/>').change(function() { action.command=this.value;}).val(action.info.trim()));
	items.push(spriteSelect("sprite",function() { action.sprite = editSprites.sprites[this.value]; },action.sprite?action.sprite.name:"null"));
	items.push($('<input type="checkbox" name="followUp"/>').change(function() { action.followUp=this.checked?new Action("followUp","cancel",""):null; nestActionOptions(options,action);}).val(action.followUp?action.followUp.name:"null"));
	
	addItems(options,items);
	//nestActionOptions(options,action);
}

function removeActionOptions(theOptions){
	$(theOptions).children().remove('.actionOptions');
}

