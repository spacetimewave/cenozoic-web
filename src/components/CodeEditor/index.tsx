import { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface Props {
    value: string;
    onChange: (newValue: string) => void;
    filename?: string;
}

const CodeEditor = ({ value, onChange, filename }: Props) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [editorHeight, setEditorHeight] = useState<number>(0);

    const updateEditorHeight = () => {
        if (editorRef.current) {
            setEditorHeight(editorRef.current.clientHeight);
        }
    };

    useEffect(() => {
        updateEditorHeight();
		const currentRef = editorRef.current;
        const resizeObserver = new ResizeObserver(() => {
            updateEditorHeight();
        });
        if (currentRef) {
            resizeObserver.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                resizeObserver.unobserve(currentRef);
            }
        };
    }, []);

    const getLanguageFromFilename = (filename: string | undefined):string => {
        return getLanguageFromExtension(filename?.split('.').pop())
    }
    
	const getLanguageFromExtension = (extension: string | undefined) => {
		switch (extension) {
			case 'js':
				return 'javascript'
			case 'ts':
				return 'typescript'
            case 'jsx':
                return 'javascript'
            case 'tsx':
                return 'typescript'
			case 'html':
				return 'html'
			case 'css':
				return 'css'
			case 'json':
				return 'json'
			case 'py':		
				return 'python'
            case 'docker':
            case 'dockerfile':
                return 'docker'
			default:
				return 'text'
		}
	}

    return (
        <div ref={editorRef} style={{ height: '100%' }}>
            <MonacoEditor
                language={getLanguageFromFilename(filename)}
                theme='vs-dark'
                value={value}
                onChange={(newValue) => onChange(newValue ?? '')}
                height={editorHeight}
                options={{
                    lineHeight: 19,
                    selectOnLineNumbers: true,
                    scrollBeyondLastLine: false,
                    colorDecorators: true,
                }}
            />
        </div>
    );
};

export default CodeEditor;