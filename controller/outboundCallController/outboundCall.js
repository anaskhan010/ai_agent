require("dotenv").config();

const KEY = process.env.KEY;
const createCall = async (req, res) => {
  const { id } = req.body;
  try {
    // 1. Prepare your call payload
    const callPayload = {
      assistantId: id,
      to: "+1(346)5492850",
      from: "+1(496)4143615",
    };

    // 2. Initiate the call via Axios
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

    // 5. Return error response
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  createCall,
};
