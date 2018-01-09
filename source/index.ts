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

	private isRootNode(line: string) {
		return line.charAt(0) !== ' ';
	}

	private getKey(line: string) {
		if (line.indexOf(':') === -1) {
			return;
		}

		return line.split(':')[0].trim();
	}

	private hasValue(line: string) {
		if (line.indexOf(':') === -1) {
			return false;
		}

		const value = line.split(':')[1].trim();

		return value.length > 0 && / $/.test(line);
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
			// Currently, we only parse root nodes
			return [];
		}

		const key = this.getKey(currentLine);

		if (key) {
			const keyword = this.completionMap.get(key);

			if (!keyword || !keyword.values || this.hasValue(currentLine)) {
				return [];
			}

			return keyword.values
				.map(value => mapResult(value, 'value'));
		}

		const usedKeys = new Set(normalizedContent.match(/^([^#\sS].*?)(?=:)/gm) || []);

		return this.completions
			.filter(completion => !usedKeys.has(completion.name))
			.map(completion => mapResult(completion, 'keyword'));
	}
}
