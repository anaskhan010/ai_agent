const db = require("../../config/DBConnection");

async function createAssistantRecord(
  assistantId,
  orgId,
  name,
  firstMessage,
  assistantData
) {
  const insertSQL = `
    INSERT INTO assistants (assistant_id, org_id, name, first_message, assistant_data)
    VALUES (?, ?, ?, ?, ?)
  `;

  const params = [
    assistantId,
    orgId,
    name,
    firstMessage,
    JSON.stringify(assistantData),
  ];

  const [result] = await db.query(insertSQL, params);

  return result.insertId;
}

const getAssistants = async () => {
  const query = `SELECT * FROM assistants`;
  const [result] = await db.query(query);
  return result;
};

module.exports = {
  createAssistantRecord,
  getAssistants,
};
