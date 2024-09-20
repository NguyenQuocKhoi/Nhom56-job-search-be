const express = require('express');
const { verifyToken } = require('../middlewares/authMiddlewares');
const { createSaveJobController, deleteSaveJobController, getSaveJobsByCandidateIdController } = require('../controllers/saveJobController');

const router = express.Router();

router.post("/create", verifyToken, createSaveJobController);

router.delete("/delete/:saveJobId", verifyToken, deleteSaveJobController);

router.get("/gets/:candidateId", verifyToken, getSaveJobsByCandidateIdController)

module.exports = router;
