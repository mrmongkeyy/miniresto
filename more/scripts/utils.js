// Array.prototype.getRandom = function(){
// 	return this[Math.floor(Math.random()*this.length)];
// }
const toInject = {
		find(param){
			return Object.assign(this.querySelector(param)||{},this);
		},
		findall(param){
			return Object.assign(this.querySelectorAll(param),this);
		},
		addChild(child){
			this.appendChild(child);
			if(child.onadded)
				child.onadded();
		},
		show(param='flex'){
			this.style.display = param;
		},
		hide(){
			this.style.display = 'none';
		}
	}
const makeElement = (name='div',config={})=>{
	Object.assign(config,toInject);
	return Object.assign(document.createElement(name),config);
}
const find = (param)=>{
	return Object.assign(document.querySelector(param)||{},toInject);
}
const findall = (param)=>{
	const els = [];
	document.querySelectorAll(param).forEach((el)=>{
		els.push(Object.assign(el,toInject));
	})
	return els;
}
const vector2 = (p1,p2)=>{
	return {
		x:p1,y:p2,add(v2){
			return vector2(this.x+v2.x,this.y+v2.y);
		},
		subs(v2){
			return vector2(this.x-v2.x,this.y-v2.y);
		},
		mag(v2,offset={x:0,y:0}){
			if(!v2)
				return Math.hypot(this.x-offset.x,this.y-offset.y);
			return Math.hypot(this.x-v2.x,this.y-v2.y);
		},
		angle(v2,offset={x:0,y:0}){
			if(!v2)
				return Math.atan2(this.y-offset.y,this.x-offset.x);
			return Math.atan2(this.y-v2.y,this.x-v2.x);
		},
		vectorUnit(){
			const mag = this.mag();
			return vector2(this.x/mag,this.y/mag);
		},
		dot(v2,offset={x:0,y:0}){
			if(!v2)
				return this.x * offset.x + this.y * offset.y;
			return this.x * v2.x + this.y * v2.y;
		},
		scale(scalar){
			return vector2(this.x*scalar,this.y*scalar);
		},
		degrees(){
			return this.angle() * 180 / Math.PI;
		},
		xy(){
			return {x:this.x,y:this.y};
		}
	}
}
const lerp = (a,b,t)=>{
	return a + (b - a) * t;
}
const getPrice = (value)=>{
	value = String(value);
	let result = '';
	while(true){
		if(value.length>3){
			result = '.'+value.slice(value.length-3)+result;
			value = value.slice(0,value.length-3);
		}else{
			result = value+result;
			break
		}
	}
	return result;
}
