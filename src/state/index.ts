import { create } from 'zustand'

const useCredentialStore = create((set) => ({
	username: null,
	password: null,
	setUsername: (key: Function) => set({ username: key }),
	setPassword: (key: Function) => set({ password: key }),
}))

export default useCredentialStore
