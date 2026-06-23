import { suite } from "uvu";
import * as assert from "uvu/assert";
import { ui_rec, testConfig } from "./utils.js";
import { Protagonist, fixXMLHttpRequest, Cookie, enableCookie } from "./exports.js";

const _name = "XMLHttpRequest";
export const _test = suite(_name);

/**
 * @param {string} n
 * @param {Parameters<typeof _test>[1]} t
 */
const test = (n, t) => {
    return _test(...ui_rec(_name, n, t));
}

const mp = { XMLHttpRequest: /** @type {typeof XMLHttpRequest} */ (typeof XMLHttpRequest !== "undefined" && XMLHttpRequest) || undefined };

/**
 * @param {unknown} XHRClass
 */
export function setXMLHttpRequestClass(XHRClass) {
    fixXMLHttpRequest(XHRClass);
    mp.XMLHttpRequest = /** @type {typeof globalThis.XMLHttpRequest} */ XHRClass;
}

enableCookie(testConfig.api_prefix);

test("XMLHttpRequest basic GET request", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/user?id=88");
    await (new Promise(resolve => {
        xhr.onload = () => { resolve(); }
        xhr.send();
    }));
    assert.equal(xhr.status, 200);
    assert.equal(xhr.getResponseHeader("content-type"), "application/json; charset=utf-8");
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.id, "88");
    assert.equal(data.name, "张三🎉");
    assert.equal(data.age, 25);
});

test("XMLHttpRequest POST request (FormData upload)", async () => {
    let formData = new Protagonist.FormData();
    formData.append("name", "李四");
    formData.append("age", "26");
    let fileContent = "This is the content of the test file.";
    let blob = new Protagonist.Blob([fileContent], { type: "text/plain" });
    formData.append("file", blob, "test-file.txt");

    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("POST", testConfig.api_prefix + "/api/upload");
    xhr.setRequestHeader("X-Custom-Header", "polyfill-test");
    await (new Promise(resolve => {
        xhr.onload = () => { resolve(); }
        xhr.send(formData);
    }));
    assert.equal(xhr.status, 201);
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.code, 0);
    assert.equal(data.message, "success");
    assert.equal(data.data.name, "李四");
    assert.equal(data.data.age, "26");
    assert.equal(data.data.file.filename, "test-file.txt");
    assert.equal(data.data.file.content, fileContent);
});

test("XMLHttpRequest abort request (AbortController)", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/timeout");
    let evt = null;
    let abortPromise = new Promise(resolve => { xhr.onabort = e => { evt = e; resolve(); } });
    xhr.send();
    xhr.abort();
    await abortPromise;
    assert.equal(evt && evt.type, "abort");
    assert.not.ok(xhr.responseText);
});

test("XMLHttpRequest dealing with 404 error response", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/not-found");
    await (new Promise(resolve => {
        xhr.onload = () => { resolve(); }
        xhr.send();
    }));
    assert.equal(xhr.status, 404);
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.code, 404);
    assert.equal(data.message, "Not Found");
});

test("XMLHttpRequest custom request header", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/header-test");
    xhr.setRequestHeader("X-Token", "123456789");
    xhr.setRequestHeader("Content-Type", "application/json");
    await (new Promise(resolve => {
        xhr.onload = () => { resolve(); }
        xhr.send();
    }));
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.token, "123456789");
    assert.equal(data.contentType, "application/json");
});

test("Cookie support: set and echo cookies with withCredentials", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr1 = new XMLHttpRequestClass();
    xhr1.open("GET", testConfig.api_prefix + "/api/cookie/set?name=testKey&value=testValue");
    xhr1.withCredentials = true;
    await (new Promise(resolve => {
        xhr1.onload = () => resolve();
        xhr1.send();
    }));
    assert.equal(xhr1.status, 200);

    let xhr2 = new XMLHttpRequestClass();
    xhr2.open("GET", testConfig.api_prefix + "/api/cookie/echo");
    xhr2.withCredentials = true;
    await (new Promise(resolve => {
        xhr2.onload = () => resolve();
        xhr2.send();
    }));
    assert.equal(xhr2.status, 200);
    let data = JSON.parse(xhr2.responseText);
    assert.equal(data.cookies.testKey, "testValue");
    assert.equal(data.cookies.sessionId, "abc123xyz456");
    assert.equal(data.cookies.theme, "dark");
});

test("Cookie support: same-origin cookies still sent when withCredentials is false", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/cookie/echo");
    xhr.withCredentials = false;
    await (new Promise(resolve => {
        xhr.onload = () => resolve();
        xhr.send();
    }));
    assert.equal(xhr.status, 200);
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.cookies.testKey, "testValue");
    assert.ok(Object.keys(data.cookies).length >= 1);
});

test("Cookie support: clear cookies works correctly", async () => {
    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr1 = new XMLHttpRequestClass();
    xhr1.open("GET", testConfig.api_prefix + "/api/cookie/clear");
    xhr1.withCredentials = true;
    await (new Promise(resolve => {
        xhr1.onload = () => resolve();
        xhr1.send();
    }));
    assert.equal(xhr1.status, 200);

    let xhr2 = new XMLHttpRequestClass();
    xhr2.open("GET", testConfig.api_prefix + "/api/cookie/echo");
    xhr2.withCredentials = true;
    await (new Promise(resolve => {
        xhr2.onload = () => resolve();
        xhr2.send();
    }));
    assert.equal(xhr2.status, 200);
    let data = JSON.parse(xhr2.responseText);
    assert.equal(data.cookies.testKey, "testValue");
    assert.equal(data.cookies.sessionId, undefined);
    assert.equal(data.cookies.theme, undefined);
});

test("document.cookie API: Cookie.get() returns all cookies in same format", async () => {
    const cookieStr = Cookie.get();
    assert.equal(typeof cookieStr, "string");
    assert.ok(cookieStr.includes("testKey=testValue"));
});

test("document.cookie API: Cookie.set() can set a new cookie", async () => {
    Cookie.set("customCookie=myCustomValue; Max-Age=3600; Path=/");
    const cookieStr = Cookie.get();
    assert.ok(cookieStr.includes("customCookie=myCustomValue"));

    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/cookie/echo");
    xhr.withCredentials = true;
    await (new Promise(resolve => {
        xhr.onload = () => resolve();
        xhr.send();
    }));
    assert.equal(xhr.status, 200);
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.cookies.customCookie, "myCustomValue");
});

test("document.cookie API: Cookie.set() can overwrite an existing cookie", async () => {
    Cookie.set("customCookie=updatedValue");
    const cookieStr = Cookie.get();
    assert.ok(cookieStr.includes("customCookie=updatedValue"));

    let XMLHttpRequestClass = mp.XMLHttpRequest || (() => { throw new ReferenceError("XMLHttpRequest is not defined") })();
    let xhr = new XMLHttpRequestClass();
    xhr.open("GET", testConfig.api_prefix + "/api/cookie/echo");
    xhr.withCredentials = true;
    await (new Promise(resolve => {
        xhr.onload = () => resolve();
        xhr.send();
    }));
    assert.equal(xhr.status, 200);
    let data = JSON.parse(xhr.responseText);
    assert.equal(data.cookies.customCookie, "updatedValue");
});

test("document.cookie API: expired cookies are automatically removed", async () => {
    const pastDate = new Date(0).toUTCString();
    Cookie.set(`expiredCookie=shouldBeGone; expires=${pastDate}`);
    const cookieStr = Cookie.get();
    assert.ok(!cookieStr.includes("expiredCookie"));
});
