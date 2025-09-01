import React, { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

interface Question {
  _id: string;
  category: Category | string;
  question: string;
  options: string[];
  correctAnswer: number;
}

const emptyQuestion = {
  category: "",
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
};

interface QuestionsTabProps {
  active?: boolean;
}

export default function QuestionsTab({ active }: QuestionsTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyQuestion);
  const [editingId, setEditingId] = useState<string | null>(null);


  // Always reload categories and questions when tab is activated
  useEffect(() => {
    if (active) {
      setLoading(true);
      fetch("/api/categories")
        .then((res) => res.json())
        .then(setCategories);
      fetch("/api/questions")
        .then((res) => res.json())
        .then(setQuestions)
        .finally(() => setLoading(false));
    }
  }, [active]);

  const reload = () => {
    setLoading(true);
    // Reload both categories and questions
    fetch("/api/categories")
      .then((res) => res.json())
      .then(setCategories);
    fetch("/api/questions")
      .then((res) => res.json())
      .then(setQuestions)
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    setForm({ ...emptyQuestion, category: categories[0]?._id || "" });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (q: Question) => {
    setForm({
      category: typeof q.category === "string" ? q.category : q.category._id,
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
    });
    setEditingId(q._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän kysymyksen?")) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    reload();
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    idx?: number
  ) => {
    if (typeof idx === "number") {
      const newOptions = [...form.options];
      newOptions[idx] = e.target.value;
      setForm({ ...form, options: newOptions });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/questions/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    reload();
  };

  if (loading) return <div>Ladataan...</div>;

  // Group questions by category
  const questionsByCategory: { [catId: string]: Question[] } = {};
  questions.forEach((q) => {
    const catId = typeof q.category === "string" ? q.category : q.category._id;
    if (!questionsByCategory[catId]) questionsByCategory[catId] = [];
    questionsByCategory[catId].push(q);
  });

  return (
    <div id="questions" className={"tab-content" + (active ? " active" : "") }>
      <button id="addQuestionBtn" className="btn-primary" onClick={handleAdd}>
        Lisää uusi kysymys
      </button>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingId ? "Muokkaa kysymystä" : "Lisää uusi kysymys"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="category">Kategoria</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  required
                >
                  {categories.map((cat) => (
                    <option value={cat._id} key={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="question">Kysymys</label>
                <input
                  name="question"
                  value={form.question}
                  onChange={handleFormChange}
                  required
                />
              </div>
              {form.options.map((opt: string, i: number) => (
                <div className="form-group" key={i}>
                  <label htmlFor={`option${i}`}>Vaihtoehto {i + 1}</label>
                  <input
                    name={`option${i}`}
                    value={opt}
                    onChange={(e) => handleFormChange(e, i)}
                    required
                  />
                </div>
              ))}
              <div className="form-group">
                <label htmlFor="correctAnswer">Oikea vastaus</label>
                <select
                  name="correctAnswer"
                  value={form.correctAnswer}
                  onChange={handleFormChange}
                  required
                >
                  {form.options.map((_: string, i: number) => (
                    <option value={i} key={i}>
                      Vaihtoehto {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  Tallenna
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Peruuta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="question-list" id="questionList">
        {categories.map((cat) => {
          const isOpen = openCategory === cat._id;
          return (
            <div className="category-section" key={cat._id}>
              <div className="category-header" style={{ cursor: 'pointer' }} onClick={() => setOpenCategory(isOpen ? null : cat._id)}>
                <div className="header-content">
                  <span className="folder-icon">{isOpen ? '📂' : '📁'}</span>
                  <h2>{cat.name}</h2>
                  <span className="question-count">
                    ({(questionsByCategory[cat._id] || []).length} kysymystä)
                  </span>
                </div>
              </div>
              {isOpen && (
                <div className="questions-grid" id={`category-${cat._id}`}>
                  {(questionsByCategory[cat._id] || []).map((q) => (
                    <div className="question-item" key={q._id}>
                      <h3>{q.question}</h3>
                      <div className="options">
                        {q.options.map((option, optIdx) => (
                          <div
                            className={
                              "option" + (optIdx === q.correctAnswer ? " correct" : "")
                            }
                            key={optIdx}
                          >
                            {option}
                          </div>
                        ))}
                      </div>
                      <div className="question-actions">
                        <button className="btn-secondary" onClick={() => handleEdit(q)}>
                          Muokkaa
                        </button>
                        <button
                          className="btn-danger"
                          onClick={() => handleDelete(q._id)}
                        >
                          Poista
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
