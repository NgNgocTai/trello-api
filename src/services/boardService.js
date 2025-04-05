import { StatusCodes } from 'http-status-codes'
import { slugify } from '~/utils/formatters'
const createNew = async (data) => {
  // eslint-disable-next-line no-useless-catch
  try {
    const newBoard = {
      ...data,
      slug: slugify(data.title)
    }
    return newBoard
} catch (error) {
    throw error
  }
}

export const boardService = {
  createNew
}