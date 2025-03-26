import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);
export default Order;
