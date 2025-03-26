// routes/api/qrPayment.js
const express = require('express');
const router = express.Router();
const Payment = require('../../models/Payment');

// Generate a payment link for QR code
router.post('/generate', async (req, res) => {
  try {
    const { amount, name, email } = req.body;
    
    // Create a pending payment record
    const transactionId = 'QR' + Math.floor(Math.random() * 1000000);
    
    const newPayment = new Payment({
      amount,
      name,
      email,
      paymentMethod: 'qr',
      transactionId,
      status: 'pending'
    });
    
    const payment = await newPayment.save();
    
    // Generate a unique URL for this payment
    const paymentUrl = `/payment/${payment._id}`;
    
    res.json({ 
      success: true, 
      paymentUrl,
      transactionId
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Process QR code payment
router.post('/process/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    
    // Update payment status to success
    payment.status = 'success';
    await payment.save();
    
    res.json({ 
      success: true,
      payment
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get QR payment details
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ msg: 'Payment not found' });
    }
    
    res.json(payment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;