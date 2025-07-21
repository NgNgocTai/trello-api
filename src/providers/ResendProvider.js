import { Resend } from 'resend'
import { env } from '~/config/environment'
const RESEND_API_KEY = env.RESEND_API_KEY
const ADMIN_SENDER_EMAIL = env.ADMIN_SENDER_EMAIL

//Tạo Resend instance để sử dụng
const resendInstance = new Resend(RESEND_API_KEY)

//Function gửi email
const sendEmail = async ({ to, subject, html }) => {
  try {
    const data = await resendInstance.emails.send({
      from:ADMIN_SENDER_EMAIL,
      to, // Nếu chưa có valid domain thì chỉ gửi tới email mà bạn đăng ký với Resend
      subject,
      html
    })
    return data
  } catch (error) {
    console.log('🚀 ~ sendEmail ~ error:', error)
    throw (error)
  }
}

export const ResendProvider = {
  sendEmail
}