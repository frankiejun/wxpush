# WXPush Enhanced - 微信消息推送服务 (Cloudflare Workers)

> **本项目是基于 [frankiejun/wxpush](https://github.com/frankiejun/wxpush) 的增强版本，由 [kiko923](https://github.com/kiko923) 二次开发。**

这是一个基于 [Cloudflare Workers](https://workers.cloudflare.com/) 搭建的、轻量级的微信公众号模板消息推送服务。它提供了一个简单的 API 接口，让您可以轻松地通过 HTTP 请求将消息推送到指定的微信用户。

## 🆕 增强功能

相比原版，本增强版本新增了以下功能：

✅ **统一 JSON 响应格式** - 所有接口响应（成功/失败）均为 JSON 格式  
✅ **动态模板参数支持** - 支持任意微信模板参数，无需固定 title/content  
✅ **增强错误处理** - 完善的 try-catch 错误捕获和详细错误信息  
✅ **灵活参数传递** - 支持传递任意模板字段（如 thing11、character_string102 等）

### JSON 响应格式

**成功响应：**
```json
{
  "code": 200,
  "message": "ok"
}
```

**失败响应：**
```json
{
  "code": 0,
  "message": "具体错误原因"
}
```

### 动态模板参数

现在支持传递任意微信模板参数，例如：

```json
{
  "token": "your_token",
  "template_id": "your_template_id",
  "userid": "user_openid",
  "thing11": "发起原因",
  "thing2": "工单类型", 
  "character_string102": "总数量",
  "time9": "完成时间"
}
```

系统会自动将所有非保留参数（除 token、userid、appid、secret、template_id、base_url 外）作为模板数据发送给微信接口。

## ✨ 特性

✅ 完全免费  
✅ 每天 10 万次额度，个人用不完  
✅ 真正的微信原生弹窗 + 声音提醒  
✅ 支持多用户  
✅ 跳转稳定  
✅ 可无限换皮肤 (使用项目[wxpushSkin](https://github.com/frankiejun/wxpushSkin))

## 🎬 部署教程

本项目基于原版 WXPush 进行增强开发，基础部署方法与原版相同。如需视频教程，可参考原作者的教程：

[原版 WXPush 视频教程](https://youtu.be/sE1Kcol_XRs?si=G-UbUGlMhyysv-US) - 由 [frankiejun](https://github.com/frankiejun) 制作


## 🚀 部署指南

我们提供两种简单的部署方式，您可以根据自己的需求选择其中一种。

### 方法一：直接粘贴代码到 Cloudflare (最简单)

这种方法无需任何本地开发环境，只需复制粘贴即可完成部署。

1.  **登录 Cloudflare 仪表板**
    *   打开浏览器，访问 [https://dash.cloudflare.com/](https://dash.cloudflare.com/) 并登录。

2.  **创建 Worker 服务**
    *   在左侧菜单中，选择 **Workers 和 Pages**。
    *   点击 **创建应用程序**，然后选择 **创建 Worker**。
    *   为您的 Worker 指定一个全局唯一的名称 (例如 `my-wxpush-service`)，然后点击 **部署**。

3.  **粘贴代码**
    *   部署完成后，点击 **编辑代码** 进入在线代码编辑器。
    *   删除编辑器中所有的默认代码。
    *   将项目 `src/index.js` 文件中的全部内容复制并粘贴到编辑器中。

4.  **保存并部署**
    *   点击编辑器右上角的 **保存并部署** 按钮。

5.  **配置环境变量 (重要)**
    *   返回 Worker 的主管理页面，进入 **设置** > **变量**。
    *   在 **环境变量** 部分，点击 **添加变量**，依次添加以下配置。这些是服务运行所必需的敏感信息。
        *   `API_TOKEN`: 用于接口调用的访问令牌，请设置一个足够复杂的随机字符串。
        *   `WX_APPID`: 您的微信公众号 AppID。
        *   `WX_SECRET`: 您的微信公众号 AppSecret。
        *   `WX_USERID`: 默认接收消息用户的 OpenID，多个用户请用 `|` 符号分隔 (例如 `openid1|openid2`)。
        *   `WX_TEMPLATE_ID`: 您要使用的微信模板消息 ID。
        *   `WX_BASE_URL`: (可选) 点击模板消息后跳转的基础 URL。
    *   **注意**：添加变量时，请确保勾选 **加密** 选项，以保护您的凭证安全。

### 方法二：通过关联 GitHub 仓库自动部署

如果您希望通过 Git 进行版本控制和持续集成，推荐使用此方法。

1.  **Fork 或克隆项目**
    *   首先，将本项目 Fork 到您自己的 GitHub 账户，或者克隆后推送到您自己的新仓库。

2.  **连接到 GitHub**
    *   登录 Cloudflare 仪表板，进入 **Workers 和 Pages**。
    *   点击 **创建应用程序**，切换到 **Pages** 选项卡，然后点击 **连接到 Git**。

3.  **选择仓库**
    *   选择您刚刚创建的 GitHub 仓库。

4.  **配置构建和部署**
    *   **项目名称**：为您项目指定一个名称。
    *   **生产分支**：选择您希望部署的分支 (通常是 `main` 或 `master`)。
    *   **框架预设**：选择 `None`。
    *   **构建设置**：将所有构建相关的字段 (如构建命令、输出目录) 留空。
    *   **根目录**：保持默认的 `/` 即可。

5.  **添加环境变量**
    *   在配置页面的 **环境变量** 部分，添加与 **方法一** 中相同的 `API_TOKEN`, `WX_APPID`, `WX_SECRET` 等变量。
    *   同样，请务必为每个变量勾选 **加密** 选项。

6.  **保存并部署**
    *   点击 **保存并部署**。Cloudflare 会自动从您的仓库拉取代码并完成部署。
    *   此后，每当您向指定的生产分支推送新的代码提交时，Cloudflare 都会自动为您重新部署。

部署成功后，您的服务访问地址会显示在 Worker 或 Pages 的主页面上。

## ⚙️ API 使用方法

服务部署成功后，您可以通过构造 URL 发起 `GET` 请求或发送 `POST` 请求来推送消息。

### 请求地址

```
https://<您的Worker地址>/wxsend
```

### 请求参数

#### 必填参数

| 参数名      | 类型   | 描述                                           |
|-------------|--------|------------------------------------------------|
| `token`     | String | 您在 `API_TOKEN` 中设置的访问令牌。            |

#### 可选参数

| 参数名      | 类型   | 描述                                           |
|-------------|--------|------------------------------------------------|
| `appid`     | String | 临时覆盖默认的微信 AppID。                     |
| `secret`    | String | 临时覆盖默认的微信 AppSecret。                 |
| `userid`    | String | 临时覆盖默认的接收用户 OpenID。                  |
| `template_id`| String | 临时覆盖默认的模板消息 ID。                    |
| `base_url`  | String | 临时覆盖默认的跳转 URL。                       |

#### 动态模板参数

除了上述保留参数外，您可以传递任意其他参数作为微信模板数据，例如：

- `title` - 消息标题
- `content` - 消息内容  
- `thing11` - 微信模板中的 thing11 字段
- `character_string102` - 微信模板中的 character_string102 字段
- `time9` - 微信模板中的 time9 字段
- 等等...

系统会自动将这些参数格式化为微信 API 所需的格式。

### 使用示例

#### 传统方式（兼容原版）

**基础推送**

```
https://<您的Worker地址>/wxsend?title=服务器通知&content=服务已于北京时间%2022:00%20重启&token=your_secret_token
```

#### 新增方式（动态模板参数）

**使用自定义模板参数**

```
https://<您的Worker地址>/wxsend?token=your_token&template_id=your_template&thing11=服务器报警&thing2=硬件故障&character_string102=10&time9=2023-10-27%2010:00:00
```

### Webhook / POST 请求

除了 `GET` 请求，服务也支持 `POST` 方法，更适合用于自动化的 Webhook 集成。

**请求地址**

```
https://<您的Worker地址>/wxsend
```

**请求方法**

```
POST
```

**请求头 (Headers)**

```json
{
  "Authorization": "你的token",
  "Content-Type": "application/json"
}
```

**请求体 (Body)**

请求体需要是一个 JSON 对象，包含与 `GET` 请求相同的参数。

#### 传统方式示例

```json
{
  "title": "Webhook 通知",
  "content": "这是一个通过 POST 请求发送的 Webhook 消息。"
}
```

#### 动态模板参数示例

```json
{
  "template_id": "your_template_id",
  "userid": "user_openid",
  "thing11": "系统报警",
  "thing2": "服务器故障",
  "character_string102": "5",
  "time9": "2023-12-21 15:30:00"
}
```

**使用示例 (cURL)**

```bash
curl -X POST \
  https://<您的Worker地址>/wxsend \
  -H 'Authorization: 你的token' \
  -H 'Content-Type: application/json' \
  -d '{
    "thing11": "来自 cURL 的消息",
    "thing2": "自动化任务已完成"
  }'
```

### 响应格式

#### 成功响应

如果消息成功发送给至少一个用户，服务会返回 `HTTP 200` 状态码和 JSON 响应：

```json
{
  "code": 200,
  "message": "ok"
}
```

#### 失败响应

如果发生错误（如 token 错误、缺少参数、微信接口调用失败等），服务会返回相应的 `HTTP 4xx` 或 `5xx` 状态码和 JSON 错误信息：

```json
{
  "code": 0,
  "message": "具体错误原因"
}
```

常见错误示例：
- `{"code": 0, "message": "Missing required parameters: token"}`
- `{"code": 0, "message": "Invalid token"}`
- `{"code": 0, "message": "getStableToken failed: invalid appid"}`

## 🔧 技术改进详情

### 错误处理增强

- 在 `getStableToken` 和 `sendMessage` 函数中添加了完善的 try-catch 错误捕获
- 所有错误都会返回详细的错误信息，便于调试和问题定位
- 网络请求失败、JSON 解析错误、微信 API 错误等都有相应的错误处理

### 动态参数系统

- 移除了对 `title` 和 `content` 的强制要求
- 系统会自动识别并过滤保留参数：`token`、`userid`、`appid`、`secret`、`template_id`、`base_url`
- 其他所有参数都会被作为模板数据传递给微信 API
- 支持微信官方的所有模板参数类型（thing、character_string、time、date 等）

### 响应格式统一

- 成功响应：`{"code": 200, "message": "ok"}`
- 失败响应：`{"code": 0, "message": "错误详情"}`
- 所有 HTTP 状态码保持不变，便于现有系统集成

## 📋 更新日志

### v2.0.0 (Enhanced by kiko923)

- ✅ 新增统一 JSON 响应格式
- ✅ 新增动态模板参数支持
- ✅ 增强错误处理和错误信息
- ✅ 保持向后兼容性
- ✅ 更新文档和示例

### v1.0.0 (Original by frankiejun)

- ✅ 基础微信模板消息推送功能
- ✅ Cloudflare Workers 部署
- ✅ 多用户支持
- ✅ GET/POST 请求支持

## 🙏 致谢

感谢原作者 [frankiejun](https://github.com/frankiejun) 创建了优秀的 WXPush 项目，为微信消息推送提供了简洁高效的解决方案。本增强版本在保持原有功能的基础上，进一步提升了灵活性和易用性。

## 🤝 贡献

欢迎任何形式的贡献！如果您有好的想法或发现了 Bug，请随时提交 Pull Request 或创建 Issue。

## 📜 许可证

本项目采用 [MIT License](LICENSE) 开源许可证。
