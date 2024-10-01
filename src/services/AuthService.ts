import { create } from 'zustand'

export const useCredentialStore = create<IAuthStore>((set) => ({
	username: null,
	password: null,
	setUsername: (key: string | null) => set({ username: key }),
	setPassword: (key: string | null) => set({ password: key }),
}))

export interface IAuthStore {
	username: string | null
	password: string | null
	setUsername: (username: string | null) => void
	setPassword: (username: string | null) => void
}
