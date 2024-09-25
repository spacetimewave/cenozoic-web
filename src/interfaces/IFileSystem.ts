import { IFile } from './IFile'

export interface IFileSystem {
	openedFiles: IFile[]
	activeFile: IFile | null
	projectFiles: IFile[]
	setOpenedFiles: (files: IFile[]) => void
	setActiveFile: (file: IFile | null) => void
	setProjectFiles: (files: IFile[]) => void
}
