// middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/userModel.js"; // 👉 Apna User model import karein

const authMiddleware = (roles = []) => {
  // 👉 Middleware ko async/await use karne ke liye async banao
  return async (req, res, next) => {
    try {
      let token;

      // 1. Header se token nikalne ki koshish
      const authHeader = req.header("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
      // 2. Agar header me nahi mila to cookie se nikalne ki koshish
      else if (req.cookies?.token) {
        token = req.cookies.token;
      }

      if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
      }

      // 3. Token ko verify karna
      // 👉 Isse token ka payload (jisme user ki ID hai) mil jayega
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. (⭐ IMPORTANT IMPROVEMENT) Decoded ID se fresh user data DB se nikalo
      // Isse hamesha latest user info (jaise role) milegi
      // Password ko chhodkar baki sab select kar lo
      const user = await User.findById(decoded.id || decoded.userId).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      // Fresh user ko request me attach kar do
      req.user = user;

      // 5. Role check (ab fresh role se check hoga)
      if (roles.length > 0 && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Access denied: insufficient role" });
      }

      next();
    } catch (error) {
      // Agar error 'TokenExpiredError' hai to specific message bhejo
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token has expired' });
      }
      // Baki sabhi errors ke liye "Token is not valid"
      res.status(401).json({ message: "Token is not valid" });
    }
  };
};

export default authMiddleware;