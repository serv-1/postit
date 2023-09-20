import '@testing-library/jest-dom'
import { loadEnvConfig } from '@next/env'

export default async function _loadEnvConfig() {
  loadEnvConfig(process.cwd())
}
