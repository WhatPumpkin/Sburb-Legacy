function AssetGallery(){
	this.searchString = "";
	
	this.assets = {};
	this.sprites = {};
	this.results = {};
	
	this.draw = function(){
		
	}
	
	this.search = function(query){
		this.searchString = query;
		//search the xml for things, load them if they have the same metadata
	}
}
