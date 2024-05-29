import express from 'express';
import { Timetable } from '../models/timetablesModel.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const allTimetables = await Timetable.find({});
        res.status(200).json(allTimetables);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});

// router.get('/:course', async (req, res) => {
//     try {
//         const { course } = req.params;
//         const timetables = await Timetable.find({ course: course });
//         res.status(200).json(timetables);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error', error: err });
//     }
// });

// router.get('/:course/:semester', async (req, res) => {
//     try {
//         const { course, semester } = req.params;
//         const timetable = await Timetable.findOne({ course: course, semester: semester });
//         res.status(200).json(timetable);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error', error: err });
//     }
// });

router.post('/', async (req, res) => {
    try {
        const timetables = req.body;
        await Timetable.deleteMany({});

        for (const timetable of timetables) {
            const newTimetable = new Timetable(timetable);
            await newTimetable.save();
        }

        res.status(200).json({ message: 'Timetables inserted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


// router.post('/:course', async (req, res) => {
//     try {
//         const { course } = req.params;
//         const timetables = req.body;
//         await Timetable.deleteMany({ course: course });
//         await Timetable.insertMany(timetables);
//         res.status(200).json({ message: `Timetables for ${course} added/updated successfully` });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error', error: err });
//     }
// });

// router.post('/:course/:semester', async (req, res) => {
//     try {
//         const { course, semester } = req.params;
//         const timetable = req.body;
//         await Timetable.findOneAndUpdate({ course: course, semester: semester }, timetable, { upsert: true });
//         res.status(200).json({ message: `Timetable for ${course} ${semester} added/updated successfully` });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Internal server error', error: err });
//     }
// });

export default router;
