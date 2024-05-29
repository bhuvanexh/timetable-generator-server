import express from 'express'
import passport from 'passport';
import { Subject } from '../models/subjectsModel.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router()



router.get('/', async (req, res) => {
    try {
        let subjects = await Subject.find({});
        res.status(200).json(subjects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


router.get('/:course/:branch/:semester', async (req, res) => {
    try {
        const { course, branch, semester } = req.params;
        const subjects = await Subject.find({ course, branch, semester });
        res.status(200).json(subjects);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});

router.post('/:course/:branch/:semester', async (req, res) => {
    try {
        const { course, branch, semester } = req.params;
        const { subject } = req.body;

        const result = await Subject.findOneAndUpdate(
            { course, branch, semester },
            { $addToSet: { subjects: { name: subject, id: uuidv4(), isEditing: false } } },
            { new: true, upsert: true }
        );

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


router.put('/:course/:branch/:semester/:subjectId', async (req, res) => {
    try {
        const { course, branch, semester, subjectId } = req.params;
        const { data } = req.body;
        let updateFields = {};
        if (data.subject) {
            updateFields['subjects.$.name'] = data.subject;
        }
        updateFields['subjects.$.isEditing'] = data.isEditing;

        const result = await Subject.findOneAndUpdate(
            { course, branch, semester, 'subjects.id': subjectId },
            { $set: updateFields },
            { new: true }
        );

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


router.delete('/:course/:branch/:semester/:subjectId', async (req, res) => {
    try {
        const { course, branch, semester, subjectId } = req.params;
        const result = await Subject.findOneAndUpdate(
            { course, branch, semester },
            { $pull: { subjects: { id: subjectId } } },
            { new: true }
        );

        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


export default router