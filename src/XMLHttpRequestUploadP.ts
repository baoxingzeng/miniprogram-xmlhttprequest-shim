import { _Symbol, setState } from "fetch-xhr-shim/dev";
import { XMLHttpRequestEventTargetP, XMLHttpRequestEventTargetState } from "./XMLHttpRequestEventTargetP";

export class XMLHttpRequestUploadP extends XMLHttpRequestEventTargetP implements XMLHttpRequestUpload {
    /** @internal */
    constructor() {
        super();
        if (this.constructor === XMLHttpRequestUploadP) {
            throw new TypeError("Failed to construct 'XMLHttpRequestUpload': Illegal constructor");
        }
    }

    /** @internal */ toString() { return "[object XMLHttpRequestUpload]"; }
    /** @internal */ get [_Symbol.toStringTag]() { return "XMLHttpRequestUpload"; }
    /** @internal */ get __MPHTTPX__() { return { chain: ["XMLHttpRequestUpload", "XMLHttpRequestEventTarget", "EventTarget"] }; }
}

export function createXMLHttpRequestUpload(): XMLHttpRequestUpload {
    let upload = Object.create(XMLHttpRequestUploadP.prototype) as XMLHttpRequestUploadP;
    // @ts-ignore
    setState(upload, "__EventTarget__", { executors: [] });
    setState(upload, "__XMLHttpRequestEventTarget__", new XMLHttpRequestEventTargetState(upload));
    return upload;
}
