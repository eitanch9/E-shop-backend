import Jwt from 'jsonwebtoken';

// Function to generate a JWT token for a user
export const generateToken = (user) => {
  return Jwt.sign(
    { _id: user._id, name: user.name, email: user.email },
    process.env.JWT_PW,
    { expiresIn: '15d' }
  );
};

// Middleware function to check if the user is authenticated
export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    // Extract the token from the authorization header
    const token = authorization.slice(7, authorization.length);

    // Verify the token using the secret key
    Jwt.verify(token, process.env.JWT_PW, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        // If the token is valid, set the decoded user information in the request object
        req.user = decode;
        next();
      }
    });
  } else {
    // If no authorization header is provided, send an error response
    res.status(401).send({ message: 'No Token' });
  }
};
