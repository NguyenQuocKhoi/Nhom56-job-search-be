const saveCandidateModel = require("../models/SaveCandidate");
const candidateModel = require("../models/Candidate");
const companyModel = require("../models/Company");

const createSaveCandidateController = async (req, res) => {
  try {
    const { candidateId, companyId } = req.body;

    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).send({
        success: false,
        message: "Candidate not found",
      });
    }

    const company = await companyModel.findById(companyId);
    if (!company) {
      return res.status(404).send({
        success: false,
        message: "company not found",
      });
    }

    let existingSaveCandidate = await saveCandidateModel.findOne({
      candidate: candidateId,
      company: companyId,
    });

    if (existingSaveCandidate) {
      return res.status(400).send({
        success: false,
        message: "candidate already exists",
      });
    }

    let saveCandidate = new saveCandidateModel({
      candidate: candidateId,
      company: companyId,
    });

    await saveCandidate.save();

    res.status(200).send({
      success: true,
      message: "Save candidate successfully",
      saveCandidate: saveCandidate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in save candidate API",
      error,
    });
  }
};

const deleteSaveCandidateController = async (req, res) => {
  try {
    const { saveCandidateId } = req.params;

    const saveCandidate = await saveCandidateModel.findById(saveCandidateId);
    if (!saveCandidate) {
      return res.status(404).send({
        success: false,
        message: "Save candidate not found",
      });
    }

    await saveCandidateModel.findByIdAndDelete(saveCandidateId);

    res.status(200).send({
      success: true,
      message: "Saved candidate deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete save candidate API",
      error,
    });
  }
};

const getSaveCandidatesByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 16 } = req.query;

    const saveCandidates = await saveCandidateModel
      .find({ company: companyId })
      .populate("candidate")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const filteredCandidates = saveCandidates.filter(
      (sc) => sc.candidate && sc.candidate.status
    );

    const totalSaveCandidate = filteredCandidates.length;

    if (totalSaveCandidate === 0) {
      return res.status(404).send({
        success: false,
        message: "No candidates",
      });
    }

    res.status(200).send({
      success: true,
      message: "Save candidates fetched successfully",
      saveCandidate: filteredCandidates,
      totalSaveCandidate,
      totalPages: Math.ceil(totalSaveCandidate / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get save candidates by company ID API",
      error,
    });
  }
};

module.exports.getSaveCandidatesByCompanyIdController =
  getSaveCandidatesByCompanyIdController;
module.exports.deleteSaveCandidateController = deleteSaveCandidateController;
module.exports.createSaveCandidateController = createSaveCandidateController;
