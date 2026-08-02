# miniprogram-xmlhttprequest-shim <!-- omit in toc -->

XMLHttpRequest polyfill for multi-platform mini programs，为小程序提供符合 W3C 标准的 XMLHttpRequest API，一套代码，多端复用。

**[English](https://github.com/baoxingzeng/miniprogram-xmlhttprequest-shim/blob/main/README.en.md)**

## 目录 <!-- omit in toc -->

- [小程序支持](#小程序支持)
- [特性](#特性)
- [安装](#安装)
- [API](#api)
- [快速开始](#快速开始)
- [超时设置](#超时设置)
- [事件处理](#事件处理)
- [兼容性](#兼容性)
- [Cookie 支持](#cookie-支持)
- [平台集成](#平台集成)
- [文本模式](#文本模式)
- [开源协议](#开源协议)

## 小程序支持

| 微信  | 支付宝 | 百度  | 字节跳动 |  QQ   | 快手  | 京东  | 小红书 |
| :---: | :----: | :---: | :------: | :---: | :---: | :---: | :----: |
|   ✔   |   ✔    |   ✔   |    ✔     |   ✔   |   ✔   |   ✔   |   ✔    |

> 在 Chrome、Firefox、Edge、Safari 等浏览器中，库导出的模块会直接返回浏览器原生实现，无性能损耗。

## 特性

- 完整实现 XMLHttpRequest Level 2 接口，包括事件、超时等
- 支持 `text`、`json`、`arraybuffer`、`blob` 四种 responseType，`"document"` 因小程序无 DOM 环境不支持
- 提供 `URLSearchParams`、`Blob`、`File`、`FormData`，覆盖常用 body 类型
- 可选插件 [miniprogram-cookie-shim](https://www.npmjs.com/package/miniprogram-cookie-shim)，支持跨请求自动携带与持久化存储
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
| `setRequestFunc`  | 当无法自动检测到平台的 `request` API 时，手动指定请求函数                                       |
| `setTextMode`     | 强制以文本模式发送请求，适用于不支持 ArrayBuffer 发送的小程序平台                               |

> 设计要点：`XMLHttpRequest` 在浏览器中直接返回原生实现，在小程序中自动切换为 polyfill，同一套代码无需任何修改即可在浏览器和小程序中以 Web 标准方式运行。

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

> `send()` 的 body 参数支持 `string`、`ArrayBuffer`、`TypedArray`、`DataView`、`URLSearchParams`、`Blob`、`FormData` 等类型。内部通过特征判断，因此也兼容其他符合 Web 标准的实现。

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

## Cookie 支持

```bash
npm install miniprogram-cookie-shim
```

```javascript
import { useCookie } from "miniprogram-xmlhttprequest-shim";
import { Cookie, createAccessor } from "miniprogram-cookie-shim";

// 启用 Cookie 支持，之后所有请求将自动携带匹配的 Cookie
// 跨域请求需设置 XMLHttpRequest#withCredentials = true
useCookie(createAccessor("https://example.com"));

// 读写 Cookie —— 与 document.cookie 的 getter/setter 语义一致
Cookie.set("token=abc123; Max-Age=3600; Path=/");
console.log(Cookie.get()); // "token=abc123"
```

> 详见 [miniprogram-cookie-shim](https://www.npmjs.com/package/miniprogram-cookie-shim)。

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

## 平台集成

自动检测运行环境（微信、支付宝、百度、字节跳动、QQ、快手、京东、小红书等），并使用对应平台的 `request` API 发起网络请求，无需手动配置。

### 手动指定请求函数 <!-- omit in toc -->

如果运行环境比较特殊，无法自动检测到 `request` API 时，可以通过 `setRequestFunc` 显式指定：

```javascript
import { setRequestFunc } from "miniprogram-xmlhttprequest-shim";

setRequestFunc(wx.request); // 比如在某个类微信但没被自动识别的环境中
```

> **支付宝小程序开发者注意**：支付宝官方将 `globalThis`、`window`、`document`、`XMLHttpRequest` 等浏览器内置对象名列为保留字，不应作为导入标识符使用，否则可能导致框架无法正常访问导入内容。如遇导入异常，可通过导入重命名规避，例如 `import { XMLHttpRequest as myXMLHttpRequest } from "..."`。

## 文本模式

部分小程序平台（如较早版本的百度小程序）的 `request` API 不支持发送 `ArrayBuffer`，导致 `Blob`、`FormData` 等二进制 body 无法正常上传。可通过 `setTextMode(true)` 强制将所有请求数据转为字符串发送：

```javascript
import { setTextMode } from "miniprogram-xmlhttprequest-shim";

setTextMode(true);
```

启用后，`ArrayBuffer` 类型的 body 会自动解码为字符串后再发起请求。此模式默认关闭，请仅在遇到不支持 ArrayBuffer 发送的平台时进行设置。

## 开源协议

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
