const Category = require('../models/category.model');

const findAll = async () => {
    return await Category.find().sort({ createAt: -1 });
}

const findById = async (id) => {
    return await Category.findById(id);
}



module.exports = {
    findAll,
    findById,
}