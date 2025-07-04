import { useEffect, useState } from "react";

interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  category: string;
}

interface QuizFlowProps {
  name: string;
  category: string;
  count: number;
  onFinish: (result: { score: number; total: number; answers: string[]; questions: QuizQuestion[] }) => void;
}

export default function QuizFlow({ name, category, count, onFinish }: QuizFlowProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, count })
    })
      .then(res => res.ok ? res.json() : Promise.reject("Kysymyksiä ei löytynyt"))
      .then(setQuestions)
      .catch(() => setError("Kysymyksiä ei löytynyt"))
      .finally(() => setLoading(false));
  }, [category, count]);

  if (loading) return <div>Ladataan kysymyksiä...</div>;
  if (error) return <div>{error}</div>;
  if (!questions.length) return <div>Ei kysymyksiä.</div>;

  const q = questions[current];

  const handleAnswer = (answer: string) => {
    setAnswers(a => {
      const newAnswers = [...a, answer];
      if (current + 1 < questions.length) {
        setCurrent(c => c + 1);
      } else {
        // Calculate score
        let score = 0;
        for (let i = 0; i < questions.length; i++) {
          const correctIdx = (questions[i] as any).correctAnswer;
          if (questions[i].options[correctIdx] === newAnswers[i]) score++;
        }
        onFinish({ score, total: questions.length, answers: newAnswers, questions });
      }
      return newAnswers;
    });
  };

  return (
    <div className="quiz-flow">
      <h2>Kysymys {current + 1} / {questions.length}</h2>
      <div className="quiz-question">{q.question}</div>
      <div className="quiz-options">
        {q.options.map(opt => (
          <button key={opt} className="btn-option" onClick={() => handleAnswer(opt)}>{opt}</button>
        ))}
      </div>
    </div>
  );
}
