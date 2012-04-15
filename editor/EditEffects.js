function EditEffects() {
    this.effects = {};
    
    this.add = function (animaiton) {
		var name = animation.name;
		this.effects[name] = animation;
    }
    
    this.remove = function (name) {
		this.effects[name] = undefined;
    }
}

function effectPreview(effect) {
    // controller functions go here, then call sprite
    // preview display function
    showEffectPreview(effect);
}
