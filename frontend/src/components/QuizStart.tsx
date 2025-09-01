import { useState, useEffect } from "react";

interface QuizStartProps {
  onStart: (data: { name: string; category: string; count: number }) => void;
  categories: { _id: string; name: string }[];
}

export default function QuizStart({ onStart, categories }: QuizStartProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [count, setCount] = useState(5);

  // Ensure category is set when categories are loaded or change
  useEffect(() => {
    if (categories.length > 0 && !category) {
      setCategory(categories[0]._id);
    }
  }, [categories, category]);

  return (
    <form className="quiz-start-form" onSubmit={e => { e.preventDefault(); onStart({ name, category, count }); }}>
      <h2>Aloita peli</h2>
      <div style={{ marginBottom: '1.2rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontWeight: 500 }}>
          Nimi:
          <input value={name} onChange={e => setName(e.target.value)} required style={{ marginTop: 4, padding: '0.4rem 1rem', fontSize: '1.1rem', width: '100%' }} />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontWeight: 500 }}>
          Kategoria:
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginTop: 4, padding: '0.4rem 1rem', fontSize: '1.1rem', width: '100%' }}>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', fontWeight: 500 }}>
          Kysymysten määrä:
          <select value={count} onChange={e => setCount(Number(e.target.value))} style={{ marginTop: 4, padding: '0.4rem 1rem', fontSize: '1.1rem', width: '100%' }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={15}>15</option>
          </select>
        </label>
      </div>
      <button className="btn-primary" type="submit">Aloita</button>
    </form>
  );
}
