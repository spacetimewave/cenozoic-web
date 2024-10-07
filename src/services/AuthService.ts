import { create } from 'zustand'

export const useCredentialStore = create<IAuthStore>((set) => ({
	username: null,
	usermail: null,
	password: null,
	token: null,
	setUsername: (key: string | null) => set({ username: key }),
	setUsermail: (key: string | null) => set({ usermail: key }),
	setPassword: (key: string | null) => set({ password: key }),
	setToken: (key: string | null) => set({ token: key }),
}))

export interface IAuthStore {
	username: string | null
	usermail: string | null
	password: string | null
	token: string | null
	setUsername: (username: string | null) => void
	setUsermail: (usermail: string | null) => void
	setPassword: (password: string | null) => void
	setToken: (token: string | null) => void
}
