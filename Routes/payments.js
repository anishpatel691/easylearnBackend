// routes/payments.js
const express = require('express');
const router = express.Router();
const Payment = require('../Models/Payment.model.js');

// Create a new payment record
router.post('/create', async (req, res) => {
  try {
    const { sessionId, amount, description, userDetails } = req.body;
    
    const newPayment = new Payment({
      sessionId,
      amount,
      description,
      userDetails,
      status: 'pending'
    });
    
    await newPayment.save();
    
    res.status(201).json({
      success: true,
      data: newPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update payment status
router.put('/update/:sessionId', async (req, res) => {
  try {
    const { status } = req.body;
    const { sessionId } = req.params;
    
    const payment = await Payment.findOneAndUpdate(
      { sessionId },
      { status },
      { new: true }
    );
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get payment by session ID
router.get('/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const payment = await Payment.findOne({ sessionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;