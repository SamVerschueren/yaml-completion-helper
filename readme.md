# yaml-completion-helper [![Build Status](https://travis-ci.org/SamVerschueren/yaml-completion-helper.svg?branch=master)](https://travis-ci.org/SamVerschueren/yaml-completion-helper)

> Completion provider helper for Yaml files


## Install

```
$ npm install yaml-completion-helper
```


## Usage

```js
import CompletionHelper from 'yaml-completion-helper';

const yaml = new CompletionHelper({
	{
		name: 'foo',
		type: 'keyword',
		description: 'foo bar',
		values: [
			{
				name: '🌈',
				description: 'Rainbow'
			},
			{
				name: '🦄',
				description: 'Unicorn'
			}
		]
	}
});

const completions = yaml.complete('', {
	lineNumber: 1,
	column: 1
});
```


## License

MIT © [Sam Verschueren](https://github.com/SamVerschueren)
