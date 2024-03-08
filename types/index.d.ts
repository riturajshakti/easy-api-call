// types/index.d.ts
declare module 'api-call' {
	export interface ApiOptions {
		method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'
		regularBody?: any
		jsonBody?: any
		headers?: Record<string, string>
		urlSearchParams?: Record<string, any>
		uploadProgress?: (uploadedPercentage: number) => any
	}
	
	export interface ApiResponse {
		ok: boolean
		statusCode: number
		statusMessage: string
		headers: Record<string, string>
		response: Response
		json?: JSON
	}

	export default function apicall(url: string, options?: ApiOptions): ApiResponse;
}
