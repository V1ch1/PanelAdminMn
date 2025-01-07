import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axios"; // Tu instancia de axios

type UserRole = 1 | 2; // 1: ADMIN, 2: Editor

type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]); // Lista de usuarios
  const [currentTab, setCurrentTab] = useState<"list" | "create">("list");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newName, setNewName] = useState<string>(""); // Nombre del usuario
  const [newEmail, setNewEmail] = useState<string>(""); // Email del usuario
  const [newPassword, setNewPassword] = useState<string>(""); // Contraseña
  const [newRole, setNewRole] = useState<UserRole>(2); // Rol (por defecto: Editor)

  // Obtener la lista de usuarios desde la API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get("/user");
        setUsers(response.data);
      } catch (error) {
        console.error("Error al obtener usuarios:", error);
      }
    };

    fetchUsers();
  }, []);

  // Crear o actualizar usuario
  const handleCreateOrUpdateUser = async () => {
    if (!newName || !newEmail || (!editingUser && !newPassword)) return;

    const userData = {
      name: newName,
      email: newEmail.toLowerCase(), // Convertir el correo electrónico a minúsculas
      role: newRole,
      ...(editingUser ? {} : { password: newPassword }),
    };

    try {
      if (editingUser) {
        // Actualizar usuario
        await axiosInstance.put(`/user/${editingUser.id}`, userData);
      } else {
        // Crear nuevo usuario
        await axiosInstance.post("/user/create", userData);
      }

      // Recargar lista de usuarios
      const response = await axiosInstance.get("/user");
      setUsers(response.data);
    } catch (error) {
      console.error("Error al crear/actualizar usuario:", error);
    }

    resetForm();
    setCurrentTab("list");
  };

  // Manejar edición de usuario
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setCurrentTab("create");
  };

  // Eliminar usuario
  const handleDeleteUser = async (id: number) => {
    try {
      await axiosInstance.delete(`/user/${id}`);
      const response = await axiosInstance.get("/user");
      setUsers(response.data);
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setEditingUser(null);
    setNewName("");
    setNewEmail("");
    setNewPassword("");
    setNewRole(2);
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
                <th className="px-4 py-2 text-center">Nombre</th>
                <th className="px-4 py-2 text-center">Correo Electrónico</th>
                <th className="px-4 py-2 text-center">Rol</th>
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2 text-center align-middle">
                    {user.name}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    {user.email}
                  </td>
                  <td className="px-4 py-2 text-center align-middle">
                    {user.role === 1 ? "Admin" : "Editor"}
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
              placeholder="Nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border rounded p-2"
            />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="border rounded p-2"
            />
            {!editingUser && (
              <input
                type="password"
                placeholder="Contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border rounded p-2"
              />
            )}
            <select
              value={newRole}
              onChange={(e) => setNewRole(parseInt(e.target.value) as UserRole)}
              className="border rounded p-2"
            >
              <option value={1}>Admin</option>
              <option value={2}>Editor</option>
            </select>
            <button
              onClick={handleCreateOrUpdateUser}
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
