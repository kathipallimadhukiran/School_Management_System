const mongoose =require('mongoose');
const Schema=mongoose.Schema;
const classSchema=new Schema({
    class_name:{
        type:String,
        required:true
    },
    class_teacher:{
        type:String,
        required:true
    },
    class_students:{
        type:Array,
        required:true
    },
    class_subjects:{
        type:Array,
        required:true
    },
    subject_marks:{
        type:Array,
        required:true
    }
});
exports.Class=mongoose.model('Class',classSchema);