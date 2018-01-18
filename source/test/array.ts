import test from 'ava';
import {complete} from './helpers/utils';
import CompletionHelper from '..';

const provider = new CompletionHelper([
	{
		name: 'foo',
		type: 'array',
		description: 'foo bar',
		values: [
			{
				name: 'value',
				type: 'keyword',
				description: 'Value description',
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
			},
			{
				name: 'bar',
				type: 'keyword',
				description: 'Bar description'
			}
		]
	}
]);

test('return the keywords inside an array', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈
			- ^
	`);

	t.deepEqual(result, [
		{
			name: 'value',
			type: 'keyword',
			description: 'Value description'
		},
		{
			name: 'bar',
			type: 'keyword',
			description: 'Bar description'
		}
	]);
});

test('return the keywords inside an array with empty line', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈
			- value: 🦄

			- ^
	`);

	t.deepEqual(result, [
		{
			name: 'value',
			type: 'keyword',
			description: 'Value description'
		},
		{
			name: 'bar',
			type: 'keyword',
			description: 'Bar description'
		}
	]);
});

test('return the keywords inside an array with comment at same level', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈
			- value: 🦄
			# Some comment
			- ^
	`);

	t.deepEqual(result, [
		{
			name: 'value',
			type: 'keyword',
			description: 'Value description'
		},
		{
			name: 'bar',
			type: 'keyword',
			description: 'Bar description'
		}
	]);
});

test('return the keywords inside an array with comment at root level', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈
			- value: 🦄
		# Some comment
			- ^
	`);

	t.deepEqual(result, [
		{
			name: 'value',
			type: 'keyword',
			description: 'Value description'
		},
		{
			name: 'bar',
			type: 'keyword',
			description: 'Bar description'
		}
	]);
});

test('only return unused values inside an array', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈
			  ^
			- value: 🦄
			  bar: foo
	`);

	t.deepEqual(result, [
		{
			name: 'bar',
			type: 'keyword',
			description: 'Bar description'
		}
	]);
});

test('only return unused values inside an array and filter out comments and empty lines', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈

			  # Some comment goes here
			  ^
			- value: 🦄
			  bar: foo
	`);

	t.deepEqual(result, [
		{
			name: 'bar',
			type: 'keyword',
			description: 'Bar description'
		}
	]);
});

test('only return unused values inside an array when inserting in the beginning', t => {
	const result = complete(provider, `
		foo:
			- ^
			  bar: foo
	`);

	t.deepEqual(result, [
		{
			name: 'value',
			type: 'keyword',
			description: 'Value description'
		}
	]);
});

test('return the values inside an array', t => {
	const result = complete(provider, `
		foo:
			- value: 🌈
			- value: ^
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
