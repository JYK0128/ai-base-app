export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  timestamp: string
  requestId: string
  traceId: string
}
