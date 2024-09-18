// src/services/fileSystemService.js

// Function to recursively get files and folders from the selected folder
export const selectFolder = async () => {
	if ('showDirectoryPicker' in window) {
		try {
			const directoryHandle = await window.showDirectoryPicker()
			return await readProjectDirectory(directoryHandle)
		} catch (error) {
			console.error('Error selecting folder:', error)
		}
	} else {
		alert('Your browser does not support the File System Access API.')
	}
	return []
}

export const readProjectDirectory = async (directoryHandle) => {
	const folderTree = []
	folderTree.push({
		name: directoryHandle.name,
		kind: 'directory',
		children: await readDirectory(directoryHandle),
	})
	console.log(folderTree)
	return folderTree
}

// Recursively read directories
const readDirectory = async (directoryHandle) => {
	const folderTree = []
	for await (const entry of directoryHandle.values()) {
		const { kind, name } = entry

		if (kind === 'directory') {
			// Recursively read sub-directories
			folderTree.push({
				name,
				kind,
				children: await readDirectory(entry),
			})
		} else {
			folderTree.push({
				name,
				kind,
				handle: entry,
			})
		}
	}
	return folderTree
}
