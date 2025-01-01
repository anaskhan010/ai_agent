const AssistantModel = require("../../model/AssistantModel/AssistantModel");
const fetch = require("node-fetch");
const axios = require("axios");
const jwt = require("jsonwebtoken");
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
      // Attempt to parse response body
      const errorBody = await vapiResponse.text();
      console.error("Vapi error body:", errorBody);

      throw new Error(
        `Vapi responded with status: ${vapiResponse.status}, body: ${errorBody}`
      );
    }

    const newAssistant = await vapiResponse.json();

    console.log(req.headers, "++++");

    const token = req.headers["authorization"].split(" ")[1];

    const decodedToken = jwt.verify(token, "ASAJKLDSLKDJLASJDLA");

    console.log(decodedToken, "devoce");

    const user_id = decodedToken.user.id;

    // Store entire newAssistant in the DB
    await AssistantModel.createAssistantRecord(
      user_id,
      newAssistant.id, // assistant_id
      newAssistant.orgId, // org_id
      newAssistant.name || null, // name
      newAssistant.firstMessage || null, // first_message
      newAssistant // entire object goes to assistant_data
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
  console.log("====");
  const pageParam = parseInt(req.query.page);
  const limitParam = parseInt(req.query.limit);
  // If you want to filter by a search term, read it here:
  const search = req.query.search || "";

  const page = !isNaN(pageParam) && pageParam > 0 ? pageParam : 1;
  const limit = !isNaN(limitParam) && limitParam > 0 ? limitParam : 10;

  try {
    // Pass search to your model if you need filtering
    const { data, totalAssistant } = await AssistantModel.getAssistants(
      page,
      limit,
      search
    );

    // If no data is returned
    if (!data || data.length === 0) {
      return res.status(404).json({ message: "No Assistants Found" });
    }

    // Calculate total pages
    const totalPages = Math.ceil(totalAssistant / limit);

    // Ensure the page does not exceed total pages
    const currentPage = page > totalPages && totalPages > 0 ? totalPages : page;

    res.status(200).json({ data, totalAssistant, currentPage, totalPages });
  } catch (error) {
    console.error(error);
    res.status(400).json(error);
  }
};
const getAssistantsFromVapi = async (req, res) => {
  console.log("-------");
  try {
    const response = await axios.get("https://api.vapi.ai/assistant", {
      headers: {
        Authorization: `Bearer ${KEY}`,
      },
    });
    const assistants = response.data;
    return res.status(200).json({
      success: true,
      message: "List of assistants retrieved successfully",
      data: assistants,
    });
  } catch (error) {
    console.error(
      "Error fetching assistants:",
      error?.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch assistants",
      error: error.message,
    });
  }
};

module.exports = {
  createAssistant,
  getAssistants,
  getAssistantsFromVapi,
};
