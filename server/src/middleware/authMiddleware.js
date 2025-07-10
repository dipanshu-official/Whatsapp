import  jwt  from "jsonwebtoken";
import { responseHandler } from "../utils/responseHandler.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const authToken = req.cookies.auth_token;

    if (!authToken) {
      return responseHandler(res, 401, "Authentication token is missing");
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);

    console.log("Decoded token:", decoded);
    req.user = decoded; // Attach user to request object
    console.log(req.user);
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error);
    return responseHandler(res, 500, "Internal server error");
  }
};
