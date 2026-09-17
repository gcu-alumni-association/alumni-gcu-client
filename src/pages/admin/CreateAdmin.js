import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { Edit2, Trash2, Shield, UserCheck, Search, Check, X } from "lucide-react";
import "./admin.css";

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [admins, setAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Edit Role Modal/State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [selectedRole, setSelectedRole] = useState("admin");
  const [editLoading, setEditLoading] = useState(false);

  // Delete Modal/State
  const [deletingAdmin, setDeletingAdmin] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch all admins and reviewers
  const fetchAdmins = async (search = "") => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const url = search ? `/admin/get-admins?search=${encodeURIComponent(search)}` : `/admin/get-admins`;
      const response = await api.get(url, { headers });
      setAdmins(response.data);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setError("Unable to fetch admin data.");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatusMessage("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.post("/admin/create-admin", formData, { headers });

      setStatusMessage(response.data.message || "Account created successfully.");
      setFormData({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins(searchTerm);
    } catch (err) {
      console.error("Error creating admin:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdmins(searchTerm);
  };

  const openEditModal = (admin) => {
    setEditingAdmin(admin);
    setSelectedRole(admin.role || "admin");
    setError("");
    setStatusMessage("");
  };

  const closeEditModal = () => {
    setEditingAdmin(null);
  };

  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setEditLoading(true);
    setError("");
    setStatusMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.put(
        `/admin/update-role/${editingAdmin._id}`,
        { role: selectedRole },
        { headers }
      );

      setStatusMessage(response.data.message || "Role updated successfully.");
      closeEditModal();
      fetchAdmins(searchTerm);
    } catch (err) {
      console.error("Error updating role:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to update role.");
    } finally {
      setEditLoading(false);
    }
  };

  const openDeleteModal = (admin) => {
    setDeletingAdmin(admin);
    setError("");
    setStatusMessage("");
  };

  const closeDeleteModal = () => {
    setDeletingAdmin(null);
  };

  const handleDeleteAdmin = async () => {
    if (!deletingAdmin) return;
    setDeleteLoading(true);
    setError("");
    setStatusMessage("");

    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const response = await api.delete(`/admin/delete-admin/${deletingAdmin._id}`, { headers });

      setStatusMessage(response.data.message || "Account deleted successfully.");
      closeDeleteModal();
      fetchAdmins(searchTerm);
    } catch (err) {
      console.error("Error deleting admin:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Failed to delete account.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="admin-form-header">Admin & Reviewer Management</h1>
      </div>

      {statusMessage && (
        <div style={{
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "#d4edda",
          color: "#155724",
          borderRadius: "6px",
          border: "1px solid #c3e6cb",
          fontWeight: "500"
        }}>
          {statusMessage}
        </div>
      )}
      {error && (
        <div style={{
          padding: "12px 16px",
          marginBottom: "16px",
          backgroundColor: "#f8d7da",
          color: "#721c24",
          borderRadius: "6px",
          border: "1px solid #f5c6cb",
          fontWeight: "500"
        }}>
          {error}
        </div>
      )}

      {/* Create Account Form */}
      <div className="admin-form-container" style={{ maxWidth: "700px", margin: "0 auto 30px auto" }}>
        <h2 style={{ fontSize: "1.4rem", marginBottom: "15px", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
          <Shield size={22} color="#007bff" /> Create Admin / Reviewer
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="name" style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Full Name:</label>
            <input
              type="text"
              className="admin-form-input"
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="email" style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Email Address:</label>
            <input
              type="email"
              className="admin-form-input"
              id="email"
              name="email"
              placeholder="e.g. admin@gcu.ac.in"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="password" style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Password:</label>
            <input
              type="password"
              className="admin-form-input"
              id="password"
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
            />
          </div>
          <div className="admin-form-group">
            <label htmlFor="role" style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>Assign Role:</label>
            <select
              className="admin-form-input"
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{ cursor: "pointer" }}
              required
            >
              <option value="admin">Admin (Full administrative access)</option>
              <option value="reviewer">Reviewer (Approvals and reviews access)</option>
            </select>
          </div>
          <button
            type="submit"
            className="admin-form-button"
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>

      {/* Admin and Reviewer List */}
      <div className="admin-list" style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "15px" }}>
          <h2 style={{ fontSize: "1.4rem", color: "#333", margin: 0 }}>Active Admins & Reviewers</h2>
          <form onSubmit={handleSearchSubmit} style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #ced4da",
                borderRadius: "4px",
                fontSize: "14px",
                minWidth: "220px"
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "8px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px"
              }}
            >
              <Search size={16} /> Search
            </button>
          </form>
        </div>

        <table className="admin-dashboard-table" style={{ background: "white", borderRadius: "8px", overflow: "hidden", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
          <thead>
            <tr>
              <th style={{ padding: "14px 16px" }}>Name</th>
              <th style={{ padding: "14px 16px" }}>Email</th>
              <th style={{ padding: "14px 16px" }}>Role</th>
              <th style={{ padding: "14px 16px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length > 0 ? (
              admins.map((admin) => (
                <tr key={admin._id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "14px 16px", fontWeight: "500" }}>{admin.name}</td>
                  <td style={{ padding: "14px 16px", color: "#555" }}>{admin.email}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        borderRadius: "14px",
                        fontSize: "12px",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        backgroundColor: admin.role === "reviewer" ? "#e0f2fe" : "#e0e7ff",
                        color: admin.role === "reviewer" ? "#0369a1" : "#4338ca",
                        border: admin.role === "reviewer" ? "1px solid #bae6fd" : "1px solid #c7d2fe"
                      }}
                    >
                      {admin.role === "reviewer" ? <UserCheck size={14} /> : <Shield size={14} />}
                      {admin.role || "admin"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", gap: "8px" }}>
                      <button
                        onClick={() => openEditModal(admin)}
                        title="Edit Role"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 12px",
                          backgroundColor: "#f0f7ff",
                          color: "#0066ff",
                          border: "1px solid #cce5ff",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "500",
                          transition: "all 0.2s"
                        }}
                      >
                        <Edit2 size={14} /> Edit Role
                      </button>
                      <button
                        onClick={() => openDeleteModal(admin)}
                        title="Delete Admin"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          padding: "6px 12px",
                          backgroundColor: "#fff5f5",
                          color: "#dc3545",
                          border: "1px solid #f5c6cb",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "13px",
                          fontWeight: "500",
                          transition: "all 0.2s"
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#777" }}>
                  No admin or reviewer accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Role Modal */}
      {editingAdmin && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="admin-modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", color: "#333", display: "flex", alignItems: "center", gap: "8px" }}>
              <Edit2 size={20} color="#007bff" /> Edit Role
            </h3>
            <p style={{ color: "#555", fontSize: "14px", marginBottom: "15px" }}>
              Update role for <strong>{editingAdmin.name}</strong> ({editingAdmin.email}):
            </p>
            <form onSubmit={handleUpdateRole}>
              <div className="admin-form-group">
                <label htmlFor="modalRole" style={{ fontWeight: "600", display: "block", marginBottom: "6px" }}>
                  Select Role:
                </label>
                <select
                  id="modalRole"
                  className="admin-form-input"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="admin">Admin</option>
                  <option value="reviewer">Reviewer</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="admin-button cancel"
                  disabled={editLoading}
                >
                  <X size={16} style={{ marginRight: "4px", verticalAlign: "middle" }} /> Cancel
                </button>
                <button
                  type="submit"
                  className="admin-button upload"
                  disabled={editLoading}
                  style={{ backgroundColor: "#007bff" }}
                >
                  <Check size={16} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAdmin && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="admin-modal-content" style={{ maxWidth: "450px" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.3rem", color: "#dc3545", display: "flex", alignItems: "center", gap: "8px" }}>
              <Trash2 size={20} color="#dc3545" /> Confirm Deletion
            </h3>
            <p style={{ color: "#444", fontSize: "14px", lineHeight: "1.5" }}>
              Are you sure you want to delete the account for <strong>{deletingAdmin.name}</strong> ({deletingAdmin.email})?
            </p>
            <p style={{ color: "#777", fontSize: "13px", marginTop: "8px" }}>
              This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "25px" }}>
              <button
                type="button"
                onClick={closeDeleteModal}
                className="admin-button cancel"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAdmin}
                className="admin-button delete"
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAdmin;
