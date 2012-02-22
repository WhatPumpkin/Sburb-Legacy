/*
A utility function to provide inheritance-like functionality. Consider two classes 

function Base(a,b);
function Derived(a,b,x,y);

To make Derived inherit Base we might put

inherit(this,new Base(a,b));

in the first line of Derived. This does double duty of calling Base's constructor
and then initializing Derived to have all its values. Of course, afterwards we 
are free to overwrite any undesired values.

Additionally, it creates an empty base object to assist with overloading inherited
behaviours. Say Base had function foo(), and Derived wished to write its own foo(),
but use base's as well.

Then we could do something like:

function Derived(a,b,x,y){
	inherit(this,new Base(x,y));
	
	base.foo = this.foo;
	this.foo = function(){
		base.foo();
		//do something...
	}
}

In cases of multiple inheritance, base.base will be constructed and base.base.base
and so on to avoid conflicts. If one wishes to opt-out of creating an additional
base layer, they may simply call inheritNoBase instead. Though if the Base class already has
a base, that will still be inherited, it simply won't be nested in another base.

*/

function inherit(child,parent){
	inheritNoBase(child,parent);
	if(!child.base){
		child.base = {}
	}else{
		child.base = {base:child.base};
	}
}

function inheritNoBase(child,parent){
	var varName;
	for(varName in parent){
		child[varName] = parent[varName];
	}
}


