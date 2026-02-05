// Param socket được lấy từ thư viện socket.io
export const inviteUserToBoardSocket = (socket) => {
  // Lắng nghe sự kiện FE_USER_INVITED_TO_BOARD mà frontend gửi lên
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // Emit một sự kiện về cho mọi frontend (trừ fontend đang thực hiện request)
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
