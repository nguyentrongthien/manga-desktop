import axios from "axios";
import cheerio from "cheerio";
import {createHash} from "crypto";
const https = require('https');

export default {
    async loadUrl(url, referer, accept = null, userAgent = null) {
        let resp = await axios.get(url, {
            httpsAgent: new https.Agent({rejectUnauthorized: false}),
            headers: {
                "Referer": referer ? referer : url,
                "accept" : accept ? accept : 'text/html',
                'user-agent' : userAgent ? userAgent : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
                    '(KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36' // Impersonating Chrome
            }
        });
        return cheerio.load(resp.data);
    },
    getHashFromString(string) {
        return createHash('sha256').update(string).digest('hex');
    },
    getParams(url, key) {
        let urlParams = new URLSearchParams(url.substr(url.indexOf('?')));
        return urlParams.get(key);
    },
    async getChapterImageUrls(payload, imgElementSelector, baseUrl) {
        let $ = await this.loadUrl(payload.url, baseUrl);
        return $(imgElementSelector).map( (index, element) => $(element).attr('src')).get();
    },
    randomString(length) {
        let result = '';
        let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
        for (let i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    },
    getInjectionScript() {
        return "<script>" +
            "document.addEventListener('DOMContentLoaded', function() {\n" +
            "    document.addEventListener('click', (event) => {\n" +
            "        let target = event.target.tagName === 'A' ? event.target : event.target.closest('a');\n" +
            "        if (target) {\n" +
            "            event.preventDefault();\n" +
            "            let href = target.getAttribute('href');\n" +
            "            console.log(href);\n" +
            "            window.parent.postMessage(href, '*');\n" +
            "        }\n" +
            "    })\n" +
            "});" +
            "<" + "/script>";
    },
    async getCheerioObject(url) {
        console.log('navigating to ' + url);
        let $ = await this.loadUrl(url, url);
        $('iframe').remove(); // Remove ads by iframe
        $('body').append(this.getInjectionScript());
        return $;
    },
    getOuterHTML ($, element) {
        let index = $(element).index();
        let parent = $(element).parent().clone();
        let child = $(parent).children()[index];
        $(parent).empty();
        $(parent).append(child);
        return $(parent).html();
    }
}

/**
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', (event) => {
        let target = event.target.tagName === 'A' ? event.target : event.target.closest('a');
        if (target) {
            event.preventDefault();
            let href = target.getAttribute('href');
            console.log('captured ' + href);
            window.parent.postMessage(href, '*');
        }
    })
});
 */