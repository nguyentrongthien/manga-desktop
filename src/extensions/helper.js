import axios from "axios";
import cheerio from "cheerio";
import {createHash} from "crypto";

export default {
    async loadUrl(url, referer) {
        let resp = await axios.get(url, {
            headers: {
                "Referer": referer ? referer : url
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
    }
}