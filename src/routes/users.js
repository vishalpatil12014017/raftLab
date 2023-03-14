var router = require("express").Router();
const { authorization,authentication } = require("../middlewares/authorization");
const users = require("../controllers/users");
const errors = require("../middlewares/validator/users")

// Sign Up And Generate Otp
router.post("/signUp",errors.POST, users.signUp);

// Retrieve all Users with pagination
router.get("/findall",authentication,authorization, users.findAll);

// Retrieve all Users without pagination
router.get("/findallusers", authentication,authorization, users.findAllWithoutPagination);

// Retrieve a single User with id
router.get("/findone", authentication, users.findOne);

// Update a User with id
router.put("/update/:id",authentication, errors.PUT, users.update);

// delete a User with id
router.delete("/delete/:id",authentication, authorization, users.delete);

// Login with Otp
router.post("/login",errors.LOGIN, users.userLogin);

module.exports = router;
