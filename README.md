# 🚀 WORKBAN - Advanced Trello Clone

Ứng dụng quản lý công việc trực quan với trải nghiệm kéo thả mượt mà và tương tác thời gian thực. Được xây dựng bằng MERN Stack với các công nghệ hiện đại để tối ưu hóa hiệu suất và trải nghiệm người dùng (UX).

---

## 📑 Table of Contents

- [Project Overview](#-project-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Technical Solutions](#-technical-solutions)
- [Data Validation Rules](#-quy-tắc-dữ-liệu-validation)
- [Contributing & License](#-contributing--license)
- [Contact / Author](#-contact--author)

---

## 📊 Project Overview

**WORKBAN** là một nền tảng quản lý dự án hiện đại, cho phép người dùng:
- Tổ chức công việc theo Board, Column, và Card
- Cộng tác thời gian thực với các thành viên trong nhóm
- Quản lý dữ liệu một cách trực quan và hiệu quả

Dự án này là **sản phẩm tâm huyết** với tiêu chí tối ưu trải nghiệm người dùng (UX) và hiệu suất cao nhất.

> 💡 **Triết lý dự án**: "Kéo thả không lag, cộng tác thời gian thực, bảo mật hàng đầu"

---

## ✨ Key Features

| Nhóm Tính Năng | Chi Tiết |
|---|---|
| 🎯 **Kéo Thả (DnD)** | Kéo thả Card/Column linh hoạt với hiệu ứng mượt mà nhờ `dnd-kit` |
| ⚡ **Real-time** | Mời người dùng (Invite) và cập nhật thông báo tức thời qua `Socket.io` |
| 🔐 **Bảo Mật** | Xác thực JWT, Bcrypt hashing, gửi Mail xác thực tài khoản qua `Brevo` |
| 📝 **Quản Lý Card** | Chỉnh sửa tiêu đề, thêm ảnh bìa (Cover), bình luận (Comment) đa tầng |
| 🖼️ **Hình Ảnh** | Upload và quản lý ảnh bìa trực tiếp trên `Cloudinary` |
| 🌓 **Giao Diện** | Hỗ trợ chế độ Darkmode/Lightmode sang trọng, tối ưu trải nghiệm thị giác |

---

## 🛠️ Tech Stack (Hiện Đại)

### **Frontend**
- **React.js** - UI library hiện đại
- **Vite** - Build tool siêu nhanh
- **Redux Toolkit** - State management mạnh mẽ
- **dnd-kit** - Drag & Drop library tối ưu
- **Material-UI (MUI)** - Component library chuyên nghiệp

### **Backend**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework

### **Database & Data**
- **MongoDB** - NoSQL database
- **MongoDB Native Driver** - Tối ưu performance, không dùng ORM, kiểm soát chặt chẽ Aggregation queries

### **Real-time Communication**
- **Socket.io** - Bi-directional communication cho cập nhật tức thì

### **Cloud Services**
- **Cloudinary** - Image Hosting & Optimization
- **Brevo** - Email Service (Xác thực tài khoản)

### **Security**
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing an toàn
- **Axios Interceptors** - Đánh chặn & xử lý Token tự động

---

## 🚀 Getting Started

### **Yêu cầu hệ thống**
- Node.js >= 16.x
- MongoDB >= 5.0 (Local hoặc MongoDB Atlas)
- npm hoặc yarn
- Git

### **Bước 1: Clone Repository**

```bash
git clone https://github.com/thanhson7777/trello-web
git clone https://github.com/thanhson7777/trello-api
```

### **Bước 2: Cài đặt Dependencies**

```bash
# Backend
cd trello-api
npm install

# Frontend
cd trello-web
npm install
```

### **Bước 3: Cấu hình Environment Variables**

Tạo file `.env` tại thư mục backend:

```bash
cp .env.example .env
```

Cấu hình các biến sau:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/workban?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Email Service (Brevo)
BREVO_API_KEY=your_brevo_api_key

# Cloudinary (Image Service)
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name

# Server
PORT=8017

# Frontend URL (CORS)
CLIENT_URL=http://localhost:5173
```

### **Bước 4: Khởi động ứng dụng**

**Chạy Backend & Frontend riêng biệt**

```bash
# Terminal 1 - Backend (cd: trello-api/)
npm run dev
# hoặc
yarn dev

# Terminal 2 - Frontend (cd: trello-web/)
npm run dev
# hoặc
yarn dev
```

> 🔗 **URLs:**
> - Frontend: http://localhost:5173
> - Backend API: http://localhost:8017
> - MongoDB: Kết nối qua URI trong .env

---

## 🔧 Technical Solutions (Điểm Tự Hào)

### **1. 🎯 Xử lý Kéo Thả & Optimistic UI**

**Vấn đề**: Khi người dùng kéo thả Card, nếu đợi API phản hồi rồi mới cập nhật giao diện sẽ gây cảm giác lag.

**Giải pháp**:
- Ngay khi người dùng thả Card, **Redux State cập nhật tức thì** (Optimistic UI)
- API được gọi ngầm dưới nền
- Nếu API thành công → Hoàn tất
- Nếu API thất bại → **Rollback** dữ liệu về trạng thái trước đó
✅ **Kết quả**: Trải nghiệm **không độ trễ**, người dùng không cảm thấy lag.

---

### **2. ⚡ Real-time Collaboration với Socket.io**

**Vấn đề**: Làm sao để mời người dùng vào Board mà họ thấy ngay lập tức?

**Giải pháp**:
- Tích hợp Socket.io để đẩy thông báo (Notification) theo thời gian thực
- Khi có lời mời, **tất cả client kết nối đều nhận được update**
- Board Members được cập nhật tự động mà không cần refresh
✅ **Kết quả**: Cộng tác thời gian thực, tăng tính tương tác đội nhóm.

---

### **3. 🔐 Luồng Xác thực An Toàn**

**Quy trình**:

```
1. Đăng ký Email
   ↓
2. Gửi Email xác thực qua Brevo API
   ↓
3. Người dùng click link xác thực
   ↓
4. Token được kiểm tra & lưu vào database
   ↓
5. Tài khoản được kích hoạt
   ↓
6. Đăng nhập với JWT Token
```

**Bảo mật thêm**:
- Sử dụng **Bcrypt** để hash password (không lưu plaintext)
- Sử dụng **Axios Interceptor** để tự động gắn Token vào header
- **Global Error Handling** xử lý lỗi tập trung (Token hết hạn, không hợp lệ)
✅ **Kết quả**: An toàn, không lo lộ thông tin nhạy cảm.

---

### **4. 🖼️ Tối ưu hóa Lưu trữ Hình Ảnh**

**Giải pháp**:
- Tích hợp **Cloudinary SDK** để upload ảnh bìa Card
- Hình ảnh được **tối ưu dung lượng** trước khi lưu trữ

---

### **5. 📦 MongoDB Native Driver vs ORM**

**Tại sao chọn Native Driver?**
- ✅ Kiểm soát chặt chẽ các Aggregation queries phức tạp
- ✅ Hiệu suất cao hơn (không overhead từ ORM)
- ✅ Linh hoạt hơn trong xử lý dữ liệu
- ✅ Phù hợp với cấu trúc dữ liệu phức tạp của Workban

---

## 👤 Thông Tin Tác Giả

**Họ và tên**: Nguyễn Thanh Sơn 
**Vị trí**: Fullstack Developer (MERN Stack)  
**Email**: thanhson1102003@gmail.com  
**GitHub**: https://github.com/thanhson7777

## 🙏 Lời Cảm Ơn

Cảm ơn bạn đã quan tâm đến dự án **WORKBAN**. Nếu thấy hữu ích, hãy tặng mình ⭐ **1 star trên GitHub** nhé!

---

**Made with ❤️ by Thanh Sơn**

**Cảm ơn đã sử dụng WORKBAN!** 🎉
