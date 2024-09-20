const express = require('express');
const { adminMiddleware, verifyToken } = require('../middlewares/authMiddlewares');
const { createSkillController, getAllSkillsController, getSkillByIdController, updateSkillController, checkSkillController } = require('../controllers/skillController');

const router = express.Router();


router.post("/create", adminMiddleware, createSkillController);

router.get("/get-all", verifyToken, getAllSkillsController);

router.get("/:skillId", getSkillByIdController);

router.put("/update/:skillId", adminMiddleware, updateSkillController);

router.post("/check-skill", adminMiddleware, checkSkillController)



module.exports = router;
