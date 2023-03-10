const { validationResult } = require("express-validator");
const response = require("../lib/response");
const constant = require("../constants/constants");
const jwt = require("jsonwebtoken");
const query = require("../lib/queries/users");
const verificationQuery = require("../lib/queries/verification");
const { generateOtp } = require("../middlewares/otpGenerator");
const { checkTimeDifferance } = require("../middlewares/timeDifferance");
const getPagination = (page, size) => {
  const limit = size ? +size : 3;
  const offset = page ? page * limit : 0;

  return { limit, offset };
};

const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: users } = data;
  const currentPage = page ? +page : 0;
  const totalPages = Math.ceil(totalItems / limit);

  return { totalItems, totalPages, currentPage, users };
};

const genNewToken = async (payload, res) => {
  try {
    const expireIn = constant.jwt.ADMIN_TOKEN_EXPIRE;
    var token = jwt.sign(payload, constant.jwt.SECRET, {
      expiresIn: expireIn || constant.jwt.EXPIRE, // expires in 24 hours
    });
    return token;
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      "Error in generating token",
      null,
      res
    );
  }
};

// Retrieve all Users from the database.
exports.signUp = async (req, res) => {
  console.log(req);
  const mobileNo = parseInt(req.body.mobileNo);
  try {
    let errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return response.sendResponse(
        constant.response_code.BAD_REQUEST,
        null,
        null,
        res,
        errors
      );
    }
    let User = await query.getUserByMobileNo(mobileNo);
    if (!User) {
      req.body["role"]="USER"
      User = await query.create(req.body);
    }
    let otp = generateOtp();

    let verificationTable = await verificationQuery.getUserById(User.id);
    if (!verificationTable) {
      await verificationQuery.createVerifications({
        userId: User.id,
        otp: otp,
        otpGeneratedAt: Math.floor(Date.now()),
      });
    } else {
      await verificationQuery.updateVerifications(
        { otp: otp, otpGeneratedAt: Math.floor(Date.now()) },
        {
          userId: User.id,
        }
      );
    }
    return response.sendResponse(
      constant.response_code.SUCCESS,
      "Otp sent successfully",
      { otp: otp },
      res
    );
  } catch (err) {
    console.log(err);
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res
    );
  }
};

// Retrieve all Users from the database.
exports.userLogin = async (req, res) => {
  const mobileNo = req.body.mobileNo;
  const otp = parseInt(req.body.otp);
  try {
    let errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return response.sendResponse(
        constant.response_code.BAD_REQUEST,
        null,
        null,
        res,
        errors
      );
    }

    let User = await query.getUserByMobileNo(mobileNo);
    if (!User) {
      return response.sendResponse(
        constant.response_code.NOT_FOUND,
        `Cannot find User with mobileNo=${mobileNo}.`,
        null,
        res,
        errors
      );
    } else {
      let verification = await verificationQuery.getUserById(User.id);
      if (checkTimeDifferance(verification.otpGeneratedAt) >= 1) {
        return response.sendResponse(
          constant.response_code.EXPIRED,
          `Otp has been expired`,
          null,
          res,
          errors
        );
      } else if (verification.otp !== otp) {
        return response.sendResponse(
          constant.response_code.UNAUTHORIZED,
          `OTP does not match`,
          null,
          res,
          errors
        );
      } else {
        var user = User;
        var userDataForToken = {
          id: user.id,
          name: user.name,
          role: user.role,
          mobileNo: user.mobileNo,
        };
        let token = await genNewToken(userDataForToken, res);
        await verificationQuery.updateVerifications(
          { token: token, tokenGeneratedAt: Math.floor(Date.now()) },
          {
            userId: User.id,
          }
        );

        const data = await query.getSingle({where:{id:User.id}});
        return response.sendResponse(
          constant.response_code.SUCCESS,
          "Success",
          {...data.dataValues,token},
          res
        );
      }
    }
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res
    );
  }
};


// Retrieve all user from the database.
exports.findAll = async (req, res) => {
  try {
    const { page, size } = req.query;
    const { limit, offset } = getPagination(page, size);
    let UserList = await query.getAllWithPagination({
      limit,
      offset,
    });
    console.log(UserList);
    const result = getPagingData(UserList, page, limit);
    return response.sendResponse(
      constant.response_code.SUCCESS,
      "Success",
      result,
      res
    );
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res
    );
  }
};

// Retrieve all Users from the database.
exports.findAllWithoutPagination = async (req, res) => {
  try {
    let UserList = await query.getAll({});
    return response.sendResponse(
      constant.response_code.SUCCESS,
      "Success",
      UserList,
      res
    );
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res
    );
  }
};

// Find a single User with an id
exports.findOne = async (req, res) => {
  try {
    let errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return response.sendResponse(
        constant.response_code.BAD_REQUEST,
        null,
        null,
        res,
        errors
      );
    }
    let id = req.body.id;
    const User = await query.getSingle({ id });
    if (User == null || !User) {
      return response.sendResponse(
        constant.response_code.NOT_FOUND,
        `Cannot find User with id=${id}.`,
        null,
        res,
        errors
      );
    } else {
      return response.sendResponse(
        constant.response_code.SUCCESS,
        "Success.",
        User,
        res
      );
    }
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res,
      err
    );
  }
};

// Update a User by the id in the request
exports.update = async (req, res) => {
  try {
    let body = req.body;
    let token = JSON.parse(req?.token);
    const userId = req.params.id;
    let errors = await validationResult(req);
    if (!errors.isEmpty()) {
      return response.sendResponse(
        constant.response_code.BAD_REQUEST,
        null,
        null,
        res,
        errors
      );
    }
    const User = await query.getSingle({ where: { id: userId } });
    if (User == null || !User) {
      return response.sendResponse(
        constant.response_code.NOT_FOUND,
        `Cannot find User with id=${userId}.`,
        null,
        res,
        errors
      );
    } else {
      // update User

      const { role } = body;

      if (
        (token.id !== User.id || (role !== token.role && role)) &&
        token.role != "ADMIN"
      ) {
        return response.sendResponse(
          constant.response_code.UNAUTHORIZED,
          `This role doesn't have access to update.`,
          null,
          res,
          errors
        );
      }

      let data = await query.update(body, { id: userId });
      return response.sendResponse(
        constant.response_code.SUCCESS,
        "success",
        data,
        res,
        errors
      );
    }
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res,
      err
    );
  }
};

// Delete a user with the specified id in the request
exports.delete = async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const User = await query.getSingle({ where: { id } });
    if (User == null || !User) {
      errors.errors.push({
        msg: `Cannot find User with id=${id}.`,
      });
      return response.sendResponse(
        constant.response_code.NOT_FOUND,
        null,
        null,
        res,
        errors
      );
    } else {
      // delete user
      await query.deleteUser({
        where: { id: id },
      });
      return response.sendResponse(
        constant.response_code.SUCCESS,
        "Success.",
        null,
        res
      );
    }
  } catch (err) {
    return response.sendResponse(
      constant.response_code.INTERNAL_SERVER_ERROR,
      err.message || constant.STRING_CONSTANTS.SOME_ERROR_OCCURED,
      null,
      res,
      err
    );
  }
};
