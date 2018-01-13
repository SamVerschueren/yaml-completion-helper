import CompletionHelper from '../..';

export const complete = (provider: CompletionHelper, content: string) => {
	let position;

	const lines = content.split('\n');

	for (let i = 0; i < lines.length; i++) {
		if (!lines[i].includes('^')) {
			continue;
		}

		position = {
			column: lines[i].indexOf('^') + 1,
			lineNumber: i + 1
		};

		break;
	}

	return provider.complete(content.replace('^', ''), position);
};
