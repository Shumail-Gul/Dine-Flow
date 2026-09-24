import mongoose from "mongoose";

const modifierOptionSchema = new mongoose.Schema({
    label : {type : String, required : true},
    priceDelta : {type: Number, default: 0.00}

})

const modifierSchema = new mongoose.Schema({
    name : {type: String, required :true},
    options : [modifierOptionSchema]
})

const menuItemSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description :{type: String},
    price : {type: Number, required: true},
    categoryId : {
        type: mongoose.Schema.Types.ObjectId,
        ref : "Category",
        required: true
    }, 
        imageUrl : {type: String},
        isAvailable :{type: Boolean, default: true},
        modifiers : [modifierSchema]
     
    
}
, {
    timestamps: true
})

const modifierOption = mongoose.model("ModifierOption", modifierOptionSchema)
const modifier = mongoose.model("Modifier", modifierSchema)
const menuItem = mongoose.model("MenuItem", menuItemSchema)
export {modifierOption, modifier, menuItem}