const validator = require("validator");

const validateEmail = (email) => {
  const emailCriteria =
    /([a-z0-9_]+|[a-z0-9_]+\.[a-z0-9_]+)@(([a-z0-9]|[a-z0-9]+\.[a-z0-9]+)+\.([a-z]{2,4}))/i;
  if (validator.isEmail(email)) {
    return {
      success: true,
      message: "Valid email",
    };
  } else {
    return {
      success: false,
      message: "Invalid email address",
    };
  }
};

const validatePassword = (password) => {
  const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]{6,}$/;

  if (passwordCriteria.test(password)) {
    return {
      success: true,
      message: "Valid password",
    };
  } else {
    return {
      success: false,
      message:
        "Password includes letters, numbers, upper case, lower case, 6 characters or more",
    };
  }
};

const validateName = (name) => {
  if (name.length >= 3) {
    return {
      success: true,
      message: "Valid name",
    };
  } else {
    return {
      success: false,
      message: "Name must be at least 3 characters long",
    };
  }
};

module.exports.validateEmail = validateEmail;
module.exports.validatePassword = validatePassword;
module.exports.validateName = validateName;
