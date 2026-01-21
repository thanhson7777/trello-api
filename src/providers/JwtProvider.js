import JWT from 'jsonwebtoken'

// Đây là fucntion tạo mới 1 token gồm 3 tham số:
// userInfor (những thông tin muốn đính kèm vào token), secretSignature (Chữ ký bí mật), tokenLife (Thời gian sống của token)
const generateToken = async (userInfor, secretSignature, tokenLife) => {
  try {
    return JWT.sign(userInfor, secretSignature, { algorithm: 'HS256', expiresIn: tokenLife })
  } catch (error) { throw new Error(error) }
}

// Đây là function kiểm tra một token có hợp lệ hay không (đúng với secretSignature)
const verifyToken = async (token, secretSignature) => {
  try {
    //
    return JWT.verify(token, secretSignature)
  } catch (error) { throw new Error(error) }
}

export const JwtProvider = {
  generateToken,
  verifyToken
}