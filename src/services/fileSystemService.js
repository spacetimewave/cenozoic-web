export const selectFolder = async () => {
    // Check if File System Access API is supported
    if ('showDirectoryPicker' in window) {
      try {
        // Request the user to select a folder
        const directoryHandle = await window.showDirectoryPicker()
        const files = []
        
        // Recursively read through the directory
        for await (const entry of directoryHandle.values()) {
          if (entry.kind === 'file') {
            files.push(entry)
          }
        }
        return files
      } catch (error) {
        console.error('Error selecting folder:', error)
      }
    } else {
      alert('Your browser does not support the File System Access API.')
      return []
    }
  }
  