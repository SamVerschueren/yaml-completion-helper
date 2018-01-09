export default (completion: {name: string; description?: string}, type: 'keyword' | 'value') => ({
	name: completion.name,
	type,
	description: completion.description
});
