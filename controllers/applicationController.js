const candidateModel = require("../models/Candidate");
const jobModel = require("../models/Job");
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

    application.status = status;
    await application.save();

    const candidateEmail = application.candidate.email;
    const companyEmail = application.job.companyEmail;

    const subject =
      status === "accepted"
        ? "Your application has been approved!"
        : "Your application has been rejected";
    const text =
      status === "accepted"
        ? `Congratulations! Your application for the position of ${application.job.title} has been approved.`
        : `We regret to inform you that your application for the position of ${application.job.title} has been rejected.`;

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
        ? `Your application for the position of ${application.job.title} has been approved!`
        : `Your application for the position of ${application.job.title} has been rejected.`;

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



module.exports.updateApplicationStatusController = updateApplicationStatusController;
module.exports.getApplicationByIdController = getApplicationByIdController;
module.exports.submitApplicationController = submitApplicationController;
