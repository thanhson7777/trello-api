const MONGDB_URI = 'mongodb+srv://thanhson11052003:yGxv8Yx1oEAZ1hWT@cluster0-thanhson.bgbggck.mongodb.net/?appName=Cluster0-thanhson'
const DATABASE_NAME = 'trello-web-database'

import { MongoClient, ServerApiVersion } from 'mongodb'

// Khởi tạo đối tượng trelloDatabaseInstance ban đầu là null vì chưa có kết nối
let trelloDatabaseInstance = null

// Khởi tạo đối tượng mongoClientInstance để kết nối tới mongodb
const mongoClientInstance = new MongoClient(MONGDB_URI, {
  // serverApi: có từ phiên bản 5.0.0 trở lên, có thể có hoặc không dùng nó, nếu dùng thì ta chỉ định một cái stable api version của mongodb
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới mongodb atlas với uri đã khai báo trong hàm mongoClientInstance
  await mongoClientInstance.connect()
  // Kết nối thành công thì lấy ra database theo tên và gán ngược vào biến global trellDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(DATABASE_NAME)
}

// Function GET_DB có nhiệm vụ export ra cái trelloDatabaseInstance sau khi đã kết nối thành công tới mongodb để chúng ta có thể sử dụng nhiều nơi trong code
// Lưu ý chỉ gọi tới GET_DB sau khi đã kết nối thành công tới mongodb

export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must to connect to database first')
  return trelloDatabaseInstance
}
