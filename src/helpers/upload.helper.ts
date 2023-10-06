import multer from 'multer';

export const storage = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.xlsx$/)) {
      return cb(new Error('Upload an excel file'));
    }
    cb(null, true);
  },
});
