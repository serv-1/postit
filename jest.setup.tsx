import '@testing-library/jest-dom/extend-expect'
import 'whatwg-fetch'
import { loadEnvConfig } from '@next/env'

jest
  .mock('nanoid', () => ({ __esModule: true, nanoid: () => '_nanoid_mock' }))
  .mock('app/api/auth/[...nextauth]/route', () => ({
    nextAuthOptions: {},
  }))
  .mock('utils/functions/hashPassword', () => ({
    __esModule: true,
    default: (password: string) => 'hashed' + password,
  }))

export default async function _loadEnvConfig() {
  loadEnvConfig(process.cwd())
}
