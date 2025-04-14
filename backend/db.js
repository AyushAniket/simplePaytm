const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://ayushd732:lFXC2KPlZ2Coo2ol@cluster0.tzdgbkv.mongodb.net/Users');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    password: String,
    username: String,
});

const Users = mongoose.model('Users', userSchema);

const accountSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    balance: Number,
});

const Account = mongoose.model('Accounts', accountSchema);
module.exports = {Users, Account};