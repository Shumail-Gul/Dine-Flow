import mongoose from "mongoose";
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
    {
    name : {type : String, required: true, trim : true},
    email : {type: String, required : true, unique : true, lowercase :true, trim :true},
    password : {type : String, required : true, minlength: 8},
    role :{type : String, enum : ["admin", "kitchen_staff" ]},
    restaurantId : {type: mongoose.Schema.Types.ObjectId, required: true, }
},
    {timestamps: true}
);

userSchema.pre("save", async function (next) {
    if(!this.modified("password")) return next()
    const salt = await bcrypt.genSalt(10);
 this.password = await bcrypt.hash(this.password,  salt)
 next()
})

userSchema.methods.comparePassword = function (candidatePassword){
    return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model("User", userSchema);
