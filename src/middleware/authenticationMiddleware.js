const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  const token = authorizationHeader && authorizationHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // Attach the decoded payload to the request object for future use
    req.userId = decoded.userId;

    next();
  });
};

module.exports = { authenticateToken };
