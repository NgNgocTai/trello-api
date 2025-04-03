import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res,next) => {
  try {
    console.log("req.body:" + req.body)
    console.log('req.body: ', req.body);
    console.log('req.query: ', req.query);
    console.log('req.params: ', req.params);
    // console.log('req.files: ', req.files);
    // console.log('req.cookies: ', req.cookies);
    // console.log('req.jwtDecoded: ', req.jwtDecoded);
    //Tiếp đến là điều hướng dữ liệu sang tầng service

    //Có kết quả thì trả về Client
    res.status(StatusCodes.CREATED).json({ message:'Post from controller: API post list post' })
  } catch (err) {
    console.log(err)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error:err.message
    })
}

export const boardController = {
  createNew
}