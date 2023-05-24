console.log("hurry!")

const cells = document.getElementsByClassName("direction");

const directions = ["left", "up", "right", "down"];
const position = {x: 1, y: 1};
const offset = (51 - 33)/2;
[...cells].forEach(c => {
    c.classList.add(directions[Math.floor(Math.random() * 4)]);
    c.addEventListener('click', () => {
        const currentValue = c.classList[2];
        console.log("currentValue", currentValue);
        const newValue = directions[(directions.indexOf(currentValue) + 1) % 4];
        c.classList.replace(currentValue, newValue);
    })
});

const startCell = document.getElementById("start");
startCell.classList.replace("start", "right");

const player = document.getElementById("player");
let playerDirection = "right";

setTimeout(start, 10_000);

function start(){
    console.log("will start to move the player");
    setInterval(movePlayer, 10);
}

function movePlayer() {
    console.log("moving the player");
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

    player.style.left = `${position.x + offset}px`;
    player.style.top = `${position.y + offset}px`;
}

