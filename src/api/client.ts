import type { AppConfig, Choice, GameResponse, SurveyAnswer } from '../types'

const BASE = '/api'

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.message) message = body.message
    } catch {
      // response had no JSON body
    }
    throw new ApiError(message, res.status)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

function adminHeaders(password: string) {
  return { 'x-admin-password': password }
}

export const api = {
  /** Persist the game choices as soon as the cards are done. */
  createResponse: (choices: Choice[], survey: SurveyAnswer[] = []) =>
    request<GameResponse>('/responses', {
      method: 'POST',
      body: JSON.stringify({ choices, survey }),
    }),
  /** Attach the survey answers to an existing response. */
  submitSurvey: (id: string, survey: SurveyAnswer[]) =>
    request<GameResponse>(`/responses/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ survey }),
    }),

  getConfig: () => request<AppConfig>('/config'),

  // ---- Admin (password-protected) ----
  listResponses: (password: string) =>
    request<GameResponse[]>('/responses', { headers: adminHeaders(password) }),
  deleteAllResponses: (password: string) =>
    request<void>('/responses', { method: 'DELETE', headers: adminHeaders(password) }),
}
