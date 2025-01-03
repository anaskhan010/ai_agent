const axios = require("axios");
require("dotenv").config();
const KEY = "aa6161d2-7ba0-4182-96aa-fee4a9f14fd8";

// const createCall = async (req, res) => {
//   const { id } = req.body; // assistantId from client
//   try {
//     // We only pass assistantId and phoneNumber
//     const callPayload = {
//       assistantId: id,
//       phoneNumber: "+18323696945", // Or get from req.body if user decides
//     };

//     // Post to Vapi with the correct shape
//     const callResponse = await axios.post(
//       "https://api.vapi.ai/call",
//       callPayload,
//       {
//         headers: {
//           Authorization: `Bearer ${KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // callResponse.data contains the result
//     console.log("Call initiated:", callResponse.data);

//     return res.status(201).json({
//       success: true,
//       message: "Call initiated successfully",
//       data: {
//         call: callResponse.data,
//       },
//     });
//   } catch (error) {
//     console.error("Error initiating call:", error);

//     // If Vapi returns a 4xx/5xx error, axios throws, so handle gracefully
//     if (error.response) {
//       return res.status(error.response.status).json({
//         success: false,
//         message: "Vapi call failed",
//         error: error.response.data,
//       });
//     }

//     // Otherwise, it's a code-level or network error
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: error.message,
//     });
//   }
// };

const createCall = async (req, res) => {
  const { id, phoneNumber } = req.body; // Expect 'id' (assistantId) and 'phoneNumber' from frontend

  try {
    // Validate required fields
    if (!id || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message:
          "'id' (assistantId) and 'phoneNumber' are required in the request body.",
      });
    }

    // Construct the payload with required and optional fields
    const callPayload = {
      name: `Call to ${phoneNumber}`, // Optional: <=40 characters
      assistantId: id, // Use either 'assistantId' or 'assistant' object

      phoneNumber: {
        number: phoneNumber, // Required: object with 'number'
      },
      // Add other optional fields here if necessary, e.g., squadId, fallbackDestination, etc.
    };

    // Make the POST request to Vapi's /call endpoint with 'await'
    const callResponse = await axios.post(
      "https://api.vapi.ai/call",
      callPayload, // Correctly structured payload
      {
        headers: {
          Authorization: `Bearer ${KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 5000, // Optional: set a timeout for the request
      }
    );

    console.log("Call initiated:", callResponse.data);

    // Optionally, store call details in your DB
    // await CallModel.createCallRecord(id, phoneNumber, callResponse.data);

    return res.status(201).json({
      success: true,
      message: "Call initiated successfully",
      data: {
        call: callResponse.data,
      },
    });
  } catch (error) {
    console.error("Error initiating call:", error);

    // Handle Axios errors
    if (error.response) {
      // Server responded with a status other than 2xx
      return res.status(error.response.status).json({
        success: false,
        message: "Vapi call failed",
        error: error.response.data,
      });
    } else if (error.request) {
      // No response received from server
      return res.status(500).json({
        success: false,
        message: "No response received from Vapi",
        error: error.message,
      });
    } else {
      // Other errors (e.g., setting up the request)
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
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
