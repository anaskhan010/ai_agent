const express = require("express");
const outboundCall = require("../../controller/outboundCallController/outboundCall");
const authMiddleware = require("../../middleware/authMiddleware");

const router = express.Router();

router.post("/createCall", authMiddleware, outboundCall.createCall);

module.exports = router;
