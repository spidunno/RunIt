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
import { RawSourceMap, SourceMapConsumer } from "source-map-js";

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
      const transformed = Babel.transform(currentCode, { sourceMaps: true, presets: ['typescript'], filename: '/index.ts', plugins: ['esmshifier'] });
      // console.log(transformed);
      const smc = new SourceMapConsumer(transformed.map as unknown as RawSourceMap);
      // console.log(smc);
      const blobUrl = URL.createObjectURL(new Blob([`${workerHeader}\n${transformed.code}`], { type: 'text/javascript' }));
      const worker = new Worker(blobUrl, { type: 'module' });
      worker.onmessage = (ev) => {
        if (ev.data[0].method === 'prompt') {
          const data = ev.data[0];
          const sab: SharedArrayBuffer = data.data[0];
          const ia = new Int32Array(sab);
          const ua = new Uint8Array(sab);
          const message: string | undefined = data.data[1];
          const defaultMessage: string | undefined  = data.data[2];
          const te = new TextEncoder();
          
          setLogs((currLogs) => [...currLogs, {method: 'command', data: Array(currLogs.length % 2), timestamp: <><div style={{color: 'rgb(212, 212, 212)'}} data-type="string">{message}</div><input defaultValue={defaultMessage} onKeyUp={ev => {
            if (ev.key === 'Enter') {
              // const encoded = te.encode(prompt(message, defaultMessage) || '');
              const encoded = te.encode(ev.currentTarget.value);
              ev.currentTarget.disabled = true;
              sab.grow(8 + encoded.byteLength);
    
              for (let i in encoded) {
                Atomics.store(ua, parseInt(i) + 8, encoded[i]);
              }
              Atomics.store(ia, 0, 1);
              Atomics.notify(ia, 0);
            }
          }}/></> as unknown as string}]);
        }
        // console.log(ev.data);
        else if (ev.data[0].method === 'clear') {
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
          if (message.method === 'error' && message.data && typeof message.data[0] === 'string') {
            const match = message.data[0].match(/(http|https):\/\/.+\/.+:([0-9]+):([0-9]+)/);
            if (match) {
              
              const [ columnString, lineString ] = match.slice(-2);
              const [ column, line ] = [columnString, lineString].map(v => parseInt(v));
              // console.log(line - 1, column);
              // console.log(transformed.code);
              const orig = smc.originalPositionFor({line: line, column: column});
              // console.log(orig);

              message.data[0] = message.data[0].replaceAll(`${columnString}:${lineString}`, `${orig.column}:${orig.line}`);
            }
          };
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
          // filter={[]}
          // searchKeywords="."
          // logFilter={(log) => {log.timestamp = <input/>;console.log(log);return true}}
          styles={{"BASE_BACKGROUND_COLOR": 'rgb(30, 30, 30)', 'OBJECT_VALUE_STRING_COLOR': 'rgb(206, 145, 120)', "OBJECT_VALUE_REGEXP_COLOR": 'rgb(180, 102, 149)', 'OBJECT_VALUE_FUNCTION_PREFIX_COLOR': 'rgb(86, 156, 214)', 'OBJECT_NAME_COLOR': '#c586c0', 'BASE_COLOR': 'rgb(212, 212, 212)', 'LOG_COLOR': 'rgb(212, 212, 212)', OBJECT_VALUE_UNDEFINED_COLOR: '#a1a1a1', OBJECT_VALUE_NUMBER_COLOR: 'rgb(181, 206, 168)'}}/>
      </div>
    </div>
  );
}