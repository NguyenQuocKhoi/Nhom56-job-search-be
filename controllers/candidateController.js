const userModel = require("../models/User");
const candidateModel = require("../models/Candidate");
const skillModel = require("../models/Skill");
const jobModel = require("../models/Job");
const applicationModel = require("../models/Application");
const { getDataUri } = require("../utils");
const cloudinary = require("cloudinary");
const mongoose = require("mongoose");

const updateCandidateController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("name email");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let candidate = await candidateModel.findById(userId).select("-__v");

    if (!candidate) {
      candidate = new candidateModel({
        _id: userId,
        name: user.name,
        email: user.email,
      });
    }
    const {
      phoneNumber,
      // address,
      city,
      street,
      gender,
      dateOfBirth,
      skill,
      experience,
      education,
      moreInformation,
      name,
    } = req.body;

    candidate.name = name || user.name;
    candidate.phoneNumber = phoneNumber;
    // candidate.address = address;
    (candidate.street = street),
      (candidate.city = city),
      (candidate.gender = gender || candidate.gender);
    candidate.dateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : candidate.dateOfBirth;
    // candidate.skill = skill;

    if (Array.isArray(skill)) {
      candidate.skill = skill.map((id) => {
        return mongoose.Types.ObjectId.isValid(id)
          ? new mongoose.Types.ObjectId(id)
          : id;
      });
    }

    candidate.experience = experience;
    candidate.education = education;
    candidate.moreInformation = moreInformation;
    candidate.lastModified = Date.now();
    candidate.email = user.email;

    user.name = candidate.name;
    await candidate.save();

    await user.save();
    await candidate.populate("skill", "skillName");

    res.status(200).send({
      success: true,
      message: "Candidate updated successfully",
      candidate: candidate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Candidate API",
      error,
    });
  }
};

const uploadCVController = async (req, res) => {
  try {
    const candidateId = req.params.id;
    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).send({
        success: false,
        message: "candidate not found",
      });
    }
    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    if (cloudResponse) {
      candidate.resume = cloudResponse.secure_url;
      candidate.resumeOriginalName = file.originalname;
    }

    candidate.lastModified = Date.now();
    await candidate.save();

    res.status(200).send({
      success: true,
      message: "Candidate upload cv successfully",
      candidate: candidate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Upload CV API",
      error,
    });
  }
};

const updateAvatarController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("name");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    let candidate = await candidateModel.findById(userId).select("-__v");
    if (!candidate) {
      candidate = new candidateModel({
        _id: userId,
        name: user.name,
      });
    }

    const file = req.file;
    const fileUri = getDataUri(file);
    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);

    if (cloudResponse) {
      candidate.avatar = cloudResponse.secure_url;
    }

    candidate.lastModified = Date.now();
    await candidate.save();

    res.status(200).send({
      success: true,
      message: "Candidate updated successfully",
      candidate: candidate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Update Avatar Candidate API",
      error,
    });
  }
};

const getCandidateByIdController = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userModel.findById(userId).select("name email");
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }
    let candidate = await candidateModel.findById(userId).select("-__v");
    if (!candidate) {
      candidate = new candidateModel({
        _id: userId,
        name: user.name,
        email: user.email,
      });
    }
    if (!candidate) {
      return res.status(404).send({
        success: false,
        message: "Candidate not found",
      });
    }

    await candidate.save();

    res.status(200).send({
      success: true,
      message: "Get Candidate successfully",
      candidate: candidate,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Get Candidate  API",
      error,
    });
  }
};

const updateCandidateStatusController = async (req, res) => {
  try {
    const { candidateId, status } = req.body;

    if (!candidateId) {
      return res.status(400).send({
        success: false,
        message: "Please provide candidate ID",
      });
    }

    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).send({
        success: false,
        message: "candidate not found",
      });
    }

    candidate.status = status;
    candidate.lastModified = Date.now();
    await candidate.save();

    return res.status(200).send({
      success: true,
      message: `Candidate status updated to ${status}`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({
      success: false,
      message: "An error occurred while updating the candidate status.",
    });
  }
};

const getAllCandidatesController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const candidates = await candidateModel
      .find()
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCandidates = await candidateModel.countDocuments();

    const totalPages = Math.ceil(totalCandidates / limit);

    res.status(200).send({
      success: true,
      message: "Candidates fetched successfully",
      candidates,
      totalCandidates,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in get all candidates API",
      error,
    });
  }
};

const searchCandidatesController = async (req, res) => {
  try {
    const { city = "", search = "", page = 1 } = req.body;

    const limit = 16;
    const skip = (page - 1) * limit;

    let query = {
      // status: true,
    };

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
      // const skillNames = search.split(",").map((skill) => skill.trim());
      // const skills = await skillModel.find({
      //   skillName: { $in: skillNames.map((name) => new RegExp(name, "i")) },
      // });
      // skillIds = skills.map((skill) => skill._id);

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
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
        // { skill: { $regex: new RegExp(search, "i") } },
        { gender: { $regex: new RegExp(search, "i") } },
        { education: { $regex: new RegExp(search, "i") } },
        { experience: { $regex: new RegExp(search, "i") } },
        ...(skillIds.length > 0 ? [{ skill: { $all: skillIds } }] : []),
      ];

      query.$or = searchQuery;
    }

    if (!city && search) {
      const searchQuery = [
        { name: { $regex: new RegExp(search, "i") } },
        { email: { $regex: new RegExp(search, "i") } },
        { phoneNumber: { $regex: new RegExp(search, "i") } },
        // { skill: { $regex: new RegExp(search, "i") } },
        { gender: { $regex: new RegExp(search, "i") } },
        { education: { $regex: new RegExp(search, "i") } },
        { experience: { $regex: new RegExp(search, "i") } },
        ...(skillIds.length > 0 ? [{ skill: { $all: skillIds } }] : []),
      ];

      query.$or = searchQuery;
    }

    const sort = { createdAt: 1 };

    const candidateResults = await candidateModel
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalCandidateResults = await candidateModel.countDocuments(query);

    res.status(200).json({
      success: true,
      candidates: candidateResults,
      pagination: {
        page,
        limit,
        totalResults: totalCandidateResults,
        totalPages: Math.ceil(totalCandidateResults / limit),
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

const toggleAutoSearchJobsForCandidate = async (req, res) => {
  try {
    const { candidateId, autoSearchJobs } = req.body;
    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    candidate.autoSearchJobs = autoSearchJobs;
    await candidate.save();

    if (!autoSearchJobs) {
      return res.status(200).json({
        success: true,
        message: "autoSearchJobs disabled for the candidate",
      });
    }

    const candidateSkills = candidate.skill || [];
    const candidateCity = candidate.city;

    const jobs = await jobModel.find({ status: true });
    const matchingJobs = [];

    for (let job of jobs) {
      if (!Array.isArray(job.requirements)) {
        continue;
      }

      const jobSkills = job.requirements;
      const jobCity = job.city;

      const matchingSkills = candidateSkills.filter((skillId) =>
        jobSkills.includes(skillId)
      );

      if (matchingSkills.length >= 3 && candidateCity === jobCity) {
        const existingApplication = await applicationModel.findOne({
          candidate: candidateId,
          job: job._id,
        });

        if (existingApplication) {
          continue;
        }

        const newApplication = await applicationModel.create({
          candidate: candidateId,
          job: job._id,
          submittedAt: new Date(),
          status: "pending",
          resume: candidate.resume,
        });

        job.applications.push(newApplication._id);
        await job.save();

        matchingJobs.push({
          jobId: job._id,
          companyId: job.company,
        });
      }
    }

    if (matchingJobs.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Applications automatically created for matching jobs",
        matchingJobs,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No jobs with matching skills and city found",
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

const checkAndAutoApplyJobs = async (req, res) => {
  try {
    const { candidateId } = req.body;

    const candidate = await candidateModel.findById(candidateId);
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found",
      });
    }

    if (!candidate.autoSearchJobs) {
      return res.status(200).json({
        success: true,
        message:
          "autoSearchJobs is disabled. No automatic applications will be created.",
      });
    }

    const candidateSkills = candidate.skill || [];
    const candidateCity = candidate.city;

    const jobs = await jobModel.find({ status: true });
    const matchingJobs = [];

    for (let job of jobs) {
      if (!Array.isArray(job.requirementSkills)) {
        continue;
      }

      const jobSkills = job.requirementSkills;
      const jobCity = job.city;

      const matchingSkills = candidateSkills.filter((skillId) =>
        jobSkills.includes(skillId)
      );

      if (matchingSkills.length >= 3 && candidateCity === jobCity) {
        const existingApplication = await applicationModel.findOne({
          candidate: candidateId,
          job: job._id,
        });

        if (existingApplication) {
          continue;
        }

        const newApplication = await applicationModel.create({
          candidate: candidateId,
          job: job._id,
          submittedAt: new Date(),
          status: "pending",
          resume: candidate.resume,
        });

        job.applications.push(newApplication._id);
        await job.save();

        matchingJobs.push({
          jobId: job._id,
          companyId: job.company,
        });
      }
    }

    if (matchingJobs.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Applications automatically created for matching jobs",
        matchingJobs,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: "No jobs with matching skills and city found",
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

module.exports.checkAndAutoApplyJobs = checkAndAutoApplyJobs;
module.exports.toggleAutoSearchJobsForCandidate =
  toggleAutoSearchJobsForCandidate;
module.exports.searchCandidatesController = searchCandidatesController;
module.exports.getAllCandidatesController = getAllCandidatesController;
module.exports.updateCandidateStatusController =
  updateCandidateStatusController;
module.exports.uploadCVController = uploadCVController;
module.exports.getCandidateByIdController = getCandidateByIdController;
module.exports.updateCandidateController = updateCandidateController;
module.exports.updateAvatarController = updateAvatarController;
