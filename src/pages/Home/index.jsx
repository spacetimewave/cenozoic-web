import { useState } from 'react'
import CodeEditor from '../CodeEditor'
import Sidebar from '../Sidebar'

const App = () => {
	const [code, setCode] = useState('// Select a file to open...')
	const [setFileName] = useState(null)

	const handleFileSelect = async (fileHandle) => {
		const file = await fileHandle.getFile()
		const fileContent = await file.text()
		setFileName(file.name)
		setCode(fileContent)
	}

	const handleCodeChange = (newValue) => {
		setCode(newValue)
	}

	return (
		<div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
			<Sidebar onFileSelect={handleFileSelect} />
			<div style={{ height: '100vh', width: '100vw' }}>
				<CodeEditor value={code} onChange={handleCodeChange} />
			</div>
		</div>
	)
}

export default App
