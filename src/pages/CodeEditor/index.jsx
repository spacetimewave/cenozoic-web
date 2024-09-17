import MonacoEditor from 'react-monaco-editor'

const CodeEditor = () => {
	const handleChange = (newValue) => {
		console.log('New value:', newValue)
	}

	return (
		<MonacoEditor
			language='javascript'
			theme='vs-dark'
			value='// Your code here...'
			onChange={handleChange}
			options={{
				selectOnLineNumbers: true,
				scrollBeyondLastLine: false,
			}}
		/>
	)
}

export default CodeEditor
