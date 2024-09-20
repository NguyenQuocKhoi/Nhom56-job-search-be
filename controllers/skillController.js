const skillModel = require("../models/Skill");

const createSkillController = async (req, res) => {
  try {
    const { skillName } = req.body;
    if (!skillName) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    let newSkill = new skillModel({
      skillName: skillName,
    });

    await newSkill.save();

    res.status(200).send({
      success: true,
      message: "Skill created successfully",
      Skill: newSkill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create Skill API",
      error,
    });
  }
};

const getAllSkillsController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;

    const skills = await skillModel
      .find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalSkills = await skillModel.countDocuments();
    res.status(200).send({
      success: true,
      message: "Skills fetched successfully",
      skills,
      totalSkills,
      totalPages: Math.ceil(totalSkills / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all skills API",
      error,
    });
  }
};

const getSkillByIdController = async (req, res) => {
  try {
    const { skillId } = req.params;
    const skill = await skillModel.findById(skillId);

    if (!skill) {
      return res.status(404).send({
        success: false,
        message: "Skill not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Skill fetched successfully",
      skill,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get Skill by ID API",
      error,
    });
  }
};

const updateSkillController = async (req, res) => {
    try {
      const { skillId } = req.params;
      const { skillName } = req.body;
  
      let skill = await skillModel.findById(skillId);
      if (!skill) {
        return res.status(404).send({
          success: false,
          message: "skill not found",
        });
      }
  
      if (skillName) skill.skillName = skillName;
      await skill.save();
  
      res.status(200).send({
        success: true,
        message: "skill updated successfully",
        skill: skill,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in update skill API",
        error,
      });
    }
  };
  
  const checkSkillController = async (req, res) => {
    try {
      const { skillName } = req.body;
  
      if (!skillName) {
        return res.status(400).send({
          success: false,
          message: "Please provide an Skill name",
        });
      }
  
      const skill = await skillModel.findOne({ skillName });
      if (!skill) {
        return res.status(201).send({
          success: false,
          message: "skill name not found",
        });
      }
  
      res.status(200).send({
        success: true,
        message: "skill name exists",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in checking skill name API",
      });
    }
  };

  module.exports.checkSkillController = checkSkillController;
  module.exports.updateSkillController = updateSkillController;
  module.exports.getSkillByIdController = getSkillByIdController;
  module.exports.getAllSkillsController = getAllSkillsController;
  module.exports.createSkillController = createSkillController;