import React, { useState } from "react";

interface QuizStartProps {
  onStart: (data: { name: string; category: string; count: number }) => void;
  categories: { _id: string; name: string }[];
}

export default function QuizStart({ onStart, categories }: QuizStartProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0]?._id || "");
  const [count, setCount] = useState(5);

  return (
    <form className="quiz-start-form" onSubmit={e => { e.preventDefault(); onStart({ name, category, count }); }}>
      <h2>Aloita peli</h2>
      <label>
        Nimi:
        <input value={name} onChange={e => setName(e.target.value)} required />
      </label>
      <label>
        Kategoria:
        <select value={category} onChange={e => setCategory(e.target.value)}>
          {categories.map(cat => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </label>
      <label>
        Kysymysten määrä:
        <input type="number" min={1} max={20} value={count} onChange={e => setCount(Number(e.target.value))} required />
      </label>
      <button className="btn-primary" type="submit">Aloita</button>
    </form>
  );
}
