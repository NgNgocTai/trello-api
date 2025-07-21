import { env } from '~/config/environment'
//Những domain được cho phép truy cập vào tài nguyên của server
export const WHITELIST_DOMAINS = [
  'http://localhost:5173'
]

export const BOARD_TYPES = {
  PUBLIC:'public',
  PRIVATE:'private'
}

export const WEBSITE_DOMAIN = (env.BUILD_MODE === 'dev') ? env.WEBSITE_DOMAIN_DEVELOPMENT : env.WEBSITE_DOMAIN_PRODUCTION