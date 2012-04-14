function EditSprites() {
    this.sprites = {};
    
    this.add = function (spriteObj) {
		var name = spriteObj.name;
		this.sprites[name] = spriteObj;
    }
    
    this.remove = function (name) {
		this.sprites[name] = undefined;
    }
}

function spritePreview(sprite) {
    // controller functions go here, then call sprite
    // preview display function
    showSpritePreview(sprite);
}
