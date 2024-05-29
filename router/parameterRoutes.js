import express from 'express';
import { Parameter } from '../models/parametersModel.js';
import { v4 as uuidv4 } from 'uuid';
import { Subject } from '../models/subjectsModel.js';

const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const parameters = await Parameter.find({});
        res.status(200).json(parameters);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


router.post('/', async (req, res) => {
    try {
        const { course, semesters } = req.body;
        const parameter = new Parameter({
            course,
            semesters,
            branches: []
        });
        const result = await parameter.save();
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});

router.delete('/:course', async (req, res) => {
    try {
        const { course } = req.params;
        let response = await Parameter.findOneAndDelete({ course });
        await Subject.deleteMany({ course })
        console.log(response);
        res.status(200).json({ message: 'Parameter deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});

router.delete('/:course/:branch', async (req, res) => {
    try {
        const { course, branch } = req.params;
        const parameter = await Parameter.findOne({ course });
        if (!parameter) {
            return res.status(404).json({ message: 'Parameter not found' });
        }
        parameter.branches = parameter.branches.filter(b => b.name != branch);
        const updatedParameter = await parameter.save();
        await Subject.findOneAndDelete({ course, branch })
        res.status(200).json(updatedParameter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});

router.post('/:course', async (req, res) => {
    try {
        const { course } = req.params;
        const { name, sections } = req.body;
        const parameter = await Parameter.findOne({ course });
        if (!parameter) {
            return res.status(404).json({ message: 'Parameter not found' });
        }
        const branch = { name, sections };
        parameter.branches.push(branch);
        const updatedParameter = await parameter.save();
        res.status(200).json(updatedParameter);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', error: err });
    }
});


export default router;
