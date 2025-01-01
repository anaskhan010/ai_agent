const AssistantModel = require("../../model/AssistantModel/AssistantModel");
const fetch = require("node-fetch");

const KEY = "bc725647-fc1b-45a5-93a5-57b784e65cc6";

async function createAssistant(req, res) {
  console.log("----------------");
  try {
    const payload = req.body;

    // Send POST to Vapi's create-assistant endpoint
    const vapiResponse = await fetch("https://api.vapi.ai/assistant", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!vapiResponse.ok) {
      throw new Error(`Vapi responded with status: ${vapiResponse.status}`);
    }

    const newAssistant = await vapiResponse.json();

    // Store in DB
    await AssistantModel.createAssistantRecord(
      newAssistant.id,
      newAssistant.orgId,
      newAssistant.name || null,
      newAssistant.firstMessage || null,
      newAssistant
    );

    res.status(201).json({
      success: true,
      message: "Assistant created successfully",
      data: newAssistant,
    });
  } catch (error) {
    console.error("Error creating assistant:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create assistant",
      error: error.message,
    });
  }
}

const getAssistants = async (req, res) => {
  try {
    const data = await AssistantModel.getAssistants();
    if (!data) {
      res.status(404).json({ message: "Assistants Doesn't Exist" });
    }
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(400).json(error);
  }
};

module.exports = {
  createAssistant,
  getAssistants,
};
