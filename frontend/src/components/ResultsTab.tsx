import React, { useEffect, useState } from "react";

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

export default function ResultsTab() {
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

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c._id === catId);
    return cat ? cat.name : "-";
  };

  if (loading) return <div>Ladataan...</div>;

  // Group results by category
  const resultsByCategory: { [catId: string]: Result[] } = {};
  results.forEach((r) => {
    const catId = typeof r.category === "string" ? r.category : r.category._id;
    if (!resultsByCategory[catId]) resultsByCategory[catId] = [];
    resultsByCategory[catId].push(r);
  });

  return (
    <div id="results" className="tab-content">
      <div className="results-filters">
        <button
          className={
            "btn-secondary" + (sortType === "score" ? " active" : "")
          }
          onClick={() => handleSort("score")}
        >
          Järjestä pisteiden mukaan
        </button>
        <button
          className={
            "btn-secondary" + (sortType === "date" ? " active" : "")
          }
          onClick={() => handleSort("date")}
        >
          Järjestä päivämäärän mukaan
        </button>
      </div>
      <section>
        <button
          className="accordion-btn"
          type="button"
          onClick={() => toggleAccordion("all")}
        >
          Kaikki kategoriat
        </button>
        {expanded["all"] && (
          <div className="accordion-content" style={{ display: "block" }}>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Käyttäjä</th>
                  <th>Kategoria</th>
                  <th>Pisteet</th>
                  <th>Päivämäärä</th>
                </tr>
              </thead>
              <tbody>
                {sortResults(results).map((r) => (
                  <tr key={r._id}>
                    <td>{r.name}</td>
                    <td>
                      {getCategoryName(
                        typeof r.category === "string"
                          ? r.category
                          : r.category._id
                      )}
                    </td>
                    <td>{r.score}</td>
                    <td>{new Date(r.date).toLocaleString("fi-FI")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {categories.map((cat) => (
        <section key={cat._id}>
          <button
            className="accordion-btn"
            type="button"
            onClick={() => toggleAccordion(cat._id)}
          >
            {cat.name}
          </button>
          {expanded[cat._id] && (
            <div className="accordion-content" style={{ display: "block" }}>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Käyttäjä</th>
                    <th>Pisteet</th>
                    <th>Päivämäärä</th>
                  </tr>
                </thead>
                <tbody>
                  {sortResults(resultsByCategory[cat._id] || []).map((r) => (
                    <tr key={r._id}>
                      <td>{r.name}</td>
                      <td>{r.score}</td>
                      <td>{new Date(r.date).toLocaleString("fi-FI")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
