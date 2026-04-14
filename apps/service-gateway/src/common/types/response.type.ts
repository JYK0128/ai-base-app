export interface ApiResponse<T> {
  success: boolean
  data: T
  timestamp: string
  requestId: string
  traceId: string
}
