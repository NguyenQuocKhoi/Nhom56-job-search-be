const candidateModel = require("../models/Candidate");
const jobModel = require("../models/Job");
const applicationModel = require("../models/Application");

const submitApplicationController = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;

    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).send({
        success: false,
        message: "Candidate not found",
      });
    }

    const job = await jobModel.findById(jobId).select("title applications");
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    let existingApplication = await applicationModel.findOne({
      candidate: candidateId,
      job: jobId,
    });
    if (existingApplication) {
      return res.status(400).send({
        success: false,
        message: "Application already exists for this job",
      });
    }

    let application = new applicationModel({
      candidate: candidateId,
      job: jobId,
    });

    await application.save();

    job.applications.push(application._id);
    await job.save();

    application = await application.populate("candidate");

    res.status(200).send({
      success: true,
      message: "Application submitted successfully",
      application: application,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Submit Application API",
      error,
    });
  }
};

const getApplicationByIdController = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const application = await applicationModel.findById(applicationId);
    if (!application) {
      return res.status(404).send({
        success: false,
        message: "application not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Get Application successfully",
      application: application,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get Application API",
      error,
    });
  }
};
module.exports.getApplicationByIdController = getApplicationByIdController;
module.exports.submitApplicationController = submitApplicationController;
