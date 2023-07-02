import Jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return Jwt.sign(
    { _id: user._id, name: user.name, email: user.email },
    process.env.JWT_PW,
    { expiresIn: '15d' }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    Jwt.verify(token, process.env.JWT_PW, (err, decode) => {
      if (err) {
        res.status(401).send({ message: 'Invalid Token' });
      } else {
        req.user = decode;
        next();
      }
    });
  } else {
    res.status(401).send({ message: 'No Token' });
  }
};