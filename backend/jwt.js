import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

export const generateAccessToken = (username) => {
  //30min
  return sign(username, process.env.JWT_SECRET, { expiresIn: "1800s" });
};

export const validateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expired" });
      }
      return res.status(403).json({ error: "Invalid token" });
    }

    req.user = user;

    next();
  });
};
