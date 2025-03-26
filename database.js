import mongoose from "mongoose";
const DB_NAME = "onlinecourse";

async function fixPaymentIndex() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const payments = collections.find(c => c.name === 'payments');
    
    if (payments) {
      // Drop the problematic index if it exists
      await mongoose.connection.db.collection('payments').dropIndex('paymentId_1').catch(() => {
        console.log('Index not found or already dropped');
      });
      
      // Create new sparse index
      await mongoose.connection.db.collection('payments').createIndex(
        { paymentId: 1 },
        { unique: true, sparse: true }
      );
      console.log('Payment index fixed successfully');
    }
  } catch (error) {
    console.error('Error fixing payment index:', error);
  }
}

async function ConnectDb() {
  try {
    const connectionInstance = await mongoose
      .connect(`${process.env.MONGOODB_URI}/${DB_NAME}`);
    
    console.log(`\nMongoDB connecting ...`);
    console.log(`\nMongoDB connection established! DB Host: ${connectionInstance.connection.name}`);
    
    // Fix payment index after connection is established
    await fixPaymentIndex();
    
    return connectionInstance;
  } catch (error) {
    console.log("Server not connected:", error);
    throw error; // Re-throw to allow caller to handle connection failure
  }
}

export default ConnectDb;