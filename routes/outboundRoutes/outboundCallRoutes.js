const express = require("express");
const outboundCall = require("../../controller/outboundCallController/outboundCall");
const router = express.Router();

router.post("/createCall", authMiddleware, assistantController.createCall);

module.exports = router;
