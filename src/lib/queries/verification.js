const db = require("../../models");
const constants = require("../../constants/constants");

createVerifications = async function (body) {
    return await db[constants.DB.table.VERIFICATION_MASTER].create(body);
};

updateVerifications = async function (obj, query) {
    await db[constants.DB.table.VERIFICATION_MASTER].update(obj, {
        where: query,
    });
};

getAllVerifications = async function (query) {
    return await db[constants.DB.table.VERIFICATION_MASTER].findAndCountAll(query);
};

getUserById = async function (id) {
    return await db[constants.DB.table.VERIFICATION_MASTER].findOne({ where: { userId: id } });
};

getUserVerrificationDetails = async function (query) {
    return await db[constants.DB.table.VERIFICATION_MASTER].findOne(query);
};

deleteVerification = async function (query) {
    return await db[constants.DB.table.VERIFICATION_MASTER].destroy(query);
};

module.exports = {
    createVerifications,
    updateVerifications,
    getUserById,
    getAllVerifications,
    getUserVerrificationDetails,
    deleteVerification
};
