function EditAssets() {
    this.assets = {};
    
    this.add = function (assetObj) {
		var name = assetObj.name;
		this.assets[name] = assetObj;
    }
    
	this.remove = function (name) {
		this.assets[name] = undefined;
    }

}

function assetPreview(asset) {
    // i guess this could've gone directly in Display?
    // but we should keep this in case we want to do stuff here
    // like save work, clear variables, init other stuff...who knows
   showAssetPreview(asset);
}
