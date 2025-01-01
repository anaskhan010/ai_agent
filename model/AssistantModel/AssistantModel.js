const db = require("../../config/DBConnection");

async function createAssistantRecord(
  user_id,
  assistantId,
  orgId,
  name,
  firstMessage,
  assistantData
) {
  console.log(user_id, "++++++++++++++++++++Model++++++++++++");
  const insertSQL = `
    INSERT INTO assistants ( user_id,assistant_id, org_id, name, first_message, assistant_data)
    VALUES (?, ?, ?, ?, ?,?)
  `;

  const params = [
    user_id,
    assistantId,
    orgId,
    name,
    firstMessage,
    JSON.stringify(assistantData),
  ];

  const [result] = await db.query(insertSQL, params);

  return result.insertId;
}

const getAssistants = async (page, limit, search = "") => {
  // Start with an empty array for parameters
  let values = [];

  // Count query
  let countQuery = `SELECT COUNT(*) AS total FROM assistants`;

  // If searching by name or similar, adjust the WHERE clause
  if (search) {
    countQuery += ` WHERE name LIKE ?`;
    values.push(`%${search}%`);
  }

  // Execute count query
  const [totalRows] = await db.query(countQuery, values);
  const totalAssistant = totalRows[0]?.total || 0;

  // Calculate total pages and adjust if necessary
  const totalPages = Math.ceil(totalAssistant / limit);
  const adjustedPage = page > totalPages && totalPages > 0 ? totalPages : page;
  const offset = (adjustedPage - 1) * limit;

  // Now build the SELECT query
  let selectQuery = `SELECT user_id FROM assistants`;

  // If search is specified, add the same WHERE clause used in countQuery
  if (search) {
    selectQuery += ` WHERE name LIKE ?`;
  }

  // Pagination
  selectQuery += ` LIMIT ? OFFSET ?`;

  // We need a fresh array for the SELECT query parameters:
  // If we used a search condition, push that first, then push limit & offset
  let selectValues = [];
  if (search) {
    selectValues.push(`%${search}%`);
  }
  selectValues.push(limit, offset);

  // Execute the SELECT query
  const [rows] = await db.query(selectQuery, selectValues);

  // Return rows (renamed to data) along with totalAssistant
  return { data: rows, totalAssistant };
};
module.exports = {
  createAssistantRecord,
  getAssistants,
};
