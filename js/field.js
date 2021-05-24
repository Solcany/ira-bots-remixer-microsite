window.onload = function() {

	const canvas = document.getElementById("stage")
	const canvasWidth = canvas.clientWidth;
	const canvasHeight = canvas.clientHeight;
	const avatarDiameter = 40;
	const avatarPackingDiameter = avatarDiameter + 10;
	const userAvatarDiameter = 300;
	const avatarPackingAttempts = 500;
	const avatarsAmount = 300;
	const concentricCirclesAmount = 20;
	const concentricCirclesScaleStep = 0.25;
	const concentricCirclesLineWidth = 0.5;


	const concentricCirclesColor = 0x3a3a3a;
	const canvasBackgroundColor = 0x000;

	/* load images */
	const range = get_randomNumsFromRange(383, avatarsAmount);
	const loader = PIXI.loader;

	for(let i = 0; i < range.length; i++) {
		loader.add( range[i].toString(), "/img/avatar/" + range[i] + ".png")
	}
	loader.add("placeholder", "/img/avatar/empty.png");


	var renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight,
	  {
	     view:document.getElementById("stage"),
	     antialias: true,
	     resolution: 2,  
	  }
	); 

	var stage = new PIXI.Container();

	loader.load(function(loader, resources) {
		/*–– draw concentric rings around userAvatar ––*/
			drawConcentricCircles(	userAvatarDiameter/2,
									concentricCirclesLineWidth,
									concentricCirclesColor,
	 							  	concentricCirclesAmount, // how many circles to generate
	 							  	concentricCirclesScaleStep) 

		/*–– fill canvas with circle packed avatar images ––*/

			// ignore the 'placeholder' avatar resource by subbing 1
			let resourcesLength = Object.keys(resources).length - 1

			let userAvatarCircle = {x: canvasWidth/2, y: canvasHeight/2, radius: userAvatarDiameter/2}
			var avatarPositions = getCirclePackedPositionsForAvatars(userAvatarCircle,
																	 resourcesLength,
																	 avatarPackingAttempts,
																	 avatarPackingDiameter )
			for(let i = 0; i < avatarPositions.length; i++) {
				let key = range[i];
				let texture = resources[key].texture;
				texture.scaleMode = PIXI.SCALE_MODES.NEAREST;
				let avatarPosition = {x: avatarPositions[i].x,
									  y: avatarPositions[i].y }
				addAvatar(texture, avatarPosition, avatarDiameter);
			}

			let userAvatarTexture = resources.placeholder.texture;
				userAvatarTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
			addAvatar(userAvatarTexture, 
					  { x: userAvatarCircle.x, y: userAvatarCircle.y }, 
					  userAvatarDiameter )

			renderer.render(stage);

	})

	function getCirclePackedPositionsForAvatars(userAvatarCircle, totalCircles, packingAttempts, AvatarDiam) {
		var circles = [];
		circles.push(userAvatarCircle)

		let radius = AvatarDiam/2;

		for( var i = 0; i < totalCircles; i++ ) {  
  			createCircle(circles, packingAttempts, radius);
		}

		circles.shift();
		return circles;
	}

	function createCircle(circles, maxAttempts, radius) {
	  var newCircle;
	  var circleSafeToDraw = false;

	  for(var tries = 0; tries < maxAttempts; tries++) {
	    newCircle = {
	      x: Math.floor(Math.random() * canvasWidth),
	      y: Math.floor(Math.random() * canvasHeight),
	      radius: radius
	    }

	    if(doesCircleHaveAcollision(newCircle, circles)) {
	    	continue;
		} else {
	      	circleSafeToDraw = true;
	      	break;
		}
	}
	if(!circleSafeToDraw) {
		   return;
		}
	circles.push(newCircle);
	}

	    	  
	function doesCircleHaveAcollision(newCircle, otherCircles) {
	  for(var i = 0; i < otherCircles.length; i++) {
	    var otherCircle = otherCircles[i];
	    var a = newCircle.radius + otherCircle.radius;
	    var x = newCircle.x - otherCircle.x;
	    var y = newCircle.y - otherCircle.y;

	    if (a >= Math.sqrt((x*x) + (y*y))) {
	      return true;
	    }
	  }
	  if(newCircle.x + newCircle.radius >= canvasWidth ||
	     newCircle.x - newCircle.radius <= 0) {
	    return true;
	  }
	    
	  if(newCircle.y + newCircle.radius >= canvasHeight ||
	      newCircle.y - newCircle.radius <= 0) {
	    return true;
	  }
	  return false;
	}


	function addAvatar(tex, position, diam) {
	    var x = position.x;
	    var y = position.y;

	    var mask = new PIXI.Graphics();
		mask.beginFill(0x000000)
		mask.drawCircle(x, y, diam/2)
		mask.endFill()

	    var avatar = new PIXI.Sprite(tex);
	    avatar.interactive = true;
	    avatar.buttonMode = true;
	    avatar.anchor.set(0.5);
	    avatar.width = diam;
	    avatar.height = diam;
	    avatar.x = x;
	    avatar.y = y;
	   	avatar.mask = mask;

	    avatar.on('pointerdown', getAvatarTextureSrc)

	    stage.addChild(avatar);
	}

	 function drawConcentricCircles(userAvatarWidth,
	 								lineWidth,
	 								color,
	 							  	circles_amount, // how many circles to generate
	 							  	scale_step // number between 0.0 and 1.0
	 							  ) {

	 	let step = userAvatarWidth * scale_step;

	 	let circles = new PIXI.Graphics();

	 	for(let i = 0; i < circles_amount; i++) {
	 		let w = userAvatarWidth + (step * i);
	 		// let h = userAvatarHeight + (step * i);
	 		circles.lineStyle(lineWidth, color, 1);
	 		circles.drawCircle(canvasWidth/2, canvasHeight/2, w)
	 	}

	 	stage.addChild(circles);

	 } 

	function getAvatarTextureSrc(event) {
		return this.texture.baseTexture.imageUrl;
	}
}

/* 

	UTILS

*/

	function get_randomNumsFromRange(total, range) {
		var numbers = [];
		for(let i = 0; i < total; i++) {
			numbers[i] = i;
		}
		return _.sampleSize(numbers,range)
	}

