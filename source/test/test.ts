import test from 'ava';
import {complete} from './helpers/utils';
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
	const result = complete(provider, `
		# Comment

		hello: world
		^
	`);

	t.deepEqual(result, [
		{
			name: 'foo',
			type: 'keyword',
			description: 'foo bar'
		}
	]);
});

test('return all keywords if line already started but has no value', t => {
	const result = complete(provider, `
		# Comment

		hello: world
		fo^
	`);

	t.deepEqual(result, [
		{
			name: 'foo',
			type: 'keyword',
			description: 'foo bar'
		}
	]);
});

test('return empty list if in comment', t => {
	const result = complete(provider, '#^');

	t.deepEqual(result, []);
});

test('return the values of an existing keyword', t => {
	const result = complete(provider, `
		# Comment

		hello: world
		foo: ^
	`);

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
	const result = complete(provider, `
		# Comment

		hello: ^
		foo: 🌈
	`);

	t.deepEqual(result, []);
});

test('should return empty array if already completed', t => {
	const result = complete(provider, `
		# Comment

		hello: world
		foo: 🌈 ^
	`);

	t.deepEqual(result, []);
});

test('completion should work with indented content', t => {
	const result = complete(provider, [
		'    # Comment',
		'',
		'    hello: world',
		'    foo: ^'
	].join('\n'));

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
