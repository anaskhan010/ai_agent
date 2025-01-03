const AssistantModel = require("../../model/AssistantModel/AssistantModel");
require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");

const KEY = "aa6161d2-7ba0-4182-96aa-fee4a9f14fd8";

//const KEY = "bc725647-fc1b-45a5-93a5-57b784e65cc6";

async function createAssistant(req, res) {
  console.log("----------------");
  try {
    const { name, firstMessage, transcriber, model, voice } = req.body;
    const payload = {
      name,
      firstMessage,
      transcriber,
      model,
      voice,
    };

    const vapiResponse = await axios.post(
      "https://api.vapi.ai/assistant",
      payload,
      {
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const newAssistant = vapiResponse.data;
    console.log("Vapi returned new assistant:", newAssistant);

    if (vapiResponse.status !== 201 && vapiResponse.status !== 200) {
      throw new Error(
        `Vapi responded with unexpected status: ${vapiResponse.status}`
      );
    }

    const token = req.headers["authorization"].split(" ")[1];

    const decodedToken = jwt.verify(token, "ASAJKLDSLKDJLASJDLA");

    const user_id = decodedToken.user.id;

    await AssistantModel.createAssistantRecord(
      user_id,
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
  const id = req.params.id;

  console.log("-------");
  try {
    const token = req.headers["authorization"].split(" ")[1];

    const decodedToken = jwt.verify(token, "ASAJKLDSLKDJLASJDLA");

    const user_id = decodedToken.user.id;
    if (user_id) {
      const response = await axios.get(`https://api.vapi.ai/assistant/${id}`, {
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
    } else {
      res
        .status(401)
        .json({ message: "You don't have permission to view this Assistant" });
    }
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

async function updateAssistant(req, res) {
  try {
    const { id } = req.params;

    const payload = req.body;

    const vapiResponse = await fetch(`https://api.vapi.ai/assistant/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!vapiResponse.ok) {
      const errorBody = await vapiResponse.text();
      console.error("Vapi error body:", errorBody);
      return res.status(vapiResponse.status).json({
        success: false,
        message: `Vapi responded with status ${vapiResponse.status}`,
        error: errorBody,
      });
    }

    const updatedAssistant = await vapiResponse.json();
    console.log("Updated assistant from Vapi:", updatedAssistant);

    const affectedRows = await AssistantModel.updateAssistantRecord(
      updatedAssistant.id,
      updatedAssistant
    );

    return res.status(200).json({
      success: true,
      message: "Assistant updated successfully",
      data: updatedAssistant,
      dbRowsUpdated: affectedRows,
    });
  } catch (error) {
    console.error("Error updating assistant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update assistant",
      error: error.message,
    });
  }
}

async function deleteAssistant(req, res) {
  try {
    const { id } = req.params;

    const vapiResponse = await fetch(`https://api.vapi.ai/assistant/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!vapiResponse.ok) {
      const errorBody = await vapiResponse.text();
      console.error("Vapi error body:", errorBody);
      return res.status(vapiResponse.status).json({
        success: false,
        message: `Vapi responded with status ${vapiResponse.status}`,
        error: errorBody,
      });
    }

    let deleteResult;
    try {
      deleteResult = await vapiResponse.json();
    } catch (_ignore) {
      deleteResult = {};
    }

    const dbRowsDeleted = await AssistantModel.deleteAssistantRecordById(
      assistantId
    );

    return res.status(200).json({
      success: true,
      message: "Assistant deleted successfully",
      data: {
        vapiDeleteResult: deleteResult,
        dbRowsDeleted,
      },
    });
  } catch (error) {
    console.error("Error deleting assistant:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete assistant",
      error: error.message,
    });
  }
}

module.exports = {
  createAssistant,
  getAssistants,
  getAssistantsFromVapi,
  updateAssistant,
  deleteAssistant,
};
