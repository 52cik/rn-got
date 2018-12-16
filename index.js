const headers = {
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7,ja;q=0.6',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.80 Safari/537.36',
  'Upgrade-Insecure-Requests': '1',
};

function param(data) {
  return Object.keys(data)
    .map(k => `${k}=${encodeURIComponent(data[k])}`)
    .join('&');
}

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
  if (opts.body) {
    if (opts.form) {
      opts.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    } else {
      opts.headers['Content-Type'] = 'application/json; charset=UTF-8';
    }

    if (typeof opts.body !== 'string') {
      if (opts.form) {
        opts.body = param(opts.body);
      } else {
        opts.body = JSON.stringify(opts.body);
      }
    }
  }

  // 处理请求参数
  if (opts.query && typeof opts.query !== 'string') {
    url += `?${param(opts.query)}`;
  }

  // 发起请求
  const request = fetch(url, opts).then((res) => {
    const reply = body => ({
      res,
      body,
      headers: res.headers,
      status: res.status,
      url: res.url,
    });

    // jsonp
    if (opts.json && opts.callbackName) {
      return res
        .text()
        .then(str => str.replace(opts.callbackName, ''))
        .then(eval) // eslint-disable-line
        .then(reply);
    }

    // json
    if (opts.json) {
      return res.json().then(reply);
    }

    // text
    return res.text().then(reply);
  });

  // 超时控制
  const timeout = ms => new Promise((resolve, reject) => {
    if (ms && typeof ms === 'number') {
      setTimeout(() => reject(Error('timeout!')), ms);
    }
  });

  return Promise.race([request, timeout(opts.timeout)]);
}

const aliases = ['get', 'post', 'put', 'patch', 'head', 'delete'];

aliases.forEach((name) => {
  const method = name.toUpperCase();
  got[name] = (url, opts) => got(url, Object.assign(opts, { method }));
});

module.exports = got;
