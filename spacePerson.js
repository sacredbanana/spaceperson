// Get the canvas and context
var canvas = document.getElementById("space");
canvas.width = 1280;
canvas.height = 652;
var ctx = canvas.getContext("2d");
var frames = 0;

//all music/sfx loading
var music = new Audio();
music.preload = "auto";
music.src = "JMJ-Oxygene-7.mp3";
music.play();
var pickUp = new Audio();
pickUp.preload = "auto";
pickUp.src = "Pickup_Coin6.wav";
var oxygenUp = new Audio();
oxygenUp.preload = "auto";
oxygenUp.src = "Powerup11.wav"
var deathSound = new Audio();
deathSound.preload = "auto";
deathSound.src = "deathSound.wav"

//setup variabls
var tools = 0;
var toolImage = ["hammer.png", "bolt.png", "spanner.png"];
var collectables = [];
var frame = 0;
var powerUps = [];
var lastCall = 0;  //to calculate the (real) time between two update-calls

//push oxygen powerup into array at specific x,y
powerUps.push(new spaceTools(26, 360, "oxygen.png", 30));

//push tools into an array for easy distribution later
for (var i = 0; i < toolImage.length; i++) { 
	
	//spawn tools at random x,y
	randX = Math.floor((Math.random() *1000) + 200);
	randY = Math.floor((Math.random() *420) + 100);
	
	collectables.push(new spaceTools(randX, randY, toolImage[i], i+1));
 
}

//having spaceperson as a class makes it easy to access variables
var spacePerson = {
    image: image("spaceperson_im.png", function(img){
        spacePerson.width = img.naturalWidth/1.5;
        spacePerson.height = img.naturalHeight/1.5;
        //render image
        update();
    }),

    //position
    x: 60, y: 310,
    width: 0, height: 0,
	
	
    speed: 200, // px/s
	oxygen: 500


    

};

//functions can become objects with new() keyword (which is strange, but useful here)
function spaceTools(x, y, imgSrc, id) {
	
	//image setup, scaled to fit appropriately inside canvas
		this.toolImage = image(imgSrc, function(img){
        this.width = 20;
        this.height = 30;
        //render image
        update();
    });
	
	this.x = x;
    this.y = y;
	this.id = id;
	this.height = 60;
	this.width = 40;
	
}

//image utility
function image(url, callback){
    var img = new Image();
    if(typeof callback === "function"){
        img.onload = function(){
            //just to ensure that the callback is executed async
            setTimeout(function(){ callback(img, url) }, 0)
        }
    }
    img.src = url;
    return img;
}

//to keep a value constrained between a min and a max
function clamp(v, min, max){
    return v > min? v < max? v: max: min;
}

//returns a function that can be called with a keyCode or one of the known aliases
//and returns true or false if the button is down or not
var isKeyDown = (function(aliases){
    //the current State of each button
    for(var i=256, keyDown=Array(i); i--; )keyDown[i]=false;
    var handler = function(e){
        keyDown[e.keyCode] = e.type === "keydown";
        e.preventDefault();  //aka. scrolling
    };

    addEventListener("keydown", handler, false);
    addEventListener("keyup", handler, false);

    return function(key){
        return(true === keyDown[ key in aliases? aliases[ key ]: key ])
    }
})({
    //keycodes
    up: 38,
    down: 40,
    left: 37,
    right: 39
});

function movePlayer(time) {
	
	
    var sp = spacePerson,
	    speed = sp.speed;

    
    var dx = (isKeyDown('right') - isKeyDown('left')) * time,
        dy = (isKeyDown('down') - isKeyDown('up')) * time;

    //fix the speed for diagonals
    if(dx && dy) speed *= 0.7071067811865475;

    //calculate the new x-Position
    //currentPos + direction * speed
    if(dx) { 
		sp.x = clamp(sp.x + dx * sp.speed, 0, canvas.width - sp.width);
		//spacePerson.oxygen--;
    }
	//same for y
    if(dy) {
		sp.y = clamp(sp.y + dy * sp.speed, 0, canvas.height - sp.height);
		//spacePerson.oxygen--;
	}
    //clears canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sp.image, sp.x, sp.y, sp.width, sp.height);
}

function drawTools() {
	
	 //ctx.clearRect(0, 0, canvas.width, canvas.height);
	 //ctx.drawImage(collectables[0].toolImage, collectables[0].x, collectables[0].y)
	 
	 //go through the array and draw a new tool if collision happens
	 //reposition last tool collided with
	for(var i = 0; i < collectables.length; i++) {
		
		randX = Math.floor((Math.random() *1000) + 200);
		randY = Math.floor((Math.random() *420) + 50);
		
		//check for collision
		if (collide(spacePerson, collectables[i])){
			pickUp.play();
			tools += 1; //increase score everytime tool is collected
			
			//respawn tool elsewhere
			collectables[i].x = randX;
			collectables[i].y = randY;
		}
		
		ctx.drawImage(collectables[i].toolImage, collectables[i].x, collectables[i].y, collectables[i].width, collectables[i].height);
	} 
	
	//powerUp collision
	if (collide(spacePerson, powerUps[0])){
			oxygenUp.play();
			powerUps[0].x = 1980;
			powerUps[0].y = 800;
			spacePerson.oxygen += 200;
	}	
	if (spacePerson.oxygen < 250) {
		
		ctx.drawImage(powerUps[0].toolImage, 26, 360, powerUps[0].width, powerUps[0].height);
		powerUps[0].x = 26;
		powerUps[0].y = 360;
		
	}
} 
	

function collide(spacePerson, currentTool) {
	
	//shortening variable names to decrease mistakes and typing time
	var sp = spacePerson,
		st = currentTool;
	
	var collision = false;
	
	//creating an area that can be collided with (i.e. hitbox)
	if ((sp.x + sp.width/2) < (st.x + st.width/6*8) && (sp.x + sp.width/2) > (st.x +st.width/8)) {
		if ((sp.y + sp.height/2) < (st.y + st.height/6*8) && (sp.y + sp.height/2) > (st.y +st.height/8)) {
			collision = true;
		}
	}
	
	return collision;	
}

//on death, restart game
function death(){
	
	deathSound.play();
	
	spacePerson.x = 60;
	spacePerson.y = 310;
	
	spacePerson.oxygen = 1000;
	tools = 0;
}

//main game loop
function update(){
	
	//count frames for functions that may not need to be checked every frame
	frames++;
	
	 //next frame
    requestAnimationFrame(update);

    //taking account for (sometimes changing) framerates
    var now = Date.now(), time = lastCall|0 && (now-lastCall)/1000;
    lastCall = now;
	
	//every 10 frames take oxygen
	if(frames % 10 == 0) {
		
		spacePerson.oxygen--;
		if (spacePerson.oxygen <= 0) {
			death();
		}
		
	}
	
	//drawing and movement
	movePlayer(time);
	drawTools();
	
	// set up score 
	ctx.font = "80px Lucida Console";
	ctx.fillStyle = "#FFFEE0";
	ctx.fillText(tools, 10, 80);
	
	//oxygen countdown
	ctx.font = "40px Lucida Console";
	ctx.fillStyle = "#FFFEE0";
	ctx.fillText("Oxygen remaining: "+spacePerson.oxygen, canvas.width/3, canvas.height/15);
	
		
}
