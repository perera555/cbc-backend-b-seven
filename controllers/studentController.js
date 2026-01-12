
import Student from '../models/student.js';


export async function getStudents(req, res) {

    //read and get information from database
    try {
        const student = await Student.find();
        res.json(student);
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Error retrieving student data"
        })
        return;

    }
}

export function createStudents(req, res) {

    // user authentication check
    if (req.user == null) {
        res.status(401).json({
            message: " Please login and try again"
        })
        return;

    }
    if (req.user.role != "admin") {
        res.status(403).json({
            message: " Access denied! only admin can create student data"
        })
        return;
    }

    // create and save student data to database
    const student = new Student({
        name: req.body.name,
        age: req.body.age,
        city: req.body.city

    })

    student.save()
        .then(() => {
            res.status(201).json({
                message: "Student data saved successfully"
            })
        })
        .catch(() => {
            res.status(500).json({
                message: "Error saving student data"
            })
        })

}