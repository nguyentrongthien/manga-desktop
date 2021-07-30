import axios from "axios";
import cheerio from "cheerio";

// https://mangakakalot.com/manga_list?type=topview&category=all&state=All&page=1

const expObj = {
    info: {
        name: 'MangaKakalot',
        id: 'mangakakalot.com',
        version: '0.0.1',
        baseUrl: 'https://mangakakalot.com/manga_list',
    },
    fetch() {
        return getSeries();
    }
}

// let params = {
//     type: {
//         topview: 'topview'
//     },
//     category: {
//         all: 'all'
//     },
//     state: {
//         all: 'All'
//     }
// }

async function getSeries() {
    try {
        let resp = await axios.get(expObj.info.baseUrl);
        let series = [];
        let $ = cheerio.load(resp.data);
        console.log('getting series...');
        $('.list-truyen-item-wrap').each((index, element) => {
            series.push({
                url: $($(element).find('a').get(0)).attr('href'),
                title: $($(element).find('a').get(0)).attr('title'),
                img: $($($(element).find('a').get(0)).find('img').get(0)).attr('src'),
                sourceId: expObj.info.id
            })
        });
        return series;
    } catch (e) { console.log(e); }
}

export default expObj;