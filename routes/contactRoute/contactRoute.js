const express = require("express");
const router = express.Router();
const contactController = require("../../controller/contactController/contactController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/contacts/:page", contactController.getAllContacts);

router.get("/contacts/lists", contactController.getListNamesWithContactCount);
router.get("/contact/:id", authMiddleware, contactController.getContactById);
router.post("/contacts", authMiddleware, contactController.createContacts); // For multiple contacts
router.put("/contacts/:id", authMiddleware, contactController.updateContact);
router.delete("/contacts/:id", authMiddleware, contactController.deleteContact);
router.get("/contacts/:list_name/:page", contactController.getContactsByList);

module.exports = router;
