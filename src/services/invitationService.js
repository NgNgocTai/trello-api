import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { boardModel } from '~/models/boardModel'
import { invitationModel } from '~/models/invitationModel'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { pickUser } from '~/utils/formatters'
import { StatusCodes } from 'http-status-codes'


const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Người mời chính là người đang request, nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)
    // Người được mời: Lấy theo email nhận từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tìm luôn cái board ra để lấy data xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Nếu không tồn tại 1 trong 3 thì cứ thẳng tay reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter, Invitee or Board not found!')
    }

    // Tạo data cần thiết để lưu vào trong DB
    // Có thể thử bỏ hoặc làm sai lệch type, boardInvitation, status để test xem Model validate ok chưa.
    const newInvitationData = {
      inviterId,
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId về String vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Gọi sang Model để lưu vào DB
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ cả luồng board, inviter, invitee cho FE thoải mái xử lý.
    const resInvitation = {
      ...getInvitation,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee),
      board
    }

    return resInvitation
  } catch (error) { throw error }
}

const getInvitations = async (userId) => {
  try {
    const getInvitations = await invitationModel.findByUser(userId)
    // console.log("🚀 ~ getInvitations ~ getInvitations:", getInvitations)

    //Do dữ liệu invier, invitee, board đang là mảng 1 phần tử --> chuyển về json object trả cho FE
    const resInvitations = getInvitations.map(i => {
      return {
        ...i,
        inviter: i.inviter[0] || {},
        invitee: i.invitee[0] || {},
        board: i.board[0] || {}
      }
    })

    return resInvitations
  } catch(error) {throw error}
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations
}