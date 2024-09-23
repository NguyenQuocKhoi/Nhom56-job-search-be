const companyModel = require("../models/Company");
const jobModel = require("../models/Job");
const applicationModel = require("../models/Application");
const notificationModel = require("../models/notification");
const saveJobModel = require("../models/SaveJobs");
const categoryModel = require("../models/Category");
const candidateModel = require("../models/Candidate");
const skillModel = require("../models/Skill");
const mongoose = require("mongoose");

const createJobController = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      salary,
      experienceLevel,
      position,
      // address,
      street,
      city,
      type,
      expiredAt,
      companyId,
      numberOfCruiment,
      category,
      requirementSkills,
      interest,
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
      requirementSkills: requirementSkills,
      interest: interest,
      salary: salary,
      experienceLevel: experienceLevel,
      position: position,
      // address: address,
      street: street,
      city: city,
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
      street,
      city,
      type,
      expiredAt,
      numberOfCruiment,
      requirementSkills,
      interest,
      category,
    } = req.body;

    let job = await jobModel.findById(jobId);
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "Job not found",
      });
    }

    let processedRequirements = [];
    if (requirementSkills && Array.isArray(requirementSkills)) {
      processedRequirements = requirementSkills.map((id) => {
        return mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)
          : id;
      });
    }

    const pendingUpdates = {
      title: title || job.title,
      description: description || job.description,
      // requirements: requirements || job.requirements,
      requirementSkills:
        processedRequirements.length > 0
          ? processedRequirements
          : job.requirementSkills,
      salary: salary || job.salary,
      experienceLevel: experienceLevel || job.experienceLevel,
      requirements: requirements || job.requirements,
      interest: interest || job.interest,
      position: position || job.position,
      // address: address || job.address,
      street: street || job.street,
      city: city || job.city,
      type: type || job.type,
      numberOfCruiment: numberOfCruiment || job.numberOfCruiment,
      expiredAt: expiredAt
        ? typeof expiredAt === "string"
          ? new Date(expiredAt)
          : expiredAt
        : job.expiredAt,
      category: category || job.category,
      status: undefined,
      lastModified: Date.now(),
    };

    job.pendingUpdates = pendingUpdates;
    await job.save();

    res.status(200).send({
      success: true,
      message: "Job update is pending approval",
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

    let job = await jobModel.findById(jobId);
    if (!job) {
      return res.status(404).send({
        success: false,
        message: "No pending updates found for this job",
      });
    }
    if (job.pendingUpdates) {
      if (status === false) {
        job.pendingUpdates = null;
      } else {
        Object.assign(job, job.pendingUpdates);
        job.pendingUpdates = null;

        const appliedCandidates = await applicationModel
          .find({ job: jobId })
          .select("candidate");

        for (const app of appliedCandidates) {
          const candidateNotification = new notificationModel({
            candidate: app.candidate,
            job: jobId,
            message: `The job ${job.title} you applied for has changed`,
          });
          await candidateNotification.save();
        }

        const savedCandidates = await saveJobModel
          .find({ job: jobId })
          .select("candidate");

        for (const saved of savedCandidates) {
          const savedNotification = new notificationModel({
            candidate: saved.candidate,
            job: jobId,
            message: `The job ${job.title} you saved for has changed`,
          });
          await savedNotification.save();
        }
      }
    } else {
      job.status = status;
    }

    await job.save();
    const notificationMessage =
      status === true
        ? `Your ${job.title} job has been approved.`
        : `Your ${job.title} job has been rejected. You can delete this job and create a new one.`;

    const notification = new notificationModel({
      job: jobId,
      company: job.company,
      message: notificationMessage,
    });

    await notification.save();

    res.status(200).send({
      success: true,
      message: "Job updated successfully after status approval",
      job: job,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in finalizing job update",
      error,
    });
  }
};

const searchJobsController = async (req, res) => {
  try {
    const { city = "", search = "", page = 1 } = req.body;

    const limit = 16;
    const skip = (page - 1) * limit;

    let query = {};

    let categoryIds = [];
    let skillIds = [];

    const parseSearchString = async (str) => {
      const words = str.split(/\s+/);
      let groupedSkills = [];
      let currentPhrase = [];

      for (let word of words) {
        currentPhrase.push(word);
        const currentSkill = currentPhrase.join(" ");

        const skill = await skillModel.findOne({
          skillName: { $regex: new RegExp(`^${currentSkill}$`, "i") },
        });

        if (skill) {
          groupedSkills.push(currentSkill);
          currentPhrase = [];
        }
      }

      return groupedSkills;
    };

    if (search) {
      const categories = await categoryModel.find({
        name: { $regex: new RegExp(search, "i") },
      });
      categoryIds = categories.map((category) => category._id);
      const skillNames = await parseSearchString(search);

      const skills = await skillModel.find({
        skillName: {
          $in: skillNames.map((name) => new RegExp(`^${name}$`, "i")),
        },
      });
      skillIds = skills.map((skill) => skill._id);
    }

    if (city && !search) {
      query.city = { $regex: new RegExp(city, "i") };
    }

    if (city && search) {
      query.city = { $regex: new RegExp(city, "i") };
      const searchQuery = [
        { title: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { experienceLevel: { $regex: new RegExp(search, "i") } },
        { position: { $regex: new RegExp(search, "i") } },
        { salary: { $regex: new RegExp(search, "i") } },
        { requirements: { $regex: new RegExp(search, "i") } },
        { interest: { $regex: new RegExp(search, "i") } },
        { type: { $regex: new RegExp(search, "i") } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(skillIds.length > 0
          ? [{ requirementSkills: { $all: skillIds } }]
          : []),
        ...(isNaN(Number(search))
          ? []
          : [{ numberOfCruiment: Number(search) }]),
      ];

      query.$or = searchQuery;
    }

    if (!city && search) {
      const searchQuery = [
        { title: { $regex: new RegExp(search, "i") } },
        { description: { $regex: new RegExp(search, "i") } },
        { experienceLevel: { $regex: new RegExp(search, "i") } },
        { position: { $regex: new RegExp(search, "i") } },
        { type: { $regex: new RegExp(search, "i") } },
        { salary: { $regex: new RegExp(search, "i") } },
        { requirements: { $regex: new RegExp(search, "i") } },
        { interest: { $regex: new RegExp(search, "i") } },
        ...(categoryIds.length > 0 ? [{ category: { $in: categoryIds } }] : []),
        ...(skillIds.length > 0
          ? [{ requirementSkills: { $all: skillIds } }]
          : []),

        ...(isNaN(Number(search))
          ? []
          : [{ numberOfCruiment: Number(search) }]),
      ];

      query.$or = searchQuery;
    }

    if (categoryIds.length > 0) {
      query.category = { $in: categoryIds };
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

const checkCandidateWithAllJobsSkillsController = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    const candidateSkills = candidate.skill || [];
    const jobs = await jobModel.find({ status: true });
    const matchingJobs = [];

    for (let job of jobs) {
      if (!Array.isArray(job.requirementSkills)) {
        continue;
      }

      const jobSkills = job.requirementSkills;

      const matchingSkills = candidateSkills.filter((skillId) =>
        jobSkills.includes(skillId)
      );

      if (matchingSkills.length > 0) {
        matchingJobs.push({
          jobId: job._id,
          companyId: job.company,
          title: job.title,
          description: job.description,
          requirementSkills: job.requirementSkills,
          requirements: job.requirements,
          interest: job.interest,
          salary: job.salary,
          experienceLevel: job.experienceLevel,
          position: job.position,
          street: job.street,
          city: job.city,
          type: job.type,
          numberOfCruiment: job.numberOfCruiment,
          expiredAt: job.expiredAt,
          category: job.category,
        });
      }
    }

    if (matchingJobs.length > 0) {
      return res.status(200).json({
        success: true,
        matchingJobs,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No jobs with matching skills found",
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports.checkCandidateWithAllJobsSkillsController =
  checkCandidateWithAllJobsSkillsController;
module.exports.searchJobsController = searchJobsController;
module.exports.getAllJobsPendingController = getAllJobsPendingController;
module.exports.getAllJobsReJectedController = getAllJobsReJectedController;
module.exports.getJobsFalseByCompanyIdController =
  getJobsFalseByCompanyIdController;
module.exports.getJobsNotStatusByCompanyIdController =
  getJobsNotStatusByCompanyIdController;
module.exports.getAllJobsStatusTrueController = getAllJobsStatusTrueController;
module.exports.updateJobStatusController = updateJobStatusController;
module.exports.deleteJobController = deleteJobController;
module.exports.updateJobController = updateJobController;
module.exports.getJobByIdController = getJobByIdController;
module.exports.getJobsByCompanyIdController = getJobsByCompanyIdController;
module.exports.getJobsTrueByCompanyIdController =
  getJobsTrueByCompanyIdController;
module.exports.getAllJobsController = getAllJobsController;
module.exports.createJobController = createJobController;
