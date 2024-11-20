const pool = require("../../config/DBConnection");

// Create a new role
const createRole = async (role) => {
  const sql = `INSERT INTO roles (name, description) VALUES (?, ?)`;
  const [result] = await pool.execute(sql, [role.name, role.description]);
  return result.insertId;
};

// Find a role by ID
const findRoleById = async (id) => {
  const sql = `SELECT * FROM roles WHERE id = ?`;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
};

// Find a role by name
const findRoleByName = async (name) => {
  const sql = `SELECT * FROM roles WHERE name = ?`;
  const [rows] = await pool.execute(sql, [name]);
  return rows[0];
};

// Get all roles
const getAllRoles = async () => {
  const sql = `SELECT * FROM roles`;
  const [rows] = await pool.execute(sql);
  return rows;
};

// Update a role
const updateRole = async (id, role) => {
  const sql = `UPDATE roles SET name = ?, description = ? WHERE id = ?`;
  const [result] = await pool.execute(sql, [role.name, role.description, id]);
  return result.affectedRows;
};

// Delete a role
const deleteRole = async (id) => {
  const sql = `DELETE FROM roles WHERE id = ?`;
  const [result] = await pool.execute(sql, [id]);
  return result.affectedRows;
};

// Export all functions
module.exports = {
  createRole,
  findRoleById,
  findRoleByName,
  getAllRoles,
  updateRole,
  deleteRole,
};
