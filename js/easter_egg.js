console.log("hurry!")

const cells = document.getElementsByClassName("direction");

const directions = ["left", "up", "right", "bottom"];

[...cells].forEach(c => {
    c.classList.add(directions[Math.floor(Math.random() * 4)]);
    c.addEventListener('click', () => {
        const currentValue = c.classList[2];
        console.log("currentValue", currentValue);
        const newValue = directions[(directions.indexOf(currentValue) + 1) % 4];
        c.classList.replace(currentValue, newValue);
    })
});