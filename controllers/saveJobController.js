const saveJobModel = require("../models/SaveJobs");
const candidateModel = require("../models/Candidate");
const jobModel = require("../models/Job")

const createSaveJobController = async (req, res) => {
    try {
      const { candidateId, jobId } = req.body;
  
      const candidate = await candidateModel.findById(candidateId);
      if (!candidate) {
        return res.status(404).send({
          success: false,
          message: "Candidate not found",
        });
      }
  
      const job = await jobModel.findById(jobId);
      if (!job) {
        return res.status(404).send({
          success: false,
          message: "Job not found",
        });
      }
  
      let existingSaveJob = await saveJobModel.findOne({
        candidate: candidateId,
        job: jobId,
      });
      if (existingSaveJob) {
        return res.status(400).send({
          success: false,
          message: "Job already exists",
        });
      }
  
      let saveJob = new saveJobModel({
        candidate: candidateId,
        job: jobId,
      });
  
      await saveJob.save();
  
      res.status(200).send({
        success: true,
        message: "Save Job successfully",
          savedJob: saveJob
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in save job API",
        error,
      });
    }
  };

  const deleteSaveJobController = async (req, res) => {
    try {
      const { saveJobId } = req.params;
  
      const saveJob = await saveJobModel.findById(saveJobId);
      if (!saveJob) {
        return res.status(404).send({
          success: false,
          message: "Save Job not found",
        });
      }
  
      await saveJobModel.findByIdAndDelete(saveJobId);
  
      res.status(200).send({
        success: true,
        message: "Saved job deleted successfully",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in delete save job API",
        error,
      });
    }
  };
 
  const getSaveJobsByCandidateIdController = async (req, res) => {
    try {
      const { candidateId } = req.params;
      const { page = 1, limit = 16 } = req.query;
  
      const savedJobs = await saveJobModel
        .find({ candidate: candidateId })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));
  
      const totalSaveJobs = await saveJobModel.countDocuments({ candidate: candidateId });
  
      if (!savedJobs || savedJobs.length === 0) {
        return res.status(404).send({
          success: false,
          message: "No jobs",
        });
      }
  
      res.status(200).send({
        success: true,
        message: "Save Jobs fetched successfully",
        savedJobs,
        totalSaveJobs,
        totalPages: Math.ceil(totalSaveJobs / limit),
        currentPage: Number(page),
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        success: false,
        message: "Error in get save job by candidate ID API",
        error,
      });
    }
  };

module.exports.getSaveJobsByCandidateIdController = getSaveJobsByCandidateIdController;
module.exports.deleteSaveJobController = deleteSaveJobController
module.exports.createSaveJobController = createSaveJobController;
