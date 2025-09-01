import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

interface Question {
  _id: string;
  text?: string;        // Some endpoints may use 'text'
  question?: string;    // Backend currently uses 'question'
  options: string[];
  correctAnswer: number;
  category: string;
}

interface Category {
  _id: string;
  name: string;
}

interface QuizFlowProps {
  questions: Question[];
  category: Category;
  onFinish: (score: number, answers: number[]) => void;
  user: any;
}

const QuizFlow: React.FC<QuizFlowProps> = ({ questions, category, onFinish, user }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [resultPosted, setResultPosted] = useState(false);
  const isPosting = useRef(false);

  useEffect(() => {
    setCurrent(0);
    setAnswers([]);
    setPendingAnswer(null);
    setFinished(false);
    setScore(0);
    setResultPosted(false);
    isPosting.current = false;
  }, [questions, category]);

  const handleAnswer = (answerIdx: number) => {
    if (finished || pendingAnswer !== null) return;
    setPendingAnswer(answerIdx);
    setTimeout(() => {
      setAnswers((prev) => [...prev, answerIdx]);
      setPendingAnswer(null);
      if (current < questions.length - 1) {
        setCurrent((prev) => prev + 1);
      } else {
        setFinished(true);
      }
    }, 300);
  };

  useEffect(() => {
    if (finished && !resultPosted && !isPosting.current) {
      isPosting.current = true;
      const correct = questions.reduce(
        (acc, q, idx) => acc + (answers[idx] === q.correctAnswer ? 1 : 0),
        0
      );
      setScore(correct);
      const resultPayload = {
        name: user?.name || user?.username || "Anonymous",
        category: category._id,
        score: `${correct} / ${questions.length}`,
        scoreValue: correct,
        total: questions.length,
        date: new Date().toISOString(),
      };
      console.log("Posting result payload:", resultPayload);
      axios
        .post("/api/results", resultPayload)
        .then(() => {
          setResultPosted(true);
          onFinish(correct, answers);
        })
        .catch(() => {
          setResultPosted(true);
          onFinish(correct, answers);
        });
    }
    // eslint-disable-next-line
  }, [finished, resultPosted, answers, questions, category, user, onFinish]);

  if (!questions || questions.length === 0) {
    return <div>No questions available for this category.</div>;
  }

  if (finished) {
    return (
      <div className="quiz-finished">
        <h2>Quiz Finished!</h2>
        <p>
          Your score: {score} / {questions.length}
        </p>
      </div>
    );
  }

  const q = questions[current];
  const questionText = q?.text || q?.question || '';

  return (
    <div className="quiz-flow">
      <h2>
        Question {current + 1} / {questions.length}
      </h2>
  <div className="question-text">{questionText}</div>
      <div className="options">
        {q.options.map((opt, idx) => (
          <button
            key={idx}
            className={
              "option-btn" +
              (pendingAnswer === idx ? " pending" : "") +
              (answers[current] === idx ? " selected" : "")
            }
            onClick={() => handleAnswer(idx)}
            disabled={pendingAnswer !== null || finished}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuizFlow;
