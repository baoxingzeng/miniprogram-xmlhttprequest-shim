// @ts-nocheck
import { Protagonist } from "../../../exports.js";
import { _test as XMLHttpRequest_suite, setXMLHttpRequestClass } from "../../../XMLHttpRequestTest.js";

setXMLHttpRequestClass(Protagonist.XMLHttpRequest);
XMLHttpRequest_suite.run();
