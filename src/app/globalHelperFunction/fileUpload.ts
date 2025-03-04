import multer from "multer";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: "dfgat58ye",
  api_key: "632991743753635",
  api_secret: "PsZqThNfGV2mvVVAW1GgYochRJg", // Click 'View API Keys' above to copy your API secret
});

// Upload an image

export const uploadCloudinary = (file: any) => {

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(file.path, {
      public_id: file.originalname,
    },(error,result)=>{
      fs.unlinkSync(file.path)
      if(error){
        reject(error)
      }else{
        resolve(result)
      }
    });
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
