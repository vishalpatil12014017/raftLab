const { check, param,header } = require("express-validator");
const Errors = {
	POST: [
		check("name", "name should not be empty").optional().notEmpty(),
		check("email", "email should be valid and not empty").optional().isEmail().notEmpty(),
		check("mobileNo", "mobileNo should be Numeric and length must be 10 digit")
			.isNumeric()
			.isInt({ gt: 999999999 })
			.notEmpty()
			.isLength({ min: 10, max: 10 }),
		check("password", "password should not empty and length must be 8 to 16 digits").optional().notEmpty().isLength({ min: 8, max: 16 })
	],
	PUT: [
		check("name", "name should not be empty").optional().notEmpty(),
		check("email", "email should be valid and not empty").optional().isEmail().notEmpty(),
		check("mobileNo", "mobileNo should be Numeric and length must be 10 digit")
			.optional()
			.isInt({ gt: 999999999 })
			.isNumeric()
			.notEmpty()
			.isLength({ min: 10, max: 10 }),
		check("password", "password should not empty and length must be 8 to 16 digits").optional().notEmpty().isLength({ min: 8, max: 16 }),
	],
	LOGIN:[
		check("mobileNo", "mobileNo should be Numeric and length must be 10 digit")
		.isInt({ gt: 999999999 })
		.isNumeric()
		.notEmpty()
		.isLength({ min: 10, max: 10 }),
		check("otp", "Otp should be Numeric and length must be 6 digit")
		.isInt({ gt: 99999 })
		.isNumeric()
		.notEmpty()
		.isLength({ min: 6, max: 6 }),
	]
};
module.exports = Errors;
