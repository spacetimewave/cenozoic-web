import { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

interface Props {
    value: string;
    onChange: (newValue: string) => void;
}

const CodeEditor = ({ value, onChange }: Props) => {
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

    return (
        <div ref={editorRef} style={{ height: '100%' }}>
            <MonacoEditor
                language='javascript'
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