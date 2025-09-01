//Param truyen tu thu vien socket.io ben main.jsx
export const inviteUserToBoardSocket = (socket) => {
  console.log('a user connected')
  //Lắng nghe sự kiện client emit lên với tên là FE_USER_INVITED_TO_BOARD
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    //Từ server emit ngược lại về cho mọi client trừ thằng gửi request lên để FE check, invitation là dữ liệu nhận được từ bên FE gửi sang khi emit
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}