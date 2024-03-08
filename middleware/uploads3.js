const multer = require("multer");
const multerS3 = require("multer-s3");
const { S3Client } = require("@aws-sdk/client-s3");

const s3 = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_ACCESS_KEY_ID
    },
    region: "eu-north-1"
})

const s3Storage = multerS3({
    s3: s3,
    bucket: "salmanomega",
    // acl: "public-read",
    metadata: (req, file, cb) => {
        cb(null, {fieldname: file.fieldname})
    },
    key: (req, file, cb) => {
        const fileName = 'upload'+ '/' + Date.now() + "_" + file.fieldname + "_" + file.originalname;
        cb(null, fileName);
    }
});

function sanitizeFile(file, cb) {
    const fileExts = [".png", ".jpg", ".jpeg", ".gif"];
    // const isAllowedExt = fileExts.includes(
    //     path.extname(file.originalname.toLowerCase())
    // );
    const isAllowedMimeType = file.mimetype.startsWith("image/");
    if (isAllowedMimeType) {
        return cb(null, true); // no errors
    } else {
        cb("Error: File type not allowed!");
    }
}

const uploadImage = multer({
    storage: s3Storage,
    fileFilter: (req, file, callback) => {
        sanitizeFile(file, callback)
    },
    limits: {
        fileSize: 1024 * 1024 * 2
    }
})

module.exports = uploadImage;