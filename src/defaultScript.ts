// Import *any* library from NPM
import * as Babel from '@babel/standalone';

const transformed = Babel.transform(
	`
	const myVar: string = 'test';
	console.log(myVar);
	`,
	{
		presets: ['typescript'],
		filename: 'index.ts'
	}
);

console.log(transformed.code);