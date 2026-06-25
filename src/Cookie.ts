import Url from "url-parse";
import validUrl from "valid-url";
import { platform } from "./request";
import { CookieAccessor } from "./XMLHttpRequestP";
import { parseSetCookie, type Cookie as TCookie } from "set-cookie-parser";

const webSite = { url: new Url("https://w3.org") };
const storage = { value: null as null | CookieStorage };

class CookieStorage {
    constructor() {
        this.restore();
        setTimeout(() => { this.persist(); }, 0);
    }

    cookies: TCookie[] = [];
    get storageKey() { return "__COOKIE_MPHTTPX__"; }

    restore() {
        if (!platform) return;

        let cookies = (() => {
            try {
                let data: string = platform.name !== "Alipay"
                    ? platform.mp.getStorageSync(this.storageKey)
                    // @ts-ignore
                    : platform.mp.getStorageSync({ key: this.storageKey }).data;    // Alipay Mini Program

                let parsed = data ? JSON.parse(data) as Array<TCookie & { _expires: number }> : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        })();

        let isValid = (val: TCookie & { _expires: number }) => {
            return typeof val === "object" && val && typeof val._expires === "number";
        }

        this.cookies = cookies.filter(_c => isValid(_c)).map(_c => {
            let copy: TCookie = copyCookie(_c);
            copy.expires = new Date(_c._expires || 0);
            return copy;
        });
    }

    persist() {
        if (!platform) return;

        let cookies = this.cookies.filter(c => (c.expires && c.expires > (new Date()))).map(c => {
            let copy: TCookie & { _expires?: number } = copyCookie(c);
            copy._expires = c.expires!.getTime();
            return copy;
        });

        platform.mp.setStorage({
            key: this.storageKey,
            data: JSON.stringify(cookies),
        });
    }

    getForUrl(fromPage: boolean, url: string, withCredentials?: boolean) {
        let currentUrl = new Url(fixUrl(url));
        let sameOrigin = webSite.url.origin === currentUrl.origin;

        if (!fromPage) {
            if (!sameOrigin && !withCredentials) return "";
        }

        let results = { valid: [] as TCookie[], expired: [] as TCookie[] };

        for (let i = 0; i < this.cookies.length; ++i) {
            let cookie = this.cookies[i]!;

            if (fromPage && cookie.httpOnly) {
                continue;
            }

            if (!fromPage) {
                if (!sameOrigin && cookie.sameSite && cookie.sameSite.toLowerCase() !== "none") {
                    continue;
                }

                if (currentUrl.hostname !== "127.0.0.1" && currentUrl.hostname !== "localhost") {
                    if (cookie.secure && currentUrl.protocol !== "https") {
                        continue;
                    }
                }
            }

            if (checkDomain(currentUrl.hostname, cookie.domain!)) {
                if (checkPath(currentUrl.pathname, cookie.path!)) {
                    if (!cookie.expires || cookie.expires > (new Date())) {
                        results.valid.push(cookie);
                    } else {
                        results.expired.push(cookie);
                    }
                }
            }
        }

        if (results.expired.length > 0) {
            this.cookies = this.cookies.filter(c => (!c.expires || c.expires > (new Date())));
            setTimeout(() => { this.persist(); }, 0);
        }

        return results.valid.map(c => (c.name + "=" + c.value)).join("; ");
    }

    setForUrl(fromPage: boolean, url: string, withCredentials?: boolean, cookies?: string | string[]) {
        if (!cookies) return;

        let currentUrl = new Url(fixUrl(url));
        let sameOrigin = webSite.url.origin === currentUrl.origin;

        if (!fromPage) {
            if (!sameOrigin && !withCredentials) return;
        }

        let results = parseSetCookie(fromPage ? ("" + cookies) : cookies);

        if (fromPage && results.length > 1) {
            results = results.slice(0, 1);
        }

        for (let i = 0; i < results.length; ++i) {
            let cookie = results[i]!;
            if (!cookie.name) continue;

            if (fromPage) {
                if (cookie.httpOnly) {
                    continue;
                }
            }

            if (cookie.sameSite && cookie.sameSite.toLowerCase() === "none" && !cookie.secure) {
                continue;
            }

            if (!cookie.domain) {
                cookie.domain = currentUrl.hostname;
            } else {
                cookie.domain = cookie.domain.toLowerCase();
                if (cookie.domain.split(".").filter(x => !!x).length >= 2) {
                    cookie.domain = prependDot(cookie.domain);
                }
            }

            if (!cookie.path) {
                cookie.path = currentUrl.pathname;
            }

            if (typeof cookie.maxAge === "number") {
                cookie.expires = new Date((new Date()).getTime() + (cookie.maxAge * 1000));
            }

            if (checkDomain(currentUrl.hostname, cookie.domain!)) {
                this.cookies = this.cookies.filter(c => !isSameCookie(c, cookie));

                if (!cookie.expires || cookie.expires > (new Date())) {
                    this.cookies = [cookie].concat(this.cookies);
                }
            }
        }

        this.cookies.sort((a, b) => {
            let a_domain = prependDot(a.domain!);
            let b_domain = prependDot(b.domain!);

            if (a_domain.length !== b_domain.length) {
                return b_domain.length - a_domain.length;
            } else {
                let a_path = appendSlash(a.path!);
                let b_path = appendSlash(b.path!);

                return b_path.length - a_path.length;
            }
        });

        this.cookies = this.cookies.filter(c => (!c.expires || c.expires > (new Date())));
        setTimeout(() => { this.persist(); }, 0);
    }
}

function fixUrl(url: string) {
    return validUrl.isUri(url)
        ? url
        : webSite.url.origin + (url.substring(0, 1) === "/" ? "" : "/") + url;
}

function isSameCookie(left: TCookie, right: TCookie) {
    return left.domain === right.domain
        && left.path === right.path
        && left.name === right.name;
}

function copyCookie(source: TCookie) {
    let copy: TCookie = {
        name: source.name,
        value: source.value,
    };

    if (source.domain !== undefined) { copy.domain = source.domain; }
    if (source.path !== undefined) { copy.path = source.path; }
    if (source.expires !== undefined) { copy.expires = source.expires; }
    if (source.secure !== undefined) { copy.secure = source.secure; }
    if (source.sameSite !== undefined) { copy.sameSite = source.sameSite; }
    if (source.httpOnly !== undefined) { copy.httpOnly = source.httpOnly; }
    if (source.partitioned !== undefined) { copy.partitioned = source.partitioned; }

    return copy;
}

function prependDot(str: string) {
    return (str.substring(0, 1) === "." ? "" : ".") + str;
}

function appendSlash(str: string) {
    return str + (str.slice(-1) === "/" ? "" : "/");
}

function checkDomain(urlDomain: string, cookieDomain: string) {
    if (cookieDomain.split(".").filter(x => !!x).length < 2) {
        return urlDomain === cookieDomain;
    }

    let _urlDomain = prependDot(urlDomain);
    let _cookieDomain = prependDot(cookieDomain);
    return _urlDomain.slice(-_cookieDomain.length) === _cookieDomain;
}

function checkPath(urlPath: string, cookiePath: string) {
    let _urlPath = appendSlash(urlPath);
    let _cookiePath = appendSlash(cookiePath);
    return _urlPath.slice(0, _cookiePath.length) === _cookiePath;
}

function createCookieInstance() {
    if (!storage.value) { storage.value = new CookieStorage(); }
    const cookieSupported = typeof document !== "undefined" && document && "cookie" in document;

    return {
        get: function () {
            if (cookieSupported) return document.cookie;
            else return storage.value!.getForUrl(true, webSite.url.href, false);
        },

        set: function (cookie: string) {
            if (cookieSupported) document.cookie = cookie;
            else storage.value!.setForUrl(true, webSite.url.href, false, cookie);
        },
    };
}

export const Cookie = createCookieInstance();

export function enableCookie(url: string) {
    if (validUrl.isUri(url)) { webSite.url = new Url(url); }
    if (!storage.value) { storage.value = new CookieStorage(); }

    if (!CookieAccessor.get && !CookieAccessor.set) {
        CookieAccessor.get = CookieStorage.prototype.getForUrl.bind(storage.value, false);
        CookieAccessor.set = CookieStorage.prototype.setForUrl.bind(storage.value, false);
    }
}
