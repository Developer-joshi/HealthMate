import jwt from 'jsonwebtoken'

 //doctor authentication middleware

const authDoctor = async (req, res, next) => {
  try {
    const { dtoken } = req.headers;
    console.log("🔑 dtoken received:", dtoken); // Log token

    if (!dtoken) {
      console.log("❌ No dtoken found in headers");
      return res.json({
        success: false,
        message: "Not authorized login again",
      });
    }

    const token_decode = jwt.verify(dtoken, process.env.JWT_SECRET);
    console.log("✅ Token decoded:", token_decode);

    req.body.docId = token_decode.id;
    req.user = { id: token_decode.id }; // ✅ Needed for accept/reject controller
    next();
  } catch (error) {
    console.log("❌ Token error:", error.message);
    res.json({ success: false, message: "Not authorized login again" });
  }
};
export default authDoctor;