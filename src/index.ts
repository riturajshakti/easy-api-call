import type { ApiOptions, ApiResponse } from './types'
import apicallXhr from './xhr'
import apicallHttp from './http'

export const defaultApiOptions: ApiOptions = {
	method: 'GET',
	headers: undefined,
	jsonBody: undefined,
	regularBody: undefined,
	urlSearchParams: undefined,
	uploadProgress: undefined
} as const

async function apicall(url: string, options?: ApiOptions): Promise<ApiResponse> {
  if(typeof window === undefined) {
    // browser environment, running xhr call
    return await apicallXhr(url, options)
  } else {
    // server environment, running http(s) call
    return await apicallHttp(url, options)
  }
}

export default apicall
