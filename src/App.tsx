import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { setupEditor } from "./setupEditor";
import defaultContent from './defaultScript.ts?raw';
import * as Babel from '@babel/standalone';
import { importDeclaration } from "@babel/types";
import workerHeader from './workerHeader.js?raw';
import { Console, Decode, Hook } from "console-feed";
import { Message } from "console-feed/lib/definitions/Console";
import { useDebounceCallback } from "usehooks-ts";

Babel.registerPlugin('esmshifier', {
  visitor: {
    ImportDeclaration(specifiers: any, source) {
      // console.log(specifiers, source);
      if (specifiers.node.importKind === 'value' && specifiers.node.source.type === 'StringLiteral') {
        const val: string = specifiers.node.source.value;
        if (!/^(.+\:\/\/)/.test(val)) {
          specifiers.node.source.value = `https://esm.sh/${val}`;
        }
      }
    }
  }
} as { visitor: { ImportDeclaration: typeof importDeclaration } });

export default function App() {
  const [ logs, setLogs ] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  const [ transformedCode, setTransformedCode ] = useState('');

  // useEffect(() => {
  //   // setLogs([]);
  //   // const blobUrl = URL.createObjectURL(new Blob([`${workerHeader}\n${transformedCode}`], {type: 'text/javascript'}));
  //   // const worker = new Worker(blobUrl, {type: 'module'});
  //   // worker.onmessage = (ev) => {
  //   //   const message: Message = ev.data;
  //   //   setLogs((currLogs) => [...currLogs, message]);
  //   // }
  //   // worker.onerror = (ev) => {
  //   //   ev.preventDefault();
  //   //   // setLogs((currLogs) => [...currLogs, ]);
  //   // }
  //   // return () => {
  //   //   worker.terminate();
  //   // };
  // }, [transformedCode]);

  useEffect(useDebounceCallback(() => {
    setLogs([]);
    try {
      const transformed = Babel.transform(currentCode, { presets: ['typescript'], filename: '/index.ts', plugins: ['esmshifier'] });
      setTransformedCode(transformed.code || '');
      const blobUrl = URL.createObjectURL(new Blob([`${workerHeader}\n${transformed.code}`], { type: 'text/javascript' }));
      const worker = new Worker(blobUrl, { type: 'module' });
      worker.onmessage = (ev) => {
        console.log(ev.data);
          const message: Message = Decode(ev.data);
          console.log(message);

          setLogs((currLogs) => [...currLogs, message]);
      }
      worker.onerror = (ev) => {
        ev.preventDefault();
        // setLogs((currLogs) => [...currLogs, {method: 'error', data: [ev.error]}]);
      }
      return () => {
        worker.terminate();
      }
    } catch(e) {

    }
  }, 100, {leading: true}), [currentCode]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'row' }}>
      <Editor
        
        value={defaultContent}
        className="editor"
        language="typescript"
        defaultPath="index.ts"
        path="index.ts"
        height="100vh"
        width='50vw'
        theme="vs-dark"
        onChange={(value) => {
          setCurrentCode(value ? value : '');
        }}
        onMount={(...args) => {
          setupEditor(...args);
          setCurrentCode(defaultContent);
          try {
            const transfomed = Babel.transform(defaultContent, { presets: ['typescript'], filename: '/index.ts', plugins: ['esmshifier'] });
            setTransformedCode(transfomed.code || '');
          } catch(e) {
      
          }
        }}
        options={{
          lineNumbers: 'off',
          minimap: { enabled: false },
          scrollbar: { horizontal: 'hidden', vertical: 'hidden' },
          overviewRulerLanes: 0,
          // renderLineHighlight: 'none',
          renderLineHighlightOnlyWhenFocus: true,
        }}
      />
      <div style={{ height: '100vh', maxHeight: '100vh', overflowY: 'scroll', width: '50vw', background: 'rgb(30, 30, 30)', borderLeft: '1px solid #2c2c2c' }}>
        <Console variant="dark" logs={logs} styles={{"BASE_BACKGROUND_COLOR": 'rgb(30, 30, 30)'}}/>
      </div>
    </div>
  );
}