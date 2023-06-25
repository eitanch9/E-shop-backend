// Importing necessary modules and dependencies
import express from 'express';
import User from '../models/userModel.js';
import expressAsyncHandler from 'express-async-handler';
import Bcrypt from 'bcryptjs';
import { generateToken } from '../utils.js';

const userRouter = express.Router();

// POST /api/v1/users/signin
// Endpoint for user sign-in
userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    // Finding the user in the database based on the provided email
    const user = await User.findOne({ email: req.body.email });

    // Checking if the user exists and the provided password matches the stored password
    if (user) {
      if (Bcrypt.compareSync(req.body.password, user.password)) {
        // If the password is valid, create a response with user details and a token
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user),
        });
        return;
      }
    }

    // If the email or password is invalid, send an error response
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

userRouter.post(
  '/signup',
  expressAsyncHandler(async (req, res) => {
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: Bcrypt.hashSync(req.body.password),
    });

    const user = await newUser.save();

    res.send({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    });
  })
);

// Exporting the userRouter
export default userRouter;
