// NEW: Helper function to extract parameters from any request type
async function getParams(request) {
  const { searchParams } = new URL(request.url);
  const urlParams = Object.fromEntries(searchParams.entries());

  let bodyParams = {};
  // Only try to parse a body if it's a POST/PUT/PATCH request
  if (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH') {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();
    try {
      if (contentType.includes('application/json')) {
        const jsonBody = await request.json();
        // jsonBody can be a string, an object, or other types
        if (typeof jsonBody === 'string') {
          // treat raw string as content
          bodyParams = { content: jsonBody };
        } else if (jsonBody && typeof jsonBody === 'object') {
          // support nested containers like { params: {...} } or { data: {...} }
          if (jsonBody.params && typeof jsonBody.params === 'object') {
            bodyParams = jsonBody.params;
          } else if (jsonBody.data && typeof jsonBody.data === 'object') {
            bodyParams = jsonBody.data;
          } else {
            bodyParams = jsonBody;
          }
        }
      } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
        const formData = await request.formData();
        bodyParams = Object.fromEntries(formData.entries());
      } else {
        // Fallback: try to read raw text and parse as JSON, otherwise treat as raw content
        const text = await request.text();
        if (text) {
          try {
            const parsed = JSON.parse(text);
            if (parsed && typeof parsed === 'object') {
              if (parsed.params && typeof parsed.params === 'object') {
                bodyParams = parsed.params;
              } else if (parsed.data && typeof parsed.data === 'object') {
                bodyParams = parsed.data;
              } else {
                bodyParams = parsed;
              }
            } else {
              bodyParams = { content: text };
            }
          } catch (e) {
            bodyParams = { content: text };
          }
        }
      }
    } catch (error) {
      console.error('Failed to parse request body:', error);
      // Ignore body parsing errors and proceed with URL params
    }
  }

  // Merge params, giving body parameters precedence over URL parameters
  return { ...urlParams, ...bodyParams };
}


export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    // If path is a single segment like '/<token>', serve an interactive test page
    // but ignore reserved paths like '/wxsend' and '/index.html'
    const singleSeg = url.pathname.match(/^\/([^\/]+)\/?$/);
    if (singleSeg && singleSeg[1] && singleSeg[1] !== 'wxsend' && singleSeg[1] !== 'index.html') {
      const rawTokenFromPath = singleSeg[1];

      // 1. Authenticate the token first
      if (rawTokenFromPath !== env.API_TOKEN) {
        return new Response(JSON.stringify({
          code: 0,
          message: 'Invalid token'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
      }

      // 2. Sanitize the token for safe embedding into HTML value attributes
      const sanitizedToken = rawTokenFromPath
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>WXPush 测试页面</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
        background: linear-gradient(170deg, #f3e8ff 0%, #ffffff 100%);
        color: #1f2937;
        box-sizing: border-box;
      }
      .container {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 40px;
        max-width: 720px;
        width: 100%;
        text-align: left;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .container:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 32px;
        font-weight: 700;
        text-align: center;
        background: linear-gradient(90deg, #8b5cf6, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .hint {
        color: #4b5563;
        margin: 0 0 24px;
        font-size: 16px;
        line-height: 1.6;
        text-align: center;
      }
      label {
        display: block;
        margin: 16px 0 8px;
        font-weight: 700;
        color: #374151;
      }
      input[type=text], textarea {
        width: 100%;
        padding: 12px;
        border: 1px solid #d4d4d8;
        border-radius: 12px;
        background: #f4f4f5;
        transition: all 0.2s ease;
        box-sizing: border-box;
        font-family: inherit;
        font-size: 14px;
      }
      input[type=text]:focus, textarea:focus {
        outline: none;
        border-color: #8b5cf6;
        background: #ffffff;
        box-shadow: 0 0 0 2px #c4b5fd;
      }
      button {
        margin-top: 24px;
        padding: 12px 20px;
        border-radius: 12px;
        border: 0;
        background: #8b5cf6;
        color: #fff;
        cursor: pointer;
        font-weight: 700;
        transition: all 0.2s ease;
      }
      button:hover {
        background: #7c3aed;
        transform: translateY(-2px);
      }
      button#clearBtn {
         background: #f4f4f5;
         color: #374151;
         border: 1px solid #e4e4e7;
      }
       button#clearBtn:hover {
         background: #ffffff;
         border-color: #d4d4d8;
         color: #1f2937;
      }
      pre {
        background: #1f2937;
        color: #e5e7eb;
        padding: 16px;
        border-radius: 12px;
        white-space: pre-wrap;
        word-break: break-all;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>WXPush 测试页面</h1>
      <p class="hint">当前 token (来自路径)：<strong>${sanitizedToken}</strong></p>

      <form id="testForm" method="POST" action="/wxsend">

        <label for="title">标题 (title)</label>
        <input id="title" name="title" type="text" value="测试标题" />

        <label for="content">内容 (content)</label>
        <textarea id="content" name="content" rows="4">这是测试内容</textarea>

        <label for="userid">用户 ID (userid，可选，多用户用 | 分隔)</label>
        <input id="userid" name="userid" type="text" placeholder="例如: OPENID1|OPENID2" />

        <label for="appid">WX_APPID (可选，留空使用环境变量)</label>
        <input id="appid" name="appid" type="text" />

        <label for="secret">WX_SECRET (可选，留空使用环境变量)</label>
        <input id="secret" name="secret" type="text" />

        <label for="template_id">模板 ID (template_id，可选)</label>
        <input id="template_id" name="template_id" type="text" />

        <label for="base_url">跳转链接 base_url (可选)</label>
        <input id="base_url" name="base_url" type="text" />

        <input type="hidden" name="token" id="hiddenToken" value="${sanitizedToken}" />

        <div style="display:flex;gap:12px;align-items:center">
          <button id="sendBtn" type="submit">发送测试请求</button>
          <button type="button" id="clearBtn">清空</button>
        </div>
      </form>
      <div id="responseCard" style="display:none; margin-top: 20px;">
        <label for="responseArea">响应</label>
        <pre id="responseArea"></pre>
      </div>
    </div>

    <script>
      const form = document.getElementById('testForm');
      const sendBtn = document.getElementById('sendBtn');
      const clearBtn = document.getElementById('clearBtn');
      const responseArea = document.getElementById('responseArea');
      const responseCard = document.getElementById('responseCard');

      if (form && sendBtn && clearBtn && responseArea && responseCard) {
        clearBtn.addEventListener('click', () => {
          document.getElementById('title').value = '';
          document.getElementById('content').value = '';
          document.getElementById('userid').value = '';
          document.getElementById('appid').value = '';
          document.getElementById('secret').value = '';
          document.getElementById('template_id').value = '';
          document.getElementById('base_url').value = '';
          responseArea.textContent = '';
          responseCard.style.display = 'none';
        });

        form.addEventListener('submit', async (event) => {
          event.preventDefault();
          sendBtn.disabled = true;
          const originalText = sendBtn.textContent;
          sendBtn.textContent = '发送中...';
          responseCard.style.display = 'none';

          const formData = new FormData(form);
          const payload = {};
          for (const [k, v] of formData.entries()) {
             if (k !== 'token' && v) {
                payload[k] = v;
             }
          }

          try {
            const headers = { 'Content-Type': 'application/json' };
            const token = document.getElementById('hiddenToken').value;
            if (token) headers['Authorization'] = token;

            const response = await fetch('/wxsend', { method: 'POST', headers, body: JSON.stringify(payload) });
            const responseText = await response.text();
            responseArea.textContent = 'Status: ' + response.status + '\\n\\n' + responseText;
            responseCard.style.display = 'block';
          } catch (err) {
            responseArea.textContent = 'Fetch error: ' + err.message;
            responseCard.style.display = 'block';
          } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = originalText;
          }
        });
      }
    </script>
  </body>
</html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Route: only handle message sending on '/wxsend'
    if (url.pathname === '/wxsend') {
      // MODIFIED: Use the new helper function to get all parameters
      const params = await getParams(request);

      // MODIFIED: Read parameters from the unified 'params' object
      // token can come from body/url params or from Authorization header
      let requestToken = params.token;
      if (!requestToken) {
        const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
        if (authHeader) {
          // support formats: 'Bearer <token>' or raw token
          const parts = authHeader.split(' ');
          requestToken = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : authHeader;
        }
      }

      if (!requestToken) {
        return new Response(JSON.stringify({
          code: 0,
          message: 'Missing required parameters: token'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
      }

      if (requestToken !== env.API_TOKEN) {
        return new Response(JSON.stringify({
          code: 0,
          message: 'Invalid token'
        }), {
          status: 403,
          headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
      }

      const appid = params.appid || env.WX_APPID;
      const secret = params.secret || env.WX_SECRET;
      const useridStr = params.userid || env.WX_USERID;
      const template_id = params.template_id || env.WX_TEMPLATE_ID;
      const base_url = params.base_url || env.WX_BASE_URL;

      if (!appid || !secret || !useridStr || !template_id) {
          return new Response(JSON.stringify({
            code: 0,
            message: 'Missing required environment variables: WX_APPID, WX_SECRET, WX_USERID, WX_TEMPLATE_ID'
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
          });
      }

      const user_list = useridStr.split('|').map(uid => uid.trim()).filter(Boolean);

      // Extract all non-reserved parameters as template data
      const reservedKeys = ['token', 'userid', 'appid', 'secret', 'template_id', 'base_url'];
      const templateData = {};
      for (const key in params) {
        if (!reservedKeys.includes(key)) {
          templateData[key] = params[key];
        }
      }

      try {
        const accessToken = await getStableToken(appid, secret);
        // accessToken check is handled inside getStableToken now

        const results = await Promise.all(user_list.map(userid =>
          sendMessage(accessToken, userid, template_id, base_url, templateData)
        ));

        const successfulMessages = results.filter(r => r.errmsg === 'ok');

        if (successfulMessages.length > 0) {
          return new Response(JSON.stringify({
            code: 200,
            message: 'ok'
          }), {
            status: 200,
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
          });
        } else {
          const firstError = results.length > 0 ? results[0].errmsg : "Unknown error";
          return new Response(JSON.stringify({
            code: 0,
            message: `Failed to send messages. First error: ${firstError}`
          }), {
            status: 500,
            headers: { 'Content-Type': 'application/json;charset=utf-8' }
          });
        }

      } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({
          code: 0,
          message: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json;charset=utf-8' }
        });
      }
    }

    // If not /wxsend, handle homepage or other paths
    // If request is a GET to root, serve a simple HTML homepage describing the service
    if (request.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
      const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>WXPush — 微信消息推送服务</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap" rel="stylesheet">
    <style>
      body {
        font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        margin: 0;
        background: linear-gradient(170deg, #f3e8ff 0%, #ffffff 100%);
        color: #1f2937;
      }
      .card {
        background: rgba(255, 255, 255, 0.85);
        backdrop-filter: blur(10px);
        border-radius: 24px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 40px;
        max-width: 720px;
        width: 90%;
        text-align: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .card:hover {
        transform: translateY(-8px);
        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
      }
      h1 {
        margin: 0 0 12px;
        font-size: 32px;
        font-weight: 700;
        background: linear-gradient(90deg, #8b5cf6, #3b82f6);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      p {
        color: #4b5563;
        margin: 0 0 24px;
        font-size: 16px;
        line-height: 1.6;
      }
      .author {
        margin: 20px 0;
        color: #374151;
        font-size: 14px;
      }
      .icons {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin-top: 24px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        border-radius: 12px;
        text-decoration: none;
        color: #374151;
        background: #f4f4f5;
        border: 1px solid #e4e4e7;
        font-weight: 700;
        transition: all 0.2s ease;
      }
      .btn:hover {
        background: #ffffff;
        border-color: #d4d4d8;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      }
      .icon {
        width: 22px;
        height: 22px;
        display: inline-block;
      }
      footer {
        margin-top: 24px;
        color: #6b7280;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>WXPush</h1>
      <p>一个极简、可靠的微信消息推送服务，通过简单的 Webhook 请求，即可向微信用户发送模板消息。</p>
      <div class="author">作者：<strong>kiko923</strong></div>
      <div class="icons">
        <a class="btn" href="https://github.com/kiko923/wxpush" target="_blank" rel="noopener noreferrer">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.93 3.2 9.11 7.64 10.59.56.1.76-.24.76-.53 0-.26-.01-.95-.02-1.87-3.11.68-3.77-1.5-3.77-1.5-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1.0 1.72 2.62 1.22 3.26.93.1-.72.39-1.22.71-1.5-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.21 1.16-2.99-.12-.28-.5-1.41.11-2.94 0 0 .95-.31 3.12 1.15.9-.25 1.86-.38 2.82-.39.96.01 1.92.14 2.82.39 2.17-1.46 3.12-1.15 3.12-1.15.61 1.53.23 2.66.11 2.94.72.78 1.16 1.77 1.16 2.99 0 4.3-2.62 5.25-5.11 5.53.4.35.75 1.04.75 2.09 0 1.51-.01 2.72-.01 3.09 0 .29.2.63.77.52C19.05 20.86 22.25 16.68 22.25 11.75 22.25 5.48 17.27.5 12 .5z"/></svg>
          GitHub
        </a>
        <a class="btn" href="https://github.com/kiko923" target="_blank" rel="noopener noreferrer">
          <svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.5 6.2s-.23-1.63-.94-2.34C21.55 3 19.9 3 19.12 2.9 16.54 2.6 12 2.6 12 2.6s-4.53 0-7.12.3C4.1 3 2.45 3.1 1.44 3.86.73 4.47.5 6.1.5 6.1S.25 8 .25 9.9v2.2c0 1.93.25 3.8.25 3.8s.23 1.63.94 2.34c.99.76 2.64.76 3.42.86 2.6.3 7.12.3 7.12.3s4.53 0 7.12-.3c.79-.1 2.44-.1 3.43-.86.7-.7.94-2.34.94-2.34s.25-1.9.25-3.8V9.9c0-1.9-.25-3.7-.25-3.7zM9.75 15.3V8.7l6.18 3.3-6.18 3.3z"/></svg>
          Profile
        </a>
      </div>
      <footer>点击上方图标前往关注，以获取更多项目更新和演示。</footer>
    </div>
  </body>
</html>`;

      return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // For any other path/method, return 404
    return new Response(JSON.stringify({
      code: 0,
      message: 'Not Found'
    }), {
      status: 404,
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
  },
};

async function getStableToken(appid, secret) {
  const tokenUrl = 'https://api.weixin.qq.com/cgi-bin/stable_token';
  const payload = {
    grant_type: 'client_credential',
    appid: appid,
    secret: secret,
    force_refresh: false
  };
  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    if (!data.access_token) {
      throw new Error(data.errmsg || 'Failed to get access token');
    }
    return data.access_token;
  } catch (error) {
    throw new Error(`getStableToken failed: ${error.message}`);
  }
}

async function sendMessage(accessToken, userid, template_id, base_url, templateData) {
  const sendUrl = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${accessToken}`;

  // Create a Date object for Beijing time (UTC+8) by adding 8 hours to the current UTC time
  const beijingTime = new Date(new Date().getTime() + 8 * 60 * 60 * 1000);
  // Format the date to 'YYYY-MM-DD HH:MM:SS' string
  const date = beijingTime.toISOString().slice(0, 19).replace('T', ' ');

  // Extract title and content for the URL, defaulting to empty string if not present
  const title = templateData.title || '';
  const content = templateData.content || '';

  const encoded_message = encodeURIComponent(content);
  const encoded_date = encodeURIComponent(date);

  // Construct data object for WeChat API from templateData
  const data = {};
  for (const key in templateData) {
    data[key] = { value: templateData[key] };
  }

  const payload = {
    touser: userid,
    template_id: template_id,
    url: `${base_url}?message=${encoded_message}&date=${encoded_date}&title=${encodeURIComponent(title)}`,
    data: data
  };

  try {
    const response = await fetch(sendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json;charset=utf-8' },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    return { errmsg: `SendMessage failed: ${error.message}` };
  }
}
