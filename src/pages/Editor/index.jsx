import { useState } from 'react'
import Sidebar from '../../components/Sidebar'
import FileManager from '../../components/FileManager'

const App = () => {
	const [selectedFile, setSelectedFile] = useState(null)

	const onFileSelected = (fileHandle) => {
		setSelectedFile(fileHandle)
	}

	return (
		<div className='bg-zinc-700 flex h-screen w-screen'>
			<Sidebar onFileSelected={onFileSelected} />
			<FileManager selectedFile={selectedFile} />
		</div>
	)
}

export default App
