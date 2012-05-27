function Path(){
	this.points = new Array();
	
	this.push = function(point){
		this.points.push(point);
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
	
	this.query = function(pt){
		for(var c = false, i = -1, l = this.points.length, j = l - 1; ++i < l; j = i){
			var ptA = this.points[i];
			var ptB = this.points[j];
			((ptA.y <= pt.y && pt.y < ptB.y) || (ptB.y <= pt.y && pt.y < ptA.y))
			&& (pt.x < (ptB.x - ptA.x) * (pt.y - ptA.y) / (ptB.y - ptA.y) + ptA.x)
			&& (c = !c);
		}
		return c;
	}
}
