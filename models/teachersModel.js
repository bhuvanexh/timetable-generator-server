import mongoose from "mongoose";

const teacherSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            match: [/\S+@\S+\.\S+/, 'is invalid'],
            required: true
        },
        passwordHash: {
            type: String,
            required: true
        },
        id: {
            type: String,
            required: true
        },
        teacherData: [{
            type: mongoose.Schema.Types.Mixed
        }],
        isEditing: {
            type: Boolean
        },
        isLocked: {
            type: Boolean,
        },
        dataVerified: {
            type: Boolean,
        },
        teacherSchedule: {
            type: mongoose.Schema.Types.Mixed
        }
    },
    {
        timeStamps: true
    }
)



export const Teacher = mongoose.model('Teacher', teacherSchema)