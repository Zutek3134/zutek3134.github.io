// Initialize variables
let score = 0;
let percentage = 0;
let countdown = 40;
let gameActive = true; // Flag to track game status
let currentCorrectAnswer = null; // Global variable to store the correct answer
let isNeg = 1;
let totalQs = 0;
let timerID = null;

// Array of questions and their corresponding correct answers
const keys = ["一", "二", "三", "四", "ㄅ", "ㄆ", "ㄇ", "ㄈ", "甲", "乙", "丙", "丁", "首", "頷", "頸", "尾", "鼠", "牛", "虎", "兔", "紅", "橙", "黃", "綠", "青", "紅", "皂", "白", "東", "南", "西", "北", "春", "夏", "秋", "冬"];
const keyCategories = 9;

// Function to generate a random question

function generateRandomQuestion() {
    const type = Math.floor(Math.random() * keyCategories);
    const answer = Math.floor(Math.random() * 4);
    const questions = [{ question: keys[type * 4 + answer], correctAnswer: answer }];

    const buttonElements = document.getElementsByClassName("button");
    for (let i = 0; i < buttonElements.length; i++) {
        const buttonElement = buttonElements[i];
        buttonElement.innerText = keys[type * 4 + i];
    }

    currentCorrectAnswer = answer; // Store the correct answer

    return questions[0];
}

// Function to update the prompt with a random question
function updatePrompt() {
    totalQs++;
    const promptElement = document.getElementById("prompt");
    var randomQuestion = generateRandomQuestion();
    var negative = 0;

    if (score > 10) negative = Math.floor(Math.random() * 4);
    else if (score > 3) negative = Math.floor(Math.random() * 2);

    isNeg = 1;

    if (negative == 1 || negative == 3) {
        isNeg *= -1;
        randomQuestion.question = "非" + randomQuestion.question;
    }

    if (negative > 1) {
        isNeg *= -1;
        randomQuestion.question += "才怪";
    }

    promptElement.innerText = promptElement.innerText = randomQuestion.question;

    return randomQuestion.correctAnswer;
}

// Function to update the score
function updateScore() {
    const scoreElement = document.getElementById("score");

    scoreElement.innerText = score + " (" + percentage + "%)";
}

// Function to handle button clicks
function handleClick(answer) {
    if (!gameActive) {
        return; // Ignore button clicks when the game is over
    }

    // Get the button elements
    const buttonElements = document.getElementsByClassName("button");

    // Check if the answer is correct
    if ((answer === currentCorrectAnswer && isNeg > 0) || (answer != currentCorrectAnswer && isNeg < 1)) {
        score++;
        buttonElements[answer].classList.add("correct-answer"); // Add the "correct-answer" class to the button
    } else {
        buttonElements[answer].classList.add("wrong-answer"); // Add the "wrong-answer" class to the button
    }

    // Disable all buttons to prevent further clicks
    for (let i = 0; i < buttonElements.length; i++) {
        buttonElements[i].disabled = true;
    }

    // Set a delay to remove the highlighting and update the prompt
    setTimeout(function () {
        // Remove the highlighting classes
        buttonElements[answer].classList.remove("correct-answer", "wrong-answer");

        // Enable all buttons
        for (let i = 0; i < buttonElements.length; i++) {
            buttonElements[i].disabled = false;
        }

        const correctAnswer = updatePrompt();
        percentage = ((score / (totalQs - 1)) * 100).toFixed(2);
        updateScore();
    }, 500);
}

// Function to update the countdown timer
function updateTimer() {
    if (!gameActive) {
        return; // Stop the timer when the game is over
    }

    const timerElement = document.getElementById("timer");
    timerElement.innerText = countdown + " 秒";

    if (countdown > 0) {
        countdown--;
        timerID = setTimeout(updateTimer, 1000); // Call the function again after 1 second
    } else {
        // Game over logic
        gameActive = false; // Set game status to false

        // Display game statistics
        const gameOverScreen = document.getElementById("game-over-screen");
        document.getElementById('game-over-screen').style.display = 'flex';
        const statsElement = document.getElementById("stats");
        statsElement.innerText = "成績：" + (score * percentage / 100).toFixed(0);

        // Reset the game or perform any other actions
    }
}

// Initialize the game
const correctAnswer = updatePrompt();
updateScore();
updateTimer(); // Start the countdown timer

// Function to reset the game
function resetGame() {
    score = 0;
    countdown = 40;
    gameActive = true; // Flag to track game status
    currentCorrectAnswer = null; // Global variable to store the correct answer
    isNeg = 1;
    totalQs = 0;

    clearTimeout(timerID);
    updateScore();
    updatePrompt();
    updateTimer();

    const gameOverScreen = document.getElementById("game-over-screen");
    gameOverScreen.style.display = "none";

    const restartButton = document.getElementById("restart-button");
    const buttonElements = document.getElementsByClassName("button");
    for (let i = 0; i < buttonElements.length; i++) {
        buttonElements[i].disabled = false;
    }
}

// Attach event listener to the restart button
document.getElementById("restart-button").addEventListener("click", resetGame);

// Attach event listeners to the buttons
document.getElementById("button1").addEventListener("click", function () {
    handleClick(0);
});
document.getElementById("button2").addEventListener("click", function () {
    handleClick(1);
});
document.getElementById("button3").addEventListener("click", function () {
    handleClick(2);
});
document.getElementById("button4").addEventListener("click", function () {
    handleClick(3);
});
