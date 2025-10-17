import User from "../models/user.js";
import catchErrAsync from "../utils/catchErrAsync.js";

export default catchErrAsync(async (req, res, next) => {
  if (!req.session.user) return next();

  let user = await User.findById(req.session.user._id);
  req.user = user;

  next();
});
