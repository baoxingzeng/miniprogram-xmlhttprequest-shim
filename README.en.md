# miniprogram-xmlhttprequest-shim <!-- omit in toc -->

A W3C-compliant XMLHttpRequest polyfill for multi-platform mini programs. Write once, run everywhere.

## Table of Contents <!-- omit in toc -->

- [Mini-Program Support](#mini-program-support)
- [Features](#features)
- [Installation](#installation)
- [API](#api)
- [Quick Start](#quick-start)
- [Timeout](#timeout)
- [Event Handling](#event-handling)
- [Compatibility](#compatibility)
- [Cookie Support](#cookie-support)
- [Platform Integration](#platform-integration)
- [TextMode](#textmode)
- [License](#license)

## Mini-Program Support

| WeChat | Alipay | Baidu | ByteDance |  QQ   | Kwai  |  JD   | RedNote |
| :----: | :----: | :---: | :-------: | :---: | :---: | :---: | :-----: |
|   ✔    |   ✔    |   ✔   |     ✔     |   ✔   |   ✔   |   ✔   |    ✔    |

> In Chrome, Firefox, Edge, Safari, and other modern browsers, the exported modules return native implementations directly with zero performance overhead.

## Features

- Full XMLHttpRequest Level 2 implementation, including events and timeouts
- Supports `text`, `json`, `arraybuffer`, and `blob` response types (`"document"` is unavailable due to the lack of DOM in mini programs)
- Provides `URLSearchParams`, `Blob`, `File`, and `FormData` covering common body types
- Optional plugin [miniprogram-cookie-shim](https://www.npmjs.com/package/miniprogram-cookie-shim) for automatic cross-request cookie handling with persistent storage
- Automatic adaptation for WeChat, Alipay, Baidu, ByteDance, QQ, Kwai, JD, RedNote, and other major mini program platforms

## Installation

```bash
npm install miniprogram-xmlhttprequest-shim
```

## API

| Module            | Description                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `XMLHttpRequest`  | Native `XMLHttpRequest` in browsers; automatically falls back to polyfill in mini programs for consistent web behavior |
| `URLSearchParams` | Native in browsers / polyfill in mini programs                                                                         |
| `Blob`            | Native in browsers / polyfill in mini programs                                                                         |
| `File`            | Native in browsers / polyfill in mini programs                                                                         |
| `FormData`        | Native in browsers / polyfill in mini programs                                                                         |
| `setRequestFunc`  | Manually specifies the request function when the platform's `request` API cannot be auto-detected                      |
| `setTextMode`     | Forces text mode for all requests, useful for platforms that do not support sending ArrayBuffer                        |

> **Key design**: `XMLHttpRequest` passes through to the native implementation in browsers and switches to polyfill in mini programs. The same code runs in both environments without modification, following web standards.

## Quick Start

### GET Request <!-- omit in toc -->

```javascript
import { XMLHttpRequest } from "miniprogram-xmlhttprequest-shim";

const xhr = new XMLHttpRequest();
xhr.open("GET", "https://example.com/api/user?id=88");

xhr.addEventListener("load", () => {
    console.log(xhr.status);         // 200
    console.log(xhr.responseText);   // Response body
});

xhr.send();
```

### POST Request (JSON) <!-- omit in toc -->

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

xhr.send(JSON.stringify({ name: "John Smith", age: 25 }));
```

### POST Request (FormData Upload) <!-- omit in toc -->

```javascript
import { XMLHttpRequest, Blob, FormData } from "miniprogram-xmlhttprequest-shim";

const formData = new FormData();
formData.append("name", "Joe Bloggs");
formData.append("file", new Blob(["file content"], { type: "text/plain" }), "test.txt");

const xhr = new XMLHttpRequest();
xhr.open("POST", "https://example.com/api/upload");

xhr.onload = () => {
    console.log(xhr.status);
};

xhr.send(formData);
```

### POST Request (URLSearchParams) <!-- omit in toc -->

```javascript
import { XMLHttpRequest, URLSearchParams } from "miniprogram-xmlhttprequest-shim";

const xhr = new XMLHttpRequest();
xhr.open("POST", "https://example.com/api/search");

xhr.onload = () => {
    console.log(xhr.status);
};

xhr.send(new URLSearchParams({ q: "keyword", page: "1" }));
```

> The `send()` body parameter supports `string`, `ArrayBuffer`, `TypedArray`, `DataView`, `URLSearchParams`, `Blob`, `FormData`, and other types. Detection is based on feature checks, so other web-compatible implementations are also supported.

## Timeout

```javascript
const xhr = new XMLHttpRequest();
xhr.timeout = 5000; // 5-second timeout

xhr.ontimeout = () => {
    console.log("Request timed out");
};

xhr.open("GET", "https://example.com/api/slow");
xhr.send();
```

> Note: The timeout value should be less than the platform's default timeout (typically 60000ms); otherwise the platform will terminate the request first.

## Event Handling

Supports `onloadstart`, `onload`, `onloadend`, `onerror`, `onabort`, `ontimeout`, and `onreadystatechange` events.

```javascript
const xhr = new XMLHttpRequest();

xhr.onloadstart = () => { /* Request started */ };
xhr.onload      = () => { /* Request succeeded */ };
xhr.onerror     = () => { /* Request failed */ };
xhr.onabort     = () => { /* Request aborted */ };
xhr.ontimeout   = () => { /* Request timed out */ };
xhr.onloadend   = () => { /* Request finished (success or failure) */ };

xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
        // Request complete
    }
};
```

## Compatibility

### Properties <!-- omit in toc -->

| Property        | Supported | Description                                                                                   |
| --------------- | :-------: | --------------------------------------------------------------------------------------------- |
| readyState      |     ✔     | UNSENT(0), OPENED(1), HEADERS_RECEIVED(2), LOADING(3), DONE(4). States 2 and 3 are simulated. |
| response        |     ✔     | Affected by `responseType`                                                                    |
| responseText    |     ✔     | Only effective when `responseType` is `""` or `"text"`                                        |
| responseType    |     ✔     | Supports `""`, `"text"`, `"json"`, `"arraybuffer"`, `"blob"`. `"document"` is not supported.  |
| responseURL     |     ✔     | Returns the URL used for the request                                                          |
| responseXML     |     ✖     | DOM parsing is unavailable in mini programs                                                   |
| status          |     ✔     | HTTP status code                                                                              |
| statusText      |     ✔     | HTTP status text                                                                              |
| timeout         |     ✔     | Timeout in milliseconds; should not exceed the platform default                               |
| upload          |     ✔     | XMLHttpRequestUpload, simulated                                                               |
| withCredentials |     ✔     | Whether to include cross-origin cookies                                                       |

### Methods <!-- omit in toc -->

| Method                                      | Supported | Description                                                                                                      |
| ------------------------------------------- | :-------: | ---------------------------------------------------------------------------------------------------------------- |
| abort()                                     |     ✔     | Abort the request                                                                                                |
| getAllResponseHeaders()                     |     ✔     | Get all response headers                                                                                         |
| getResponseHeader(name)                     |     ✔     | Get a specific response header                                                                                   |
| open(method, url [, async, user, password]) |     ✔     | Initialize the request; synchronous mode is not supported                                                        |
| overrideMimeType(mime)                      |     ✖     | Unavailable in mini programs                                                                                     |
| send([body])                                |     ✔     | Send the request; body supports string / ArrayBuffer / TypedArray / DataView / URLSearchParams / Blob / FormData |
| setRequestHeader(name, value)               |     ✔     | Set a request header                                                                                             |

### Event Properties <!-- omit in toc -->

| Event Property     | Supported | Description                                          |
| ------------------ | :-------: | ---------------------------------------------------- |
| onreadystatechange |     ✔     | Fires when `readyState` changes                      |
| onloadstart        |     ✔     | Fires when the request starts                        |
| onload             |     ✔     | Fires when the request completes successfully        |
| onloadend          |     ✔     | Fires when the request finishes (success or failure) |
| onerror            |     ✔     | Fires when the request fails                         |
| onabort            |     ✔     | Fires when the request is aborted                    |
| ontimeout          |     ✔     | Fires when the request times out                     |

## Cookie Support

```bash
npm install miniprogram-cookie-shim
```

```javascript
import { useCookie } from "miniprogram-xmlhttprequest-shim";
import { Cookie, createAccessor } from "miniprogram-cookie-shim";

// Enable cookie support; all subsequent requests will automatically include matching cookies.
// Set XMLHttpRequest#withCredentials = true for cross-origin requests.
useCookie(createAccessor("https://example.com"));

// Read and write cookies — same semantics as document.cookie getter/setter
Cookie.set("token=abc123; Max-Age=3600; Path=/");
console.log(Cookie.get()); // "token=abc123"
```

> See [miniprogram-cookie-shim](https://www.npmjs.com/package/miniprogram-cookie-shim) for details.

> In browsers, `document.cookie` is defined on `Document.prototype`. Mini programs have no `Document` constructor, so prototype-level mounting is not possible. However, if your runtime provides a global `document` object (e.g., Taro.js or similar cross-platform frameworks), you can mount the cookie implementation onto the instance property for a similar effect:
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
> Once the above code runs successfully, you can operate on `document.cookie` just as you would in a browser:
>
> ```javascript
> document.cookie = "token=abc123; Max-Age=3600; Path=/";
> console.log(document.cookie); // "token=abc123"
> ```

## Platform Integration

Automatically detects the runtime environment (WeChat, Alipay, Baidu, ByteDance, QQ, Kwai, JD, RedNote, etc.) and uses the corresponding platform's `request` API to make network calls—no manual configuration required.

### Manual Request Function <!-- omit in toc -->

If your runtime environment is unusual and the `request` API cannot be auto-detected, you can specify it explicitly via `setRequestFunc`:

```javascript
import { setRequestFunc } from "miniprogram-xmlhttprequest-shim";

setRequestFunc(wx.request); // e.g., in a WeChat-like environment that wasn't auto-detected
```

> **For Alipay Mini Program developers**: Alipay reserves browser built-in names such as `globalThis`, `window`, `document`, and `XMLHttpRequest` as keywords. Using them as import identifiers may prevent the framework from accessing imported content correctly. If you encounter import errors, use import aliasing as a workaround, e.g., `import { XMLHttpRequest as myXMLHttpRequest } from "..."`.

## TextMode

Some mini program platforms (e.g., earlier versions of Baidu Smart Mini Program) do not support sending `ArrayBuffer` via their `request` API. This can prevent binary bodies such as `Blob` and `FormData` from being uploaded. You can call `setTextMode(true)` to force all request data to be sent as strings:

```javascript
import { setTextMode } from "miniprogram-xmlhttprequest-shim";

setTextMode(true);
```

When enabled, `ArrayBuffer`-typed bodies are automatically decoded to strings before sending. This mode is disabled by default and should only be enabled when encountering a platform that does not support ArrayBuffer sending.

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
