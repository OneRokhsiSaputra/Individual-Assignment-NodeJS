require("dotenv").config();
const jwt = require("jsonwebtoken");
const accessSecretKey = process.env.ACCESS_SECRET_KEY;

// Generate token
exports.generateToken = (user) => {
  return jwt.sign({ id: user.id }, accessSecretKey, { expiresIn: "15m" });
};

// Verify token
exports.verifyToken = (req, res, next) => {
  const headersToken = req.headers.authorization;

  if (!headersToken) return res.status(401).send({ message: "Tidak ada token akses yang dikirim." });

  const token = headersToken.split(" ")[1];

  jwt.verify(token, accessSecretKey, (err, payload) => {
    if (err) return res.status(403).send({ message: "Anda tidak bisa." });

    console.log(payload);

    req.payload = payload;

    next();
  });
};
