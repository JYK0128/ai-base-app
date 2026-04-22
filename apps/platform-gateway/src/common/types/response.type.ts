export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: {
    message: string
    code?: string
    details?: unknown
  }
  traceId: string
  requestId: string
}
