import Fighter from "./fighter.js";


const FIGHTERS_JSON_FILENAME = "fighters.json";
const REVEAL_TIMEOUT_MS = 800;
const WHITE_SCREEN_FADE_MS = 400;
const SHAKE_MS = 1000;

let randomBtn = document.querySelector("#randomBtn");
let resetBtn = document.querySelector("#resetBtn");
let canvas = document.querySelector("#cvs");
let ctx = canvas.getContext("2d");

let fighters = [];
let imageRenderSize = 0;

let fightersLeft = [];

let fighter = null;

let fighterImage = null;
let readyToDrawFighter = false;

let announcerVoice = null;
let readyToAnnounceFighter = false;

let fighterIsReady = false;

let matchupSound = new Audio();
matchupSound.src = "sounds/se_matchup_spritsboad.wav";
matchupSound.volume = 0.5;

let dateReady = null;
let dateRevealed = null;

let revealedFighter = false;
let showWhiteScreen = false;
let whiteScreenOpacity = 0;


function resizeCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    imageRenderSize = Math.floor((innerWidth < innerHeight ? innerWidth : innerHeight) / 1.5);
}

function getRandomNumberBetween(a, b) {
    return a + Math.floor(Math.random() * (b - a + 1));
}

function fillPoolOfFighters() {
    for (let i = 0; i < fighters.length; i++) {
        fightersLeft.push(i);
    }
}

function getRandomFighter() {
    if (fightersLeft.length === 0) {
        fillPoolOfFighters();
    }

    let randomIndex = Math.floor(Math.random() * fightersLeft.length);
    let randomFighterIndex = fightersLeft[randomIndex];
    fightersLeft.splice(randomIndex, 1);

    return fighters[randomFighterIndex];
}

function randomizeFighter() {
    fighter = getRandomFighter();

    if (announcerVoice !== null) {
        announcerVoice.pause();
    }

    fighterImage = new Image();
    fighterImage.src = fighter.imgSrc;
    fighterImage.onload = () => {
        readyToDrawFighter = true;
    };

    announcerVoice = new Audio();
    announcerVoice.src = fighter.audSrc;
    announcerVoice.oncanplay = () => {
        readyToAnnounceFighter = true;
    };

    fighterIsReady = false;
    readyToDrawFighter = false;
    readyToAnnounceFighter = false;

    revealedFighter = false;
    showWhiteScreen = false;
    matchupSound.pause();
    matchupSound.currentTime = 0;
}

function draw() {
    let currentDate = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!fighterIsReady && readyToDrawFighter && readyToAnnounceFighter) {
        fighterIsReady = true;
        dateReady = Date.now();
        matchupSound.play();
    }

    if (fighterIsReady) {
        if (!revealedFighter && currentDate >= dateReady + REVEAL_TIMEOUT_MS) {
            dateRevealed = Date.now();
            revealedFighter = true;
            showWhiteScreen = true;
            whiteScreenOpacity = 1;
            announcerVoice.play();
        }

        let width = null;
        let height = null;

        if (fighterImage.width > fighterImage.height) {
            width = imageRenderSize;
            height = imageRenderSize / fighterImage.width * fighterImage.height;
        }
        else {
            height = imageRenderSize;
            width = imageRenderSize / fighterImage.height * fighterImage.width;
        }

        let x = (innerWidth / 2) - (width / 2);
        let y = (innerHeight / 2) - (height / 2);

        if (currentDate < dateReady + SHAKE_MS) {
            x += getRandomNumberBetween(-50, 50);
            y += getRandomNumberBetween(-50, 50);
        }

        ctx.filter = revealedFighter ? "none" : `contrast(0%) brightness(0%) blur(${(1 - ((currentDate - dateReady) / REVEAL_TIMEOUT_MS)) * 50}px)`;
        ctx.drawImage(fighterImage, x, y, width, height);


        if (showWhiteScreen) {
            ctx.fillStyle = `rgba(255, 255, 255, ${whiteScreenOpacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (whiteScreenOpacity <= 0) {
                showWhiteScreen = false;
                whiteScreenOpacity = 0;
            }
            else {
                whiteScreenOpacity = 1 - ((currentDate - dateRevealed) / WHITE_SCREEN_FADE_MS);
            }
        }
    }

    requestAnimationFrame(draw);
}


if ('serviceWorker' in navigator) {
    navigator.serviceWorker
            .register("worker.js")
            .then(() => console.log("Service Worker Registered"));
}

fetch(FIGHTERS_JSON_FILENAME)
.then(response => response.json())
.then(fightersData => {
    fightersData.forEach((fighterdata, index) => {
        fighters.push(new Fighter(fighterdata));
    });

    window.onclick = () => {
        randomizeFighter();
    };
    resetBtn.onclick = () => {
        fightersLeft = [];
        fillPoolOfFighters();
    };
});


window.onresize = resizeCanvas;
resizeCanvas();

draw();
