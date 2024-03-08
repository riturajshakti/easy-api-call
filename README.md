# Introduction

**`easy-api-call`** A Zero dependency npm package which is the simplified version of fetch API and axios API, build on top of Promise API compatible on both browser and servers. On browser it uses XMLHttpRequest and on node environment it uses http/https module.

Please write any issues on github if you found any. Don't hesitate to suggest any new features.

# Useful Links

- [How to install](#how-to-install)
- [Usage](#usage)
  - [1. GET API](#1-get-api)
  - [2. POST API](#2-post-api)
  - [3. Multipart FormData](#3-multipart-formdata)
- [API](#api)
  - [Function Definition](#function-definition)
    - [`ApiOptions` structure](#apioptions-structure)
    - [`ApiResponse` structure](#apiresponse-structure)

# How to install

Run this command in the root of your npm project

```sh
npm i easy-api-call
```

# Usage

## 1. GET API

```js
import apicall from 'easy-api-call'

apicall('https://jsonplaceholder.typicode.com/posts/1')
  .then((e) => console.log(e.json))
  .catch((e) => console.error('Error:', e))
```

Sample Output:

```js
{
  userId: 1,
  id: 1,
  title: 'Nature is beautiful', 
  body: 'Nature is so beautiful. Love it! Care it! Save it!' 
}
```

## 2. POST API

```js
import apicall from 'easy-api-call'

apicall('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  jsonBody: {
    title: 'foo',
    body: 'bar',
    userId: 1,
  }
})
  .then((e) => console.log(e.json))
  .catch((e) => console.error('Error:', e))
```

This is the output you'll receive:

```js
{
  title: 'foo',
  body: 'bar', 
  userId: 1,
  id: 101
}
```

## 3. Multipart FormData

```js
import apicall from 'easy-api-call'

const formData = new FormData()
formData.append('name', 'john doe')
formData.append('file', myFileObject)

apicall('https://api.example.com/files', {
  method: 'PUT',
  headers: {
    'x-api-key': '123'
  },
  regularBody: formData,
  urlSearchParams: {
    renameFile: 'yes'
  },
  uploadProgress: (percent) => console.log(`${percent}% uploaded`)
})
  .then((e) => console.log(e.statusCode, e.statusMessage, e.json))
  .catch((e) => console.error('Error:', e))
```


# API

## Function Definition

```js
function apicall(url: string, options: ApiOptions): ApiResponse {
  // internal implementation
}
```

### `ApiOptions` structure

```ts
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'
  regularBody?: any
  jsonBody?: any
  headers?: Record<string, string>
  urlSearchParams?: Record<string, any>
  uploadProgress?: (uploadedPercentage: number) => any
}
```

1. `method`: Used to set the API call method as the name suggest. Default value is `GET`

2. `regularBody`: Used to set the request body for the API call

3. `jsonBody`: Used to set the request body, you can directly pass JSON data. This also sets `content-type: application/json` internally in the header

4. `headers`: Sets the request headers for the api call, this must be an object where key and value both must be string

5. `urlSearchParams`: Set the request URL query (also known as URL Search Parameters) for the API call. It requires an object where key and value both must be string. This also encodes the values

6. `uploadProgress`: Sets a handler for upload progress updates, this requires a function where you'll be getting a value of uploadedPercentage which basically means the % value of the data uploaded. This is generally used for form data when you have provided large files and want to know the upload % at the time of uploading data to the API

### `ApiResponse` structure

```ts
interface ApiResponse {
  ok: boolean
  statusCode: number
  statusMessage: string
  headers: Record<string, string>
  response: Response
  json?: JSON
}
```

1. `ok`: Used to indicate if API call succeeded. Returns `true` of response status code is in between `200` - `299` (inclusive).

> **Warning:** Don't trust it in case if your API is returning any status code between 300-399 range which has a success meaning. As it depends on the API implementation in most cases

2. `statusCode`: The status code of the API response

3. `statusMessage`: The status message of the API response

4. `headers`: The headers of the API response. Its an object where key and value both are string

5. `response`: The `Response` data which we get after doing API call. It is same as the `Response` object which we receive after calling `fetch` API

6. `json`: Returns the json data, it will only be available if the API response returns a json body. It does so by first checking if the response header's `content-type` value starts with `application/json` and then parses the body using `JSON.parse`
