import { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ code, onChange, readOnly = false }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      // Define Python language configuration
      monaco.languages.register({ id: 'python' });
      
      // Configure Python syntax highlighting
      monaco.languages.setMonarchTokensProvider('python', {
        defaultToken: '',
        tokenPostfix: '.python',
        keywords: [
          'False', 'None', 'True', 'and', 'as', 'assert', 'async', 'await',
          'break', 'class', 'continue', 'def', 'del', 'elif', 'else', 'except',
          'finally', 'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda',
          'nonlocal', 'not', 'or', 'pass', 'raise', 'return', 'try', 'while',
          'with', 'yield'
        ],
        
        operators: [
          '+', '-', '*', '**', '/', '//', '%', '<<', '>>', '&', '|', '^', '~',
          '<', '>', '<=', '>=', '==', '!=', '<>', '+=', '-=', '*=', '/=', '//=',
          '%=', '&=', '|=', '^=', '>>=', '<<=', '**='
        ],

        // Brackets and delimiters
        brackets: [
          { open: '{', close: '}', token: 'delimiter.curly' },
          { open: '[', close: ']', token: 'delimiter.square' },
          { open: '(', close: ')', token: 'delimiter.parenthesis' }
        ],

        // Token rules
        tokenizer: {
          root: [
            { include: '@whitespace' },
            { include: '@numbers' },
            { include: '@strings' },
            
            [/[,:;]/, 'delimiter'],
            [/[{}\[\]()]/, '@brackets'],
            
            [/@[a-zA-Z]\w*/, 'tag'],
            [/[a-zA-Z]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }]
          ],

          whitespace: [
            [/\s+/, 'white'],
            [/(^#.*$)/, 'comment']
          ],

          numbers: [
            [/\d*\.\d+([eE][-+]?\d+)?/, 'number.float'],
            [/\d+/, 'number']
          ],

          strings: [
            [/'([^'\\]|\\.)*$/, 'string.invalid'],
            [/"([^"\\]|\\.)*$/, 'string.invalid'],
            [/'/, 'string', '@string_single'],
            [/"/, 'string', '@string_double']
          ],

          string_single: [
            [/[^\\']+/, 'string'],
            [/\\./, 'string.escape'],
            [/'/, 'string', '@pop']
          ],

          string_double: [
            [/[^\\"]+/, 'string'],
            [/\\./, 'string.escape'],
            [/"/, 'string', '@pop']
          ]
        }
      });

      editorRef.current = monaco.editor.create(containerRef.current, {
        value: code,
        language: 'python',
        theme: 'vs',
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly: readOnly,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        padding: { top: 10, bottom: 10 },
      });

      editorRef.current.onDidChangeModelContent(() => {
        onChange(editorRef.current?.getValue() || '');
      });
    }

    return () => {
      editorRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && code !== editorRef.current.getValue()) {
      editorRef.current.setValue(code);
    }
  }, [code]);

  return (
    <div ref={containerRef} className="h-[400px] w-full" />
  );
}
