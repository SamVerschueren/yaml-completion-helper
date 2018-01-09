import test from 'ava';
import CompletionHelper from '..';

const provider = new CompletionHelper([
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
]);

test('return all keywords if line is empty', t => {
	const result = provider.complete([
		'# Comment',
		'',
		'hello: world',
		''
	].join('\n'), {
		column: 1,
		lineNumber: 4
	});

	t.deepEqual(result, [
		{
			name: 'foo',
			type: 'keyword',
			description: 'foo bar'
		}
	]);
});

test('return empty list if in comment', t => {
	const result = provider.complete('#', {
		column: 2,
		lineNumber: 1
	});

	t.deepEqual(result, []);
});

test('return the values of an existing keyword', t => {
	const result = provider.complete([
		'# Comment',
		'',
		'hello: world',
		'foo: '
	].join('\n'), {
		column: 6,
		lineNumber: 4
	});

	t.deepEqual(result, [
		{
			name: '🌈',
			type: 'value',
			description: 'Rainbow'
		},
		{
			name: '🦄',
			type: 'value',
			description: 'Unicorn'
		}
	]);
});

test('unknown keyword returns empty array', t => {
	const result = provider.complete([
		'# Comment',
		'',
		'hello: ',
		'foo: 🌈'
	].join('\n'), {
		column: 8,
		lineNumber: 3
	});

	t.deepEqual(result, []);
});

test('should return empty array if already completed', t => {
	const result = provider.complete([
		'# Comment',
		'',
		'hello: world',
		'foo: 🌈 '
	].join('\n'), {
		column: 8,
		lineNumber: 4
	});

	t.deepEqual(result, []);
});

test('completion should work with indented content', t => {
	const result = provider.complete([
		'    # Comment',
		'',
		'    hello: world',
		'    foo: '
	].join('\n'), {
		column: 6,
		lineNumber: 4
	});

	t.deepEqual(result, [
		{
			name: '🌈',
			type: 'value',
			description: 'Rainbow'
		},
		{
			name: '🦄',
			type: 'value',
			description: 'Unicorn'
		}
	]);
});
