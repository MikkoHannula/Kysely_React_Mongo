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

type SortType = "score" | "date";

interface ResultsTabProps {
  active?: boolean;
}

export default function ResultsTab({ active }: ResultsTabProps) {
  const [results, setResults] = useState<Result[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortType, setSortType] = useState<SortType>("date");
  const [expanded, setExpanded] = useState<{ [catId: string]: boolean }>({
    all: true,
  });

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

  const sortResults = (arr: Result[]) => {
    if (sortType === "score") {
      return [...arr].sort((a, b) => b.scoreValue - a.scoreValue);
    } else {
      return [...arr].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    }
  };

  const handleSort = (type: SortType) => setSortType(type);
  const toggleAccordion = (catId: string) =>
    setExpanded((e) => ({ ...e, [catId]: !e[catId] }));

  const getCategoryName = (catId: string | undefined | null) => {
    if (!catId) return "-";
    const cat = categories.find((c) => c && c._id === catId);
    return cat ? cat.name : "-";
  };

  if (loading) return <div>Ladataan...</div>;

  // Group results by category
  const resultsByCategory: { [catId: string]: Result[] } = {};
  results.forEach((r) => {
    if (!r || !r.category) return;
    const catId = typeof r.category === "string" ? r.category : (r.category && r.category._id);
    if (!catId) return;
    if (!resultsByCategory[catId]) resultsByCategory[catId] = [];
    resultsByCategory[catId].push(r);
  });

  // Show all results as a ranking table
  return (
    <div id="results" className={"tab-content" + (active ? " active" : "") }>
      <div className="results-tab">
      <h2>Tulokset / Ranking</h2>
      <div style={{ marginBottom: 16 }}>
        <button
          className={
            sortType === "score" ? "btn-primary" : "btn-secondary"
          }
          onClick={() => handleSort("score")}
        >
          Järjestä pisteiden mukaan
        </button>
        <button
          className={sortType === "date" ? "btn-primary" : "btn-secondary"}
          onClick={() => handleSort("date")}
        >
          Järjestä ajan mukaan
        </button>
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
              <td>
                {typeof r.category === "string"
                  ? getCategoryName(r.category)
                  : (r.category && (r.category as Category).name) || "-"}
              </td>
              <td>{r.score}</td>
              <td>{new Date(r.date).toLocaleString("fi-FI")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
