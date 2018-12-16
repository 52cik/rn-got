import test from 'ava';
import fetch from 'node-fetch';

import got from '..';
import { createServer } from './helpers/server';

global.fetch = fetch;

let s;

test.before('setup', async () => {
  s = await createServer();

  s.on('/', (request, response) => {
    response.end('ok');
  });

  s.on('/empty', (request, response) => {
    response.end();
  });

  s.on('/timeout', (request, response) => {
    setTimeout(() => {
      response.end('timeout');
    }, 2000);
  });

  s.on('/404', (request, response) => {
    response.statusCode = 404;
    response.end('not');
  });

  s.on('/?a=123&b=asd', (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end('{"a":123,"b":"asd"}');
  });

  s.on('/?a=123&b=asd&callback=cb', (request, response) => {
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end('cb({"a":123,"b":"asd"})');
  });

  await s.listen(s.port);
});

test.after('cleanup', async () => {
  await s.close();
});

test('simple request', async (t) => {
  t.is((await got(s.url)).body, 'ok');
});

test('timeout request', async (t) => {
  const start = Date.now();
  t.is((await got(`${s.url}/timeout`)).body, 'timeout');
  t.true(Date.now() - start >= 2000);
});

test('timeout request', async (t) => {
  const start = Date.now();
  const error = await t.throws(got(`${s.url}/timeout`, { timeout: 100 }));
  t.is(error.message, 'timeout!');
  t.true(Date.now() - start <= 200);
});

test('empty response', async (t) => {
  t.is((await got(`${s.url}/empty`)).body, '');
});

test('requestUrl response', async (t) => {
  t.is((await got(s.url)).url, `${s.url}/`);
  t.is((await got(`${s.url}/empty`)).url, `${s.url}/empty`);
});

test('with 404 code', async (t) => {
  const res = await got(`${s.url}/404`);
  t.is(res.status, 404);
  t.is(res.body, 'not');
});

test('with referer', async (t) => {
  t.is((await got(s.url, { referer: s.url })).body, 'ok');
});

test('with ajax', async (t) => {
  t.is((await got(s.url, { ajax: true })).body, 'ok');
});

test('querystring', async (t) => {
  const { body } = await got(`${s.url}`, { query: { a: 123, b: 'asd' } });
  t.is(body, '{"a":123,"b":"asd"}');
});

test('querystring with json', async (t) => {
  const { body } = await got(`${s.url}`, { query: { a: 123, b: 'asd' }, json: true });
  t.deepEqual(body, { a: 123, b: 'asd' });
});

test('querystring with callbackName', async (t) => {
  const { body } = await got(`${s.url}`, {
    query: { a: 123, b: 'asd', callback: 'cb' },
    callbackName: 'cb',
    json: true,
  });
  t.deepEqual(body, { a: 123, b: 'asd' });
});

test('post with json', async (t) => {
  const data = { a: 123, b: 'asd' };
  const { body } = await got.post(`${s.url}`, { query: data, body: data, json: true });
  t.deepEqual(body, { a: 123, b: 'asd' });
});

test('post with form', async (t) => {
  const data = { a: 123, b: 'asd' };
  const { body } = await got.post(`${s.url}`, {
    query: data,
    body: data,
    json: true,
    form: true,
  });
  t.deepEqual(body, { a: 123, b: 'asd' });
});

test('post with form', async (t) => {
  const data = { a: 123, b: 'asd' };
  const { body } = await got.post(`${s.url}`, {
    query: data,
    body: '2333',
    json: true,
    form: true,
  });
  t.deepEqual(body, { a: 123, b: 'asd' });
});
