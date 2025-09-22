# Interactive Quiz App

A lightweight and interactive quiz web application that allows users to practice quizzes, view their scores, and track their quiz history.

## Features

- Fetches quiz categories and questions dynamically from [Open Trivia Database](https://opentdb.com/).
- Multiple-choice quizzes with 3 difficulty levels: Easy, Medium, Hard.
- Timer for each question (15 seconds).
- Instant feedback: shows if the answer is correct or wrong, along with the correct answer.
- Score summary at the end of the quiz.
- Stores quiz history in `localStorage` to review past results.
- Responsive and interactive UI.

## Screens

- **Welcome Screen** – Introduction and start browsing quizzes.
- **Dashboard** – Select category and difficulty.
- **Quiz Screen** – Answer questions with a timer.
- **Score Screen** – Shows final score and performance summary.
- **History Screen** – View past quiz attempts and clear history.

## How to Use

1. Open `index.html` in a web browser.
2. Click **Start Browsing** to load quiz categories.
3. Select a category and difficulty to start the quiz.
4. Answer the questions before the timer runs out.
5. Review your score and quiz history.

## Technologies Used

- HTML
- CSS (TailwindCSS optional for styling)
- JavaScript (Vanilla JS)
- Open Trivia Database API

## Local Storage

- Quiz history is saved in the browser's local storage.
- Users can clear history using the **Clear History** button.
