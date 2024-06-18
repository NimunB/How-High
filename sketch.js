// parameters
let p = {
  landmarks: false,
  skeleton: false,
  blackScreen: true,
};

// the model
let posenet;
// latest model predictions
let predictions = [];
// video capture
let video;

// Store data about each person
let peopleData = {};

// max jump count
let maxJumpCount = 25;

// stickFigure
let stickFigure;

// Helper function to load images
function loadImages(folder, imageArray) {
  return imageArray.map(img => loadImage(folder + img));
}

function preload() {
  noseImages = ['beyonce.png', 'dog.png', 'dot.png', 'pig.png', 'redCircle.png', 'voldemort.png', 'white.png'];
  earImages = ['beyonce.png', 'bluePink.png', 'drawn.png', 'gold.png', 'piercing.png', 'pointy.png', 'white.png'];
  eyeImages = ['beyonce.png', 'blueCartoon.png', 'closedWhite.png', 'drawn.png', 'greenMenacing.png', 'orange.png', 'rihanna.png'];
  antennaImages = ['blackFuzzy.png', 'bunny.png', 'green.png', 'pink2.png', 'purple.png', 'tiara.png'];
  handImages = ['blueAlien.png', 'blueClaw.png', 'greenAlien.png', 'mickeyMouse.png', 'rihannaHand.png', 'whiteFist.png', 'womanCartoon.png'];
  shoulderImages = ['firework.png', 'gorilla.png', 'labelledSkeleton.png', 'purpleBush.png', 'woman.png', 'written.png'];
  footImages = ['dog.png', 'duck.png', 'elephant.png', 'grid.png', 'highHeel.png', 'monsterShoe.png', 'soccer.png'];
  hipImages = ['accSkeleton.png', 'belt.png', 'creamSkeleton.png', 'jewelry.png'];
  jointImages = ['bird.png', 'bluePassport.png', 'clock.png', 'ice.png', 'knee.png', 'maple.png', 'passport.png', 'redOrangeFlower.png', 'rose.png', 'sapphire.png'];

  // Loading all necessary images for body parts
  noseImageArray = loadImages('bodyStickers/nose/', noseImages);
  earImageArray = loadImages('bodyStickers/ear/', earImages);
  eyeImageArray = loadImages('bodyStickers/eye/', eyeImages);
  antennaImageArray = loadImages('bodyStickers/antenna/', antennaImages);
  handImageArray = loadImages('bodyStickers/hand/', handImages);
  shoulderImageArray = loadImages('bodyStickers/shoulder/', shoulderImages);
  footImageArray = loadImages('bodyStickers/feet/', footImages);
  hipImageArray = loadImages('bodyStickers/hips/', hipImages);
  jointImageArray = loadImages('bodyStickers/joints/', jointImages);

  stickFigure = loadImage('bodyStickers/stickFigure.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(width, height);

  // add params to a GUI
  createParamGui(p, paramChanged);

  // initialize the model
  const options = {
    maxPoseDetections: 6,
    minConfidence: 0.3,
  };
  
  posenet = ml5.poseNet(video, options, modelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new predictions are made
  // When it detects a pose, this method is called:
  posenet.on("pose", (results) => {
    console.log(results); // results is an object.
    // Filter out poses with low confidence
    const filteredPoses = results.filter((p) => p.pose.score > 0.27);
    predictions = filteredPoses;
    updatePeopleData();
  });

  // Hide the video element, and just show the canvas
  video.hide();

  // Presentation purposes
  noCursor();

  // Set the start time
  startTime = millis();
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  background("#000000"); 
  // Showing video
  if (p.blackScreen == false) {
    background("#0000cc");
    translate(video.width, 0)
    scale(-1, 1);
    image(video, 0, 0, width, height);
  }
  // Showing black screen
  else {
    translate(video.width, 0)
    scale(-1, 1);
  }
  // Calculate elapsed time in seconds
  let elapsedTime = (millis() - startTime) / 1000;

  // Fade in "Jump" Message after 23 seconds
  if (elapsedTime > 23) {
    let fadeInDuration = 2; // Duration of the fade-in effect in seconds
    let fadeValJump = map(constrain(elapsedTime - 30, 0, fadeInDuration), 0, fadeInDuration, 0, 255);
    drawJumpMessage(fadeValJump);
  }

  // Drawing Body Stickers
  drawEars(); 
  drawAntennas();
  drawEyes();
  drawHand();
  drawFeet();
  drawShoulders();
  drawElbows();
  drawHips();
  drawKnees();

   // Fade in Jump Counter after 23 seconds
  if (elapsedTime > 23) {
    let fadeInDuration = 2; // Duration of the fade-in effect in seconds
    let fadeValCount = map(constrain(elapsedTime - 30, 0, fadeInDuration), 0, fadeInDuration, 0, 255);
    drawJumpNumber(fadeValCount);
  }

  // Drawing generic man figure
  drawRevealedImage();
}

// Returns an image ransomly from specified foler
function randomImg(folder) {
  return folder[floor(random(folder.length))]
}

function updatePeopleData() {
  // Update or initialize data for each person
  predictions.forEach((p, i) => {
    let personID = i;

    if (!peopleData[personID]) {
      peopleData[personID] = {
        eyeCount: random() < 0.5 ? 1 : 2, // Assign 1 or 2 eyes randomly
        noseSticker: randomImg(noseImageArray),
        earSticker: randomImg(earImageArray),
        eyeSticker: randomImg(eyeImageArray),
        antennaSticker: randomImg(antennaImageArray),
        handSticker: randomImg(handImageArray),
        shoulderSticker: randomImg(shoulderImageArray),
        footSticker: randomImg(footImageArray),
        hipSticker: randomImg(hipImageArray),
        elbowSticker: randomImg(jointImageArray),
        kneeSticker: randomImg(jointImageArray),
        jumpCount: 0,
        prevHipY: (p.pose.leftHip.y + p.pose.rightHip.y) / 2,
        performanceValue: 0,
        stickFigureColor: color(random(255), random(255), random(255)),
      };
    } else { // Update jumpCounts for people
      let currentHipY = (p.pose.leftHip.y + p.pose.rightHip.y) / 2;
      let prevHipY = peopleData[personID].prevHipY;

      // Only check for jumps after 25 seconds
      let elapsedTime = (millis() - startTime) / 1000;

      if (elapsedTime > 25) {
        if (peopleData[personID].jumpCount > maxJumpCount) {
          peopleData[personID].jumpCount = 0; // reset jumpCount
        }
        // Check if jump has occurred
        let verticalDif = prevHipY - currentHipY;
        let personHeight = currentHipY - p.pose.nose.y;
        if (verticalDif / personHeight > 0.17) {
          peopleData[personID].jumpCount++;
        }
        // Update performance value
        peopleData[personID].performanceValue = map(peopleData[personID].jumpCount, 0, maxJumpCount, 0, 255);
      }

      // Update previous hip coordinate
      peopleData[personID].prevHipY = currentHipY;
    }
  });
}

function maintainAspectRatio(d, img) {
  // Maintain aspect ratio by scaling proportionally
  let aspectRatio = img.width / img.height;
  let scaledWidth, scaledHeight;
  if (aspectRatio > 1) {
    // Sticker is wider than it is tall
    scaledWidth = d;
    scaledHeight = d / aspectRatio;
  } else {
    // Sticker is taller than it is wide
    scaledWidth = d * aspectRatio;
    scaledHeight = d;
  }
  return [scaledWidth, scaledHeight];
}

function drawJumpMessage(alpha) {
  push();

  // Highlight rectangle
  fill(0, 0, 204, alpha); // Use RGBA values for fill color with alpha
  noStroke(); // Remove outline
  rectMode(CENTER);
  let rectWidth = textWidth("Jump.") + 40; // Add padding
  let rectHeight = 30;
  rect(width / 2, 120, rectWidth, rectHeight);

  // Text
  fill(255, alpha);
  textSize(60);
  textFont("Namdhinggo");

  let x = width / 2;
  let y = 120;

  translate(x, y);
  scale(-1, 1);
  text("Jump.", 0, 0);

  pop();
}

// Draw generic man figure
function drawRevealedImage() {
  // For each person
  predictions.forEach((p, i) => {
    let avgHipY = (p.pose.leftHip.y + p.pose.rightHip.y) / 2;

    // centered around this x and y
    let x = (p.pose.leftShoulder.x + p.pose.rightShoulder.x) / 2;
    let y = avgHipY;

    // Choose scale value
    let d = dist(p.pose.leftShoulder.x, p.pose.leftShoulder.y, p.pose.rightShoulder.x, p.pose.rightShoulder.y) * 4.5
    let [scaledWidth, scaledHeight] = maintainAspectRatio(d, stickFigure);

    // Figuring out opacity
    let alpha = peopleData[i].performanceValue;

    // Specify the desired color (e.g., red)
    let stickFigureColor = peopleData[i].stickFigureColor;

    // Draw stick figure
    push()
    translate(x, y)
    imageMode(CENTER)
    tint(stickFigureColor.levels[0], stickFigureColor.levels[1], stickFigureColor.levels[2], alpha);
    image(stickFigure, 0, 0, scaledWidth, scaledHeight)
    pop()
  });
}

// Draw jump counter on people
function drawJumpNumber(alpha) {
  // For each person
  predictions.forEach((p, i) => {
    // Get location to place number
    let x = (p.pose.leftShoulder.x + p.pose.rightShoulder.x) /2;
    let y = p.pose.leftShoulder.y;

    let d = dist(p.pose.leftShoulder.x, p.pose.leftShoulder.y, p.pose.rightShoulder.x, p.pose.rightShoulder.y) * 0.3;

    push();
    fill(255, alpha);
    textSize(d);
    textAlign(CENTER, CENTER);
    textFont("Kode Mono");
    translate(x, y);
    scale(-1, 1);
    text(peopleData[i].jumpCount, 0, 0);
    pop();
  });
}

function drawKnees() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Get knee locations
    leftKneeX = p.pose.leftKnee.x;
    leftKneeY = p.pose.leftKnee.y;
    rightKneeX = p.pose.rightKnee.x;
    rightKneeY = p.pose.rightKnee.y;

    // Choose scale values
    let knee_d = dist(leftKneeX, leftKneeY, rightKneeX, rightKneeY) * 0.5;
    let [scaledWidth, scaledHeight] = maintainAspectRatio(knee_d, peopleData[i].kneeSticker);

    // Draw left knee
    push()
    translate(leftKneeX, leftKneeY)
    imageMode(CENTER)
    scale(-1, 1)
    tint(255, alpha);
    image(peopleData[i].kneeSticker, 0, 0, scaledWidth, scaledHeight)
    pop()

    // Draw right knee
    push()
    translate(rightKneeX, rightKneeY)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].kneeSticker, 0, 0, scaledWidth, scaledHeight)
    pop()
  });
}

function drawHips() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Get hip locations
    leftHipX = p.pose.leftHip.x;
    leftHipY = p.pose.leftHip.y;
    rightHipX = p.pose.rightHip.x;
    rightHipY = p.pose.rightHip.y;

    avgX = (leftHipX + rightHipX) / 2;
    avgY = (leftHipY + rightHipY) / 2;

    // Choose scale values
    let hip_d = dist(leftHipX, leftHipY, rightHipX, rightHipY) * 1.5;
    let [scaledWidth, scaledHeight] = maintainAspectRatio(hip_d, peopleData[i].hipSticker);

    // Choose left foot rotation value
    let a = atan2(leftHipY - rightHipY, leftHipX - rightHipX); //+ HALF_PI;

    // Draw Hip
    push()
    translate(avgX, avgY)
    rotate(a)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].hipSticker, 0, 0, scaledWidth, scaledHeight)
    pop()
  });
}

function drawElbows() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;
    // Get elbow locations
    leftElbowX = p.pose.leftElbow.x;
    leftElbowY = p.pose.leftElbow.y;
    rightElbowX = p.pose.rightElbow.x;
    rightElbowY = p.pose.rightElbow.y;

    // Getting eye locations
    eye_lx = p.pose.leftEye.x
    eye_ly = p.pose.leftEye.y
    eye_rx = p.pose.rightEye.x
    eye_ry = p.pose.rightEye.y

    // Choose scale values
    let elbow_d = dist(leftElbowX, leftElbowY, rightElbowX, rightElbowY) * 0.3;
    let [scaledWidth, scaledHeight] = maintainAspectRatio(elbow_d, peopleData[i].elbowSticker);

    // Draw left elbow
    push()
    translate(leftElbowX, leftElbowY)
    imageMode(CENTER)
    scale(-1, 1)
    tint(255, alpha);
    image(peopleData[i].elbowSticker, 0, 0, scaledWidth, scaledHeight)
    pop()

    // Draw right elbow
    push()
    translate(rightElbowX, rightElbowY)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].elbowSticker, 0, 0, scaledWidth, scaledHeight)
    pop()
  });
}

function drawShoulders() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Get shoulder locations
    leftShoulderX = p.pose.leftShoulder.x;
    leftShoulderY = p.pose.leftShoulder.y;
    rightShoulderX = p.pose.rightShoulder.x;
    rightShoulderY = p.pose.rightShoulder.y;

    // Choose scale values
    let shoulder_d = dist(leftShoulderX, leftShoulderY, rightShoulderX, rightShoulderY) * 0.4;
    let [scaledWidth, scaledHeight] = maintainAspectRatio(shoulder_d, peopleData[i].shoulderSticker);

    // Draw left shoulder
    push()
    translate(leftShoulderX, leftShoulderY)
    imageMode(CENTER)
    scale(-1, 1)
    tint(255, alpha);
    image(peopleData[i].shoulderSticker, 0, 0, scaledWidth, scaledHeight)
    pop()

    // Draw right shoulder
    push()
    translate(rightShoulderX, rightShoulderY)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].shoulderSticker, 0, 0, scaledWidth, scaledHeight)
    pop()
  });
}

function drawFeet() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Getting ankle locations
    lx = p.pose.leftAnkle.x
    ly = p.pose.leftAnkle.y
    rx = p.pose.rightAnkle.x
    ry = p.pose.rightAnkle.y

    // Getting knee locations
    leftKneeX = p.pose.leftKnee.x
    leftKneeY = p.pose.leftKnee.y
    rightKneeY = p.pose.rightKnee.y
    rightKneeX = p.pose.rightKnee.x

    // Choose scale value for left leg
    let l_d = dist(leftKneeX, leftKneeY, lx, ly) * 0.5
    // Choose left foot rotation value
    let l_a = atan2(leftKneeY - ly, leftKneeX - lx) + HALF_PI;

    // Choose scale value for right leg
    let r_d = dist(rightKneeX, rightKneeY, rx, ry) * 0.5
    // Choose right foot rotation value
    let r_a = atan2(rightKneeY - ry, rightKneeX - rx) + HALF_PI;

    // Draw left foot
    push()
    translate(lx, ly)
    rotate(l_a)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].footSticker, 0, 0, l_d, l_d)
    pop()
    // Draw right foot
    push()
    translate(rx, ry)
    rotate(r_a)
    imageMode(CENTER)
    scale(-1, 1)
    tint(255, alpha);
    image(peopleData[i].footSticker, 0, 0, r_d, r_d)
    pop()
  });
}

function drawHand() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Getting wrist locations
    lx = p.pose.leftWrist.x
    ly = p.pose.leftWrist.y
    rx = p.pose.rightWrist.x
    ry = p.pose.rightWrist.y

    // Getting knee locations
    leftElbowX = p.pose.leftElbow.x
    leftElbowY = p.pose.leftElbow.y
    rightElbowY = p.pose.rightElbow.y
    rightElbowX = p.pose.rightElbow.x

    // Choose scale value for left hand
    let l_d = dist(leftElbowX, leftElbowY, lx, ly) * 0.75
    // Choose left hand rotation value
    let l_a = atan2(leftElbowY - ly, leftElbowX - lx) + HALF_PI;

    // Choose scale value for right hand
    let r_d = dist(rightElbowX, rightElbowY, rx, ry) * 0.75
    // Choose right foot rotation value
    let r_a = atan2(rightElbowY - ry, rightElbowX - rx) + HALF_PI;

    // Draw left hand
    push()
    translate(lx, ly)
    rotate(l_a)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].handSticker, 0, 0, l_d, l_d)
    pop()
    // Draw right hand
    push()
    translate(rx, ry)
    rotate(r_a)
    imageMode(CENTER)
    scale(-1, 1)
    tint(255, alpha);
    image(peopleData[i].handSticker, 0, 0, r_d, r_d)
    pop()
  });
}

function drawEyes() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // 2 eyes, nose
    if (peopleData[i].eyeCount == 2) {
      // Getting eye locations
      lx = p.pose.leftEye.x
      ly = p.pose.leftEye.y
      rx = p.pose.rightEye.x
      ry = p.pose.rightEye.y

      // Choose scale value
      let d = dist(lx, ly, rx, ry) 
      // Choose rotation value
      let a = atan2(ly - ry, lx - rx) 

      // Drawing left eye
      push()
      translate(lx, ly)
      rotate(a)
      imageMode(CENTER)
      
      // Maintain aspect ratio by scaling proportionally
      let aspectRatio = peopleData[i].eyeSticker.width / peopleData[i].eyeSticker.height;
      let scaledWidth, scaledHeight;
      if (aspectRatio > 1) {
        // Sticker is wider than it is tall
        scaledWidth = d;
        scaledHeight = d / aspectRatio;
      } else {
        // Sticker is taller than it is wide
        scaledWidth = d * aspectRatio;
        scaledHeight = d;
      }
      scale(-1, 1); 
      tint(255, alpha);
      image(peopleData[i].eyeSticker, 0, 0, scaledWidth, scaledHeight);
      pop()

      // Drawing right eye
      push()
      translate(rx, ry)
      rotate(a)
      imageMode(CENTER)
      
      // Maintain aspect ratio by scaling proportionally
      aspectRatio = peopleData[i].eyeSticker.width / peopleData[i].eyeSticker.height;
      if (aspectRatio > 1) {
        // Sticker is wider than it is tall
        scaledWidth = d;
        scaledHeight = d / aspectRatio;
      } else {
        // Sticker is taller than it is wide
        scaledWidth = d * aspectRatio;
        scaledHeight = d;
      }
      tint(255, alpha);
      image(peopleData[i].eyeSticker, 0, 0, scaledWidth, scaledHeight);
      pop()

      // Drawing the nose
      drawNose();
    }
    // 1 eye, no nose
    else {
      // Getting eye locations
      eye_lx = p.pose.leftEye.x
      eye_ly = p.pose.leftEye.y
      eye_rx = p.pose.rightEye.x
      eye_ry = p.pose.rightEye.y

      // Getting midpoint of eyes
      x = (eye_lx + eye_rx)/2;
      y = (eye_ly + eye_ry)/2;

      // Choose scale value
      let d = dist(eye_lx, eye_ly, eye_rx, eye_ry) * 1.4
      // Choose rotation value
      let a = atan2(eye_ly - eye_ry, eye_lx - eye_rx) 

      // Draw cyborg eye
      push()
      translate(x, y)
      rotate(a)
      imageMode(CENTER)

      // Maintain aspect ratio by scaling proportionally
      let aspectRatio = peopleData[i].eyeSticker.width / peopleData[i].eyeSticker.height;
      let scaledWidth, scaledHeight;

      if (aspectRatio > 1) {
        // Sticker is wider than it is tall
        scaledWidth = d;
        scaledHeight = d / aspectRatio;
      } else {
        // Sticker is taller than it is wide
        scaledWidth = d * aspectRatio;
        scaledHeight = d;
      }
      tint(255, alpha);
      image(peopleData[i].eyeSticker, 0, 0, scaledWidth, scaledHeight);

      pop()
    }
  });
}

function drawAntennas() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;
    // Getting face size
    let faceSize = dist(
      p.pose.leftEar.x,
      p.pose.leftEar.y,
      p.pose.rightEar.x,
      p.pose.rightEar.y
    );
    // Getting eye locations
    eye_lx = p.pose.leftEye.x
    eye_ly = p.pose.leftEye.y
    eye_rx = p.pose.rightEye.x
    eye_ry = p.pose.rightEye.y
    // Choose scale value
    let d = dist(eye_lx, eye_ly, eye_rx, eye_ry) * 2.7
    let [scaledWidth, scaledHeight] = maintainAspectRatio(d, peopleData[i].antennaSticker);
    // Choose rotation value
    let a = atan2(eye_ly - eye_ry, eye_lx - eye_rx) 

    // Getting nose position
    let nose_x = p.pose.nose.x;
    let nose_y = p.pose.nose.y;

    // Calculate midpoint between eyes
    let eyesMidpointX = (eye_lx + eye_rx) / 2;
    let eyesMidpointY = (eye_ly + eye_ry) / 2;

    // Calculate rotation angle based on the line between the midpoint of the eyes and the nose
    let angle = atan2(nose_y - eyesMidpointY, nose_x - eyesMidpointX);

    // Calculate antenna positions relative to the face size
    let antennaLength = dist(eye_lx, eye_ly, eye_rx, eye_ry) * 3; // Adjust the ratio as needed

    // Left antenna positions
    let x = nose_x - cos(angle) * (antennaLength / 2);
    let y = nose_y - sin(angle) * (antennaLength / 2);

    // Draw antennas
    push()
    translate(x, y)
    rotate(a)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].antennaSticker, 0, 0, scaledWidth, scaledHeight);
    pop()
  });
}

function drawEars() {
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Getting ear positions
    lx = p.pose.leftEar.x
    ly = p.pose.leftEar.y
    rx = p.pose.rightEar.x
    ry = p.pose.rightEar.y
    // Getting eye locations
    eye_lx = p.pose.leftEye.x
    eye_ly = p.pose.leftEye.y
    eye_rx = p.pose.rightEye.x
    eye_ry = p.pose.rightEye.y
    // Choose scale value
    let d = dist(eye_lx, eye_ly, eye_rx, eye_ry)
    // Choose rotation value
    let a = atan2(eye_ly - eye_ry, eye_lx - eye_rx) 
    // Draw right ear
    push()
    translate(rx, ry)
    rotate(a)
    imageMode(CENTER)
    tint(255, alpha);
    image(peopleData[i].earSticker, 0, 0, d, d)
    pop()
    // Draw left ear
    push()
    translate(lx, ly)
    rotate(a)
    imageMode(CENTER)
    scale(-1, 1)
    tint(255, alpha);
    image(peopleData[i].earSticker, 0, 0, d, d)
    pop()
  });
}

function drawNose(){
  // For each person
  predictions.forEach((p, i) => {
    // Figuring out opacity
    let alpha = 255 - peopleData[i].performanceValue;

    // Getting nose positions
    x = p.pose.nose.x
    y = p.pose.nose.y
    // Getting eye locations
    eye_lx = p.pose.leftEye.x
    eye_ly = p.pose.leftEye.y
    eye_rx = p.pose.rightEye.x
    eye_ry = p.pose.rightEye.y
    // Choose scale value
    let d = dist(eye_lx, eye_ly, eye_rx, eye_ry)
    let [scaledWidth, scaledHeight] = maintainAspectRatio(d, peopleData[i].noseSticker);
    // Choose rotation value
    let a = atan2(eye_ly - eye_ry, eye_lx - eye_rx) 

    // Draw image
    push()
    translate(x, y)
    rotate(a)
    imageMode(CENTER)
    scale(0.8)
    tint(255, alpha);
    image(peopleData[i].noseSticker, 0, 0, scaledWidth, scaledHeight);
    pop()
  });
}

function keyPressed() {
}

function mousePressed() {}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(width, height);
}

// global callback from the settings GUI
function paramChanged(name) {}

fps = 0;

function drawFps() {
  let a = 0.01;
  fps = a * frameRate() + (1 - a) * fps;
  stroke(255);
  strokeWeight(0.5);
  fill(0);
  textAlign(LEFT, TOP);
  textSize(20.0);
  text(this.fps.toFixed(1), 10, 10);
}
