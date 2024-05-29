import express from 'express'
import passport from 'passport';
import { Teacher } from '../models/teachersModel.js';
import { createTeacher } from '../controllers/teacherClass.js'
import constraints from "../controllers/constraints.js"
import bcrypt from "bcrypt"
import { validate } from "validate.js";

const router = express.Router()

const ADMIN_ID = '493e3bab-20bf-4a16-a211-3a668752d510';

export const requireAdmin = async (req, res, next) => {
    try {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userId = req.user.id;

        if (userId === ADMIN_ID) {
            return next();
        } else {
            return res.status(403).json({ message: 'Access denied (not an admin)' });
        }
    } catch (error) {
        console.error('Error in requireAdmin middleware:', error);
        return res.status(500).json({ message: 'Internal server error', error });
    }
};


export const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            message: 'acess denied'
        })
    } else {
        next()
    }
}


router.post('/register', async (req, res) => {
    try {
        const { email, name } = req.body;
        const existingTeacher = await Teacher.findOne({ $or: [{ email }, { name }] });
        if (existingTeacher) {
            return res.status(400).json({ message: `${existingTeacher.email === email ? 'Email' : 'name'} is already in use` });
        }

        let response = await createTeacher(req.body)
        if (response.errMsg) {
            console.log(response);
            return res.status(401).json({
                message: response.errMsg,
            })
        }
        let response2 = await Teacher.create(response)
        res.status(200).json({
            teacher: response2,
        })
    } catch (error) {
        console.log(error, 'error');
        return res.status(500).json({
            message: 'internal server error',
            error: error
        })
    }
})


router.post('/login', (req, res, next) => {
    console.log('1 login handler');
    passport.authenticate('local', (err, teacher) => {
        console.log('3 passport authenticate cb', err, teacher);

        if (err) {
            return res.status(401).json({
                message: 'Access denied (some error occurred)', error: err
            });
        }
        if (!teacher) {
            // 
            return res.status(401).json({
                message: 'email or password incorrect'
            })
        }

        req.logIn(teacher, (err) => {
            if (err) {
                return next(err);
            }
            res.status(200).json({
                teacher: teacher
            });
        });
    })(req, res, next)
})

router.post('/login/admin', (req, res, next) => {
    console.log('1 admin login handler');
    passport.authenticate('local', (err, teacher) => {
        console.log('3 admin passport authenticate cb', err, teacher);
        if (err) {
            return res.status(401).json({ message: 'Access denied (some error occurred)' });
        }
        if (!teacher) {
            return res.status(401).json({ message: 'Email or password incorrect' });
        }

        if (teacher.isAdmin) {
            req.logIn(teacher, (err) => {
                if (err) {
                    return next(err);
                }
                return res.status(200).json({ teacher });
            });
        } else {
            return res.status(401).json({ message: 'Access denied (not an admin)' });
        }
    })(req, res, next);
});


router.post('/update-schedule', async (req, res) => {
    try {
        const scheduleUpdates = req.body;

        for (const [teacherName, schedule] of Object.entries(scheduleUpdates)) {
            const teacher = await Teacher.findOne({ name: teacherName });
            if (!teacher) {
                console.log(`Teacher ${teacherName} not found. Skipping.`);
                continue;
            }
            teacher.teacherSchedule = schedule;
            await teacher.save();
        }
        const allTeachers = await Teacher.find({});

        res.status(200).json({ teachers: allTeachers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});



router.get('/teacher', requireAuth, async (req, res) => {
    try {
        console.log('request');
        const teacher = await Teacher.findOne({ id: req.user?.id })

        if (!teacher) {
            return res.status(404).json({
                msg: 'teacher not found'
            })
        }

        let isAdmin = teacher.id == ADMIN_ID
        res.status(200).json({
            id: teacher.id,
            teacher: teacher,
            isAdmin
        })
    } catch (error) {
        console.log(error);
        req.status(500).json({ message: 'failed to get teacher, server error', error })
    }
})

router.post('/logout', async (req, res) => {
    try {
        req.logOut()

        res.status(200).json({
            message: 'Logout successful'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
})

router.get('/teachers', requireAuth, async (req, res) => {
    try {
        console.log('request');
        const teachers = await Teacher.find({})

        res.status(200).json({
            teachers: teachers
        })
    } catch (error) {
        console.log(error);
        req.status(500).json({ message: 'failed to get teacher, server error', error })
    }
})



router.delete('/:teacherId', requireAdmin, async (req, res) => {
    try {
        const { teacherId } = req.params;

        const deletedTeacher = await Teacher.findOneAndDelete({ id: teacherId });

        if (!deletedTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});



router.put('/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;

        if (req.body.password) {
            let msg3 = validate.single(req.body.password, constraints.password())
            if (msg3) {
                // return { errMsg: msg3 }
            } else {
                let passwordHash = await bcrypt.hash(req.body.password, 10)

                const updatedTeacher = await Teacher.findOneAndUpdate(
                    { id: teacherId },
                    { passwordHash },
                    { new: true }
                );
                if (!updatedTeacher) {
                    return res.status(404).json({ message: 'Teacher not found' });
                }
                res.status(200).json(updatedTeacher);
            }
        } else {
            const updatedTeacher = await Teacher.findOneAndUpdate(
                { id: teacherId },
                req.body,
                { new: true }
            );

            if (!updatedTeacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }

            res.status(200).json(updatedTeacher);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});
router.put('/:teacherId/lock', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { id: teacherId },
            req.body,
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});



router.post('/:teacherId/data', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const data = req.body;
        const teacher = await Teacher.findOne({ id: teacherId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher.teacherData.push(data);

        const updatedTeacher = await teacher.save();
        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

router.put('/:teacherId/data/:dataId', async (req, res) => {
    try {
        const { teacherId, dataId } = req.params;
        const updateFields = req.body;

        const updatedTeacher = await Teacher.findOneAndUpdate(
            { id: teacherId, 'teacherData.id': dataId },
            { $set: { 'teacherData.$': updateFields } },
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Teacher or data element not found' });
        }

        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});


router.delete('/:teacherId/data/:dataId', async (req, res) => {
    try {
        const { teacherId, dataId } = req.params;

        const teacher = await Teacher.findOne({ id: teacherId });

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        teacher.teacherData = teacher.teacherData.filter(item => item.id !== dataId);

        const updatedTeacher = await teacher.save();

        res.status(200).json(updatedTeacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

export default router
