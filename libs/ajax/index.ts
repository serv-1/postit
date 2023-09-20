import { getCsrfToken } from 'next-auth/react'
import { NEXT_PUBLIC_CSRF_HEADER_NAME } from 'env/public'

export interface RequestConfig extends RequestInit {
  csrf?: boolean
}

function requestWithBody(method: string) {
  return async function <D>(url: string, data?: D, config: RequestConfig = {}) {
    config.method = method
    config.headers = new Headers(config.headers)

    if (config.csrf) {
      const csrfToken = await getCsrfToken()

      if (csrfToken) {
        config.headers.append(NEXT_PUBLIC_CSRF_HEADER_NAME, csrfToken)
      }
    }

    if (data) {
      config.body = JSON.stringify(data)

      config.headers.append('content-type', 'application/json')
    }

    return fetch('/api' + url, config)
  }
}

function requestWithoutBody(method: string) {
  return async function (url: string, config: RequestConfig = {}) {
    config.method = method

    if (config.csrf) {
      const csrfToken = await getCsrfToken()

      if (csrfToken) {
        config.headers = new Headers(config.headers)

        config.headers.append(NEXT_PUBLIC_CSRF_HEADER_NAME, csrfToken)
      }
    }

    return fetch('/api' + url, config)
  }
}

const ajax = {
  post: requestWithBody('POST'),
  put: requestWithBody('PUT'),
  get: requestWithoutBody('GET'),
  delete: requestWithoutBody('DELETE'),
}

export default ajax
