import https from 'https'
import http from 'http'
import { defaultApiOptions } from './index'
import { ApiOptions, ApiResponse } from './types'
import { ReadStream } from 'fs'

// ✅handle form data
// ✅http/https
// interface ApiOptions {
// 	✅method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'
// 	✅regularBody?: any
// 	✅jsonBody?: any
// 	✅headers?: Record<string, string>
// 	✅urlSearchParams?: Record<string, any>
// 	✅uploadProgress?: (uploadedPercentage: number) => any
// }

// interface ApiResponse {
// 	✅ok: boolean
// 	✅statusCode: number
// 	✅statusMessage: string
// 	✅headers: Record<string, string>
// 	✅response: any
// 	✅json?: JSON
// }

async function apiCallHttp(url: string, options: ApiOptions = defaultApiOptions): Promise<any> {
	if (options.urlSearchParams) {
		const [urlString, queryString] = url.split('?')
		let query = new URLSearchParams(queryString)
		for (const [key, value] of Object.entries(options.urlSearchParams)) {
			query.set(key, `${value}`)
		}
		url = `${urlString}?${query}`
	}

	const boundary = getRandomBoundary()

	const requestOptions: https.RequestOptions = {
		method: options.method ?? 'GET',
		headers: options.headers ?? {}
	}

	// setting headers
	if (options.jsonBody) {
		requestOptions.headers = {
			...requestOptions.headers,
			'content-type': 'application/json; charset=utf-8'
		}
	} else if (options.regularBody instanceof FormData) {
		const formDataString = await getFormDataString(options.regularBody, boundary)
		requestOptions.headers = {
			...requestOptions.headers,
			'content-type': `multipart/form-data; boundary=${boundary}`,
			'content-length': Buffer.byteLength(formDataString) + ''
		}
	}

	return new Promise(async (resolve, reject) => {
		const caller = url.startsWith('https') ? https : http
		const req = caller.request(url, requestOptions, (res) => {
			let responseData = ''
			let totalBytesReceived = 0
			let totalBytesExpected = parseInt(res.headers['content-length'] ?? '0')

			res.setEncoding('utf8')

			res.on('data', (chunk) => {
				totalBytesReceived += chunk.length
				responseData += chunk
				if (options.uploadProgress && totalBytesExpected > 0) {
					const uploadedPercentage = (totalBytesReceived / totalBytesExpected) * 100
					options.uploadProgress(uploadedPercentage)
				}
			})

			res.on('end', () => {
				const headers = convertHeaders(res.headers)
				const response = new Response(responseData, {
					status: res.statusCode!,
					statusText: res.statusMessage!,
					headers
				})
				const apiResponse: ApiResponse = {
					ok: res.statusCode! >= 200 && res.statusCode! < 300,
					statusCode: res.statusCode!,
					statusMessage: res.statusMessage!,
					headers,
					response
				}

				if (res.headers['content-type']?.startsWith('application/json')) {
					apiResponse.json = JSON.parse(responseData)
				}

				resolve(apiResponse)
			})
		})

		req.on('error', (error) => {
			reject(error)
		})

		if (options.jsonBody) {
			req.write(JSON.stringify(options.jsonBody))
		} else if (options.regularBody instanceof FormData) {
			const formDataString = await getFormDataString(options.regularBody, boundary)
			req.write(formDataString)
		} else if (options.regularBody) {
			req.write(options.regularBody)
		}

		req.end()
	})
}

function convertHeaders(headers: http.IncomingHttpHeaders): Record<string, string> {
	const convertedHeaders: Record<string, string> = {}
	for (const [key, value] of Object.entries(headers)) {
		if (typeof value === 'string') {
			convertedHeaders[key] = value
		} else if (Array.isArray(value)) {
			convertedHeaders[key] = value.join(', ')
		}
	}
	return convertedHeaders
}

function getRandomBoundary() {
	const random = Math.random().toString().slice(2)
	const now = Date.now()
	return `--------------------------${random}${now};`
}

async function getFormDataString(formData: FormData, boundary: string) {
	const parts: string[] = []
	for (const [name, value] of formData.entries()) {
		parts.push(`--${boundary}`)
		if (value instanceof ReadStream) {
			const streamData = await streamToString(value)
			parts.push(`Content-Disposition: form-data; name="${name}"`)
			parts.push('')
			parts.push(streamData)
		} else if (value instanceof File) {
			const fileData = await readFile(value)
			parts.push(`Content-Disposition: form-data; name="${name}"; filename="${value.name}"`)
			parts.push(`Content-Type: ${value.type || 'application/octet-stream'}`)
			parts.push('')
			parts.push(fileData)
		} else {
			parts.push(`Content-Disposition: form-data; name="${name}"`)
			parts.push('')
			parts.push(value)
		}
	}
	return parts.join('\r\n') + `\r\n--${boundary}--\r\n`
}

// Helper function to convert a ReadStream to a string asynchronously
function streamToString(stream: ReadStream): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = ''
		stream.on('data', (chunk) => {
			data += chunk
		})
		stream.on('end', () => {
			resolve(data)
		})
		stream.on('error', (err) => {
			reject(err)
		})
	})
}

function readFile(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result as string)
		}
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

export default apiCallHttp
