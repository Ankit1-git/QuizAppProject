import React, { useState, useEffect } from "react";
import QuizResult from "./QuizResult";
import { quizData } from "../Data/QuizData";

function Quiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [clickedOption, setClickedOption] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("quizState");
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      setCurrentQuestion(parsedState.currentQuestion);
      setScore(parsedState.score);
      setClickedOption(parsedState.clickedOption);
      setTimeLeft(parsedState.timeLeft);
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setShowResult(true);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    requestFullScreen();

    document.addEventListener("fullscreenchange", handleFullScreenChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  
  useEffect(() => {
    // Save state to localStorage
    const quizState = {
      currentQuestion,
      score,
      clickedOption,
      timeLeft,
    };
    localStorage.setItem("quizState", JSON.stringify(quizState));
  }, [currentQuestion, score, clickedOption, timeLeft]);

  const requestFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.log("Open in fullscreen");
      });
    }
  };

  const handleFullScreenChange = () => {
    setIsFullScreen(!!document.fullscreenElement);
  };

  const changeQuestion = () => {
    updateScore();
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setClickedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const updateScore = () => {
    if (clickedOption === quizData[currentQuestion].answer) {
      setScore(score + 1);
    }
  };

  const resetAll = () => {
    setShowResult(false);
    setCurrentQuestion(0);
    setClickedOption(null);
    setScore(0);
    setTimeLeft(600);
    localStorage.removeItem("quizState");
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div>
      <p className="heading-txt">Quiz APP</p>
      <div className="container">
        {isFullScreen ? (
          showResult ? (
            <QuizResult
              score={score}
              totalScore={quizData.length}
              tryAgain={resetAll}
            />
          ) : (
            <>
              <div className="question">
                <span id="question-number">{currentQuestion + 1}. </span>
                <span id="question-txt">
                  {quizData[currentQuestion].question}
                </span>
              </div>
              <div className="option-container">
                {quizData[currentQuestion].options.map((option, i) => (
                  <button
                    className={`option-btn ${
                      clickedOption === i + 1 ? "checked" : ""
                    }`}
                    key={i}
                    onClick={() => setClickedOption(i + 1)}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <input
                type="button"
                value="Next"
                id="next-button"
                onClick={changeQuestion}
              />
              <div className="timer">Time Left: {formatTime(timeLeft)}</div>
            </>
          )
        ) : (
          <div className="fullscreen-message">
            <p>Please enable full-screen mode to take the quiz.</p>
            <button onClick={requestFullScreen}>Enable Full-Screen</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Quiz;
