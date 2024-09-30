import MonacoEditor from 'react-monaco-editor'

interface Props {
	value: string
	onChange: (newValue: string) => void
}

const CodeEditor = ({ value, onChange }: Props) => {
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
