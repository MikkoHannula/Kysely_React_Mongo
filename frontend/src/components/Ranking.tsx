import { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface Result {
  _id: string;
  name: string;
  category: Category | string;
  score: string;
  scoreValue: number;
  total: number;
  date: string;
}

interface RankingProps {
  onBack: () => void;
}

export default function Ranking({ onBack }: RankingProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<'score' | 'date'>('score');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/results").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([results, categories]) => {
        setResults(results);
        setCategories(categories);
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c._id === catId);
    return cat ? cat.name : "-";
  };

  const sortResults = (arr: Result[]) => {
    if (sortType === "score") {
      return [...arr].sort((a, b) => b.scoreValue - a.scoreValue);
    } else {
      return [...arr].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  };

  if (loading) return <div>Ladataan tuloksia...</div>;

  return (
    <div className="ranking-view">
      <h2>Ranking / Tulokset</h2>
      <div style={{ marginBottom: 16 }}>
        <button className={sortType === "score" ? "btn-primary" : "btn-secondary"} onClick={() => setSortType("score")}>Järjestä pisteiden mukaan</button>
        <button className={sortType === "date" ? "btn-primary" : "btn-secondary"} onClick={() => setSortType("date")}>Järjestä ajan mukaan</button>
        <button className="btn-secondary" style={{ float: 'right' }} onClick={onBack}>Takaisin</button>
      </div>
      <table className="results-table">
        <thead>
          <tr>
            <th>Nimi</th>
            <th>Kategoria</th>
            <th>Pisteet</th>
            <th>Pvm</th>
          </tr>
        </thead>
        <tbody>
          {sortResults(results).map((r) => (
            <tr key={r._id}>
              <td>{r.name}</td>
              <td>{typeof r.category === "string" ? getCategoryName(r.category) : (r.category as Category).name}</td>
              <td>{r.score}</td>
              <td>{new Date(r.date).toLocaleString("fi-FI")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
