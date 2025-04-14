const express = require('express');
const { Account } = require('../db.js');
const authMiddleware = require('../middleware');
const { default: mongoose } = require('mongoose');

const router = express.Router();

router.get('/balance', authMiddleware, async (req, res) => {
    const acccount = await Account.findOne({ userId: req.user });
    if (!acccount) {
        return res.status(404).json({ message: "Account not found" });
    }

    res.json({
        balance: acccount.balance
    });
})


router.post('/transfer', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    if (!session) {
        throw new Error('Failed to start session');
      }
    session.startTransaction();

    try {
        const { to, amount } = req.body;

        const account = await Account.findOne({ userId: req.user }).session(session);

        if (!account || account.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const toAccount = await Account.findOne({ userId: to }).session(session);
        if (!toAccount) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Recipient account not found" });
        }

        await Account.updateOne({ userId: req.user }, { $inc: { balance: -amount } }).session(session);
        await Account.updateOne({ userId: to }, { $inc: { balance: amount } }).session(session);

        await session.commitTransaction();
        res.json({
            message: "Transfer successful",
        });
    } catch (error) {
        await session.abortTransaction();
        res.status(500).json({ message: "An error occurred during the transaction", error: error.message });
    } finally {
        session.endSession();
    }


})
module.exports = router;