import { v4 } from "uuid"
import { validate } from "validate.js";
import constraints from "./constraints.js"
import bcrypt from "bcrypt"
export async function createTeacher({ name, email, password }) {
    let teacher = {}

    /* --------------------*/

    let msg1 = validate.single(name, constraints.name())
    if (msg1) {
        return { errMsg: msg1 }
    } else {
        teacher.name = name
    }

    /* --------------------*/

    teacher.id = v4()

    /* --------------------*/

    let msg2 = validate.single(email, constraints.email())
    if (msg2) {
        return { errMsg: msg2 }
    } else {
        teacher.email = email
    }


    /* --------------------*/

    let msg3 = validate.single(password, constraints.password())
    if (msg3) {
        return { errMsg: msg3 }
    } else {
        teacher.passwordHash = await bcrypt.hash(password, 10)
    }

    /* --------------------*/
    teacher.teacherData = []
    /* --------------------*/
    teacher.teacherSchedule = {}
    /* --------------------*/
    teacher.isEditing = false
    /* --------------------*/
    teacher.isLocked = false
    /* --------------------*/
    teacher.dataVerified = false


    return teacher

}
