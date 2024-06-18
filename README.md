# How High?

Interactive art piece that uses computer vision techniques (p5.js, posenet, opencv) to map abstract, alien, and foreign looking objects onto participants’ bodies.

Video: https://youtu.be/4xNEhoRiN5o?si=CNnBCe2iDntovRwe

<img width="1405" alt="Screen Shot 2024-06-18 at 7 34 55 PM" src="https://github.com/NimunB/How-High/assets/32827637/ea7c1cef-9ea1-432d-8828-25d8ba4c4d74">
<img width="1310" alt="Screen Shot 2024-06-18 at 7 30 33 PM" src="https://github.com/NimunB/How-High/assets/32827637/cda86214-3ee5-4e56-8442-ffb776806b9a">
<img width="1440" alt="Screen Shot 2024-06-18 at 7 32 53 PM" src="https://github.com/NimunB/How-High/assets/32827637/3ae5c238-01ee-4956-9379-3b45fa40672c">



## Technical Description
I used p5.js and ml5.js for my project. Specifically, I used the PoseNet machine learning model in order to detect the location of the participants’ body parts. In order to understand and set up the PoseNet process, I used the official ml5.js PoseNet documentation, Daniel Shiffman’s video on Pose Estimation with PoseNet, and the Body Tracking demo from our class’s Computer Vision workshop (Workshop 3). 

## Artist Statement
This is an interactive piece that uses computer vision techniques to map abstract, alien, and foreign looking objects onto participants’ bodies. It then encourages them to jump, with a visible number placed on their chest area. On jumping, the participant’s jump counter updates, and the opacity of the foreign body parts decreases, while we see the image of a generic man begin to appear. The concept behind the artwork relates to the idea of “the other” and how members of marginalized communities are often not seen as human, and are told to “jump” through hoops and follow certain rules in order to be accepted. In this process however, it’s easy to lose yourself and what makes you unique. 

<img width="425" alt="Screen Shot 2024-06-18 at 7 25 10 PM" src="https://github.com/NimunB/How-High/assets/32827637/968c5f16-9f69-4776-b00b-ecda1a3618e2">
<img width="461" alt="Screen Shot 2024-06-18 at 7 25 15 PM" src="https://github.com/NimunB/How-High/assets/32827637/4bd21800-387a-4924-9770-e679a6b59bc8">
<img width="742" alt="Screen Shot 2024-06-18 at 7 16 43 PM" src="https://github.com/NimunB/How-High/assets/32827637/70e26f12-3a1d-4315-a66e-f7d38e278ef1">

_Showing mapped body parts_

<img width="428" alt="Screen Shot 2024-06-18 at 7 24 26 PM" src="https://github.com/NimunB/How-High/assets/32827637/4a5893df-666e-4a59-964f-f5140311b93c">
<img width="435" alt="Screen Shot 2024-06-18 at 7 23 36 PM" src="https://github.com/NimunB/How-High/assets/32827637/ac439247-da46-4cd6-b816-5794d15a92c5">

_Showing opacity changes and generic man showing as jump count increases_

## Code Structure and Flow
First, the preload function loads all the necessary images that will be placed onto participants’ body parts. The setup function initializes the poseNet model, sets the maximum pose detections to 6, and filters out poses with a confidence level below 0.27. When new poses are detected, the updatePeopleData() method is called, which goes through each pose/person and either initalizes or updates that person’s data in the peopleData array. It uses the pose ID to identify the person in the peopleData array. If the array does not contain the given pose ID, then a new person’s information is added - including the randomized image stickers to be placed on their body parts, their jump counter, their performance adherence level. If the person already exists in the array, their jumps are detected using the y-values of their hip locations and their jump counters and performance values are updated. 

In the draw method, we draw all the body stickers for the various body parts by calling their respective methods (e.g. drawEars). These helper methods use the poseNet predictions to draw the appropriate image sticker at the right spot. 

## Key Aspect
One key aspect of my project is jump detection. It was something I was apprehensive about, and I thought I would need to train a separate ml5.js classification model in order to detect jumps. However, one neat way I found which worked decently well was to use the average  y-values of the hips, and see how much they increased in vertical height, relative to the height of the person’s torso. 

If (the vertical difference of the hips) / (torso height) was greater than a certain threshold (which I set to 0.17 after testing a bit), then that would be classified as a jump and that person’s jump counter would be increased. This solution was interesting to me because it is a simpler approach that still employs the person’s individual features (i.e. torso length) in order to tailor the jump detection algorithm to each person, despite not using machine learning. I chose to measure torso height instead of overall height because it is possible for the person’s feet to not always be in frame, and using torso height was a quick way to ensure my detection algorithm was consistent.


## Formal Qualities
In the beginning of the experience of this piece, participants see an entirely black screen over which randomized abstract and foreign looking objects have been superimposed on key locations of their body: eyes, ears, head, nose, shoulders, elbows, wrists, hips, knees, and ankles. They do not see their body itself, but instead see weird images that put together resemble the figure of a body and follow their movements. 

The first 23 seconds are reserved just for exploration, so that participants can get used to the body mappings and can appreciate how interesting and bizarre the composition is. After 23 seconds, the word “Jump” fades in at the top middle area of the screen, as well as a number placed on where each participants’ chest area would be. I leave it to the viewer to make the connection between the instruction and the number. They will find that as they jump, the number on their chest increases. 

After trying to increase their jump counter and potentially competing a little with other participants, viewers will begin to notice that as they jump, the opacity of the abstract body parts decreases and they begin to fade out. In parallel, they see the figure of this generic yellow-ish man appearing and gaining opacity. 

The jump instruction never goes away. As they continuously jump and see their interesting body parts fade out in favor of a generic boring figure, the intention is that participants question whether it is worth it to keep going, and question the anti-climactic reward for following the instructions. Once a person’s jump counter reaches 25, they see their abstract body parts appear again and the jump counter resets to 0, starting the cycle again. 

## Context
This artwork is about one’s individuality, the human desire to follow instructions, and the expectations of reward one has if they’ve “done everything right.” Marginalized communities have been othered in many different ways throughout history - and one of the most insidious is through the process of dehumanization. 

I wanted to capture this process in my artwork. When participants see themselves represented  with nothing but these foreign images, it’s an interesting experience due to how abstract it is. After letting them play around with their bodies for the first 23 seconds, I introduce the instruction to jump and the jump counter on their chests. As they jump, they lose the weird abstract parts of themselves in favor of something very generic and boring. 

This process encourages participants to follow instructions and perform, but the reward is really not as interesting as what they started out with. This anticlimactic experience and the continuous jumping is aimed at making people question whether it is worth it to follow these instructions and jump, when it was more fun to see the weird versions of themselves. Is being accepted as human really worth it, when you lose so much? 

One inspiration for this work was Facework by KyleMcDonald, where users are given instructions to follow, but then realize there is greater value in disobeying them. Another inspiration for the look of the piece is Francesca Brierley’s project called you Home now, where I really liked the disconnected cut-out look of her alien and used it to inspire how I placed body parts upon a Black screen. 
