const pool = require("../../config/DBConnection"); // Adjust the path to your pool.js file

// const getAllContacts = async (page, limit) => {
//   // Query to get the total number of contacts
//   const [totalRows] = await pool.query(
//     "SELECT COUNT(*) as total FROM contacts"
//   );
//   const totalContacts = totalRows[0]?.total || 0;

//   const totalPages = Math.ceil(totalContacts / limit);

//   // Adjust page if it exceeds total pages
//   const adjustedPage = page > totalPages && totalPages > 0 ? totalPages : page;

//   const offset = (adjustedPage - 1) * limit;

//   // Query to get paginated contacts
//   const sql = "SELECT * FROM contacts LIMIT ? OFFSET ?";
//   const [rows] = await pool.query(sql, [parseInt(limit), parseInt(offset)]);

//   return { contacts: rows, totalContacts };
// };

const getAllContacts = async (page, limit, search) => {
  let whereClause = "";
  let values = [];

  // If search term is provided, construct a WHERE clause using LIKE conditions
  if (search && search.trim() !== "") {
    whereClause =
      "WHERE email LIKE ? OR contact_number LIKE ? OR list_name LIKE ?";
    values = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  // Get total number of contacts (with or without WHERE clause depending on search)
  const countQuery = `SELECT COUNT(*) as total FROM contacts ${whereClause}`;
  const [totalRows] = await pool.query(countQuery, values);
  const totalContacts = totalRows[0]?.total || 0;

  const totalPages = Math.ceil(totalContacts / limit);

  // Adjust page if it exceeds total pages 
  const adjustedPage = page > totalPages && totalPages > 0 ? totalPages : page;

  const offset = (adjustedPage - 1) * limit;

  // Query to get paginated contacts (with or without WHERE clause)
  const sql = `SELECT * FROM contacts ${whereClause} LIMIT ? OFFSET ?`;
  values.push(parseInt(limit), parseInt(offset)); // Add paging parameters

  const [rows] = await pool.query(sql, values);

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

  // Calculate total pages
  const totalPages = Math.ceil(totalContacts / limit);
  const currentPage = page > totalPages && totalPages > 0 ? totalPages : page;

  // Adjust offset if page number exceeds total pages
  const adjustedOffset = (currentPage - 1) * limit;

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
    parseInt(adjustedOffset),
  ]);

  // If no contacts are found
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
    current_page: currentPage,
    total_pages: totalPages,
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
