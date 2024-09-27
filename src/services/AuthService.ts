import { create } from 'zustand'

export const useCredentialStore = create<IAuthStore>((set) => ({
	username: null,
	password: null,
	setUsername: (key: string) => set({ username: key }),
	setPassword: (key: string) => set({ password: key }),
}))

export interface IAuthStore {
	username: string | null
	password: string | null
	setUsername: (username: string) => void
	setPassword: (username: string) => void
}
