const API_URL = "https://opentdb.com/api.php?amount=5&type=multiple";

let questions = [];
let currentQuestion = 0;
let score = 0;
let timerInterval;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next");
const resultEl = document.getElementById("result");
const restartBtn = document.getElementById("restart");
const progressBar = document.getElementById("progress-bar");
const timerEl = document.getElementById("timer");

// Fixed blue gradient background (animation included in CSS)
const blueGradient = "linear-gradient(135deg, #6a11cb, #2575fc)";

async function fetchQuestions() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();

    questions = data.results.map((q) => ({
      question: decodeHtml(q.question),
      answers: [...q.incorrect_answers.map(decodeHtml), decodeHtml(q.correct_answer)].sort(() => Math.random() - 0.5),
      correct: decodeHtml(q.correct_answer),
    }));

    showQuestion();
  } catch (error) {
    console.error("Error fetching questions:", error);
    alert("Failed to fetch questions. Please try again later.");
  }
}

function decodeHtml(html) {
  const textArea = document.createElement("textarea");
  textArea.innerHTML = html;
  return textArea.value;
}

function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.innerHTML = q.question;

  // Reset options
  optionsEl.innerHTML = q.answers
    .map((answer) => `<button class="option" onclick="selectAnswer(this, '${answer}')">${answer}</button>`)
    .join("");

  // Set the fixed blue gradient background
  document.body.style.background = blueGradient;

  // Reset styles and timer
  nextBtn.style.display = "none"; // Hide Next button initially
  clearInterval(timerInterval);
  startTimer(15); // Set timer for 15 seconds
  updateProgress();
}

function selectAnswer(optionEl, selectedAnswer) {
  document.querySelectorAll(".option").forEach((btn) => btn.classList.remove("selected"));
  optionEl.classList.add("selected");

  if (selectedAnswer === questions[currentQuestion].correct) {
    score++;
  }

  nextBtn.style.display = "block"; // Show Next button once an answer is selected
}

function startTimer(seconds) {
  let timeLeft = seconds;
  timerEl.textContent = `Time left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    timeLeft--;
    timerEl.textContent = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      autoMoveToNext();
    }
  }, 1000);
}

function autoMoveToNext() {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

nextBtn.addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener("click", restartQuiz);

function showResult() {
  // Hide all elements except result and restart button
  questionEl.style.display = "none"; // Hide the question
  optionsEl.style.display = "none"; // Hide the options
  timerEl.style.display = "none"; // Hide the timer
  nextBtn.style.display = "none"; // Hide the Next button

  // Display the result and restart button
  resultEl.style.display = "block";
  resultEl.textContent = `You scored ${score} out of ${questions.length}!`;
  restartBtn.style.display = "block";
  progressBar.innerHTML = ""; // Clear progress bar
  clearInterval(timerInterval);
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;

  // Show all necessary elements and reset styles
  questionEl.style.display = "block";
  optionsEl.style.display = "block";
  timerEl.style.display = "block";
  resultEl.style.display = "none";
  restartBtn.style.display = "none";
  nextBtn.style.display = "block";

  // Fetch new questions and restart quiz
  fetchQuestions();
}

function updateProgress() {
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  progressBar.innerHTML = `<div style="width: ${progress}%"></div>`;
}

// Initialize the quiz
fetchQuestions();
