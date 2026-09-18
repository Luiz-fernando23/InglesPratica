const ACCESS_KEY = 'access_token'
const REFRESH_KEY = 'refresh_token'
export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (access: string, refresh: string) => { localStorage.setItem(ACCESS_KEY, access); localStorage.setItem(REFRESH_KEY, refresh); },
  setAccess: (t: string) => localStorage.setItem(ACCESS_KEY, t),
  clear: () => { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); },
}
