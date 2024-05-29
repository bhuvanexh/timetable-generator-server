import mongoose from "mongoose";

const subjectSchema = mongoose.Schema(
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
        subjects: {
            type: [
                {
                    name: String,
                    id: String,
                    isEditing: Boolean
                }
            ],
            required: true
        },
    },
    {
        timestamps: true
    }
);

export const Subject = mongoose.model('Subject', subjectSchema);
