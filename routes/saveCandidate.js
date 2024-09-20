const express = require('express');
const { companyMiddleware } = require('../middlewares/authMiddlewares');
const { createSaveCandidateController, deleteSaveCandidateController, getSaveCandidatesByCompanyIdController } = require('../controllers/saveCandidateController');

const router = express.Router();

router.post("/create", companyMiddleware, createSaveCandidateController);

router.delete("/delete/:saveCandidateId", companyMiddleware, deleteSaveCandidateController);

router.get("/gets/:companyId", companyMiddleware, getSaveCandidatesByCompanyIdController)

module.exports = router;
