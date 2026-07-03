# miniprogram-xmlhttprequest-shim <!-- omit in toc -->

XMLHttpRequest polyfill for multi-platform mini programs，在小程序环境中提供符合 W3C 标准的 XMLHttpRequest API。
通过补齐小程序缺失的 `XMLHttpRequest`，配合 **自动导入**，让基于 XHR 的 HTTP 客户端库免适配运行，降低 Web 代码迁移成本。

## 目录 <!-- omit in toc -->

- [小程序支持](#小程序支持)
- [特性](#特性)
- [安装](#安装)
- [API](#api)
- [自动导入](#自动导入)
- [快速开始](#快速开始)
- [Cookie 支持](#cookie-支持)
- [超时设置](#超时设置)
- [事件处理](#事件处理)
- [兼容性](#兼容性)
- [平台集成](#平台集成)
- [License](#license)

## 小程序支持

| 微信  | 支付宝 | 百度  | 字节跳动 |  QQ   | 快手  | 京东  | 小红书 |
| :---: | :----: | :---: | :------: | :---: | :---: | :---: | :----: |
|   ✔   |   ✔    |   ✔   |    ✔     |   ✔   |   ✔   |   ✔   |   ✔    |

> 在 Chrome、Firefox、Edge、Safari 等浏览器中，库导出的模块会直接返回浏览器原生实现，无性能损耗。

## 特性

- 完整实现 XMLHttpRequest Level 2 接口，包括事件、超时等
- 支持 `text`、`json`、`arraybuffer`、`blob` 四种 responseType，`"document"` 因小程序无 DOM 环境不支持
- 提供 `URLSearchParams`、`Blob`、`File`、`FormData`，覆盖常用 body 类型
- 可选启用 Cookie 管理，支持持久化存储与跨请求自动携带，行为与浏览器一致
- 自动适配微信、支付宝、百度、字节跳动、QQ、快手、京东、小红书等主流小程序平台

## 安装

```bash
npm install miniprogram-xmlhttprequest-shim
```

## API

| 模块              | 说明                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| `XMLHttpRequest`  | 在浏览器环境中为原生 `XMLHttpRequest`，在小程序环境中自动回退为 polyfill，保证 Web 标准行为一致 |
| `URLSearchParams` | 浏览器原生 `URLSearchParams` / 小程序 polyfill 自适应                                           |
| `Blob`            | 浏览器原生 `Blob` / 小程序 polyfill 自适应                                                      |
| `File`            | 浏览器原生 `File` / 小程序 polyfill 自适应                                                      |
| `FormData`        | 浏览器原生 `FormData` / 小程序 polyfill 自适应                                                  |
| `Cookie`          | 提供 `get()` / `set()` 方法，模拟 `document.cookie` 接口                                        |
| `enableCookie`    | 初始化 Cookie 模块，传入当前站点 URL                                                            |
| `setRequestFunc`  | 当自动检测不到平台 `request` API 时，手动指定请求函数                                           |

> 设计要点：`XMLHttpRequest` 在浏览器中直接透传原生实现，在小程序中自动切换为 polyfill，同一套代码无需任何修改即可在浏览器和小程序中以 Web 标准方式运行。

## 自动导入

> **推荐**：小程序环境中没有 `globalThis`，无法像浏览器一样直接使用全局的 `XMLHttpRequest`，因此非常推荐配合 [unplugin-auto-import](https://www.npmjs.com/package/unplugin-auto-import) 等导入插件，免去手动写 `import` 语句的麻烦。

如果你使用 unplugin-auto-import，可以这样配置：

```javascript
// 仅参考
AutoImport({
    // 其他配置

    imports: [
        // 其他导入

        {
            "miniprogram-xmlhttprequest-shim": [
                "XMLHttpRequest",

                // 以下为可选导入
                "URLSearchParams",
                "Blob",
                "File",
                "FormData",
            ],
        },

        // 其他导入
    ],

    // 其他配置
});
```

> **UniApp 开发者注意**：如果你的项目是通过 HBuilderX 基于 Vue 2 旧模板创建的，可能需要安装较低版本的 unplugin-auto-import（如 `0.16.7`）以兼容 CMD 模块格式。
>
> **支付宝小程序开发者注意**：支付宝官方将 `globalThis`、`window`、`document`、`XMLHttpRequest` 等浏览器内置对象名列为保留字，不应作为导入标识符使用，否则可能导致框架无法正常访问导入内容。如遇导入异常，可通过导入重命名规避，例如 `import { XMLHttpRequest as myXMLHttpRequest } from "..."`。

## 快速开始

### GET 请求 <!-- omit in toc -->

```javascript
import { XMLHttpRequest } from "miniprogram-xmlhttprequest-shim";

const xhr = new XMLHttpRequest();
xhr.open("GET", "https://example.com/api/user?id=88");

xhr.addEventListener("load", () => {
    console.log(xhr.status);         // 200
    console.log(xhr.responseText);   // 响应文本
});

xhr.send();
```

### POST 请求（JSON）<!-- omit in toc -->

```javascript
import { XMLHttpRequest } from "miniprogram-xmlhttprequest-shim";

const xhr = new XMLHttpRequest();
xhr.open("POST", "https://example.com/api/user");

xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
        console.log(JSON.parse(xhr.responseText));
    }
};

xhr.send(JSON.stringify({ name: "张三", age: 25 }));
```

### POST 请求（FormData 上传） <!-- omit in toc -->

```javascript
import { XMLHttpRequest, Blob, FormData } from "miniprogram-xmlhttprequest-shim";

const formData = new FormData();
formData.append("name", "李四");
formData.append("file", new Blob(["文件内容"], { type: "text/plain" }), "test.txt");

const xhr = new XMLHttpRequest();
xhr.open("POST", "https://example.com/api/upload");

xhr.onload = () => {
    console.log(xhr.status);
};

xhr.send(formData);
```

### POST 请求（URLSearchParams） <!-- omit in toc -->

```javascript
import { XMLHttpRequest, URLSearchParams } from "miniprogram-xmlhttprequest-shim";

const xhr = new XMLHttpRequest();
xhr.open("POST", "https://example.com/api/search");

xhr.onload = () => {
    console.log(xhr.status);
};

xhr.send(new URLSearchParams({ q: "关键词", page: "1" }));
```

> `send()` 的 body 参数支持 `string`、`ArrayBuffer`、`TypedArray`、`DataView`、`URLSearchParams`、`Blob`、`FormData` 等类型。内部通过特征判断而非 `instanceof` 检测，因此也兼容其他符合 Web 标准的实现；推荐直接使用本库导出的 `Blob`、`FormData` 和 `URLSearchParams`，无需额外安装其他依赖。

## Cookie 支持

`Cookie.get()` 和 `Cookie.set()` 在小程序与浏览器中都能正常工作：

- **在小程序中**：通过内置 Cookie 存储模拟浏览器行为。带有 `Max-Age` 或 `expires` 的 Cookie 会被持久化到缓存中，应用重启后可恢复；未设置过期时间的会话期 Cookie 不会被持久化，与浏览器行为一致。
- **在浏览器中**：直接读写 `document.cookie`，与原生行为完全一致。

```javascript
import { enableCookie, Cookie } from "miniprogram-xmlhttprequest-shim";

// 初始化 Cookie（浏览器中可省略，小程序中需指定当前站点 URL）
// enableCookie 可多次调用，重复调用仅更新基准 URL，不会产生副作用
enableCookie("https://example.com");

// 读写 Cookie——与 document.cookie 的 setter/getter 语义一致
Cookie.set("token=abc123; Max-Age=3600; Path=/");
console.log(Cookie.get()); // "token=abc123"

// 之后所有 XMLHttpRequest 请求将自动携带匹配的 Cookie
// 跨域请求需设置 withCredentials = true
```

> 浏览器中 `document.cookie` 实际定义在 `Document.prototype` 上，小程序没有 `Document` 构造函数，自然无法在原型上挂载。但如果你的运行环境提供了全局 `document` 对象（如 Taro.js 等跨端框架），可以通过以下方式将 Cookie 模拟实现挂载到实例属性上，达到类似效果：
>
> ```javascript
> if (typeof document === "object" && document && !("cookie" in document)) {
>     Object.defineProperty(document, "cookie", {
>         configurable: true,
>         enumerable: true,
>         get: Cookie.get,
>         set: Cookie.set,
>     });
> }
> ```
>
> 如果上述代码成功执行，之后即可像在浏览器中一样操作 `document.cookie`：
>
> ```javascript
> document.cookie = "token=abc123; Max-Age=3600; Path=/";
> console.log(document.cookie); // "token=abc123"
> ```

## 超时设置

```javascript
const xhr = new XMLHttpRequest();
xhr.timeout = 5000; // 5 秒超时

xhr.ontimeout = () => {
    console.log("请求超时");
};

xhr.open("GET", "https://example.com/api/slow");
xhr.send();
```

> 注意：设置的 timeout 值应小于小程序平台默认的超时时间（通常为 60000ms），否则会被平台优先终止。

## 事件处理

支持 `onloadstart`、`onload`、`onloadend`、`onerror`、`onabort`、`ontimeout` 以及 `onreadystatechange` 事件。

```javascript
const xhr = new XMLHttpRequest();

xhr.onloadstart = () => { /* 请求开始 */ };
xhr.onload      = () => { /* 请求成功 */ };
xhr.onerror     = () => { /* 请求失败 */ };
xhr.onabort     = () => { /* 请求被中止 */ };
xhr.ontimeout   = () => { /* 请求超时 */ };
xhr.onloadend   = () => { /* 请求结束（无论成败） */ };

xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        // 请求完成
    }
};
```

## 兼容性

### 属性 <!-- omit in toc -->

| 属性            | 支持 | 说明                                                                                 |
| --------------- | ---- | ------------------------------------------------------------------------------------ |
| readyState      | ✔    | UNSENT(0), OPENED(1), HEADERS_RECEIVED(2), LOADING(3), DONE(4)。其中 2、3 为模拟实现 |
| response        | ✔    | 受 responseType 影响                                                                 |
| responseText    | ✔    | 仅在 responseType 为 `""` 或 `"text"` 时有效                                         |
| responseType    | ✔    | 支持 `""`、`"text"`、`"json"`、`"arraybuffer"`、`"blob"`，不支持 `"document"`        |
| responseURL     | ✔    | 返回请求使用的 URL                                                                   |
| responseXML     | ✖    | 小程序环境不支持 DOM 解析                                                            |
| status          | ✔    | HTTP 状态码                                                                          |
| statusText      | ✔    | HTTP 状态文本                                                                        |
| timeout         | ✔    | 超时时间（毫秒），不应超过平台默认值                                                 |
| upload          | ✔    | XMLHttpRequestUpload，模拟实现                                                       |
| withCredentials | ✔    | 是否携带跨域 Cookie                                                                  |

### 方法 <!-- omit in toc -->

| 方法                                        | 支持 | 说明                                                                                                 |
| ------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------- |
| abort()                                     | ✔    | 中止请求                                                                                             |
| getAllResponseHeaders()                     | ✔    | 获取所有响应头                                                                                       |
| getResponseHeader(name)                     | ✔    | 获取指定响应头                                                                                       |
| open(method, url [, async, user, password]) | ✔    | 初始化请求，不支持同步模式                                                                           |
| overrideMimeType(mime)                      | ✖    | 小程序环境不支持                                                                                     |
| send([body])                                | ✔    | 发送请求，body 支持 string / ArrayBuffer / TypedArray / DataView / URLSearchParams / Blob / FormData |
| setRequestHeader(name, value)               | ✔    | 设置请求头                                                                                           |

### 事件属性 <!-- omit in toc -->

| 事件属性           | 支持 | 说明                  |
| ------------------ | ---- | --------------------- |
| onreadystatechange | ✔    | readyState 变化时触发 |
| onloadstart        | ✔    | 请求开始时触发        |
| onload             | ✔    | 请求成功完成时触发    |
| onloadend          | ✔    | 请求结束（无论成败）  |
| onerror            | ✔    | 请求失败时触发        |
| onabort            | ✔    | 请求被中止时触发      |
| ontimeout          | ✔    | 请求超时时触发        |

## 平台集成

该 shim 通过 `miniprogram-platform` 自动检测运行环境（微信、支付宝、百度、字节跳动、QQ、快手、京东、小红书等），并使用对应平台的 `request` API 发起网络请求，无需手动配置。

### 手动指定请求函数 <!-- omit in toc -->

如果运行环境比较特殊，自动检测不到 `request` API，可以通过 `setRequestFunc` 显式指定：

```javascript
import { setRequestFunc } from "miniprogram-xmlhttprequest-shim";

setRequestFunc(wx.request); // 比如在某个类微信但没被自动识别的环境中
```

## License

MIT License

Copyright (c) 2026

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
