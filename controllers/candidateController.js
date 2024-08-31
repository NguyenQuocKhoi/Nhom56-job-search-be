const userModel = require("../models/User");
const candidateModel = require("../models/Candidate");
const { getDataUri } = require("../utils");
const cloudinary = require("cloudinary");

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
      address,
      gender,
      dateOfBirth,
      skill,
      experience,
      education,
      moreInformation,
      name,
    } = req.body;
    // if (
    //   !name ||
    //   !phoneNumber
    //   // ||
    //   // ! address ||
    //   // !skill ||
    //   // !experience ||
    //   // !education ||
    //   // !moreInformation
    // ) {
    //   return res.status(400).send({
    //     success: false,
    //     message: "Please provide all required fields",
    //   });
    // }

    candidate.name = name || user.name;
    candidate.phoneNumber = phoneNumber;
    candidate.address = address;
    candidate.gender = gender || candidate.gender;
    candidate.dateOfBirth = dateOfBirth
      ? new Date(dateOfBirth)
      : candidate.dateOfBirth;
    candidate.skill = skill;
    candidate.experience = experience;
    candidate.education = education;
    candidate.moreInformation = moreInformation;
    candidate.lastModified = Date.now();
    candidate.email = user.email;

    user.name = candidate.name;
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



module.exports.updateCandidateStatusController = updateCandidateStatusController
module.exports.uploadCVController = uploadCVController;
module.exports.getCandidateByIdController = getCandidateByIdController;
module.exports.updateCandidateController = updateCandidateController;
module.exports.updateAvatarController = updateAvatarController;
