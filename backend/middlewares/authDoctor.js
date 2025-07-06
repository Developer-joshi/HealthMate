import jwt from 'jsonwebtoken'

// //doctor authentication middleware

// const authDoctor = async(req,res,next)=>{
//    try {
      
//      const {dtoken} = req.headers;
//      console.log("Token:", dtoken);

//      if(!dtoken)
//      {
//         return res.json({success:false,message:'Not authorized login again'})
//      }
//      const token_decode = jwt.verify(dtoken,process.env.JWT_SECRET)
     
//      req.body.docId=token_decode.id;
//      next();

//    } 
//    catch (error) {
//     console.log(error);
//     res.json({success:false,message:error.message})
//    }
// }
// export default authDoctor
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
    next();
  } catch (error) {
    console.log("❌ Token error:", error.message);
    res.json({ success: false, message: "Not authorized login again" });
  }
};
export default authDoctor;