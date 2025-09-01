import React, { useEffect, useState } from "react";

interface Category {
  _id: string;
  name: string;
}

const emptyCategory = { name: "" };

interface CategoriesTabProps {
  active?: boolean;
}

export default function CategoriesTab({ active }: CategoriesTabProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<any>(emptyCategory);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, []);

  const reload = () => {
    setLoading(true);
    fetch("/api/categories", { credentials: "include" })
      .then((res) => res.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    setForm(emptyCategory);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name });
    setEditingId(cat._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Haluatko varmasti poistaa tämän kategorian? Kaikki kategorian kysymykset poistetaan myös."
      )
    )
      return;
  await fetch(`/api/categories/${id}`, { method: "DELETE", credentials: "include" });
    reload();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include"
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include"
      });
    }
    setShowForm(false);
    reload();
  };

  if (loading) return <div>Ladataan...</div>;

  return (
    <div id="categories" className={"tab-content" + (active ? " active" : "") }>
      <button id="addCategoryBtn" className="btn-primary" onClick={handleAdd}>
        Lisää uusi kategoria
      </button>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>
              {editingId
                ? "Muokkaa kategoriaa"
                : "Lisää uusi kategoria"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="categoryName">Kategorian nimi</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  required
                />
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
      <div id="categoryList">
        {categories.map((cat) => (
          <div className="category-item" key={cat._id}>
            <h3>{cat.name}</h3>
            <div className="category-actions">
              <button
                className="btn-secondary"
                onClick={() => handleEdit(cat)}
              >
                Muokkaa
              </button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(cat._id)}
              >
                Poista
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
