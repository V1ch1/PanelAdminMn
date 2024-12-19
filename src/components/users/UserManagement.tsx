import React, { useState } from "react";

type UserRole = "Admin" | "Editor";

type User = {
  id: number;
  username: string;
  email: string;
  role: UserRole;
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, username: "admin", email: "admin@example.com", role: "Admin" },
    { id: 2, username: "editor", email: "editor@example.com", role: "Editor" },
  ]);

  const [currentTab, setCurrentTab] = useState<"list" | "create">("list");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");
  const [newUserPassword, setNewUserPassword] = useState<string>("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("Editor");

  // Funciones
  const handleCreateUser = () => {
    if (!newUsername || !newUserEmail || (!editingUser && !newUserPassword))
      return;

    const newUser: User = editingUser
      ? {
          ...editingUser,
          username: newUsername,
          email: newUserEmail,
          role: newUserRole,
        }
      : {
          id: users.length + 1,
          username: newUsername,
          email: newUserEmail,
          role: newUserRole,
        };

    setUsers((prev) =>
      editingUser
        ? prev.map((user) => (user.id === editingUser.id ? newUser : user))
        : [...prev, newUser]
    );

    resetForm();
    setCurrentTab("list");
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewUsername(user.username);
    setNewUserEmail(user.email);
    setNewUserRole(user.role);
    setCurrentTab("create");
  };

  const handleDeleteUser = (id: number) => {
    setUsers((prev) => prev.filter((user) => user.id !== id));
  };

  const resetForm = () => {
    setEditingUser(null);
    setNewUsername("");
    setNewUserEmail("");
    setNewUserPassword("");
    setNewUserRole("Editor");
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

      {/* Pestañas */}
      <div className="flex border-b mb-4">
        <button
          onClick={() => {
            setCurrentTab("list");
            resetForm();
          }}
          className={`px-4 py-2 font-semibold ${
            currentTab === "list"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          Listar Usuarios
        </button>
        <button
          onClick={() => setCurrentTab("create")}
          className={`px-4 py-2 font-semibold ${
            currentTab === "create"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
        >
          {editingUser ? "Editar Usuario" : "Crear Usuario"}
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {currentTab === "list" && (
        <div>
          {/* Tabla de usuarios */}
          <table className="table-auto w-full bg-white rounded shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center">Nombre de Usuario</th>
                <th className="px-4 py-2 text-center">Correo Electrónico</th>
                <th className="px-4 py-2 text-center">Rol</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2 text-center align-middle">
                    {user.username}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    {user.role}
                  </td>
                  <td className="px-4 py-2 text-center align-middle space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {currentTab === "create" && (
        <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4">
            {editingUser ? "Editar Usuario" : "Crear Usuario"}
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Nombre de Usuario"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="border rounded p-2"
              autoComplete="off"
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="border rounded p-2"
              autoComplete="off"
            />
            {!editingUser && (
              <input
                type="password"
                placeholder="Contraseña"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                className="border rounded p-2"
                autoComplete="new-password"
              />
            )}
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value as UserRole)}
              className="border rounded p-2"
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
            </select>
            <button
              onClick={handleCreateUser}
              className={`${
                editingUser
                  ? "bg-yellow-500 hover:bg-yellow-600"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white px-4 py-2 rounded`}
            >
              {editingUser ? "Actualizar Usuario" : "Crear Usuario"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setCurrentTab("list");
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
