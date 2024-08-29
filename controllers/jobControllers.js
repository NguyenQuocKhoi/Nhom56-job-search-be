const companyModel = require("../models/Company");
const jobModel = require("../models/Job");

const createJobController = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      experienceLevel,
      position,
      address,
      type,
      expiredAt,
      companyId,
      status,
    } = req.body;

    const company = await companyModel.findById(companyId);
    if (!company) {
      return res.status(404).send({
        success: false,
        message: "Company not found",
      });
    }

    if (
      !title ||
      !description ||
      !requirements ||
      !salary ||
      !experienceLevel ||
      !position ||
      !type ||
      !expiredAt
    ) {
      return res.status(400).send({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const expiredAtDate =
      typeof expiredAt === "string" ? new Date(expiredAt) : expiredAt;

    let newJob = new jobModel({
      title: title,
      description: description,
      requirements: requirements,
      salary: salary,
      experienceLevel: experienceLevel,
      position: position,
      address: address,
      type: type,
      expiredAt: expiredAtDate,
      company: companyId,
      created_by: company._id,
    });

    await newJob.save();

    newJob = await jobModel.findById(newJob._id).populate("company");

    res.status(200).send({
      success: true,
      message: "Job created successfully",
      job: newJob,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in create job API",
      error,
    });
  }
};

const getAllJobsController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;
    const currentDate = new Date();
    await jobModel.updateMany(
      { expiredAt: { $lt: currentDate }, status: true },
      { status: false }
    );

    const jobs = await jobModel
      .find()
      .populate("company")
      // .sort({ status: -1, createdAt: -1 })
      .sort({ status: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments();
    res.status(200).send({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all jobs API",
      error,
    });
  }
};

const getJobsByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 6 } = req.query;

    const jobs = await jobModel
      .find({ company: companyId })
      .populate("company")
      .sort({ status: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({ company: companyId });

    if (!jobs || jobs.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No jobs found for this company",
      });
    }

    res.status(200).send({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
      totalJobs,
      totalPages: Math.ceil(totalJobs / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get jobs by company ID API",
      error,
    });
  }
};

const getJobByIdController = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await jobModel.findById(jobId).populate("company");

    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Job fetched successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get job by ID API",
      error,
    });
  }
};

module.exports.getJobByIdController = getJobByIdController;
module.exports.getJobsByCompanyIdController = getJobsByCompanyIdController;
module.exports.getAllJobsController = getAllJobsController;
module.exports.createJobController = createJobController;
