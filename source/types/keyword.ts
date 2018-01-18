export interface Keyword {
	name: string;
	type?: 'keyword' | 'value' | 'array' | 'object';
	description?: string;
	values?: Keyword[];
}
