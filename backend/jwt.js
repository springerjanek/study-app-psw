import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

export const generateAccessToken = (username) => {
  return sign(username, process.env.JWT_SECRET, { expiresIn: "1800s" });
};

export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(err);

    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
};
