class Engine{
	constructor(config){
		Object.assign(this.config,config);
	}
	config = {}; // {id:'car',type:'img',src:'../path/car.png'}
	canvasSettings = {width:320,height:180,background:'black'};
	assets = {};
	scenes = {
		root:{
			engine:this,
			objects:{},
			init(){console.log('root init called')},
			update(){console.log('hi!')},
			draw(){}
		}
	};
	scenesAtive = 'root';
	stop = false;
	globalObjects = {};
	inputs = {
		mouse:{
			left:{
				pressed:false
			},
			middle:{
				pressed:false
			},
			right:{
				pressed:false
			},
			position:{x:0,y:0},
		},
		key:{}
	}
	initCanvas(){
		return new Promise((resolve,reject)=>{
			const canvasSettings = this.config.canvasSettings || this.canvasSettings;
			this.canvas = makeElement('canvas',{
				width:canvasSettings.width,
				height:canvasSettings.height
			})
			//handling mobile responsive
			if(canvasSettings.mobileResponsive && innerWidth <= 600){
				this.canvas.style.width = '100%';
				this.canvas.style.height = '100%';	
			}
			this.g = Object.assign(this.canvas.getContext('2d'),this.graphicMethods);
			this.gameBody.addChild(this.canvas);
			resolve();
		})
	}
	graphicMethods = {
		engine:this,
		sprite(img,pos,size,flipH=false,flipV=false){
			const canvasInfo = this.engine.getCanvasInfo();
			//optimizing
			if(pos.y < -(this.engine.viewport.y) || pos.y > -(this.engine.viewport.y) + canvasInfo.height){
				return;
			}
			this.save();
			this.scale(flipH ? -1 : 1, flipV ? -1 : 1);
			this.drawImage(img,flipH ? -(pos.x+size.x/2): pos.x-size.x/2,flipV ? -(pos.y+size.y/2): pos.y-size.y/2,size.x,size.y);
			this.restore();
		},
		spriteRegion(img,sx,sy,sw,sh,pos,size,flipH=false,flipV=false){
			const canvasInfo = this.engine.getCanvasInfo();
			//optimizing
			if(pos.y < -(this.engine.viewport.y) || pos.y > -(this.engine.viewport.y) + canvasInfo.height){
				return;
			}
			this.save();
			this.scale(flipH ? -1 : 1, flipV ? -1 : 1);
			this.drawImage(img,sx,sy,sw,sh,flipH ? -(pos.x+size.x/2): pos.x-size.x/2,flipV ? -(pos.y+size.y/2): pos.y-size.y/2,size.x,size.y);
			this.restore();
		},
		box2d(pos,size,color="red",fill=false){
			const canvasInfo = this.engine.getCanvasInfo();
			//optimizing
			if(pos.y < -(this.engine.viewport.y) || pos.y > -(this.engine.viewport.y) + canvasInfo.height){
				return;
			}
			this.strokeStyle = color;
			this.fillStyle = color;
			this.beginPath();
			this.rect(pos.x-size.x/2,pos.y-size.y/2,size.x,size.y);
			this.stroke();
			if(fill)
				this.fill();
		},
		circle2d(pos,radius,color="red",fill=false){
			const canvasInfo = this.engine.getCanvasInfo();
			//optimizing
			if(pos.y < -(this.engine.viewport.y) || pos.y > -(this.engine.viewport.y) + canvasInfo.height){
				return;
			}
			this.strokeStyle = color;
			this.fillStyle = color;
			this.beginPath();
			this.arc(pos.x-radius/2,pos.y-radius/2,radius,0,Math.PI*2);
			this.stroke();
			if(fill)
				this.fill();
		}
	}
	initInputs(){
		//capturing mouse
		document.onmousemove = (e)=>{
			this.inputs.mouse.position = vector2(e.pageX,e.pageY);
		}
		document.onmousedown = (e)=>{
			if(!this.config.dev && e.which === 3){
				e.preventDefault();
				alert('"Akses tidak diizinkan!" -neon');
			}
			this.inputs.mouse[e.which===1?'left':e.which===2?'middle':'right'].pressed = true;
		}
		document.onmouseup = (e)=>{
			this.inputs.mouse[e.which===1?'left':e.which===2?'middle':'right'].pressed = false;
		}
		document.onkeydown = (e)=>{
			if(!this.config.dev && e.key === 'F12'){
				e.preventDefault();
				alert('"Akses tidak diizinkan!" -neon');
			}
			this.inputs.key[e.key] = true;
		}
		document.onkeyup = (e)=>{
			delete this.inputs.key[e.key];
		}
		document.addEventListener("touchstart", (e) => {
			this.inputs.mouse.position = vector2(e.touches[0].pageX,e.touches[0].pageY);
			this.inputs.mouse.left.pressed = true;
			if(!this.mobileDevice)
				this.mobileDevice = true;
		})
		document.addEventListener("touchend", () => {
			this.inputs.mouse.left.pressed = false;
		})
	}
	collisionRadius(){

	}
	newObject(objName,scene=null,parent=null,config={}){
		this.globalObjects[objName] = Object.assign({
			id:objName,engine:this,scene:!scene?this.scenesAtive:scene,parent,
			angle:0,size:{x:8,y:8},position:vector2(0,0),initPosition:vector2(0,0),
			init(){

			},
			update(){

			},
			draw(){

			},
			getParent(){
				if(!this.parent)
					return this.engine;
				return this.parent;
			},
			getPosition(){
				if(!this.parent)
					return vector2(this.position.x,this.position.y);
				//get angle.
				this.angle += this.engine.globalObjects[this.parent].angle;
				const dir = this.initPosition.angle() + this.engine.globalObjects[this.parent].angle;
				const mag = this.initPosition.mag();
				const newVector = vector2(Math.cos(dir)*mag,Math.sin(dir)*mag);
				return vector2(
					this.engine.globalObjects[this.parent].position.x + newVector.x,
					this.engine.globalObjects[this.parent].position.y + newVector.y
				);
			},
			getAngle(){
				if(!this.parent)
					return angle;
				return this.parent.angle + this.angle;
			},
			rotate(deg){
				this.angle = deg * Math.PI/180;
			},
			onMouseClick(){
				if(!this.engine.inputs.mouse.left.pressed)
					return false;
				const mouse = this.engine.getNormalizedMousePos();
				const position = this.position || this.initPosition || vector2(0,0);
				return (
					mouse.x >= position.x - (this.size.x * .5) && mouse.x <= position.x + (this.size.x * .5) &&
					mouse.y >= position.y - (this.size.y * .5) && mouse.y <= position.y + (this.size.y * .5)
				)
			},
			onMouseHovered(){
				const mouse = this.engine.getNormalizedMousePos();
				const position = this.position || this.initPosition || vector2(0,0);
				return (
					mouse.x >= position.x - (this.size.x * .5) && mouse.x <= position.x + (this.size.x * .5) &&
					mouse.y >= position.y - (this.size.y * .5) && mouse.y <= position.y + (this.size.y * .5)
				)
			},
			newInterpolateMove(paths,percent=0,speed=.1,loop=false){
				this.interpolatePath = paths;
				this.interpolatePathIndex = 0;
				this.interpolatePercentage = percent;
				this.interpolateSpeed = speed;
				this.interpolateStoped = false;
				this.interpolateLoop = loop;
			},
			interpolateMove(){
				if(this.interpolateStoped)
					return;
				const nextPoint = this.interpolatePath[this.interpolatePathIndex];
				this.interpolatePercentage += this.interpolateSpeed;
				this.position = this.position.add(vector2(lerp(0,nextPoint.x,this.interpolatePercentage),lerp(0,nextPoint.y,this.interpolatePercentage)));
				if(this.interpolatePercentage >= 1){
					this.interpolatePathIndex += 1;
					this.interpolatePercentage = 0;
					if(this.interpolatePathIndex === this.interpolatePath.length){
						if(this.interpolateLoop){
							this.interpolatePathIndex = 0;
							this.interpolatePercentage = 0;
						}else this.interpolateStoped = true;
					}
				}
			},
			//animation sprites
			animationFrame:0,frameIndex:0,animationState:null,
			animationStoped:false,
			newAnimationSprite(config={}){
				/*
					{
						texture:this.engine.assets.img.people,
						animations:{
							idle:{
								row:10,col:10,scale:{x:1,y:1},loop:false,changeFrame:12
							}
						}
					}
				*/
				this.animationsSpriteConfig = config;
			},
			animationSetState(state=null){
				if(this.animationState != state){
					this.frameIndex = 0;
					this.animationFrame = 0;
				}
				this.animationState = state;
			},
			animationSpritesPlay(){
				if(this.animationStoped || !this.animationsSpriteConfig)
					return;
				//frame skip
				this.frameIndex += 1;
				if(this.frameIndex >= this.animationsSpriteConfig.animations[this.animationState].changeFrame){
					this.animationFrame += 1;
					this.frameIndex = 0;
					if(this.animationFrame === this.animationsSpriteConfig.animations[this.animationState].row){
						this.animationFrame = 0;
						if(!this.animationsSpriteConfig.animations[this.animationState].loop){
							this.animationSpritesStop();
						}else if(this.animationsSpriteConfig.animations[this.animationState].loop === 'next'){
							this.animationState = this.animationsSpriteConfig.animations[this.animationState].nextState;
						}
					}
				}
			},
			animationSpritesStop(){
				this.animationStoped = true;
			},
			animationSpriteDraw(){
				const texture = this.animationsSpriteConfig.texture || this.animationsSpriteConfig.animations[this.animationState].texture; 
				this.engine.g.spriteRegion(
					texture,
					this.animationFrame * texture.width/this.animationsSpriteConfig.animations[this.animationState].row,
					texture.height/this.animationsSpriteConfig.animations[this.animationState].col*this.animationsSpriteConfig.animations[this.animationState].colI,
					this.engine.assets.img.walkingman.width/this.animationsSpriteConfig.animations[this.animationState].row,this.engine.assets.img.walkingman.height/this.animationsSpriteConfig.animations[this.animationState].col,
					vector2(0,0),vector2(texture.width/this.animationsSpriteConfig.animations[this.animationState].row,texture.height/this.animationsSpriteConfig.animations[this.animationState].col),
				);
			}
		},config);
		return this.globalObjects[objName];
	}
	newScene(sceneName,config={}){
		this.scenes[sceneName] = Object.assign({
			id:sceneName,
			engine:this,
			objects:{},
			init(){
				for(let i in this.objects){
					if(this.objects[i].init)
						this.objects[i].init();
				}
			},
			update(){
				for(let i in this.objects){
					if(this.objects[i].update)
						this.objects[i].update();
				}
			},
			draw(){
				for(let i in this.objects){
					this.engine.g.save();
					this.engine.g.translate(this.objects[i].position.x+this.engine.viewport.x,this.objects[i].position.y+this.engine.viewport.y);	
					this.engine.g.rotate(this.objects[i].angle);
					if(this.objects[i].draw)
						this.objects[i].draw();
					this.engine.g.restore();
				}
			},
			addObject(obj){
				this.objects[obj.id] = obj;
			}
		},config);
		return this.scenes[sceneName];
	}
	changeScene(sceneName){
		if(this.scenes[sceneName])
			this.scenesAtive = sceneName;
		else{
			this.stop = true;
			console.error(`${sceneName} isnt found!`);
			console.error(`Engine stoped.`);
		}
	}
	async init(){
		//load assets
		this.loaderlog = await this.preload();
		if(!this.loaderlog.ok)
			return console.error(this.loaderlog.message);
		this.assets = this.loaderlog.data;
		delete this.loaderlog.data;
		this.gameBody = find(this.config.gameroot || 'body');
		//working with input
		this.initInputs();
		//working with canvas
		await this.initCanvas();
		//call init scenes
		if(this.scenes[this.scenesAtive].init)
			this.scenes[this.scenesAtive].init();
		//init objects functions base on scenes
		this.process();
	}
	preloadLog(percent){
		if(this.config.dev)
			console.log('Loading assets',percent,'%');
		if(this.config.displayLoadPercent)
			this.config.displayLoadPercent(percent);
	}
	preload(){
		const engine = this;
		return new Promise(async (resolve,reject)=>{
			const loadStatus = {ok:true,message:'Ev"Ok',data:{audio:{},img:{}}};
			for(let i in this.config.toLoad){
				const item = this.config.toLoad[i];
				loadStatus.data[item.type][item.id] = await new Promise((resolve,reject)=>{
					makeElement(item.type,Object.assign(item,{
						src:item.src,
						onloadeddata(){//handling audio type
							engine.preloadLog(Math.round(((Number(i)+1)/engine.config.toLoad.length)*100));
							resolve(this);
						},
						onload(){//handling media type
							engine.preloadLog(Math.round(((Number(i)+1)/engine.config.toLoad.length)*100));
							resolve(this);
						}
					}))
				})
			}
			resolve(loadStatus);
		})
	}
	update(){
		// console.log('Updating...');
		if(this.inputs.key.Escape){
			this.stop = true;
			return;
		}
		if(this.scenes[this.scenesAtive].update)
			this.scenes[this.scenesAtive].update();
	}
	draw(){
		//cleaning the canvas
		this.cls();
		// console.log('Drawing...');
		if(this.scenes[this.scenesAtive].draw)
			this.scenes[this.scenesAtive].draw();
	}
	framePerSecon = 1/60;
	prevStamp;
	process(ts){
		if(!this.prevStamp)
			this.prevStamp = ts;
		this.delta = (ts-this.prevStamp)/1000;
		while(this.delta >= this.framePerSecon){
			this.update();
			this.draw();
			this.delta -= this.framePerSecon;
		}
		this.fps = Math.floor(1/this.delta);
		this.prevStamp = ts - this.delta * 1000;
		if(!this.stop)
			requestAnimationFrame((timestamp)=>{
				this.process(timestamp);
			});
	}
	cls(){
		this.g.beginPath();
		this.g.fillStyle = this.config.canvasSettings.background || this.canvasSettings.background;
		this.g.rect(0,0,this.config.canvasSettings.width || this.canvasSettings.width,this.config.canvasSettings.height || this.canvasSettings.height);
		this.g.fill();
		this.g.closePath();
	}
	viewport = vector2(0,0);
	getCanvasCenter(){
		return vector2((this.config.canvasSettings.width || this.canvasSettings.width)*.5,(this.config.canvasSettings.height || this.canvasSettings.height)*.5);
	}
	getGlobalScreenCenter(){
		return vector2(innerWidth*.5,innerHeight*.5);
	}
	getNormalizedMousePos(){
		if(!this.inputs.mouse.position.xy)
			return this.getGlobalScreenCenter();
		const mouse = this.inputs.mouse.position.xy();

		//make sure that the canvas position is on the center of the screen.
		const cwidth = this.config.canvasSettings.width || this.canvasSettings.width;
		const cheight = this.config.canvasSettings.height || this.canvasSettings.height;
		const swidth = innerWidth;
		const sheight = innerHeight;

		if(swidth <= 600){
			return vector2(mouse.x * cwidth/swidth,mouse.y * cheight/sheight).subs(this.viewport);
		}

		const xscgap = (swidth - cwidth);
		const sidescgap = xscgap * .5;
		const yscgap = sheight - cheight;
		const updownscgap = yscgap * .5;

		const canvasMousePos = vector2(mouse.x-sidescgap,mouse.y-updownscgap);
		return canvasMousePos.subs(this.viewport);
	}
	getNormalizedMousePosCenter(){
		const normalizedpos = this.getNormalizedMousePos();
		return normalizedpos.subs(this.getCanvasCenter());
	}
	getMouseAngle(vector2){
		//lookatmouse
			if(!this.inputs.mouse.position.xy)
				return
			const mouse = this.getNormalizedMousePos();
			const dir = -Math.atan2(-(vector2.x - mouse.x),-(vector2.y - mouse.y));
			return dir;
	}
	rectMouseHovered(position=vector2(0,0),size=vector2(8,8)){
		const mouse = this.getNormalizedMousePos();
		return (
			mouse.x >= position.x - (size.x * .5) && mouse.x <= position.x + (size.x * .5) &&
			mouse.y >= position.y - (size.y * .5) && mouse.y <= position.y + (size.y * .5)
		)
	}
	getCanvasInfo(){
		return this.config.canvasSettings || this.canvasSettings;
	}
}