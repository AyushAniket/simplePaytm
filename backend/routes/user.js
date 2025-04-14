const router = require('express').Router();
const JWT_SECRET = require('../config.js');
const jwt = require('jsonwebtoken');
const {Users, Account} = require('../db.js');
const zod = require('zod');
const authMiddleware = require('../middleware.js');

const signupSchema = zod.object({
    firstName: zod.string().min(1, 'First name is required'),
    lastName: zod.string().min(1, 'Last name is required'),
    password: zod.string().min(6, 'Password must be at least 6 characters long'),
    username: zod.string().email()
});

router.post('/signup', async (req,res) => {
    const body = req.body;
    const parsedBody = signupSchema.safeParse(body);

    if (!parsedBody.success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    const existingUser = await Users.findOne({ username: parsedBody.data.username });

    if (existingUser) {
        return res.status(411).json({ message: "Username already exists" });
    }

    const User  = await Users.create({
        firstName: parsedBody.data.firstName,
        lastName: parsedBody.data.lastName,
        password: parsedBody.data.password,
        username: parsedBody.data.username
    });

    const account = await Account.create({
        userId: User._id,
        balance: 1 + Math.random() * 1000 // random balance between 0 and 1000
    });

    //send back jwt token
    const token = jwt.sign({ id: User._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
        message: "User created successfully",
        token: token
    })
})

router.post('/signin', async (req,res) => {
    const body = req.body;

    const existingUser = await Users.findOne({ username: body.username });

    if (!existingUser) {
        return res.status(411).json({ message: "Username does not exist" });
    }

    if (existingUser.password !== body.password) {
        return res.status(411).json({ message: "Incorrect password" });
    }

    //send back jwt token
    const token = jwt.sign({ id: existingUser._id }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
        message: "User signed in successfully",
        token: token
    })

})


const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put('/update', authMiddleware, async (req,res) => {

    const parsedBody = updateBody.safeParse(req.body);
    if (!parsedBody.success) {
        return res.status(411).json({ message: "Incorrect inputs" });
    }

    await Users.updateOne(req,body, { _id: req.user });

    res.json({
        message: "User updated successfully",
    })
})


router.get('bulk'   , authMiddleware, async (req,res) => {
    const filter = req.query.filter || "";

    const users = await Users.find({ 
        $or: [{
            firstName: { $regex: filter, $options: 'i' }}, 
            {lastName: { $regex: filter, $options: 'i' }}] });

    res.json({
        message: "Users fetched successfully",
        users: users.map(user => ({
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                _id: user._id
            }))
    })

})
module.exports = router;