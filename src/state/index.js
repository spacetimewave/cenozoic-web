import { create } from 'zustand'

const useCredentialStore = create((set) => ({
  username: null,
  password: null,
  setUsername: (key) => set({ username: key }),
  setPassword: (key) => set({ password: key }),
}))

export default useCredentialStore

