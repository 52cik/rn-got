import headers from './headers';

/**
 * 抓取方法
 * @param {string} url 地址
 * @param {object} opts 参数
 * @return {Promise<string|object>} 异步对象
 */
function got(url, opts = {}) {
  // 覆盖 header
  opts.headers = Object.assign({}, headers, opts.headers);

  // 来源参数处理
  if (opts.referer) {
    opts.headers.Referer = opts.referer;
    delete opts.referer;
  }

  // 模拟 ajax 请求
  if (opts.ajax) {
    opts.headers['X-Requested-With'] = 'XMLHttpRequest';
  }

  // json 请求
  if (opts.json) {
    opts.headers.Accept = 'application/json, text/javascript, */*; q=0.01';
  }

  // 合并配置
  opts = Object.assign({ method: 'GET', json: false, callbackName: '' }, opts);

  // TODO: form

  // 处理请求参数
  if (opts.body && typeof opts.body !== 'string') {
    opts.body = JSON.stringify(opts.body);
  }

  // 处理请求参数
  if (opts.query && typeof opts.query !== 'string') {
    url += `?${Object.keys(opts.query)
      .map(k => `${k}=${encodeURIComponent(opts.query[k])}`)
      .join('&')}`;
  }

  // 发起请求
  return fetch(url, opts).then(res => {
    // jsonp
    if (opts.json && opts.callbackName) {
      return res
        .text()
        .then(str => str.replace(opts.callbackName, ''))
        .then(eval); // eslint-disable-line
    }

    // json
    if (opts.json) {
      return res.json();
    }

    // text
    return res.text();
  });
}

const aliases = ['get', 'post', 'put', 'patch', 'head', 'delete'];

aliases.forEach(name => {
  const method = name.toUpperCase();
  got[name] = (url, opts) => got(url, Object.assign(opts, { method }));
});

export default got;
