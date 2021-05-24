const twitterBlue = 0x1da1f2;
const fadeStep = 0.1;

	var isChoosePhotoCompleted = false;
	var isChooseNameCompleted = false;
	var isChooseBioCompleted = false;
	var isChooseCountryCompleted = false;

	var photoTextContent;
	var nameTextContent;
	var bioTextContent;
	var txtContainerDOM;

window.onload = function() {
	var body = document.getElementsByTagName("BODY")[0];
	var CURRENT_STATE = "choosePhoto";

	if(body.id === "introPage") {
		let dragContainer = ".draggable-container";
		let dragableContent = ".draggable-content";
		let dragger1 = ".dragbar";
		let dragger2 = ".drag-pattern";
		let draggerPattern = dragger2;
		let numOfEls = 200;
		let toggleButton = 'button.minimize';
		let txtContent = '.text-content';

		addLiElementsToDragger(draggerPattern, numOfEls)
		makeElementDraggable(dragContainer, dragger1, dragger2 , dragableContent)
		toggleContentOnClick(toggleButton, txtContent)
	}

	else if(body.id === "choosePhotoPage") {
		const canvas = document.getElementById("stage")
		const canvasWidth = canvas.clientWidth;
		const canvasHeight = canvas.clientHeight;
		const avatarDiameter = 40;
		const avatarPackingDiameter = avatarDiameter + 15;
		const namesPackingDiameter = 80;
		const biosPackingDiameter = 120;

		const avatarHoverDiameter = avatarDiameter + 10;
		const userAvatarDiameter = 300;
		const avatarPackingAttempts = 200;
		const avatarsAmount = 300;
		const concentricCirclesAmount = 20;
		const concentricCirclesScaleStep = 0.25;
		const concentricCirclesLineWidth = 0.5;
		const concentricCirclesColor = 0x4c4b4b;
		const canvasBackgroundColor = 0x000;
		const amount_of_rendered_names = 100;
		const amount_of_rendered_bios = 30;

		photoTextContent = document.getElementById("photoTxt");
		nameTextContent = document.getElementById("nameTxt");
		bioTextContent = document.getElementById("bioTxt");
		txtContainerDOM = document.getElementById("cntr")

		// disable submit button
		let submitButton = document.querySelector(".submit-bot-button");
			submitButton.disabled = true;

	 	submitButton.addEventListener('click', function() {
	 		console.log('fired');
	 		setNextStateBotnet();
	 	})

		/* load images */
		const range = get_randomNumsFromRange(383, avatarsAmount);
		const loader = PIXI.loader;

		for(let i = 0; i < range.length; i++) {
			loader.add( "avatar" + range[i].toString(), "/img/avatar/" + range[i] + ".png")
		}
		loader.add("placeholder", "/img/avatar/empty.png");
		loader.add("glitchSound", '/audio/glitch-sound.mp3');

		var renderer = PIXI.autoDetectRenderer(canvasWidth, canvasHeight,
		  {
		     view:document.getElementById("stage"),
		     antialias: true,
		     resolution: 2,
		  }
		);

		var bot_names;
		var bot_bios;

	 	loadJSON("/data/bots_display_names.json", function(response) {
	  		// Parse JSON string into object
	    	bot_names = JSON.parse(response);
	 	});

	 	loadJSON("/data/bots_bios.json", function(response) {
	  		// Parse JSON string into object
	    	bot_bios = JSON.parse(response);
	 	});

	 	bot_names = bot_names.data;
	 	bot_bios = bot_bios.data;

	 	var inputMonoCompressedFont = new Font();
	 		inputMonoCompressedFont.fontFamily = "inputMonoCompressed"
	 		inputMonoCompressedFont.src ="/fonts/InputMonoCompressed-Regular.ttf"


		// global
		var ticker = new PIXI.ticker.Ticker();
			ticker.autoStart = false;
			ticker.stop();

		var stage = new PIXI.Container();

		// choosePhoto state
		var circlesContainer = new PIXI.Container();
			circlesContainer.name = "circlesContainer";
		var photosContainer = new PIXI.Container();
			photosContainer.name = "photosContainer";
			photosContainer.alpha = 0.0;

		// chooseName state
		var namesContainer = new PIXI.Container();
			namesContainer.name = "namesContainer";
			namesContainer.alpha = 0.0;


		var biosContainer = new PIXI.Container();
			biosContainer.name = "biosContainer";
			biosContainer.alpha = 0.0;

		var WIPstyle = new PIXI.TextStyle({
				align: 'center',
			    fontFamily: inputMonoCompressedFont.fontFamily,
			    fontSize: 34,
			    fill: '#b2b2b2'
		});

		var WIPtxt = new PIXI.Text("work in progress", WIPstyle)
			WIPtxt.x = canvasWidth/2 - WIPtxt.width/2
			WIPtxt.y = canvasHeight/2
			WIPtxt.name = "WIPtxt"
			WIPtxt.alpha = 0;
		stage.addChild(WIPtxt);

				function exitCurrentState(STATE) {
					if (STATE == "choosePhoto") {
							stage.getChildByName("photosContainer").interactiveChildren = false;
							tickerFadeOutContainer("photosContainer", fadeStep);
					} else if(STATE =="chooseName") {
							stage.getChildByName("namesContainer").interactiveChildren = false;
							tickerFadeOutContainer("namesContainer", fadeStep);
					} else if(STATE =="chooseBio") {
							stage.getChildByName("biosContainer").interactiveChildren = false;
							tickerFadeOutContainer("biosContainer", fadeStep);
					} else if(STATE == "botnet") {
							tickerFadeInContainer("mainAvatar", fadeStep);
							tickerFadeInContainer("botName", fadeStep);
							tickerFadeInContainer("botBio", fadeStep);
							tickerFadeInContainer("circlesContainer", fadeStep);					}
				}

				function enterNewState(STATE) {
					if (STATE == "choosePhoto") {
							stage.getChildByName("photosContainer").interactiveChildren = true;
							tickerFadeInContainer("photosContainer", fadeStep);
							if(stage.getChildByName("botName") != null ) {
								stage.getChildByName("botName").alpha = 0.0;
							}
							if(stage.getChildByName("botBio") != null ) {
								stage.getChildByName("botBio").alpha = 0.0;
							}
					} else if(STATE =="chooseName") {
							stage.getChildByName("namesContainer").interactiveChildren = true;
							stage.getChildByName("botName").alpha = 1.0;
							tickerFadeInContainer("namesContainer", fadeStep);
							stage.getChildByName("botBio").alpha = 0.0;


					} else if(STATE =="chooseBio") {
							stage.getChildByName("biosContainer").interactiveChildren = true;
							stage.getChildByName("botBio").alpha = 1.0;
							tickerFadeInContainer("biosContainer", fadeStep);
					} else if(STATE =="botnet" ) {
							tickerFadeOutContainer("mainAvatar", fadeStep);
							tickerFadeOutContainer("botName", fadeStep);
							tickerFadeOutContainer("botBio", fadeStep);
							tickerFadeOutContainer("circlesContainer", fadeStep);
							tickerFadeInContainer("WIPtxt", fadeStep);



					}
				}

				function tickerFadeOutContainer(ContainerName, dec) {
					let container = stage.getChildByName(ContainerName);
					ticker.add(fadeOut)

					function fadeOut() {
						if(container.alpha >= 0.0 ) {
							container.alpha -=dec;
						} else {
							ticker.remove(fadeOut)
							if(container.alpha < 0) container.alpha = 0.0;
						}
					}
				}

				function tickerFadeInContainer(ContainerName, inc) {
						let container = stage.getChildByName(ContainerName);
						ticker.add(fadeIn)
					function fadeIn() {
						if(container.alpha >= 0 && container.alpha <= 1.0) {
							container.alpha +=inc;
						} else {
							ticker.remove(fadeIn)
							if(container.alpha > 1.0) container.alpha = 1.0;
						}
					}
				}

				function IfCompletedActivateSubmitButton(buttonRef) {
					if( isChoosePhotoCompleted && isChooseNameCompleted && isChooseBioCompleted) {
						let button = document.querySelector(buttonRef);
							button.parentElement.classList.remove('inactive');
							button.parentElement.classList.add('active');
							button.disabled = false;
					}
				}


				function deactivateCurrentActiveLI(currentState, isCompleted) {
					if(currentState != 'botnet') {
						let p = document.querySelector("[data-state=" + currentState + "] p")
						// set current state element to inactive
						p.classList.remove('active');
						p.classList.add("inactive");
					}
				}

				function activateNextLI(nextDataState) {
					let p = document.querySelector("[data-state=" + nextDataState + "] p")
					let tickbox = document.querySelector("[data-state=" + nextDataState + "] span")
					// set next state element to active
					p.classList.remove("inactive");
					p.classList.add("active");
				}

				function activateCurrentTickboxIfComplete(currentState, isCompleted) {
					if(isCompleted) {
					let tickbox = document.querySelector("[data-state=" + currentState + "] span")
					// set current state tickbox to completed
					tickbox.classList.add("completed")
					}
				}


				function changeStateFromDOMbarElement(barEl_ID) {
					let bar = document.getElementById(barEl_ID);
					var index = null;
					for (var i = 0, len = bar.children.length; i < len; i++) {
					        bar.children[i].addEventListener('pointerup', function(){
					        	  if(this.hasAttribute('data-state')) {
					        	   let dataStateVal = this.getAttribute('data-state');
									switch(dataStateVal) {
									  case "choosePhoto":
											// CURRENT_STATE get's updated here (ugly side effect)
									    	setNextStateChoosePhoto()
											IfCompletedActivateSubmitButton('.submit-bot-button');
									    	break;
									  case "chooseName":
											// CURRENT_STATE get's updated here (ugly side effect)
									  		setNextStateChooseName()
											IfCompletedActivateSubmitButton('.submit-bot-button');

									  		break;
									  case "chooseBio":
											// deactivateCurrentActiveLI(CURRENT_STATE);
									  		setNextStateChooseBio()
											IfCompletedActivateSubmitButton('.submit-bot-button');

									  		break;
									  case "chooseCountry":
									  // 		deactivateCurrentActiveLI(CURRENT_STATE);
											// activateCurrentTickboxIfComplete(CURRENT_STATE, isPhotoCompleted);
											// setNextStateChooseCountry()
											// activateNextLI(CURRENT_STATE);
											// IfCompletedActivateSubmitButton('.submit-bot-button');
									  		break;
									  }
									}
								})
					    }
					}

				function setNextStateChoosePhoto() {
					exitCurrentState(CURRENT_STATE);
					deactivateCurrentActiveLI(CURRENT_STATE);

					txtContainerDOM.classList.remove('invisible')
					txtContainerDOM.classList.add('visible')
					photoTextContent.classList.add('visible')
					photoTextContent.classList.remove('invisible')
					nameTextContent.classList.add('invisible')
					nameTextContent.classList.remove('visible')
					bioTextContent.classList.add('invisible')
					bioTextContent.classList.remove('visible')

					let NEXT_STATE = "choosePhoto"
					CURRENT_STATE = NEXT_STATE;
					IfCompletedActivateSubmitButton('.submit-bot-button')
					activateNextLI(CURRENT_STATE);
					enterNewState(CURRENT_STATE);

				}
				function setNextStateChooseName() {
					setPIXItextureSRCtoLocalStorage(stage, "mainAvatar");
					exitCurrentState(CURRENT_STATE);
					deactivateCurrentActiveLI(CURRENT_STATE);

					txtContainerDOM.classList.remove('invisible')
					txtContainerDOM.classList.add('visible')
					photoTextContent.classList.add('invisible')
					photoTextContent.classList.remove('visible')
					nameTextContent.classList.add('visible')
					nameTextContent.classList.remove('invisible')
					bioTextContent.classList.add('invisible')
					bioTextContent.classList.remove('visible')

					activateCurrentTickboxIfComplete(CURRENT_STATE, isChoosePhotoCompleted);
					let NEXT_STATE = "chooseName";
					CURRENT_STATE = NEXT_STATE;
					IfCompletedActivateSubmitButton('.submit-bot-button')
					activateNextLI(CURRENT_STATE);
					enterNewState(CURRENT_STATE);
				}
				function setNextStateChooseBio() {
					setBotNameToLocalStorage(stage, "botName");
					exitCurrentState(CURRENT_STATE);
					deactivateCurrentActiveLI(CURRENT_STATE);

					txtContainerDOM.classList.remove('invisible')
					txtContainerDOM.classList.add('visible')
					photoTextContent.classList.add('invisible')
					photoTextContent.classList.remove('visible')
					nameTextContent.classList.add('invisible')
					nameTextContent.classList.remove('visible')
					bioTextContent.classList.add('visible')
					bioTextContent.classList.remove('invisible')

					activateCurrentTickboxIfComplete(CURRENT_STATE, isChooseNameCompleted);
					let NEXT_STATE = "chooseBio";
					CURRENT_STATE = NEXT_STATE;
					IfCompletedActivateSubmitButton('.submit-bot-button')
					activateNextLI(CURRENT_STATE);
					enterNewState(CURRENT_STATE);
				}

				function setNextStateAddToBotnet() {
					setBotBioToLocalStorage(stage, "botBio");
					activateCurrentTickboxIfComplete(CURRENT_STATE, isChooseBioCompleted);
					IfCompletedActivateSubmitButton('.submit-bot-button')
				}

				function setNextStateBotnet() {
					exitCurrentState(CURRENT_STATE);
					txtContainerDOM.classList.add('invisible')
					txtContainerDOM.classList.remove('visible')


					let NEXT_STATE = "botnet";
					CURRENT_STATE = NEXT_STATE;
					enterNewState(CURRENT_STATE);

				}


				function setNextStateChooseCountry() {
					exitCurrentState(CURRENT_STATE);
					let NEXT_STATE = "chooseCountry";
					CURRENT_STATE = NEXT_STATE;

					enterNewState(CURRENT_STATE);
				}

		loader.load(function(loader, resources) {
			/*–– remove loader gif from DOM––*/
				let gifParent = document.getElementById("choosePhoto");
				let loaderGif = document.querySelector(".loader");

				const glitchSound = resources['glitchSound'].sound;
					  glitchSound.volume = 0.0;

				// stage.filters = [new PIXI.filters.CRTFilter({curvature: 0, lineWidth: 0, lineContrast: 0, verticalLine: false, noise: 0.1, vignetting: 0.3 })]

				gifParent.removeChild(loaderGif)
				// remove black background from the parent
				gifParent.style.backgroundColor = "transparent";

				/*–– draw concentric rings around userAvatar ––*/
				drawConcentricCircles(	circlesContainer,
											canvasWidth,
											canvasHeight,
											userAvatarDiameter/2,
											concentricCirclesLineWidth,
											concentricCirclesColor,
			 							  	concentricCirclesAmount, // how many circles to generate
			 							  	concentricCirclesScaleStep)

				/*–– fill canvas with circle packed avatar images ––*/

					// ignore the 'placeholder' avatar resource by subbing 1
				let resourcesLength = Object.keys(resources).length - 1
				initState("choosePhoto");
				initState("chooseName");
				initState("chooseBio");

				changeStateFromDOMbarElement("gameControls");


				ticker.start();
				ticker.add(function(time) {
					renderer.render(stage);
				})

				function initState(STATE) {
					if( STATE == "choosePhoto") {

							let userAvatarCircle = {x: canvasWidth/2, y: canvasHeight/2, radius: userAvatarDiameter/2}
							var avatarPositions = getCirclePackedPositionsForAvatars(canvasWidth, canvasHeight,
																					 [userAvatarCircle],
																					 avatarsAmount,
																					 avatarPackingAttempts,
																					 avatarPackingDiameter )
							for(let i = 0; i < avatarPositions.length; i++) {
								let key = "avatar" + range[i];
								let texture = resources[key].texture;
								texture.scaleMode = PIXI.SCALE_MODES.NEAREST;
								let avatarPosition = {x: avatarPositions[i].x,
													  y: avatarPositions[i].y }
								addAvatar({stage: stage, renderer: renderer, ticker: ticker}, photosContainer, texture, avatarPosition, {diam: avatarDiameter, hoverDiam: avatarHoverDiameter}, glitchSound, setNextStateChooseName);
							}
							let userAvatarTexture = resources.placeholder.texture;
								userAvatarTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
							addAvatar({stage: stage, renderer: renderer, ticker: ticker}, stage,
									  userAvatarTexture,
									  { x: userAvatarCircle.x, y: userAvatarCircle.y },
									  {diam: userAvatarDiameter, hoverDiam: userAvatarDiameter+10},null, null, "mainAvatar" )
							// let last = photoStage.children.length -1;
							// stage.getChildByName("circlesContainer").alpha = 0;
							stage.addChild(circlesContainer);
							stage.addChild(photosContainer);

					} else if (STATE =="chooseName") {
							let userAvatarCircle = {x: canvasWidth/2, y: canvasHeight/2, radius: userAvatarDiameter/2}
							let userDescriptionCircle = {x: canvasWidth/2, y: canvasHeight/2 + 150, radius: userAvatarDiameter/2}
							var namesPositions = getCirclePackedPositionsForAvatars(canvasWidth, canvasHeight,
																					 [userAvatarCircle, userDescriptionCircle],
																					 amount_of_rendered_names,
																					 avatarPackingAttempts, // change
																					 namesPackingDiameter ) // cahnge
							var style = new PIXI.TextStyle({
									align: 'center',
								    fontFamily: inputMonoCompressedFont.fontFamily,
								    fontSize: 12,
								    fill: '#595959'
							});
							var botNameStyle = new PIXI.TextStyle({
									align: 'center',
								    fontFamily: inputMonoCompressedFont.fontFamily,
								    fontSize: 34,
								    fill: '#b2b2b2'
							});
							var botNameCurrent = "a nameless bot";
							var botName = new PIXI.Text(botNameCurrent, botNameStyle)
								botName.x = canvasWidth/2 - botName.width/2;
								botName.y = 50 + userAvatarDiameter/2 + (canvasHeight/2 - botName.height/2);
								botName.name = "botName"
								botName.filters = [new PIXI.filters.DropShadowFilter({color: 0x595959, alpha: 1.0})]

							for(let i = 0; i < namesPositions.length; i++) {

								var txt = new PIXI.Text(bot_names[i].user_display_name,{
									align: 'center',
								    fontFamily: inputMonoCompressedFont.fontFamily,
								    fontSize: 12,
								    fill: '#595959'})
									txt.anchor.set(0.5);

									txt.x = namesPositions[i].x - txt.width/2;
									txt.y = namesPositions[i].y - txt.height/2;
									txt.interactive = true;
									txt.cursor = 'pointer';

									txt.on('pointerover',function() {
										this.style.fill = '#ffffff';
										this.scale.y = 1.3;
										this.scale.x = 1.3;
										botName.text = this.text;
										botName.x = canvasWidth/2 - botName.width/2;

									})

									txt.on('pointerout',function() {
										this.style.fill = '#595959';
										this.scale.y = 1;
										this.scale.x = 1;
										botName.text = botNameCurrent;
										botName.x = canvasWidth/2 - botName.width/2;

									})

									txt.on('pointerup', function() {
										botNameCurrent = this.text;
										botName.text = botNameCurrent;
										botName.x = canvasWidth/2 - botName.width/2;
										stage.filters = [new PIXI.filters.GlitchFilter({offset: 15,
																						average: true,
																						green:[4,4]}),
														new PIXI.filters.PixelateFilter(10)]

										ticker.add(glitch)
										glitchSound.play();

										let seed = 1; //Math.Random() * 100;
										function glitch() {
											seed += 1;
											stage.filters[0].seed = seed;
											if(seed > 20) {
												stage.filters = [];
												ticker.remove(glitch);

												// proceed to the next game stage
													isChooseNameCompleted = true;
													setNextStateChooseBio();
											}
										}

									})

								namesContainer.addChild(txt);
							}
							botName.alpha = 0.0;
							stage.addChild(botName);
							stage.addChild(namesContainer);




					} else if (STATE =="chooseBio") {
							let userAvatarCircle = {x: canvasWidth/2, y: canvasHeight/2, radius: userAvatarDiameter/2}
							let userDescriptionCircle = {x: canvasWidth/2, y: canvasHeight/2 + 200, radius: userAvatarDiameter/2}

							var bioPositions = getCirclePackedPositionsForAvatars(canvasWidth, canvasHeight,
																					 [userAvatarCircle, userDescriptionCircle],
																					 amount_of_rendered_bios,
																					 avatarPackingAttempts, // change
																					 biosPackingDiameter ) // cahnge
							var style = new PIXI.TextStyle({
									align: 'center',
								    fontFamily: inputMonoCompressedFont.fontFamily,
								    fontSize: 12,
								    fill: '#595959'
							});
							var botBioStyle = new PIXI.TextStyle({
									align: 'center',
								    fontFamily: inputMonoCompressedFont.fontFamily,
								    fontSize: 18,
								    wordWrap: true,
								    wordWrapWidth: 350,
								    fill: '#b2b2b2'
							});
							var botBioCurrent = "a nondescript bot";
							var botBio = new PIXI.Text(botBioCurrent, botBioStyle)
								botBio.x = canvasWidth/2 - botBio.width/2;
								botBio.y = 100 + userAvatarDiameter/2 + (canvasHeight/2 - botBio.height/2);
								botBio.name = "botBio"
								botBio.filters = [new PIXI.filters.DropShadowFilter({color: 0x595959, alpha: 1.0})]

							for(let i = 0; i < bioPositions.length; i++) {

								var txt = new PIXI.Text(bot_bios[i].user_profile_description,{
									align: 'center',
								    fontFamily: inputMonoCompressedFont.fontFamily,
								    fontSize: 12,
								    fill: '#595959',
									wordWrap: true,
									wordWrapWidth: biosPackingDiameter-10})
									txt.anchor.set(0.5);

									txt.x = bioPositions[i].x - txt.width/2;
									txt.y = bioPositions[i].y - txt.height/2;
									txt.interactive = true;
									txt.cursor = 'pointer';

									txt.on('pointerover',function() {
										this.style.fill = '#ffffff';
										this.scale.y = 1.3;
										this.scale.x = 1.3;
										botBio.text = this.text;
										botBio.x = canvasWidth/2 - botBio.width/2;

									})

									txt.on('pointerout',function() {
										this.style.fill = '#595959';
										this.scale.y = 1;
										this.scale.x = 1;
										botBio.text = botBioCurrent;
										botBio.x = canvasWidth/2 - botBio.width/2;

									})

									txt.on('pointerup', function() {
										botBioCurrent = this.text;
										botBio.text = botBioCurrent;
										botBio.x = canvasWidth/2 - botBio.width/2;
										stage.filters = [new PIXI.filters.GlitchFilter({offset: 15,
																						average: true,
																						green:[4,4]}),
														new PIXI.filters.PixelateFilter(10)]
										ticker.add(glitch)
										glitchSound.play();

										let seed = 1; //Math.Random() * 100;
										function glitch() {
											seed += 1;
											stage.filters[0].seed = seed;
											if(seed > 20) {
												stage.filters = [];
												ticker.remove(glitch);

												// proceed to the next game stage
													isChooseBioCompleted = true;
													setNextStateAddToBotnet();
											}
										}

									})

								biosContainer.addChild(txt);
							}
							botBio.alpha = 0.0;
							stage.addChild(botBio);
							stage.addChild(biosContainer);




					}
					enterNewState(CURRENT_STATE);
				}

		let dragContainer = ".draggable-container";
		let dragableContent = ".draggable-content";
		let dragger1 = ".dragbar";
		let dragger2 = ".drag-pattern";
		let draggerPattern = dragger2;
		let numOfEls = 200;
		let toggleButton = 'button.minimize';
		let txtContent = '.text-content';

		addLiElementsToDragger(draggerPattern, numOfEls)
		makeElementDraggable(stage, dragContainer, dragger1, dragger2 , dragableContent)
		toggleContentOnClick(toggleButton, txtContent)
		})
	}
}

/*

	Content dragging
    o
*/
	function makeElementDraggable(stage, content_container, dragger1, dragger2, draggableContent) {

    var container = document.querySelector(content_container);
	var dragger1 = document.querySelector(dragger2);
	var dragger2 = document.querySelector(dragger2);
	var draggableContent = document.querySelector(draggableContent);


    var active = false;
    var currentX;
    var currentY;
    var initialX;
    var initialY;
    var xOffset = 0;
    var yOffset = 0;

    container.addEventListener("touchstart", dragStart, false);
    container.addEventListener("touchend", dragEnd, false);
    container.addEventListener("touchmove", drag, false);

    container.addEventListener("mousedown", dragStart, false);
    container.addEventListener("mouseup", dragEnd, false);
    container.addEventListener("mousemove", drag, false);

    function dragStart(e) {
      if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }

      if (e.target === dragger1 || e.target === dragger2) {
        active = true;
      }
    }

    function dragEnd(e) {
      initialX = currentX;
      initialY = currentY;
	  stage.getChildByName("photosContainer").interactiveChildren = true;
	  stage.getChildByName("namesContainer").interactiveChildren = true;
      active = false;
    }

    function drag(e) {
      if (active) {
        e.preventDefault();

        if (e.type === "touchmove") {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

		stage.getChildByName("photosContainer").interactiveChildren = false;
		stage.getChildByName("namesContainer").interactiveChildren = false;

        setTranslate(currentX, currentY, draggableContent);
      }
    }

    function setTranslate(xPos, yPos, el) {
      //el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
      el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";

    }
}

function addLiElementsToDragger(draggerPattern, numOfEls) {
	var ul = document.querySelector(draggerPattern);
		for(var i = 0; i < numOfEls; i++ ) {
			var li = document.createElement('li');
			ul.appendChild(li);
		}
}

function toggleContentOnClick(button, content) {
	var isHidden = false;
	var button = document.querySelector(button);
	var content = document.querySelector(content);

	button.addEventListener("mouseup", toggleVisibility, false);
	button.addEventListener("touchend", toggleVisibility, false);

	function toggleVisibility() {
		if(isHidden) {
			content.style.display = 'block'
			isHidden = false
		} else {
			content.style.display = 'none'
			isHidden = true
		}
	}
}


/*

	PIXI  canvas avatar drawing

*/

	function getCirclePackedPositionsForAvatars(canvasWidth, canvasHeight, userAvatarCircle, totalCircles, packingAttempts, AvatarDiam) {
		var circles = [];

		for(let i = 0; i < userAvatarCircle.length; i++ ) {
			circles.push(userAvatarCircle[i])
		}

		let radius = AvatarDiam/2;

		for( var i = 0; i < totalCircles; i++ ) {
  			createCircle(canvasWidth, canvasHeight, circles, packingAttempts, radius);
		}

		circles.shift();
		return circles;
	}

	function createCircle(canvasWidth, canvasHeight, circles, maxAttempts, radius) {
	  var newCircle;
	  var circleSafeToDraw = false;

	  for(var tries = 0; tries < maxAttempts; tries++) {
	    newCircle = {
	      x: Math.floor(Math.random() * canvasWidth),
	      y: Math.floor(Math.random() * canvasHeight),
	      radius: radius
	    }

	    if(doesCircleHaveAcollision(canvasWidth, canvasHeight, newCircle, circles)) {
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


	function doesCircleHaveAcollision(canvasWidth, canvasHeight, newCircle, otherCircles) {
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


	function addAvatar(stageANDrenderer, parentContainer, tex, position, diamANDHoverDiam,soundEffect, nextState, name=null) {
	    var x = position.x;
	    var y = position.y;
	    var diam = diamANDHoverDiam.diam;
	    var hoverDiam = diamANDHoverDiam.hoverDiam;
	    var stage = stageANDrenderer.stage;
	    var renderer = stageANDrenderer.renderer;
	    var ticker = stageANDrenderer.ticker;

		// var outlineFilterBlue = new PIXI.filters.OutlineFilter(2, 0x99ff99);

	    var avatar = new PIXI.Sprite(tex);
	    avatar.interactive = true;
	    avatar.buttonMode = true;
	    avatar.anchor.set(0.5);

	    let texW = avatar.texture.width;
	    let texH = avatar.texture.height;
	    var aspectR = texH / texW;

	    if ( texW > texH ) {
	    	aspectR = texH / texW;
	    } else if ( texW < texH ) {
	    	aspectR = texH / texW; //texW / texH;
	    } else {
	    	aspectR = 1;
	    }

	    var avatarWidth = diam;
	    var avatarHeight = diam * aspectR;

	    avatar.width = avatarWidth;
	    avatar.height = avatarHeight;
	    avatar.x = x;
	    avatar.y = y;

	    if(name == "mainAvatar") {
		    var mask = new PIXI.Graphics();
			mask.beginFill(0x000000)
			mask.drawCircle(x, y, diam/2)
			mask.endFill()
			mask.pivot.set(0.5, 0.5)
			avatar.mask = mask;
			avatar.interactive = false;

		}

	   	if(name != null) {
	   		avatar.name = name;
	   	}
	   	if(name != "mainAvatar") {
	   		avatar.on('pointerup', setMainAvatarToThis)
	   		// avatar.on('pointerdown', outlineAvatar)
	    	avatar.on('pointerover', setTempMainAvatarToThis) //setMainAvatarToThis)
	    	avatar.on('pointerout', resetMainAvatar)
		}
	    let previousTex;

	    function hoverEff() {
	    	// this.mask.scale.set(1.5);
	    		this.scale.set(1.5);
	    }

	    function setMainAvatarToThis() {
	    	let mainAvatar = stage.getChildByName("mainAvatar")
	    		previousTex = mainAvatar.texture;
	    		mainAvatar.setTexture(this.texture)
				stage.filters = [new PIXI.filters.GlitchFilter({offset: 15,
																average: true,
																green:[4,4]}),
								new PIXI.filters.PixelateFilter(10)]

				ticker.add(glitch)
				if(soundEffect != null) soundEffect.play()

				let seed = 1;
				function glitch() {
					seed += 1;
					// stage.filters[0].seed = seed;
					if(seed > 20) {
						stage.filters = [];
						ticker.remove(glitch);

						// proceed to the next game stage
						if(nextState != null) {
							console.log(isChoosePhotoCompleted)
							isChoosePhotoCompleted = true;
							nextState();
						}

					}
				}

	    		// renderer.render(stage);
	    }

	    function setTempMainAvatarToThis() {
	    	let mainAvatar = stage.getChildByName("mainAvatar")
	    		previousTex = mainAvatar.texture;
	    		mainAvatar.setTexture(this.texture)
	    		this.width = hoverDiam;
	    		this.height = hoverDiam * aspectR;

	    		// this.mask.graphicsData.radius = 60;
	    		// renderer.render(stage);
	    }

	    function resetMainAvatar() {
	    	let mainAvatar = stage.getChildByName("mainAvatar")
	    		mainAvatar.setTexture(previousTex)
	    		this.width = avatarWidth;
	    		this.height = avatarHeight;
	    		mainAvatar.filters = [];
	    		avatar.filters = [];
	    		// renderer.render(stage);
	    }

	    function outlineAvatar() {
	    	let mainAvatar = stage.getChildByName("mainAvatar")
	    	// mainAvatar.filters = [new PIXI.filters.OutlineFilter(3, twitterBlue, quality = 1.0)];
	    	// avatar.filters = [new PIXI.filters.OutlineFilter(3, twitterBlue, quality = 1.0)];

	    }

	    parentContainer.addChild(avatar);

	}


	 function drawConcentricCircles(stage,
	 								canvasWidth, canvasHeight,
	 								userAvatarWidth,
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

	function setPIXItextureSRCtoLocalStorage(stage, objectName) {
		let PIXItexSRC = stage.getChildByName(objectName).texture.baseTexture.imageUrl
		console.log(PIXItexSRC);
		localStorage.setItem(objectName + "TextureSRC", PIXItexSRC);
	}

	function setBotNameToLocalStorage(stage, objectName) {
		let botNameText = stage.getChildByName(objectName).text
		localStorage.setItem("botNameText", botNameText);
	}

	function setBotBioToLocalStorage(stage, objectName) {
		let botBioText = stage.getChildByName(objectName).text
		localStorage.setItem("botBioText", botBioText);
	}

	function loadJSON(path, callback) {

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', path, false); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }
