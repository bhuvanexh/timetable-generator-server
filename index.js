import dotenv from 'dotenv';
import express from 'express'
import mongoose from 'mongoose'
import passport from 'passport'
import passport_local from 'passport-local'
import bcrypt from "bcrypt"
import cors from "cors"
import cookieSession from 'cookie-session'
import { Teacher } from './models/teachersModel.js';
import teachersRoutes from './router/teachersRoutes.js';
import subjectRoutes from './router/subjectsRoutes.js';
import timetableRoutes from './router/timetablesRoutes.js';
import parameterRoutes from './router/parameterRoutes.js';

dotenv.config();

const LocalStrategy = passport_local.Strategy

const app = express()
const PORT = process.env.PORT || 5000;

app.use(cookieSession({
    name: 'timetable-auth',
    keys: ['secret-new', 'secret-old'],
    maxAge: 60 * 60 * 24 * 7
}))

app.use(
    cors({
        origin: `${process.env.originURL}`,
        credentials: true,
    })
);

app.use(express.json())

app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((teacher, done) => {
    console.log(`4 serialize teacher ${JSON.stringify(teacher.id)}`);
    return done(null, teacher.id)
})

passport.deserializeUser(async (id, done) => {
    console.log(`5 deserializing teacher ${id}`);
    try {
        const teacher = await Teacher.findOne({ id: id });
        if (teacher) {
            return done(null, { id: teacher.id, email: teacher.email });
        } else {
            return done(new Error('No teacher with this id is found'));
        }
    } catch (error) {
        return done(error);
    }
});


passport.use('local', new LocalStrategy({ passReqToCallback: true, usernameField: 'email', },
    async (req, email, password, done) => {
        console.log('2 local strategy verify', email, password);
        try {
            let res = await Teacher.findOne({ email })
            if (!res) {
                console.log('no Teacher found');
                return done(null, false)
            }

            async function passwordCompare(enteredPassword, realPassword) {
                let result = await bcrypt.compare(enteredPassword, realPassword)
                return result
            }

            let result = await passwordCompare(password, res.passwordHash)

            const adminId = "493e3bab-20bf-4a16-a211-3a668752d510";
            const isAdmin = res.id === adminId;

            if (!result) {
                return done(null, false)
            }
            return done(null, { id: res.id, name: res.name, isAdmin })
        } catch (error) {
            return done(error);
        }
    }
))



app.use('/teachers', teachersRoutes)
app.use('/subjects', subjectRoutes)
app.use('/timetables', timetableRoutes)
app.use('/parameters', parameterRoutes)



app.get('/', (req, res) => {
    res.json({ body: 'hello' })
})

async function start() {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('mongo connected');
        app.listen(PORT, () => {
            console.log('listening on port 5000')
        })
    } catch (error) {
        console.error('Error starting server:', error);
    }
}

start()