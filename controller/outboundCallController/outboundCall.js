require("dotenv").config();
const axios = require("axios");

const KEY = process.env.KEY;
const createCall = async (req, res) => {
  const { id } = req.body;
  try {
    const callPayload = {
      assistantId: id,
      to: "+1(346)5492850",
      from: "+1(496)4143615",
    };

    const callResponse = await axios.post(
      "https://api.vapi.ai/call",
      callPayload, // body/payload goes here
      {
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Call initiated:", callResponse.data);

    return res.status(201).json({
      success: true,
      message: "Assistant created and call initiated successfully",
      data: {
        assistant: newAssistant,
        call: callResponse.data,
      },
    });
  } catch (error) {
    console.error("Error creating assistant and call:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllCalls = async (req, res) => {
  try {
    const vapiResponse = await axios.get("https://api.vapi.ai/call", {
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

    const calls = await vapiResponse.json();
    return res.status(200).json({
      success: true,
      message: "List of calls retrieved successfully",
      data: calls,
    });
  } catch (error) {
    console.error("Error listing calls:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch calls",
      error: error.message,
    });
  }
};
const getCallsbyID = async (req, res) => {
  const { id } = req.params;
  try {
    const vapiResponse = await axios.get(`https://api.vapi.ai/call/${id}`, {
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

    const calls = await vapiResponse.json();
    return res.status(200).json({
      success: true,
      message: "List of calls retrieved successfully",
      data: calls,
    });
  } catch (error) {
    console.error("Error listing calls:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch calls",
      error: error.message,
    });
  }
};

module.exports = {
  createCall,
  getAllCalls,
  getCallsbyID,
};
