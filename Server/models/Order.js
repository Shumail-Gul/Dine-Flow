import mongoose from "mongoose";

export const orderItemSchema = new mongoose.Schema({
    menuItemId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'MenuItem' 
    },
    name: { type: String, required: true },          // Snapshot of item name
    unitPrice: { type: Number, required: true },     // Snapshot of base price at purchase
    quantity: { type: Number, required: true },
    selectedModifiers: [{
      modifierName: String,                          // e.g., "Size"
      optionLabel: String,                           // e.g., "Large"
      priceDelta: Number                             // e.g., 2.50
    }]
  });
  
  const orderSchema = new mongoose.Schema({
    tableNumber: { type: Number, required: true },
    items: [orderItemSchema],                       
    totalAmount: { type: Number, required: true },  
    status: { 
      type: String, 
      enum: ['pending', 'preparing', 'served', 'cancelled'], 
      default: 'pending' 
    }
  }, { timestamps: true });                          // Provides automatic `createdAt`


  export default ("Order", orderSchema)