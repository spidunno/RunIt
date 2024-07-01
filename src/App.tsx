import { Editor } from "@monaco-editor/react";
import { useEffect, useState } from "react";
import { setupEditor } from "./setupEditor";
import defaultContent from './defaultScript.ts?raw';
import * as Babel from '@babel/standalone';
import { importDeclaration } from "@babel/types";
import workerHeader from './workerHeader.js?raw';
import { Console, Decode } from "console-feed";
import { Message } from "console-feed/lib/definitions/Console";
import { useDebounceCallback } from "usehooks-ts";
import ansi, { parse } from "ansicolor";

console.log(parse('test'));
ansi.rgb = {

  black:        [0,     0,   0],    
  darkGray:     [128, 128, 128],
  lightGray:    [212, 212, 212],
  white:        [255, 255, 255],

  red:          [237, 78, 76],
  lightRed:     [242, 139, 130],
  
  green:        [1, 200, 1],
  lightGreen:   [161, 247, 181],
  
  yellow:       [210, 192, 87],
  lightYellow:  [221, 251, 85],
  
  blue:         [39, 116, 240],
  lightBlue:    [102, 157, 246],
  
  magenta:      [161, 66, 244],
  lightMagenta: [214, 112, 214],
  
  cyan:         [18, 181, 203],
  lightCyan:    [132, 240, 255],
}

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

      // stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid stupid
      source;
    }
  }
} as { visitor: { ImportDeclaration: typeof importDeclaration } });

export default function App() {
  const [ logs, setLogs ] = useState<Message[]>([]);
  const [currentCode, setCurrentCode] = useState('');
  // const [ transformedCode, setTransformedCode ] = useState('');

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
      const blobUrl = URL.createObjectURL(new Blob([`${workerHeader}\n${transformed.code}`], { type: 'text/javascript' }));
      const worker = new Worker(blobUrl, { type: 'module' });
      worker.onmessage = (ev) => {
        if (ev.data[0].method === 'clear') {
          const message: Message = {
            data: [
              "%cConsole was cleared",
              "font-style: italic; color: rgb(127, 127, 127);"
            ],
            method: 'log'
          };
          setLogs([message]);
        }
        else {
          const message: Message = Decode(ev.data);
          const newMessageData = message.data ? message.data.flatMap(v => {
            if (typeof v === 'string') {
              const parsed = parse(v).asChromeConsoleLogArguments;
              if (parsed.length === 2 && parsed[1] === "") return [v];
              else return parsed;
            } else {
              return [v];
            }
          }) : message.data;
          message.data = newMessageData;
          // if (newMessageData) {for (const i in newMessageData) {
          //   const msg = newMessageData[i];
          //   if (typeof msg === 'string') newMessageData.splice(parseInt(i), 1, ...parse(msg).asChromeConsoleLogArguments);
          // }}
          // console.log(message);
          if (message.data?.length === 0) message.data[0] = undefined;
          setLogs((currLogs) => [...currLogs, message]);
        }
      }
      worker.onerror = () => false
      return () => {
        worker.terminate();
      }
    } catch(e) {

    }
  }, 100, {leading: true}), [currentCode]);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Editor
        value={defaultContent}
        className="editor"
        language="typescript"
        defaultPath="index.ts"
        path="index.ts"
        height="50vh"
        width='100vw'
        theme="vs-dark"
        onChange={(value) => {
          setCurrentCode(value ? value : '');
        }}
        onMount={(...args) => {
          setupEditor(...args);
          setCurrentCode(defaultContent);
          // try {
          //   // const transfomed = Babel.transform(defaultContent, { presets: ['typescript'], filename: '/index.ts', plugins: ['esmshifier'] });
          //   // setTransformedCode(transfomed.code || '');
          // } catch(e) {
      
          // }
        }}
        options={{
          fontFamily: 'Fira Code',
          fontLigatures: true,
          lineNumbers: 'off',
          minimap: { enabled: false },
          scrollbar: { horizontal: 'hidden', vertical: 'hidden' },
          overviewRulerLanes: 0,
          // renderLineHighlight: 'none',
          renderLineHighlightOnlyWhenFocus: true,
        }}
      />
      <div className="console-container">
        <Console variant="dark"
          // @ts-expect-error
          logs={logs}
          styles={{"BASE_BACKGROUND_COLOR": 'rgb(30, 30, 30)', 'OBJECT_VALUE_STRING_COLOR': 'rgb(206, 145, 120)', "OBJECT_VALUE_REGEXP_COLOR": 'rgb(180, 102, 149)', 'OBJECT_VALUE_FUNCTION_PREFIX_COLOR': 'rgb(86, 156, 214)', 'OBJECT_NAME_COLOR': '#c586c0', 'BASE_COLOR': 'rgb(212, 212, 212)', 'LOG_COLOR': 'rgb(212, 212, 212)', OBJECT_VALUE_UNDEFINED_COLOR: '#a1a1a1', OBJECT_VALUE_NUMBER_COLOR: 'rgb(181, 206, 168)'}}/>
      </div>
    </div>
  );
}