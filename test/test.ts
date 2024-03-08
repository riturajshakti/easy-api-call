import apicall from '../src/index'

apicall('https://jsonplaceholder.typicode.com/posts', {
	method: 'POST',
	jsonBody: {
		title: 'foo',
    body: 'bar',
    userId: 1,
	},
})
	.then((e) => console.log(e.json))
	.catch((e) => console.error('Error:', e))
