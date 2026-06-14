import { _Symbol, setState } from "fetch-xhr-shim/dev";
import { XMLHttpRequestEventTargetP, XMLHttpRequestEventTargetState } from "./XMLHttpRequestEventTargetP";

export class XMLHttpRequestUploadP extends XMLHttpRequestEventTargetP implements XMLHttpRequestUpload {
    /** @internal */
    constructor() {
        if (new.target === XMLHttpRequestUploadP) {
            throw new TypeError("Failed to construct 'XMLHttpRequestUpload': Illegal constructor");
        }
        super();
    }

    /** @internal */ toString() { return "[object XMLHttpRequestUpload]"; }
    /** @internal */ get [_Symbol.toStringTag]() { return "XMLHttpRequestUpload"; }
    /** @internal */ get __MPHTTPX__() { return { chain: ["XMLHttpRequestUpload", "XMLHttpRequestEventTarget", "EventTarget"] }; }
}

/** @internal */
export function createXMLHttpRequestUpload(): XMLHttpRequestUpload {
    let upload = Object.create(XMLHttpRequestUploadP.prototype) as XMLHttpRequestUploadP;
    // @ts-ignore
    setState(upload, "__EventTarget__", { executors: [] });
    setState(upload, "__XMLHttpRequestEventTarget__", new XMLHttpRequestEventTargetState(upload));
    return upload;
}
