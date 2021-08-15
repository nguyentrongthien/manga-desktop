import axios from "axios";
import cheerio from "cheerio";
import {createHash} from "crypto";
import downloader from "./downloader";

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
    async getImages(payload, imgElementSelector, baseUrl) {
        let $ = await this.loadUrl(payload.url, baseUrl);
        let promises = [];
        let imageUrls = [];
        await $(imgElementSelector).each(async (index, element) => {
            let url = $(element).attr('src');
            imageUrls.push(url);
            promises.push(downloader(
                url,
                index.toString().padStart(5, '0'),
                payload.outputPath,
                baseUrl,
                true
            ));
        })
        let results = await Promise.allSettled(promises);
        return {
            imageUrls,
            localImages: results.map(result => {
                if(result.status === 'fulfilled')
                    return result.value;
            })
        };
    },
    async getChapterImageUrls(payload, imgElementSelector, baseUrl) {
        let $ = await this.loadUrl(payload.url, baseUrl);
        return $(imgElementSelector).map( (index, element) => $(element).attr('src')).get();
    }
}