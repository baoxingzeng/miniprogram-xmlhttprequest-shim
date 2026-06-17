import Url from "url-parse";
import validUrl from "valid-url";
import { CookieUtils } from "./XMLHttpRequestP";
import { type Cookie, parseSetCookie } from "set-cookie-parser";

const webSite = { url: new Url("https://w3.org") };
export function setWebSite(url: string) { if (validUrl.isUri(url)) { webSite.url = new Url(url); } }

class CookieStorage {
    constructor() {
        this.cookies = {};
    }

    cookies: Record<string /* Domain */, Record<string /* Path */, Record<string /* cookie-name */, Cookie>>>;

    getForUrl(url: string) {
        if (!validUrl.isUri(url)) return "";

        let currentUrl = new Url(url);
        // TODO 同源

        let cookies: Cookie[] = [];
        let domainNames = Object.getOwnPropertyNames(this.cookies);
        for (let i = 0; i < domainNames.length; ++i) {
            let domainName = domainNames[i]!;
            let pathNames = Object.getOwnPropertyNames(this.cookies[domainName]);
            for (let j = 0; j < pathNames.length; ++j) {
                let pathName = pathNames[j]!;
                let cookieNames = Object.getOwnPropertyNames(this.cookies[domainName]![pathName]);
                for (let k = 0; k < cookieNames.length; ++k) {
                    let cookieName = cookieNames[k]!;
                    let cookie = this.cookies[domainName]![pathName]![cookieName]!;
                    cookies.push(cookie);
                }
            }
        }

        let results: Cookie[] = [];
        for (let index = 0; index < cookies.length; ++index) {
            let cookie = cookies[index]!;

            if (this.checkDomain(currentUrl.hostname, cookie.domain!)) {
                if (this.checkPath(currentUrl.pathname, cookie.path!)) {
                    if (!cookie.expires || cookie.expires > (new Date())) {
                        results.push(cookie);
                    }
                }
            }
        }

        // TODO 排序
        return results.map(cookie => { return cookie.name + "=" + cookie.value; }).join("; ");
    }

    setForUrl(url: string, cookies: string | string[]) {
        if (!validUrl.isUri(url)) return;

        let currentUrl = new Url(url);
        // TODO 同源

        let results = parseSetCookie(cookies);
        for (let i = 0; i < results.length; ++i) {
            let cookie = results[i]!;
            if (!cookie.name) { continue; }
            if (!cookie.domain) { cookie.domain = currentUrl.hostname; }
            if (!cookie.path) { cookie.path = currentUrl.pathname; }

            if (typeof cookie.maxAge === "number") {
                cookie.expires = new Date((new Date).getTime() + cookie.maxAge);
            }

            if (this.checkDomain(currentUrl.hostname, cookie.domain)) {
                if (!(cookie.domain in this.cookies)) { this.cookies[cookie.domain] = {}; }
                if (!(cookie.path in this.cookies[cookie.domain]!)) { this.cookies[cookie.domain]![cookie.path] = {}; }
                let cookiesObj = this.cookies[cookie.domain]![cookie.path]!;
                cookiesObj[cookie.name] = cookie.name in cookiesObj ? Object.assign({}, cookiesObj[cookie.name], cookie) : cookie;
            }
        }
    }

    checkDomain(urlDomain: string, cookieDomain: string) {
        let _urlDomain = (urlDomain.substring(0, 1) === "." ? "" : ".") + urlDomain;
        let _cookieDomain = (cookieDomain.substring(0, 1) === "." ? "" : ".") + cookieDomain;
        return _urlDomain.slice(-_cookieDomain.length) === _cookieDomain;
    }

    checkPath(urlPath: string, cookiePath: string) {
        let _urlPath = urlPath + (urlPath.slice(-1) === "/" ? "" : "/");
        let _cookiePath = cookiePath + (cookiePath.slice(-1) === "/" ? "" : "/");
        return _cookiePath.slice(0, _urlPath.length) === _urlPath;
    }
}
