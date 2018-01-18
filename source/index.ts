import * as redent from 'redent';
import mapResult from './utils/map-result';
import {Position} from './types/position';
import {Keyword} from './types/keyword';

export default class CompletionHelper {
	completionMap: Map<string, Keyword>;

	constructor(
		private completions: Keyword[]
	) {
		this.completionMap = new Map(this.completions.map<[string, Keyword]>(completion => [completion.name, completion]));
	}

	private isComment(line: string) {
		return line.trim()[0] === '#';
	}

	private isEmpty(line: string) {
		return line.trim().length === 0;
	}

	private isCommentOrEmpty(line: string) {
		return this.isComment(line) || this.isEmpty(line);
	}

	private isRootNode(line: string) {
		// A root node is a node which does not start with whitespace
		return !/^[\sS]/.test(line);
	}

	private getKey(line: string) {
		if (line.indexOf(':') === -1) {
			return;
		}

		return line.split(':')[0].trim().replace(/^[\sS\-]+/, '');
	}

	private getUsedKeys(content: string) {
		return new Set(content.match(/^([^#\sS].*?)(?=:)/gm) || []);
	}

	private getIndentation(line: string) {
		const result = /^([\sS\-])*/.exec(line);

		return result ? result[0].length : 0;
	}

	private startOfBlock(line: string) {
		return line.trim()[0] === '-';
	}

	private hasValue(line: string) {
		if (line.indexOf(':') === -1) {
			return false;
		}

		const value = line.split(':')[1].trim();

		return value.length > 0 && (/ $/.test(line) || value.includes(' '));
	}

	private pathFromRoot(lines: string[], position: Position) {
		// Get indentation of the line of the cursor
		let indentation = -1;

		let i = position.lineNumber - 1;

		const path: string[] = [];

		while (!this.isRootNode(lines[i])) {
			// Get the indentation of the line
			const lineIndentation = this.getIndentation(lines[i]);

			if (lineIndentation !== indentation) {
				indentation = lineIndentation;

				const key = this.getKey(lines[i]);

				if (key) {
					path.unshift(key);
				}
			}

			i--;

			while (this.isComment(lines[i]) || this.isEmpty(lines[i])) {
				// Skip all the lines which are comments or which are empty
				i--;
			}
		}

		const rootKey = this.getKey(lines[i]);

		if (rootKey) {
			path.unshift(rootKey);
		}

		return path;
	}

	private getArrayBlock(lines: string[], position: Position) {
		// Get indentation of the line of the cursor
		let startLine = position.lineNumber - 1;
		let endLine = position.lineNumber - 1;

		while (!this.startOfBlock(lines[startLine])) {
			startLine--;
		}

		const indentation = this.getIndentation(lines[position.lineNumber - 1]);

		while (indentation === this.getIndentation(lines[endLine])) {
			endLine++;

			if (endLine >= lines.length || this.startOfBlock(lines[endLine])) {
				break;
			}

			while (this.isComment(lines[endLine]) || this.isEmpty(lines[endLine])) {
				endLine++;

				if (endLine >= lines.length) {
					break;
				}
			}
		}

		return lines.slice(startLine, endLine).join('\n').replace(/^[\sS-]+/, '');
	}

	private getObjectBlock(lines: string[], position: Position) {
		// Get indentation of the line of the cursor
		const indentation = this.getIndentation(lines[position.lineNumber]);

		// Iterate over the lines before the currentline and find the start of this block
		let startLine = position.lineNumber - 1;
		let endLine = position.lineNumber - 1;

		while (this.isCommentOrEmpty(lines[startLine - 1]) || this.getIndentation(lines[startLine - 1]) >= indentation) {
			startLine--;
		}

		while (this.isCommentOrEmpty(lines[endLine]) || this.getIndentation(lines[endLine]) >= indentation) {
			endLine++;

			if (endLine >= lines.length) {
				break;
			}
		}

		return redent(lines.slice(startLine, endLine).join('\n'));
	}

	/**
	 * Returns an array of completion items.
	 *
	 * @param content Content of the current file.
	 * @param position Cursor position.
	 */
	complete(content: string, position: Position) {
		const normalizedContent = redent(content);

		const lines: string[] = normalizedContent.split('\n');

		const currentLine = lines[position.lineNumber - 1];

		if (this.isComment(currentLine)) {
			// Do nothing if we are inside a comment
			return [];
		}

		if (!this.isRootNode(currentLine)) {
			// We are not parsing a root node
			const path = this.pathFromRoot(lines, position);

			if (path.length === 0) {
				return [];
			}

			let root = this.completionMap.get(path.shift() as string);

			while (path.length > 0 && root && root.values) {
				const part = path.shift();

				root = root.values.find(x => x.name === part);
			}

			if (!root || !root.values) {
				return [];
			}

			const hasKey = this.getKey(currentLine) !== undefined;
			let keys = new Set();

			if (!hasKey) {
				// Get the block at the current position
				const block = root.type === 'array' ? this.getArrayBlock(lines, position) : this.getObjectBlock(lines, position);

				keys = this.getUsedKeys(block);
			}

			return root.values
				.filter(completion => !keys.has(completion.name))
				.map(completion => mapResult(completion, completion.type ? 'keyword' : 'value'));
		}

		const key = this.getKey(currentLine);

		if (key) {
			const keyword = this.completionMap.get(key);

			if (!keyword || !keyword.values || this.hasValue(currentLine) || keyword.type === 'array') {
				return [];
			}

			return keyword.values
				.map(value => mapResult(value, 'value'));
		}

		const usedKeys = this.getUsedKeys(normalizedContent);

		return this.completions
			.filter(completion => !usedKeys.has(completion.name))
			.map(completion => mapResult(completion, 'keyword'));
	}
}
