// UsersTab component for managing users in the admin panel
// Handles CRUD operations for users and displays them in a list

import React, { useEffect, useState } from "react";

interface User {
  _id: string;
  username: string;
  role: string;
}

const emptyUser = { username: "", password: "", role: "teacher" };

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyUser);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    reload();
  }, []);

  const reload = () => {
    setLoading(true);
    fetch("/api/users", { credentials: "include" })
      .then((res) => res.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  const handleAdd = () => {
    setForm(emptyUser);
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setForm({ username: user.username, password: "", role: user.role });
    setEditingId(user._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Haluatko varmasti poistaa tämän käyttäjän?")) return;
    await fetch(`/api/users/${id}`, { method: "DELETE", credentials: "include" });
    reload();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/users/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    reload();
  };

  if (loading) return <div>Ladataan...</div>;

  return (
    <div id="users" className="tab-content">
      <button id="addUserBtn" className="btn-primary" onClick={handleAdd}>Lisää uusi käyttäjä</button>
      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingId ? "Muokkaa käyttäjää" : "Lisää uusi käyttäjä"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Käyttäjätunnus</label>
                <input name="username" value={form.username} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Salasana {editingId && <span style={{ color: '#888', fontSize: '0.9em' }}>(jätä tyhjäksi jos et vaihda)</span>}</label>
                <input name="password" type="password" value={form.password} onChange={handleFormChange} autoComplete="new-password" />
              </div>
              <div className="form-group">
                <label htmlFor="role">Rooli</label>
                <select name="role" value={form.role} onChange={handleFormChange} required>
                  <option value="admin">Admin</option>
                  <option value="teacher">Opettaja</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-primary">Tallenna</button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Peruuta</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div id="userList">
        {users.map((user) => (
          <div className="user-item" key={user._id}>
            <h3>{user.username} <span style={{ color: '#888', fontSize: '0.9em' }}>({user.role})</span></h3>
            <div className="user-actions">
              <button className="btn-secondary" onClick={() => handleEdit(user)}>Muokkaa</button>
              <button className="btn-danger" onClick={() => handleDelete(user._id)}>Poista</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
