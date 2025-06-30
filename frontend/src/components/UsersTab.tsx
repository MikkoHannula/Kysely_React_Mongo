import React from "react";

export default function UsersTab() {
  return (
    <div id="users" className="tab-content">
      <button id="addUserBtn" className="btn-primary">Lisää uusi käyttäjä</button>
      <div id="userList"></div>
    </div>
  );
}
