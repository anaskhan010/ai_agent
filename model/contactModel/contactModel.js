const pool = require("../../config/DBConnection"); // Adjust the path to your pool.js file

const getAllContacts = async (page, limit) => {
  const offset = (page - 1) * limit;

  const [totalRows] = await pool.query(
    "SELECT COUNT(*) as total FROM contacts"
  );
  const totalContacts = totalRows[0]?.total || 0;

  const sql = "SELECT * FROM contacts LIMIT ? OFFSET ?";
  const [rows] = await pool.query(sql, [parseInt(limit), parseInt(offset)]);

  return { contacts: rows, totalContacts };
};

const getListNamesWithContactCount = async () => {
  const sql = `
    SELECT list_name, list_description,created_at, COUNT(*) AS contact_count
    FROM contacts
    GROUP BY list_name, list_description,created_at;
  `;

  const [rows] = await pool.query(sql);
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

const updateContact = async (
  user_id,
  list_name,
  list_description,
  contacts
) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const contact of contacts) {
      await connection.query(
        "UPDATE contacts SET email = ?, contact_number = ?, list_name = ?, list_description = ? WHERE contact_id = ? AND user_id = ?",
        [
          contact.email,
          contact.contact_number,
          list_name,
          list_description,
          contact.contact_id,
          user_id,
        ]
      );
    }

    await connection.commit();
    return { message: "Contacts updated successfully" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const deleteContact = async (contact_id) => {
  const [result] = await pool.query(
    "DELETE FROM contacts WHERE contact_id = ?",
    [contact_id]
  );
  return result;
};

const getContactsByList = async (list_name, page, limit) => {
  const offset = (page - 1) * limit;

  // Query to get total number of contacts for the given list_name
  const [totalRows] = await pool.query(
    "SELECT COUNT(*) as total FROM contacts WHERE list_name = ?",
    [list_name]
  );
  const totalContacts = totalRows[0]?.total || 0;

  // Query to get contacts with pagination
  const sql = `
    SELECT list_name, list_description, email, contact_number
    FROM contacts
    WHERE list_name = ?
    LIMIT ? OFFSET ?
  `;
  const [rows] = await pool.query(sql, [
    list_name,
    parseInt(limit),
    parseInt(offset),
  ]);

  if (rows.length === 0) {
    return null;
  }

  // Since list_name and list_description are the same for all rows
  const listDescription = rows[0].list_description;

  const contacts = rows.map((row) => ({
    email: row.email,
    contact_number: row.contact_number,
  }));

  return {
    list_name,
    list_description: listDescription,
    contacts,
    total_contacts: totalContacts,
  };
};

module.exports = {
  getAllContacts,
  getListNamesWithContactCount,
  getContactById,
  createContacts,
  updateContact,
  deleteContact,
  getContactsByList,
};
