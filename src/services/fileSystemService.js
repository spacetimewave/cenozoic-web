export const selectProjectFolder = async () => {
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
		handle: directoryHandle,
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
				handle: entry,
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

export const deleteDirectory = async (directoryHandle) => {
	// Recursively delete all contents of the directory
	for await (const entry of directoryHandle.values()) {
		if (entry.kind === 'directory') {
			// Recursively delete sub-directory contents
			await deleteDirectory(entry)
		} else {
			// Delete the file
			await entry.remove()
		}
	}
	// Delete the directory itself
	await directoryHandle.remove()
}
