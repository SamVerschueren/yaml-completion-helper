export interface Keyword {
	name: string;
	type?: 'keyword' | 'value' | 'array';
	description?: string;
	values?: Keyword[];
}
