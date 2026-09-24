import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name : {type : String, required : true},
        slug : {type :String, required : true},
        displayOrder : {type :Number, default: 0 },

        restaurantId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Restaurant",
            required : true
        }},
        {timestamps :true}

    
)

export default mongoose.model("Category", categorySchema);
