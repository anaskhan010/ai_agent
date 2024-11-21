const contactModel = require("../../model/contactModel/contactModel");

const getAllContacts = async (req, res) => {
  try {
    // Extract pagination parameters from query string
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 10; // Default to 10 contacts per page

    const { contacts, totalContacts } = await contactModel.getAllContacts(
      page,
      limit
    );

    res.status(200).json({
      contacts,
      totalContacts,
      currentPage: page,
      totalPages: Math.ceil(totalContacts / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getListNamesWithContactCount = async (req, res) => {
  try {
    const data = await contactModel.getListNamesWithContactCount();

    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No lists found" });
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const getContactById = async (req, res) => {
  try {
    const contact_id = req.params.id;
    const contact = await contactModel.getContactById(contact_id);
    if (contact) {
      res.status(200).json(contact);
    } else {
      res.status(404).json({ message: "Contact not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createContacts = async (req, res) => {
  try {
    const { user_id, list_name, list_description, contacts } = req.body;

    // Validate input
    if (
      !user_id ||
      !list_name ||
      !list_description ||
      !Array.isArray(contacts)
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Ensure each contact has email and contact_number
    for (const contact of contacts) {
      if (!contact.email || !contact.contact_number) {
        return res.status(400).json({
          error: "Each contact must have an email and contact_number",
        });
      }
    }

    const result = await contactModel.createContacts(
      user_id,
      list_name,
      list_description,
      contacts
    );
    res
      .status(201)
      .json({ message: "Contacts List created Sucessfully", data: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const { user_id, list_name, list_description, contacts } = req.body;

    // Validate input
    if (
      !user_id ||
      !list_name ||
      !list_description ||
      !Array.isArray(contacts)
    ) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    // Ensure each contact has contact_id, email, and contact_number
    for (const contact of contacts) {
      if (!contact.contact_id || !contact.email || !contact.contact_number) {
        return res.status(400).json({
          error: "Each contact must have contact_id, email, and contact_number",
        });
      }
    }

    const result = await contactModel.updateContact(
      user_id,
      list_name,
      list_description,
      contacts
    );
    res.status(200).json({ message: "Contacts updated", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteContact = async (req, res) => {
  try {
    const contact_id = req.params.id;
    const result = await contactModel.deleteContact(contact_id);
    res.status(200).json({ message: "Contact deleted", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getAllContacts,
  getListNamesWithContactCount,
  getContactById,
  createContacts,
  updateContact,
  deleteContact,
};
