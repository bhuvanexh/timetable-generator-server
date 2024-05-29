import mongoose from "mongoose";

const parameterSchema = mongoose.Schema(
    {
        course: {
            type: String,
            required: true
        },
        branches: {
            type: [
                {
                    name: String,
                    sections: String
                }
            ]
        },
        semesters: {
            type: String,
            required: true
        },
    },
    {
        timestamps: true
    }
);

export const Parameter = mongoose.model('Parameter', parameterSchema);
