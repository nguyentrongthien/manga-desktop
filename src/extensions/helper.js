import axios from "axios";
import cheerio from "cheerio";
import {createHash} from "crypto";

export default {
    async loadUrl(url, referer) {
        let resp = await axios.get(url, {
            headers: {
                "Referer": referer
            }
        });
        return cheerio.load(resp.data);
    },
    getHashFromString(string) {
        return createHash('sha256').update(string).digest('hex');
    }
}