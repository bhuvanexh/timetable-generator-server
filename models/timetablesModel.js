import mongoose from "mongoose";

const timetableSchema = mongoose.Schema(
    {
        course: {
            type: String,
            required: true
        },
        branch: {
            type: String,
            required: true
        },
        semester: {
            type: String,
            required: true
        },
        section: {
            type: String,
            required: true
        },
        timetable: {
            Monday: {
                type: mongoose.Schema.Types.Mixed
            },
            Tuesday: {
                type: mongoose.Schema.Types.Mixed
            },
            Wednesday: {
                type: mongoose.Schema.Types.Mixed
            },
            Thursday: {
                type: mongoose.Schema.Types.Mixed
            },
            Friday: {
                type: mongoose.Schema.Types.Mixed
            },
            Saturday: {
                type: mongoose.Schema.Types.Mixed
            }
        }
    },
    {
        timestamps: true
    }
);

export const Timetable = mongoose.model('Timetable', timetableSchema);
