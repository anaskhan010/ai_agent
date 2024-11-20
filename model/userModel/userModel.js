const pool = require("../../config/DBConnection");

// Create a new user
const createUser = async (user) => {
  const sql = `INSERT INTO users (username, email, password_hash, first_name, last_name, phone_number, role_id) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const [result] = await pool.execute(sql, [
    user.username,
    user.email,
    user.password_hash,
    user.first_name,
    user.last_name,
    user.phone_number,
    user.role_id,
  ]);
  return result.insertId;
};

// Find a user by email
const findUserByEmail = async (email) => {
  const sql = `SELECT * FROM users WHERE email = ?`;
  const [rows] = await pool.execute(sql, [email]);
  return rows[0];
};

// Find a user by ID
const findUserById = async (id) => {
  const sql = `SELECT * FROM users WHERE id = ?`;
  const [rows] = await pool.execute(sql, [id]);
  return rows[0];
};

// Update user details
const updateUser = async (id, user) => {
  const sql = `UPDATE users SET username = ?, email = ?, first_name = ?, last_name = ?, phone_number = ?, role_id = ?, is_active = ? 
               WHERE id = ?`;
  const [result] = await pool.execute(sql, [
    user.username,
    user.email,
    user.first_name,
    user.last_name,
    user.phone_number,
    user.role_id,
    user.is_active,
    id,
  ]);
  return result.affectedRows;
};

// Delete a user
const deleteUser = async (id) => {
  const sql = `DELETE FROM users WHERE id = ?`;
  const [result] = await pool.execute(sql, [id]);
  return result.affectedRows;
};

// Get all users
const getAllUsers = async () => {
  const sql = `SELECT * FROM users`;
  const [rows] = await pool.execute(sql);
  return rows;
};

// Update the last login timestamp for a user
const updateLastLogin = async (id) => {
  const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
  await pool.execute(sql, [id]);
};

// Export all functions
module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  deleteUser,
  getAllUsers,
  updateLastLogin,
};
