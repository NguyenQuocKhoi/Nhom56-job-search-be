const candidateModel = require("../models/Candidate");
const jobModel = require("../models/Job");
const companyModel = require("../models/Company")
const applicationModel = require("../models/Application");
const notificationModel = require("../models/notification");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

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
      resume: candidate.resume,
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

const updateApplicationStatusController = async (req, res) => {
  try {
    const { applicationId, status } = req.body;
    if (!applicationId || !status) {
      return res.status(400).send({
        success: false,
        message: "Please provide application ID and status",
      });
    }

    const application = await applicationModel
      .findById(applicationId)
      .populate("candidate")
      .populate("job");

    if (!application) {
      return res.status(404).send({
        success: false,
        message: "Application not found",
      });
    }

    const company = await companyModel.findById(application.job.company);
    if (!company) {
      return res.status(404).send({
        success: false,
        message: "Company not found",
      });
    }

    application.status = status;
    await application.save();

    const candidateEmail = application.candidate.email;
    const companyName = company.name;
    const workAddress = application.job.address; 
    const companyEmail = company.email; 
    const subject =
      status === "accepted"
        ? `Invitation to Interview for the Position of ${application.job.title} at ${companyName}`
        : `Application Status Update: ${application.job.title} at ${companyName}`;

    const text =
      status === "accepted"
        ? `Dear ${application.candidate.name},\n\nCongratulations! We are pleased to inform you that your application for the position of ${application.job.title} at ${companyName} has been approved. We would like to invite you for an interview at our office located at ${workAddress}.\n\nPlease reply to this email to confirm your availability. We look forward to meeting you.\n\nThank you for your interest in joining our team.\n\nBest regards,\n${companyName}`
        : `Dear ${application.candidate.name},\n\nThank you for applying for the position of ${application.job.title} at ${companyName}. After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.\n\nWe appreciate the time and effort you invested in your application and encourage you to apply for future openings that match your skills and experience.\n\nThank you again for your interest in ${companyName}.\n\nBest regards,\n${companyName}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: companyEmail,
      to: candidateEmail,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions);

    const notificationMessage =
      status === "accepted"
      ? `Your application for the position of ${application.job.title} at ${companyName} has been approved! You have been invited for an interview at ${workAddress}.`
      : `Your application for the position of ${application.job.title} at ${companyName} has been rejected.`;

    const notification = new notificationModel({
      candidate: application.candidate._id,
      message: notificationMessage,
      status: false,
    });

    await notification.save();

    return res.status(200).send({
      success: true,
      message: `Application status updated to ${status} and notification sent to candidate.`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the application status.",
    });
  }
};

const getApplyByCanididateIdController = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const applications = await applicationModel
      .find({ candidate: candidateId })
      .sort({ submittedAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalApplications = await applicationModel.countDocuments({ candidate: candidateId });

    if (!applications || applications.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No apply found for this candidate",
      });
    }

    res.status(200).send({
      success: true,
      message: "Applications fetched successfully",
      applications,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get apply by candidate ID API",
      error,
    });
  }
};

const getAllApplicationController = async (req, res) => {
  try {
    const { page = 1, limit = 16 } = req.query;
  
    const applications = await applicationModel
      .find()
      .sort({ submittedAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalApplications = await applicationModel.countDocuments();
    res.status(200).send({
      success: true,
      message: "Applications fetched successfully",
      applications,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all applications API",
      error,
    });
  }
};

const getApplyByJobIdController = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const applications = await applicationModel
      .find({ job: jobId })
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalApplications = await applicationModel.countDocuments({ job: jobId });

    if (!applications || applications.length === 0) {
      return res.status(404).send({
        success: false,
        message: "No apply found for this job",
      });
    }

    res.status(200).send({
      success: true,
      message: "Applications fetched successfully",
      applications,
      totalApplications,
      totalPages: Math.ceil(totalApplications / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get apply by job ID API",
      error,
    });
  }
};

const getApplicationByCandidateAndJobController = async (req, res) => {
  try {
    const { candidateId, jobId } = req.body;
    const application = await applicationModel.findOne({
      candidate: candidateId,
      job: jobId,
    }).populate("candidate job", "-__v");

    if (!application) {
      return res.status(404).send({
        success: false,
        message: "Application not found",
      });
    }

    res.status(200).send({
      success: true,
      message: "Application retrieved successfully",
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


module.exports.getApplicationByCandidateAndJobController = getApplicationByCandidateAndJobController;
module.exports.getApplyByJobIdController = getApplyByJobIdController
module.exports.getAllApplicationController = getAllApplicationController
module.exports.getApplyByCanididateIdController = getApplyByCanididateIdController;
module.exports.updateApplicationStatusController = updateApplicationStatusController;
module.exports.getApplicationByIdController = getApplicationByIdController;
module.exports.submitApplicationController = submitApplicationController;
