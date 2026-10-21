const express = require("express");
const { acceptApplication, withdrawApplication } = require("../controllers/applicationController");
const { protect } = require("../middleware/authMiddleware");
const router = express.Router();
router.put("/:id/accept", protect, acceptApplication);
router.put("/:id/withdraw", protect, withdrawApplication);
module.exports = router;
