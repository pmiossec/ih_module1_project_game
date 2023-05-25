console.log("hurry!")

const cells = [...document.getElementsByClassName("direction")];
const walls = [...document.getElementsByClassName("wall")];
const playerSize = 51;
const playerCenterSize = Math.floor(playerSize / 2) + 1;

const directions = ["left", "up", "right", "down"];
const position = {x: 1, y: 1};
const offset = Math.floor((51 - playerSize)/2);

cells.forEach(c => {
    c.addEventListener('click', () => {
        const currentValue = c.classList[2];
        const newValue = directions[(directions.indexOf(currentValue) + 1) % 4];
        c.classList.replace(currentValue, newValue);
    })
});

function shuffleBoard() {
    cells.forEach(c => {
        const direction = directions[Math.floor(Math.random() * 4)];
        if(c.classList.length === 3) {
            c.classList.replace(c.classList[2], direction);
        } else {
            c.classList.add(direction);
        }
    });
}

shuffleBoard();

const startCell = document.getElementById("start");
startCell.classList.replace("start", "right");

const endCell = document.getElementById("end");

const player = document.getElementById("player");
player.addEventListener('click', startMouse);
let playerDirection = "right";
const playerImg = document.getElementById("player-img");

let countDown = null;
let intervalStart = null;
const difficultyElement = document.getElementById("difficulty");
difficultyElement.addEventListener('change', () => {
    if (intervalStart !== null) {
        clearInterval(intervalStart);
    }

    startCountDown();
})

function startCountDown() {
    if(difficultyElement.value) {
        shuffleBoard();
        countDown = +difficultyElement.value;
        displayTime();
        intervalStart = setInterval(start, 1_000);
    }
}

startCountDown();

function displayTime() {
    document.getElementById("time").innerText = 
    countDown ? `${countDown} s remaining!` : `Please choose a difficulty...`;
}

displayTime();
let moveInterval = null;
function start(){
    countDown--;
    displayTime();
    if (countDown === 0) {
        console.log("will start to move the player");
        startMouse();
    }
}

function startMouse() {
    moveInterval = setInterval(movePlayer, 10);
    clearInterval(intervalStart);
}

function movePlayer() {
    // console.log("moving the player");
    switch(playerDirection) {
        case "right":
            position.x++;
            break;
        case "left":
            position.x--;
            break;
        case "up":
            position.y--;
            break;
        case "down":
            position.y++;
            break;
    }

    player.style.left = `${position.x + offset + 1}px`;
    player.style.top = `${position.y + offset + 1}px`;

    const playerCenter = getCenter(player);
    console.log("playerCenter", playerCenter);
    checkGameWon(playerCenter);
    checkPlayerShouldChangeDirection(playerCenter);
    checkGameLost(playerCenter);
}

function getCenter(domElement) {
    const rect = domElement.getBoundingClientRect();
    const centerX = rect.x +  Math.floor(rect.width / 2) + 1;
    const centerY = rect.y +  Math.floor(rect.height / 2) + 1;
    return { x: centerX, y: centerY };
}

function checkPlayerShouldChangeDirection(playerCenter) {
    cells.forEach(c => {
        const cellCenter = getCenter(c);
        // console.log("cellCenter", cellCenter);
        if (cellCenter.x === playerCenter.x && cellCenter.y === playerCenter.y ) {
            console.log("Change direction", "old:", playerDirection, "new:", c.classList[2]);
            playerDirection = c.classList[2];
            playerImg.src = `./images/mouse_${playerDirection}.png`
        }
    });
}

function checkGameLost(playerCenter) {
    walls.forEach(c => {
        const wallCenter = getCenter(c);
        console.log("wallCenter", wallCenter);
        if (wallCenter.x === playerCenter.x && wallCenter.y === playerCenter.y ) {
            document.getElementById("cheese-img").src = "./images/cheese_moldy.png";
            clearInterval(moveInterval);
            document.getElementById("time").innerText = "😐Game lost!😐";
            setTimeout(()=> {
                document.location.reload();
            }, 3_000);
        }
    });
}

function checkGameWon(playerCenter) {
    const endCenter = getCenter(endCell);
    // console.log("endCenter", endCenter);
    if (endCenter.x === playerCenter.x && endCenter.y === playerCenter.y ) {
        clearInterval(moveInterval);
        document.getElementById("time").innerText = "🎉🎉Game won!🎉🎉";
        setTimeout(()=> {
            document.location.reload();
        }, 3_000);
    }
}