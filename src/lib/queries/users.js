const db = require("../../models");
const constants = require("../../constants/constants");

create = async function (body) {
    return await db[constants.DB.table.USERS_MASTER].create(body);
};

update = async function (obj, query) {
    await db[constants.DB.table.USERS_MASTER].update(obj, {
        where: query,
    });
};
getAll = async function (query) {
    return await db[constants.DB.table.USERS_MASTER].findAll(query);
};
getAllWithPagination = async function (query) {
    return await db[constants.DB.table.USERS_MASTER].findAndCountAll(query);
};

getUserByMobileNo = async function (mobileNo) {
	const user = await db[constants.DB.table.USERS_MASTER].findOne({
		where: {  mobileNo: mobileNo },
	});
	return user ? user.dataValues : null;
};

getSingle = async function (body) {
    return await db[constants.DB.table.USERS_MASTER].findOne(body);
};

deleteUser = async function (query) {
	return await db[constants.DB.table.USERS_MASTER].destroy(query);
};

module.exports = {
    create,
    update,
    getSingle,
    getAll,
    getAllWithPagination,
    deleteUser,
    getUserByMobileNo
};
