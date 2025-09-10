const screens = {
    welcome: document.getElementById('welcome-screen'),
    about: document.getElementById('about-screen'),
    dashboard: document.getElementById('dashboard-screen'),
    quiz: document.getElementById('quiz-screen'),
    score: document.getElementById('score-screen')
};
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const quizSelectionContainer = document.getElementById('quiz-selection-container');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const dashboardBtn = document.getElementById('dashboard-btn');
const homeBtn = document.getElementById('home-btn');
const categoriesBtn = document.getElementById('categories-btn');
const aboutBtn = document.getElementById('about-btn');
const backToWelcomeBtn = document.getElementById('back-to-welcome-btn');
const quitQuizBtn = document.getElementById('quit-quiz-btn');
const logo = document.getElementById('logo');
const startBrowsingBtn = document.getElementById('start-browsing-btn');
const quizTitle = document.getElementById('quiz-title');
const questionCounter = document.getElementById('question-counter');
const timerElement = document.getElementById('timer');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const feedback = document.getElementById('feedback');
const progressBar = document.getElementById('progress-bar');
const finalScore = document.getElementById('final-score');
const scoreSummary = document.getElementById('score-summary');

let currentQuiz = {};
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15;
let lastQuizParams = {};
let categoriesCache = null;

function decodeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// Utility to shuffle array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.add('hidden'));
    if (screens[screenName]) screens[screenName].classList.remove('hidden');
}

function setLoading(isLoading) {
    if (isLoading) {
        loader.classList.remove('hidden');
        errorMessage.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
    }
}

async function fetchCategories() {
    showScreen('dashboard');
    if (categoriesCache) {
        populateDashboard(categoriesCache);
        return;
    }

    setLoading(true);
    quizSelectionContainer.innerHTML = '';
    try {
        const response = await fetch('https://opentdb.com/api_category.php');
        const data = await response.json();
        categoriesCache = data.trivia_categories;
        populateDashboard(categoriesCache);
    } catch (error) {
        errorMessage.classList.remove('hidden');
        console.error("Failed to fetch categories:", error);
    } finally {
        setLoading(false);
    }
}

function populateDashboard(categories) {
    quizSelectionContainer.innerHTML = '';
    categories.forEach(category => {
        const card = document.createElement('div');
        card.className = 'quiz-card bg-neutral-800/80 p-6 rounded-xl border border-neutral-700';
        card.innerHTML = `
            <h3 class="text-xl font-bold text-neutral-200 mb-2">${decodeHtml(category.name)}</h3>
            <div class="flex flex-wrap gap-2 mt-4">
                <button data-difficulty="easy" data-id="${category.id}" class="flex-1 bg-green-900/50 text-green-400 border border-green-700/50 text-sm font-semibold mr-2 px-2.5 py-1.5 rounded hover:bg-green-800/50 transition-colors">Easy</button>
                <button data-difficulty="medium" data-id="${category.id}" class="flex-1 bg-yellow-900/50 text-yellow-400 border border-yellow-700/50 text-sm font-semibold mr-2 px-2.5 py-1.5 rounded hover:bg-yellow-800/50 transition-colors">Medium</button>
                <button data-difficulty="hard" data-id="${category.id}" class="flex-1 bg-red-900/50 text-red-400 border border-red-700/50 text-sm font-semibold mr-2 px-2.5 py-1.5 rounded hover:bg-red-800/50 transition-colors">Hard</button>
            </div>
        `;
        quizSelectionContainer.appendChild(card);
    });
}

quizSelectionContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        const { id, difficulty } = e.target.dataset;
        fetchAndStartQuiz(id, difficulty);
    }
});

async function fetchAndStartQuiz(categoryId, difficulty) {
    setLoading(true);
    showScreen('quiz');
    lastQuizParams = { categoryId, difficulty };

    try {
        const response = await fetch(`https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=multiple`);
        const data = await response.json();

        if (data.response_code !== 0) {
            throw new Error('Could not fetch questions for the selected category/difficulty.');
        }

        const categoryName = categoriesCache.find(c => c.id == categoryId)?.name || 'Quiz';
        currentQuiz.title = decodeHtml(categoryName);
        currentQuiz.questions = data.results.map(q => {
            const options = [...q.incorrect_answers, q.correct_answer];
            shuffleArray(options);
            return {
                question: decodeHtml(q.question),
                options: options.map(opt => decodeHtml(opt)),
                correctAnswer: decodeHtml(q.correct_answer)
            };
        });

        startQuiz();

    } catch (error) {
        alert(error.message + "\nPlease try another category or difficulty.");
        showScreen('dashboard');
    } finally {
        setLoading(false);
    }
}

function startQuiz() {
    score = 0;
    currentQuestionIndex = 0;
    quizTitle.innerText = currentQuiz.title;
    showScreen('quiz');
    showQuestion();
}

function showQuestion() {
    resetState();
    const question = currentQuiz.questions[currentQuestionIndex];
    const totalQuestions = currentQuiz.questions.length;

    questionCounter.innerText = `Question ${currentQuestionIndex + 1}/${totalQuestions}`;
    progressBar.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;
    questionText.innerText = question.question;

    question.options.forEach(option => {
        const button = document.createElement('button');
        button.innerText = option;
        button.className = 'w-full text-left p-4 border-2 border-neutral-700 rounded-lg hover:bg-neutral-700/50 hover:border-red-600 transition-colors duration-200 text-neutral-300';
        button.addEventListener('click', () => selectOption(button, option, question.correctAnswer));
        optionsContainer.appendChild(button);
    });
    startTimer();
}

function startTimer() {
    timeLeft = 15;
    timerElement.innerText = timeLeft;
    timerElement.classList.remove('text-red-500', 'border-red-500');

    timer = setInterval(() => {
        timeLeft--;
        timerElement.innerText = timeLeft;
        if (timeLeft < 10) {
            timerElement.classList.add('text-red-500', 'border-red-500');
        }
        if (timeLeft <= 0) {
            clearInterval(timer);
            showFeedback('Time\'s up!', 'text-red-500');
            disableOptions(currentQuiz.questions[currentQuestionIndex].correctAnswer);
            nextBtn.classList.remove('hidden');
        }
    }, 1000);
}

function resetState() {
    clearInterval(timer);
    optionsContainer.innerHTML = '';
    feedback.innerText = '';
    feedback.className = 'text-center mt-4 font-medium h-6';
    nextBtn.classList.add('hidden');
    timerElement.classList.remove('text-red-500', 'border-red-500');
}

function selectOption(button, selectedOption, correctAnswer) {
    clearInterval(timer);
    disableOptions(correctAnswer);

    if (selectedOption === correctAnswer) {
        score++;
        button.className = 'w-full text-left p-4 border-2 rounded-lg bg-green-500/20 border-green-500 text-green-300';
        showFeedback('Correct!', 'text-green-400');
    } else {
        button.className = 'w-full text-left p-4 border-2 rounded-lg bg-red-500/20 border-red-500 text-red-300';
        showFeedback(`Wrong!`, 'text-red-500');
    }
    nextBtn.classList.remove('hidden');
}

function showFeedback(message, className) {
    feedback.innerText = message;
    feedback.classList.add(className);
}

function disableOptions(correctAnswer) {
    Array.from(optionsContainer.children).forEach(button => {
        button.disabled = true;
        button.classList.add('cursor-not-allowed', 'opacity-60');
        if (button.innerText === correctAnswer) {
            button.className = 'w-full text-left p-4 border-2 rounded-lg bg-green-500/20 border-green-500 text-green-300';
        }
    });
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.questions.length) {
        showQuestion();
    } else {
        showScore();
    }
}

function showScore() {
    showScreen('score');
    const totalQuestions = currentQuiz.questions.length;
    finalScore.innerText = `${score}/${totalQuestions}`;

    const percentage = (score / totalQuestions) * 100;
    let summaryText = `You answered ${score} out of ${totalQuestions} questions correctly.`;
    if (percentage === 100) summaryText += " Perfect score, great job!";
    else if (percentage >= 70) summaryText += " Excellent work!";
    else if (percentage >= 50) summaryText += " Good effort!";
    else summaryText += " Keep practicing!";
    scoreSummary.innerText = summaryText;
}

startBrowsingBtn.addEventListener('click', fetchCategories);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => fetchAndStartQuiz(lastQuizParams.categoryId, lastQuizParams.difficulty));

logo.addEventListener('click', () => showScreen('welcome'));
homeBtn.addEventListener('click', () => showScreen('welcome'));
categoriesBtn.addEventListener('click', fetchCategories);
aboutBtn.addEventListener('click', () => showScreen('about'));
dashboardBtn.addEventListener('click', fetchCategories);
backToWelcomeBtn.addEventListener('click', () => showScreen('welcome'));
quitQuizBtn.addEventListener('click', () => {
    clearInterval(timer);
    fetchCategories();
});

showScreen('welcome');
