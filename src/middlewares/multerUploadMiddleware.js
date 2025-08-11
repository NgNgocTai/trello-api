import { StatusCodes } from 'http-status-codes'
import multer from 'multer'
import ApiError from '~/utils/ApiError'
import { LIMIT_COMMON_FILE_SIZE, ALLOW_COMMON_FILE_TYPES } from '~/utils/validators.js'
//docs:https://www.npmjs.com/package/multer
//Function kiểm tra file nào được chấp nhận
const customFilefilter = (req, file, callback) => {
  // console.log('Multer file: ', file)
  //Đối với multer, kiểm tra kiểu file thì dùng mimetype
  if (!ALLOW_COMMON_FILE_TYPES.includes(file.mimetype)) {
    const errMessage = 'File type is invalid. Only accept jpg, jpeg and png'
    return callback(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, errMessage), null)
  }
  //Nếu như kiểu file hợp lệ
  return callback(null, true)
}

//Khởi tạo function upload được bọc bởi multer
const upload = multer({
  limits: { fileSize: LIMIT_COMMON_FILE_SIZE },
  fileFilter: customFilefilter
})

export const multerUploadMiddleWare = { upload }