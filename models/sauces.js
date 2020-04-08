const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    heat: { type: Number, required: true },
    userId: { type: String, required: true },
    imageUrl: { type: String, required: true },
    likes: { type: String, required: true },
    dislikes: { type: String, required: true },
    usersliked: { type: Array, required: true },
    usersdisliked: { type: Array, required: true },
});


module.exports = mongoose.model('Sauce', sauceSchema);