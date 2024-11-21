const pool = require("../../config/DBConnection"); // Adjust the path to your pool.js file

const getAllContacts = async () => {
  const [rows] = await pool.query("SELECT * FROM contacts");
  return rows;
};

const getListNamesWithContactCount = async () => {
  const sql = `
    SELECT list_name, list_description,created_at, COUNT(*) AS contact_count
    FROM contacts
    GROUP BY list_name, list_description;
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

module.exports = {
  getAllContacts,
  getListNamesWithContactCount,
  getContactById,
  createContacts,
  updateContact,
  deleteContact,
};
