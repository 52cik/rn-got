# rn-got

> react native fetch helper.

## Usage

```sh
$ yarn add rn-got
```

```js
import got from 'rn-got';

(async () => {
 let body;
 body = await got('url'); // string
 body = await got('url', { ajax: true }); // string
 body = await got('url', { json: true }); // object
 body = await got('url', { referer: 'referer url' }); // string
 body = await got('url', { json: true, callbackName: 'callbackName' }); // object
})();
```
