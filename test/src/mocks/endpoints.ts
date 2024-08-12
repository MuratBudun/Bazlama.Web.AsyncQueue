import { http, HttpResponse } from 'msw'
import { mockDataList } from "./data"

export const baseUrl = "http://www.bazlama.com"

type mockDataResult = {
    status: number
    statusMessage: string
    networkError: boolean
    data: any | undefined
}

export const asyncDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)) 
export const getMockData = async (request: any, mockDataName: string): Promise<mockDataResult> => {
    const url = new URL(request.url)
    
    let status = Number(url.searchParams.get("status")) || 200
    let delay = Number(url.searchParams.get("delay")) || 0
    let networkError = url.searchParams.get("networkError") != null
    let statusMessage = `Status ${status}`

    if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (networkError) {
        return {
            status: 500,
            statusMessage: "Network Error",
            networkError: true,
            data: null,
        }
    }

    return {
        status: status,
        statusMessage: statusMessage,
        networkError: false,
        data: mockDataList[mockDataName],
    }
}

export const getUrl = (endpoint: string, status = 200, delay = 0, isNetworkError = false) => {
    let result = `${baseUrl}/${endpoint}?a=a`

    if  (status != 200) {
        result += `&status=${status}`
    }

    if (delay > 0) {
        result += `&delay=${delay}`
    }

    if (isNetworkError === true) {
        result += `&networkError=1`
    }

    return result
}

/*
    Usage:
        <endpoint>?delay=<ms>&status=<status>&networkError=<error>
    Example:    
        http://www.bazlama.com/user?delay=3000&status=404&networkError
*/
export const endpointHandlers = [
    http.get(`${baseUrl}/user`, async ({ request }) => {
        const result = await getMockData(request, "userProfile")
        if (result.networkError) return HttpResponse.error()
        
        return HttpResponse.json(result.data, {
            status: result.status,
            statusText: result.statusMessage
        })
    }),
]