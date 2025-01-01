const express = require("express");
const assistantController = require("../../controller/AssistantController/AssistantController");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/create_assistant",
  authMiddleware,
  assistantController.createAssistant
);

router.get(
  "/get_all_assistants",
  authMiddleware,
  assistantController.getAssistants
);

router.get(
  "/get-assistants/:id",
  authMiddleware,
  assistantController.getAssistantsFromVapi
);

router.put(
  "/update-assistant",
  authMiddleware,
  assistantController.updateAssistant
);

module.exports = router;
