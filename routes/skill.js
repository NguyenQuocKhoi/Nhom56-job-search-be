const express = require('express');
const { adminMiddleware, verifyToken } = require('../middlewares/authMiddlewares');
const { createSkillController, getAllSkillsController, getSkillByIdController, updateSkillController, checkSkillController, getSkillBySkillNameController, getCandidatesAndJobsBySkillNameController,  } = require('../controllers/skillController');

const router = express.Router();


router.post("/create", adminMiddleware, createSkillController);

router.get("/get-all", verifyToken, getAllSkillsController);

router.get("/:skillId", getSkillByIdController);

router.put("/update/:skillId", adminMiddleware, updateSkillController);

router.post("/check-skill", adminMiddleware, checkSkillController)

router.post("/get-skill-by-skill-name", adminMiddleware, getSkillBySkillNameController);

router.post('/get-candidate-and-job-by-skill', adminMiddleware, getCandidatesAndJobsBySkillNameController);
module.exports = router;
