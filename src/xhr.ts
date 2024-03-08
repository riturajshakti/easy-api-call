import type { ApiOptions, ApiResponse } from './types'
import { defaultApiOptions } from './index'

async function apicallXhr(url: string, options: ApiOptions = defaultApiOptions): Promise<any> {
	try {
		const xhr = await new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest()

			if (options.urlSearchParams) {
				const [urlString, queryString] = url.split('?')
				let query = new URLSearchParams(queryString)
				for (const [key, value] of Object.entries(options.urlSearchParams)) {
					query.set(key, `${value}`)
				}
				url = `${urlString}?${query}`
			}

			xhr.open(options.method ?? 'GET', url, true)

			if (options.jsonBody) {
				xhr.setRequestHeader('content-type', 'application/json; charset=utf-8')
			}

			if (options.headers) {
				for (const [key, value] of Object.entries(options.headers)) {
					xhr.setRequestHeader(key, value)
				}
			}

			if (options.uploadProgress) {
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const percentComplete = (event.loaded / event.total) * 100
						options.uploadProgress?.(percentComplete)
					}
				}
			}

			xhr.onreadystatechange = function () {
				if (xhr.readyState === XMLHttpRequest.DONE) {
					if (xhr.status >= 200 && xhr.status <= 299) {
						resolve(xhr)
					} else {
						reject(xhr)
					}
				}
			}

			if (options.jsonBody) {
				xhr.send(JSON.stringify(options.jsonBody))
			} else if (options.regularBody) {
				xhr.send(options.regularBody)
			} else {
				xhr.send()
			}
		})
		return getApiResponseFromXhr(xhr as XMLHttpRequest)
	} catch (error) {
		if (error instanceof XMLHttpRequest) {
			return getApiResponseFromXhr(error as XMLHttpRequest)
		}
		console.error(error)
	}
}

function getApiResponseFromXhr(xhr: XMLHttpRequest): ApiResponse {
	const headers: Record<string, string> = {}
	const headersList = xhr.getAllResponseHeaders().trim().split('\n')
	for (const header of headersList) {
		const [headerName, ...headerValueParts] = header.split(': ')
		const headerValue = headerValueParts.join(': ')
		headers[headerName] = headerValue.trim()
	}

	const response = new Response(xhr.response, {
		status: xhr.status,
		statusText: xhr.statusText,
		headers: headers
	})

	const result: ApiResponse = {
		ok: xhr.status >= 200 && xhr.status < 300,
		statusCode: xhr.status,
		statusMessage: xhr.statusText,
		headers,
		response
	}

	if (xhr.responseType === 'json') {
		result.json = xhr.response
	}

	return result
}

export default apicallXhr