let startTime; 
let player;
let playerBumpInto;
let backgroundX = 0;
let playerAnimation;
let heart;
let lives = 5; 

let sounds = {}
let angelsound = {}
let demonHurtSound = {}
let puaHurtSound = {}

let angel, demon;
let PUA1, PUA2, NOT_PUA1;

let angelEffectStartTime = null; 
let angelEffectDuration = 7000;

const yOptions = [252, 383, 514]; // 三個跑道的Y座標
let puaImages = []; // 存放所有 PUA 圖片
let notPuaImages = []; // 存放所有 NOT_PUA 圖片
let deadplayerImages = []; // 存放所有死亡玩家圖片

// 全域速度因子，初始為1，每輪shuffleQ增加
let speedFactor = 1;

function preload() {
  backgroundImg = loadImage("assets/track.png");
  player1Img = loadImage("assets/player1.png");
  player2Img = loadImage("assets/player2.png");
  playerBumpInto1 = loadImage("assets/player3.png");
  playerBumpInto2 = loadImage("assets/player4.png");
  playerBumpIntoAngel1 = loadImage("assets/player5.png");
  playerBumpIntoAngel2 = loadImage("assets/player6.png");
  heart = loadImage("assets/heart.png");
  lostheart = loadImage("assets/lostheart.png");

  sounds.chrono= createAudio("music/background.mp3");
  angelsound.chrono= createAudio("music/angel.mp3");
  demonHurtSound.chrono= createAudio("music/demonHurt.mp3");
  puaHurtSound.chrono= createAudio("music/puaHurt.mp3");

  for (let i = 1; i <= 5; i++) {
    let img1 = loadImage(`assets/deadplayer${i}.png`);
    let img2 = loadImage(`assets/deadplayer${i}_1.png`);
    deadplayerImages.push([img1, img2]);
  }

  angelImg = loadImage("assets/angel.png");
  demonImg = loadImage("assets/demon.png");

  for (let i = 1; i <= 60; i++) {
    puaImages.push(loadImage(`assets/pua_images/PUA_${i}.png`));
  }

  for (let i = 1; i <= 30; i++) {
    notPuaImages.push(loadImage(`assets/not_pua_images/NOT_PUA_${i}.png`));
  }
}

function setup() {
  createCanvas(1300, 580);
  startTime = millis();
  noLoop();// 先暫停遊戲更新
  
  

  player1Img.resize(150, 230);
  player2Img.resize(150, 230);
  playerBumpInto1.resize(150, 230);
  playerBumpInto2.resize(150, 230);
  playerBumpIntoAngel1.resize(150, 230);
  playerBumpIntoAngel2.resize(150, 230);
  heart.resize(40, 40);
  lostheart.resize(40, 40);
  player = createSprite(300, yOptions[1]-100, 150, 230);
  player.addAnimation('normal', player1Img, player2Img);
  player.addAnimation('angel', playerBumpIntoAngel1, playerBumpIntoAngel2);
  player.addAnimation('deadplayer1', deadplayerImages[0][0], deadplayerImages[0][1]);
  player.addAnimation('deadplayer2', deadplayerImages[1][0], deadplayerImages[1][1]);
  player.addAnimation('deadplayer3', deadplayerImages[2][0], deadplayerImages[2][1]);
  player.addAnimation('deadplayer4', deadplayerImages[3][0], deadplayerImages[3][1]);
  player.addAnimation('deadplayer5', deadplayerImages[4][0], deadplayerImages[4][1]);

  PUA1 = createSprite(width, random(yOptions));
  PUA2 = createSprite(width, random(yOptions));
  NOT_PUA1 = createSprite(width, random(yOptions));

  angel = createSprite(width + 100, random(yOptions));
  demon = createSprite(width + 200, random(yOptions));
  angel.addImage("angel", angelImg);
  demon.addImage("demon", demonImg);
  angel.scale = 0.3;
  demon.scale = 0.3;

  player.depth = 10;
  PUA1.depth = 5;
  PUA2.depth = 5;
  NOT_PUA1.depth = 5;
  angel.depth = 5;
  demon.depth = 5;

  PUA1.setCollider("rectangle", -PUA1.width / 2, -PUA1.height / 2, PUA1.width, PUA1.height);
  PUA2.setCollider("rectangle", -PUA2.width / 2, -PUA2.height / 2, PUA2.width, PUA2.height);
  NOT_PUA1.setCollider("rectangle", -NOT_PUA1.width / 2, -NOT_PUA1.height / 2, NOT_PUA1.width, NOT_PUA1.height);
  shuffleQ(); 
}

window.startGame = function () {
  loop(); // 當按下 Start 時，開始遊戲
  sounds.chrono.play();
  sounds.chrono.volume(0.4);
}

function draw() {
  if (lives <= 0) {
    // 半透明背景
    background(0, 0, 0, 100);

    // GAME OVER 標題
    fill(255, 100, 100); // 設置文字顏色
    textSize(60);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text("GAME OVER", width / 2, height / 2 - 150);

    // 顯示存活時間
    let elapsedTime = millis() - startTime;
    let totalSeconds = Math.floor(elapsedTime / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    text(`你在PUA環境中存活了: ${minutes}分${formattedSeconds}秒`, width / 2, height / 2 - 40);

    // 根據時間顯示訊息
    let message = "";
    if (totalSeconds < 30) {
        message = "你很容易被PUA喔，建議你去看『虧我把你當朋友』";
    } else if (totalSeconds >= 30 && totalSeconds < 60) {
        message = "感覺還可以再加油喔！";
    } else if (totalSeconds >= 60 && totalSeconds < 90) {
        message = "你已經很棒了！";
    } else if (totalSeconds >= 90) {
        message = "你是反PUA大師！";
    }

    // 顯示訊息
    fill(255); // 設置文字顏色
    textSize(24);
    textStyle(BOLD);
    textAlign(CENTER, CENTER);
    text(message, width / 2, height / 2 + 60);

    noLoop(); 
    if (sounds.chrono) {
      sounds.chrono.pause(); 
    }
    // 在遊戲結束後顯示restart按鈕
    showRestartButton();
    return; 
  }

  background("lightyellow");
  drawBackground();
  displayGameTime();
  makeSentence();

  angelOut();
  demonOut();
  
  drawSprites();
  checkCollisions();

  for (let i = 0; i < lives; i++) {
    image(heart, width - 8 - 50 * (i + 1), 40);
  }

  if (angelEffectStartTime !== null) {
    let remainingTime = Math.ceil((angelEffectDuration - (millis() - angelEffectStartTime)) / 1000);
    if (remainingTime > 0) {
      fill(29, 86, 152); 
      textSize(18);
      textStyle(BOLD);
      textAlign(CENTER, BOTTOM); 
      text(`Angel: ${remainingTime}s`, player.position.x, player.position.y - 120);
    }
  }
}

//背景滾動
function drawBackground() {
  image(backgroundImg, backgroundX, 0, width, height);
  image(backgroundImg, backgroundX + width, 0, width, height);

  backgroundX -= 2 * speedFactor; // 利用 speedFactor 加速背景
  if (backgroundX <= -width) {
    backgroundX = 0;
  }
}

function displayGameTime() {
  let elapsedTime = millis() - startTime;
  let totalSeconds = Math.floor(elapsedTime / 1000);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  let formattedSeconds = seconds < 10 ? "0" + seconds : seconds;

  fill(29, 86, 152); 
  textSize(24);
  textStyle(BOLD);
  textAlign(CENTER, CENTER); 
  text(`Time: ${minutes}:${formattedSeconds}`, width / 2, 40);
}

function makeSentence() {
  // 使用 speedFactor 加速
  PUA1.position.x -= 2.5 * speedFactor;
  PUA2.position.x -= 2.5 * speedFactor;
  NOT_PUA1.position.x -= 2.5 * speedFactor;

  if (
    PUA1.position.x <= -(PUA1.width * PUA1.scale) ||
    PUA2.position.x <= -(PUA2.width * PUA2.scale) ||
    NOT_PUA1.position.x <= -(NOT_PUA1.width * NOT_PUA1.scale)
  ) {
    shuffleQ(); 
  }
}

function getRandomAndRemove(array) {
  const index = Math.floor(Math.random() * array.length);
  const value = array[index];
  array.splice(index, 1);
  return value;
}

function shuffleQ() {
  const randomNumber1 = Math.floor(Math.random() * 60);
  let randomNumber2;
  do {
    randomNumber2 = Math.floor(Math.random() * 60);
  } while (randomNumber2 === randomNumber1);
  const randomNumber3 = Math.floor(Math.random() * 30);

  PUA1.addImage("PUA1", puaImages[randomNumber1]);
  PUA2.addImage("PUA2", puaImages[randomNumber2]);
  NOT_PUA1.addImage("NOT_PUA1", notPuaImages[randomNumber3]);

  PUA1.scale = 0.54;
  PUA2.scale = 0.54;
  NOT_PUA1.scale = 0.54;

  let availableY = [...yOptions];
  PUA1.position.y = getRandomAndRemove(availableY);
  PUA2.position.y = getRandomAndRemove(availableY);
  NOT_PUA1.position.y = getRandomAndRemove(availableY);

  PUA1.position.x = width + (PUA1.width * PUA1.scale) / 2;
  PUA2.position.x = width + (PUA2.width * PUA2.scale) / 2;
  NOT_PUA1.position.x = width + (NOT_PUA1.width * NOT_PUA1.scale) / 2;

  // 每次 shuffleQ 呼叫時加快整體速度
  speedFactor += 0.1;
}

function angelOut() {
  angel.position.x -= 3 * speedFactor; 
  if (angel.position.x <= -angel.width) {
    angel.position.x = width * 5.1;
    angel.position.y = random(yOptions);
  }
  while (angel.position.y === demon.position.y) {
    angel.position.y = random(yOptions);
  }
}

function demonOut() {
  demon.position.x -= 5 * speedFactor;
  if (demon.position.x <= -demon.width) {
    demon.position.x = width * 2.5;
    demon.position.y = random(yOptions);
  }
  while (demon.position.y === angel.position.y) {
    demon.position.y = random(yOptions);
  }
}

function keyPressed() {
  const currentIndex = yOptions.indexOf(player.position.y + 100); 
  if (keyCode === UP_ARROW && currentIndex > 0) {
    player.position.y = yOptions[currentIndex - 1] - 100;
  } else if (keyCode === DOWN_ARROW && currentIndex < yOptions.length - 1) {
    player.position.y = yOptions[currentIndex + 1] - 100;
  }
}

let demonCollisionHandled = false;
let angelCollisionHandled = false;
let puaCollisionHandled = false;

function checkCollisions() {
  if ((player.overlap(PUA1) && player.position.y == PUA1.position.y -100 && !puaCollisionHandled && player.getAnimationLabel() != 'angel')||
     (player.overlap(PUA2) && player.position.y == PUA2.position.y -100 && !puaCollisionHandled && player.getAnimationLabel() != 'angel')) {
    puaHurtSound.chrono.play();
    puaCollisionHandled = true;
    lives-=1;
  } else if (!player.overlap(PUA1) && !player.overlap(PUA2)) {
    puaCollisionHandled = false;
  }

  if (player.overlap(demon) && player.position.y == demon.position.y - 100 && !demonCollisionHandled) {
    
    demonCollisionHandled = true; 
    if (player.getAnimationLabel() == 'normal') {
      demonHurtSound.chrono.play();
      player.changeAnimation('deadplayer1');
      lives-=1;
    } else if (player.getAnimationLabel() == 'deadplayer1') {
      demonHurtSound.chrono.play();
      player.changeAnimation('deadplayer2');
      lives-=1;
    } else if (player.getAnimationLabel() == 'deadplayer2') {
      demonHurtSound.chrono.play();
      player.changeAnimation('deadplayer3');
      lives-=1;
    } else if (player.getAnimationLabel() == 'deadplayer3') {
      demonHurtSound.chrono.play();
      player.changeAnimation('deadplayer4');
      lives-=1;
    } else if (player.getAnimationLabel() == 'deadplayer4') {
      demonHurtSound.chrono.play();
      player.changeAnimation('deadplayer5');
      lives-=1;
    }
  } else if (!player.overlap(demon)) {
    demonCollisionHandled = false;
  }

  let status;
  status = player.getAnimationLabel();

  if (player.overlap(angel) && player.position.y == angel.position.y - 100 && !angelCollisionHandled) {
    angelCollisionHandled = true; 
    player.changeAnimation('angel');
    angelsound.chrono.play();
    angelEffectStartTime = millis(); 
    setTimeout(() => {
        player.changeAnimation(status);
        angelCollisionHandled = false; 
        angelEffectStartTime = null; 
    }, angelEffectDuration); 
  } 
}

// 顯示 restart 按鈕
function showRestartButton() {
  // 建立 overlay
  let overlay = document.createElement('div');
  overlay.id = 'restartOverlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
  overlay.style.display = 'flex';
  overlay.style.justifyContent = 'center';
  overlay.style.alignItems = 'center';
  overlay.style.zIndex = '9999';

  let btn = document.createElement('button');
  btn.innerText = 'Restart';
  btn.style.display = 'inline-block';
  btn.style.padding = '15px 40px';
  btn.style.fontSize = '24px';
  btn.style.fontWeight = 'bold';
  btn.style.textTransform = 'uppercase';
  btn.style.color = '#000';
  btn.style.background = '#f8c44c';
  btn.style.border = 'none';
  btn.style.borderRadius = '50px';
  btn.style.boxShadow = '0px 5px 0px #dba435';
  btn.style.cursor = 'pointer';
  btn.style.transition = 'transform 0.1s ease-in-out, box-shadow 0.1s ease-in-out';
  
    // 往下移動一點
    btn.style.marginTop = '330px'; // 調整此數值即可

  btn.onmousedown = () => {
    btn.style.transform = 'scale(0.95)';
    btn.style.boxShadow = '0px 3px 0px #dba435';
  }
  btn.onmouseup = () => {
    btn.style.transform = 'scale(1)';
    btn.style.boxShadow = '0px 5px 0px #dba435';
  }

  btn.addEventListener('click', () => {
    document.body.removeChild(overlay);
    restartGame();
  });

  overlay.appendChild(btn);
  document.body.appendChild(overlay);
}

function restartGame() {
  // 重置遊戲狀態
  lives = 5;
  speedFactor = 1;
  backgroundX = 0;
  angelEffectStartTime = null;

  player.position.x = 300;
  player.position.y = yOptions[1]-100;
  player.changeAnimation('normal');

  // 重置 PUA、NOT_PUA、angel、demon
  shuffleQ();
  angel.position.x = width + 100;
  angel.position.y = random(yOptions);
  demon.position.x = width + 200;
  demon.position.y = random(yOptions);

  startTime = millis();

  if (sounds.chrono) {
    sounds.chrono.currentTime = 0;
    sounds.chrono.play();
    sounds.chrono.volume(0.4);
  }

  loop();
}