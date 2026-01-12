import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



export function createUser(req, res) {
    const hashedPassword = bcrypt.hashSync(req.body.Password, 10);

    const user = new User(
        {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            Password: hashedPassword,
            role: req.body.role

        }
    )

    user.save().then(
        () => {
            res.status(201).json({
                message: "User created successfully"
            })

        }).catch(() => {
            res.status(500).json({
                message: "Error creating user"
            })
        })


}

export function loginUser(req, res) {

    User.findOne({
        email: req.body.email

    }
    ).then(
        (user) => {
            if (user == null) {
                res.status(404).json({
                    message: " user not found"
                }
                )
            } else {
                const isPasswordMatching = bcrypt.compareSync(req.body.Password, user.Password);
                if (isPasswordMatching) {
                    //Authorization and Authentication
                    // this is authorization part
                    // create token & encrypted with secret key( "jwt-secret")
                    const token = jwt.sign({
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                    },
                        "jwt-secret"


                    )
                    res.status(200).json({
                        message: " login successful",
                        token: token


                    }
                    )
                } else {
                    res.status(401).json({
                        message: " incorrect password"
                    }
                    )
                }


            }
        }
    )




}

export function isAdmin(req){
     if (req.user == null) {
        return false;
        }
        
    if (req.user.role != "admin") {
        return false;
     
    }
    return true;

}

export function isCustomer(req){
    if (req.user == null) {
       return false;
       }
    if (req.user.role != "user") {
        return false;
    }
    return true;
}