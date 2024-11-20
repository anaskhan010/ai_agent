// model.js

const pool = require("../../config/DBConnection"); // Adjust the path to your pool.js file

const getAllContacts = async () => {
  const [rows] = await pool.query("SELECT * FROM contacts");
  return rows;
};

const getContactById = async (contact_id) => {
  const [rows] = await pool.query(
    "SELECT * FROM contacts WHERE contact_id = ?",
    [contact_id]
  );
  return rows[0];
};

const createContacts = async (
  user_id,
  list_name,
  list_description,
  contacts
) => {
  const sql = `
    INSERT INTO contacts (user_id, email, contact_number, list_name, list_description)
    VALUES ?
  `;

  // Build the values array
  const values = contacts.map((contact) => [
    user_id,
    contact.email,
    contact.contact_number,
    list_name,
    list_description,
  ]);

  const [result] = await pool.query(sql, [values]);
  return result;
};

const updateContact = async (contact_id, contactData) => {
  const [result] = await pool.query(
    "UPDATE contacts SET ? WHERE contact_id = ?",
    [contactData, contact_id]
  );
  return result;
};

const deleteContact = async (contact_id) => {
  const [result] = await pool.query(
    "DELETE FROM contacts WHERE contact_id = ?",
    [contact_id]
  );
  return result;
};

module.exports = {
  getAllContacts,
  getContactById,
  createContacts,
  updateContact,
  deleteContact,
};
