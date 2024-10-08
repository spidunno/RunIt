import { Editor } from '@monaco-editor/react';
import defaultContent from './defaultScript.ts?raw';
import React, { useEffect, useState } from 'react';
import { createATA } from './ata';

export const typeHelper = createATA();

export function useProgress() {
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const handleProgress = (progress: number, total: number) => {
      setProgress(progress);
      setTotal(total);
    };
    typeHelper.addListener('progress', handleProgress);

    const handleFinished = () => setFinished(true);
    typeHelper.addListener('finished', handleFinished);

    const handleStarted = () => setFinished(false);
    typeHelper.addListener('started', handleStarted);

    return () => {
      typeHelper.removeListener('progress', handleProgress);
      typeHelper.removeListener('finished', handleFinished);
      typeHelper.removeListener('started', handleStarted);
    };
  }, []);

  return { progress, total, finished };
}

export const setupEditor: NonNullable<React.ComponentProps<typeof Editor>['onMount']> = (
  editor,
  monaco
) => {
  // acquireType on initial load
  editor.onDidChangeModelContent(() => {
    typeHelper.acquireType(editor.getValue());
  });

  const defaults = monaco.languages.typescript.typescriptDefaults;

  defaults.setCompilerOptions({
    // jsx: JsxEmit.React,
		// target: monaco.languages.typescript.ScriptTarget.ES2015,
    esModuleInterop: true,
    module: monaco.languages.typescript.ModuleKind.ESNext,
    // module: monaco.languages.typescript.ModuleKind.ES2015,
		// noEmit: true,
    target: monaco.languages.typescript.ScriptTarget.ES2017,
		noLib: true,
		moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
		// typeRoots: ["node_modules/@types"]
		lib: ['es6', 'webworker'],
	});
editor.updateOptions({detectIndentation: false, insertSpaces: false, tabSize: 2})
	// defaults.addExtraLib(workerLib, 'lib.webworker.symbol.d.ts');
	// defaults.addExtraLib(es6lib, 'lib.es6.symbol.d.ts');
  const addLibraryToRuntime = (code: string, _path: string) => {
    const path = 'file://' + _path;
    defaults.addExtraLib(code, path);
    // don't need to open the file in the editor
    // const uri = monaco.Uri.file(path);
    // if (monaco.editor.getModel(uri) === null) {
      // monaco.editor.createModel(code, 'javascript', uri);
    // }
  };
  import('./libs.json').then(async ({default: libs}) => {
    for (const lib of libs) addLibraryToRuntime(await (await fetch(`/RunIt/libs/${lib}`)).text(), `/libs/${lib}`)
  });

  typeHelper.addListener('receivedFile', addLibraryToRuntime);

  typeHelper.acquireType(defaultContent);

  // auto adjust the height fits the content
  const element = editor.getDomNode();
  const height = editor.getScrollHeight();
  if (element) {
    element.style.height = `${height}px`;
  }
};