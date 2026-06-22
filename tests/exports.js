// @ts-check
import {
    Blob, BlobP,
    FormData, FormDataP,
    fixXMLHttpRequest
} from "fetch-xhr-shim";
import {
    XMLHttpRequest, XMLHttpRequestP,
    Cookie, enableCookie
} from "../dist/esm/index.js";
// } from "../dist/miniprogram-xmlhttprequest-shim.esm.min.js";

export {
    fixXMLHttpRequest,
    Cookie, enableCookie
};

export const protagonistConfig = {
    useNativeBlob: false,
    useNativeFormData: false,
    useNativeXMLHttpRequest: false,
}

export class Protagonist {
    static get Blob() { return /** @type {typeof globalThis.Blob} */(protagonistConfig.useNativeBlob ? Blob : BlobP); }
    static get FormData() { return /** @type {typeof globalThis.FormData} */(protagonistConfig.useNativeFormData ? FormData : FormDataP); }
    static get XMLHttpRequest() { return /** @type {typeof globalThis.XMLHttpRequest} */(protagonistConfig.useNativeXMLHttpRequest ? XMLHttpRequest : XMLHttpRequestP); }
}
