const SibApiV3Sdk = require('@getbrevo/brevo')
import { env } from '~/config/environment'

// Cấu hình
let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (toEmail, customSubject, htmlContent) => {
  // Khởi tạo biến sendSmtpMail với những thông tin cần thiết
  let sendSmtpMail = new SibApiV3Sdk.SendSmtpEmail()

  // Tài khoản gửi mail: là tài khoản đăng ký trên brevo
  sendSmtpMail.sender = { email: env.ADMIN_EMAIL_EDDRESS, name: env.ADMIN_EMAIL_NAME }

  // Những tại khoản nhận mail
  // to phải là dạng mảng (cấu trúc của brevo) sau này có thể tùy biến được
  sendSmtpMail.to = [{ email: toEmail }]

  // Tiêu đề của email
  sendSmtpMail.subject = customSubject

  // Nội dung của email html
  sendSmtpMail.htmlContent = htmlContent

  // Gọi hành động gửi mail
  // sendTransacEmail trả về một Promise
  return apiInstance.sendTransacEmail(sendSmtpMail)
}

export const BrevoProvider = {
  sendEmail
}
