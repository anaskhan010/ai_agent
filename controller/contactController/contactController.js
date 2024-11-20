const contactModel = require("../../model/contactModel/contactModel");

const getAllContacts = async (req, res) => {
  try {
    const contacts = await contactModel.getAllContacts();
    res.status(200).json(contacts);
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
    const contacts = req.body;
    console.log(contacts, "...............");
    const result = await contactModel.createContacts(contacts);
    res.status(201).json({ message: "Contacts created", result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateContact = async (req, res) => {
  try {
    const contact_id = req.params.id;
    const contactData = req.body;
    const result = await contactModel.updateContact(contact_id, contactData);
    res.status(200).json({ message: "Contact updated", result });
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
  getContactById,
  createContacts,
  updateContact,
  deleteContact,
};
