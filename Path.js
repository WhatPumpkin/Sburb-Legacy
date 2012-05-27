function Path(){
	this.points = new Array();
	
	this.push = function(point){
		
	}
	
	this.queryBatchPos = function(queries,results){
		for(var query in queries){
			results[query] = results[query] || this.query(queries[query]);
		}
	}
	
	this.queryBatchNeg = function(queries,results){
		for(var query in queries){
			results[query] = results[query] && this.query(queries[query]);
		}
	}
	
	this.query = function(point){
		return true;
	}
}
