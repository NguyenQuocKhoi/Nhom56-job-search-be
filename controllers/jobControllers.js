const companyModel = require("../models/Company");
const jobModel = require("../models/Job");
const applicationModel = require("../models/Application");
const notificationModel = require("../models/notification");
const saveJobModel = require("../models/SaveJobs");
const categoryModel = require("../models/Category");

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
      numberOfCruiment,
      category,
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
      numberOfCruiment: numberOfCruiment,
      company: companyId,
      created_by: company._id,
      category: category,
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

const getAllJobsStatusTrueController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;
    const currentDate = new Date();

    await jobModel.updateMany(
      { expiredAt: { $lt: currentDate }, status: true },
      { status: false }
    );

    const jobs = await jobModel
      .find({ status: true })
      .populate("company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({ status: true });

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

const getAllJobsReJectedController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;
    const currentDate = new Date();

    await jobModel.updateMany(
      { expiredAt: { $lt: currentDate }, status: true },
      { status: false }
    );

    const jobs = await jobModel
      .find({ status: false })
      .populate("company")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({ status: false });

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

const getAllJobsPendingController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;
    const currentDate = new Date();

    await jobModel.updateMany(
      { expiredAt: { $lt: currentDate }, status: true },
      { status: false }
    );

    const jobs = await jobModel
      .find({ status: undefined })
      .populate("company")
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({ status: undefined });

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

const getJobsTrueByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 6 } = req.query;

    const jobs = await jobModel
      .find({ company: companyId, status: true })
      .populate("company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({
      company: companyId,
      status: true,
    });

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

const getJobsFalseByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 6 } = req.query;

    const jobs = await jobModel
      .find({ company: companyId, status: false })
      .populate("company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({
      company: companyId,
      status: false,
    });

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

const getJobsNotStatusByCompanyIdController = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { page = 1, limit = 6 } = req.query;

    const jobs = await jobModel
      .find({ company: companyId, status: undefined })
      .populate("company")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalJobs = await jobModel.countDocuments({
      company: companyId,
      status: undefined,
    });

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

const updateJobController = async (req, res) => {
  try {
    const { jobId } = req.params;
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
      numberOfCruiment,
      category,
    } = req.body;

    let job = await jobModel.findById(jobId);
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    if (title) job.title = title;
    if (description) job.description = description;
    if (requirements) job.requirements = requirements;
    if (salary) job.salary = salary;
    if (experienceLevel) job.experienceLevel = experienceLevel;
    if (position) job.position = position;
    if (address) job.address = address;
    if (type) job.type = type;
    if (numberOfCruiment) job.numberOfCruiment = numberOfCruiment;
    if (expiredAt) {
      job.expiredAt =
        typeof expiredAt === "string" ? new Date(expiredAt) : expiredAt;
    }
    if (category) job.category = category;

    // job.status = false;
    job.status = undefined;
    job.lastModified = Date.now();
    await job.save();

    job = await jobModel.findById(job._id).populate("company");

    res.status(200).send({
      success: true,
      message: "Job updated successfully",
      job: job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update job API",
      error,
    });
  }
};

const deleteJobController = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await jobModel.findById(jobId);
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    await applicationModel.deleteMany({ job: jobId });

    await saveJobModel.deleteMany({ job: jobId });

    await jobModel.findByIdAndDelete(jobId);

    res.status(200).send({
      success: true,
      message: "Job, related applications, and saved jobs deleted successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in delete job API",
      error,
    });
  }
};

const updateJobStatusController = async (req, res) => {
  try {
    const { jobId, status } = req.body;

    if (!jobId) {
      return res.status(400).send({
        success: false,
        message: "Please provide job ID",
      });
    }

    const job = await jobModel.findById(jobId);
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    job.status = status;
    await job.save();

    const notificationMessage =
      status === true
        ? `Your ${job.title} job has been approved.`
        : `Your ${job.title} job has been approved`;

    const notification = new notificationModel({
      job: jobId,
      message: notificationMessage,
    });

    await notification.save();
    return res.status(200).send({
      success: true,
      message: `job status updated to ${status}. ${notificationMessage}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the job status.",
    });
  }
};

const searchJobsController = async (req, res) => {
  try {
    const {
      address = "",
      search = "",
      page = 1,
    } = req.body;

    const limit = 16;
    const skip = (page - 1) * limit;

    let query = {
      // status: true,
    };

    let categoryIds = [];
    if (search) {
      const categories = await categoryModel.find({
        name: { $regex: new RegExp(search, "i") },
      });
      categoryIds = categories.map((category) => category._id);
    }

    if (address && !search) {
      query.address = { $regex: new RegExp(address, "i") };
    }

    if (address && search) {
      query.address = { $regex: new RegExp(address, "i") };
      const searchQuery = [
        { title: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { requirements: { $regex: new RegExp(search, "i") } },
        { experienceLevel: { $regex: new RegExp(search, "i") } },
        { position: { $regex: new RegExp(search, "i") } },
        { type: { $regex: new RegExp(search, "i") } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(isNaN(Number(search)) ? [] : [{ salary: Number(search) }]), 
      ];

      query.$or = searchQuery;
    }

    if (!address && search) {
      const searchQuery = [
        { title: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { requirements: { $regex: new RegExp(search, "i") } },
        { experienceLevel: { $regex: new RegExp(search, "i") } },
        { position: { $regex: new RegExp(search, "i") } },
        { type: { $regex: new RegExp(search, "i") } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(isNaN(Number(search)) ? [] : [{ salary: Number(search) }]), 
      ];

      query.$or = searchQuery;
    }

    const sort = { createdAt: 1 };

    const jobResults = await jobModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalJobResults = await jobModel.countDocuments(query);

    res.status(200).json({
      success: true,
      jobs: jobResults,
      pagination: {
        page,
        limit,
        totalResults: totalJobResults,
        totalPages: Math.ceil(totalJobResults / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports.searchJobsController = searchJobsController;
module.exports.getAllJobsPendingController = getAllJobsPendingController;
module.exports.getAllJobsReJectedController = getAllJobsReJectedController;
module.exports.getJobsFalseByCompanyIdController = getJobsFalseByCompanyIdController;
module.exports.getJobsNotStatusByCompanyIdController = getJobsNotStatusByCompanyIdController;
module.exports.getAllJobsStatusTrueController = getAllJobsStatusTrueController;
module.exports.updateJobStatusController = updateJobStatusController;
module.exports.deleteJobController = deleteJobController;
module.exports.updateJobController = updateJobController;
module.exports.getJobByIdController = getJobByIdController;
module.exports.getJobsByCompanyIdController = getJobsByCompanyIdController;
module.exports.getJobsTrueByCompanyIdController = getJobsTrueByCompanyIdController;
module.exports.getAllJobsController = getAllJobsController;
module.exports.createJobController = createJobController;
