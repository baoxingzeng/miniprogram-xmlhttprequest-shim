export * from "./index";
import { XMLHttpRequestP } from "./XMLHttpRequestP";
import { URLSearchParamsP, BlobP, FileP, FormDataP, fixXMLHttpRequest } from "fetch-xhr-shim";

/* eslint-disable no-prototype-builtins */
const g: typeof globalThis =
    (typeof globalThis !== "undefined" && globalThis) ||
    (typeof window !== "undefined" && window) ||
    (typeof self !== "undefined" && self) ||
    // @ts-ignore eslint-disable-next-line no-undef
    (typeof global !== "undefined" && global) ||
    {};

if (typeof XMLHttpRequest !== "undefined" && XMLHttpRequest) {
    if (!g.Blob || !g.FormData) {
        fixXMLHttpRequest();
    }
}

if (!g.URLSearchParams) { g.URLSearchParams = URLSearchParamsP; }
if (!g.Blob) { g.Blob = BlobP; }
if (!g.File) { g.File = FileP; }
if (!g.FormData) { g.FormData = FormDataP; }
if (!g.XMLHttpRequest) { g.XMLHttpRequest = XMLHttpRequestP; }
