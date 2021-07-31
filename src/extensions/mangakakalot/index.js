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
    },
    getSeriesInfo(url) {
        if(url.includes(this.info.id)) {
            return getInfo(url);
        } else return null;
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
        $('.list-truyen-item-wrap').each((index, element) => {
            series.push({
                url: $($(element).find('a').get(0)).attr('href'),
                title: $($(element).find('a').get(0)).attr('title'),
                img: $($($(element).find('a').get(0)).find('img').get(0)).attr('src'),
                latestChapter: $($(element).children('.list-story-item-wrap-chapter').get(0)).attr('title'),
                latestChapterUrl: $($(element).children('.list-story-item-wrap-chapter').get(0)).attr('href'),
                views: $($(element).find('div > span.aye_icon').get(0)).text(),
                sourceId: expObj.info.id
            })
        });
        return series;
    } catch (e) { console.log(e); }
}

async function getInfo(url) {
    try {
        let obj = {};
        let resp = await axios.get(url);
        let $ = cheerio.load(resp.data);
        let infoEl = $($('.manga-info-text').get(0));
        infoEl.children('li').each((i, el) => {
            if($(el).find('h1').length > 0 && !obj.title) {
                obj.title = $($(el).find('h1').get(0)).html();
            }
            else if($(el).html().toLowerCase().includes('author') && !obj.authors) {
                obj.authors = [];
                $(el).children('a').each((i, childEl) => {
                    obj.authors.push($(childEl).text());
                })
            }
            else if($(el).html().toLowerCase().includes('status') && !obj.status) {
                let tmp = $(el).text().replaceAll(' ', '');
                obj.status = tmp.substring(tmp.indexOf(':') + 1);
            }
            else if($(el).html().toLowerCase().includes('view') && !obj.views) {
                let tmp = $(el).text().replaceAll(' ', '');
                obj.views = tmp.substring(tmp.indexOf(':') + 1);
            }
            else if($(el).html().toLowerCase().includes('genres') && !obj.genres) {
                obj.genres = [];
                $(el).children('a').each((i, childEl) => {
                    obj.genres.push($(childEl).text());
                })
            }
        })
        obj.img = $($($('.manga-info-pic').get(0)).find('img').get(0)).attr('src')
        obj.summary = $($('#noidungm').get(0)).text();
        obj.chapters = [];
        $($('div#chapter > div.manga-info-chapter > div.chapter-list').get(0)).children('div.row').each((i, el) => {
            let tmp = {};
            $(el).children('span').each((i, childEl) => {
                if($(childEl).html().toLowerCase().includes('href') && $(childEl).html().toLowerCase().includes('title')) {
                    tmp.url = $($(childEl).find('a').get(0)).attr('href');
                    tmp.title = $($(childEl).find('a').get(0)).attr('title');
                    tmp.name = $($(childEl).find('a').get(0)).text();
                }
                else if ($('<div />').append($(childEl).clone()).html().toLowerCase().includes('title')) {
                    tmp.updated = $(childEl).attr('title');
                } else if (!tmp.views) {
                    tmp.views = $(childEl).text();
                }
            })
            obj.chapters.push(tmp);
        })
        return obj;
    } catch (e) { console.log(e); }
}

export default expObj;