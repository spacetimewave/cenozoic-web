import MonacoEditor from 'react-monaco-editor'

const CodeEditor = ({ value, onChange }) => {
	return (
		<MonacoEditor
			language='javascript'
			theme='vs-dark'
			value={value}
			onChange={onChange}
			options={{
				selectOnLineNumbers: true,
				scrollBeyondLastLine: false,
			}}
		/>
	)
}

export default CodeEditor
