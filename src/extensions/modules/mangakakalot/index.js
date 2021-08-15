import downloader from '../../downloader';
import helper from "../../helper";

const expObj = {
    info: {
        name: 'MangaKakalot',
        id: 'mangakakalot.com',
        version: '0.0.1',
        baseUrl: 'https://mangakakalot.com',
    },
    browseSeries : payload => browseSeries(payload),
    searchSeries : payload => searchSeries(payload),
    getSeriesInfo : url => isUrlValid(url) ? getSeriesInfo(url) : null,
    getChapterImages : payload => isUrlValid(payload.url) ? getChapterImages(payload) : null,
    getChapterImageUrl : payload => isUrlValid(payload.url) ? getChapterImageUrl(payload) : null,
    getAvailableFilters : () => getAvailableFilters(),
}

function isUrlValid(url) {
    return url.includes(expObj.info.id)
}

async function browseSeries(payload) {
    try {
        let $ = await helper.loadUrl(getUrl(payload), expObj.info.baseUrl);
        return $('.list-truyen-item-wrap').map((index, element) => {
            return {
                url: $($(element).find('a').get(0)).attr('href'),
                title: $($(element).find('a').get(0)).attr('title'),
                img: $($(element).find('a > img').get(0)).attr('src'),
                latestChapter: $($(element).children('.list-story-item-wrap-chapter').get(0)).attr('title'),
                latestChapterUrl: $($(element).children('.list-story-item-wrap-chapter').get(0)).attr('href'),
                views: $($(element).find('div > span.aye_icon').get(0)).text(),
                sourceId: expObj.info.id
            }
        }).get();
    } catch (e) { console.log(e); }
}

async function searchSeries(payload) {
    try {
        let $ = await helper.loadUrl(getUrl(payload), expObj.info.baseUrl);
        return $('div.panel_story_list > div.story_item').map((index, element) => {
            return {
                url: $($(element).find('a').get(0)).attr('href'),
                title: $($(element).find('div.story_item_right > h3.story_name > a').get(0)).text(),
                img: $($(element).find('a > img').get(0)).attr('src'),
                latestChapter: $($(element).children('div.story_item_right > em.story_chapter > a').get(0)).attr('title'),
                latestChapterUrl: $($(element).children('div.story_item_right > em.story_chapter > a').get(0)).attr('href'),
                views: $($(element).find('div.story_item_right > span').last()).text(),
                sourceId: expObj.info.id
            }
        }).get();
    } catch (e) { console.log(e); }
}

async function getAvailableFilters() {
    try {
        let $ = await helper.loadUrl(expObj.info.baseUrl);
        let arr = [{
            name: 'Category',
            key: 'category',
            selected: 0,
            values: []
        }];
        $('div.panel-category > table > tbody > tr').each((index, element) => {
            if(index <= 1) {
                arr.push({
                    name: index === 0 ? 'Type' : 'State',
                    key: index === 0 ? 'type' : 'state',
                    selected: 0,
                    values: $(element).find('td > a').map((i, child) => ({
                        name: $(child).text(),
                        value: helper.getParams($(child).attr('href'), 'type'),
                    })).get()
                });
            } else {
                $(element).find('td > a').each((i, child) => {
                    arr[0].values.push({
                        name: $(child).text(),
                        value: helper.getParams($(child).attr('href'), 'category'),
                    })
                })
            }
        });
        return arr;
    } catch (e) { console.log(e); }

}

function getUrl(payload) {
    let url = expObj.info.baseUrl;
    if(!payload || !payload.search) {
        url += '/manga_list?';
        if(payload.filter)
            for(let item of payload.filter) {
                url += item.key + '=' + item.values[item.selected].value + '&'
            }
    }

    if(payload.search)
        url += '/search/story/' + formatSearchTerm(payload.search) + '?';

    if(payload.page)
        url += 'page=' + payload.page;

    console.log(url);
    return url;
}

function formatSearchTerm(search) {
    return search.replaceAll(/[\s]/gi, '_').replaceAll(/[^0-9a-z\\_]/gi, '');
}

async function getSeriesInfo(url) {
    try {
        let obj = {};
        let $ = await helper.loadUrl(url, expObj.info.baseUrl);
        let infoEl = $($('.manga-info-text').get(0));
        obj.url = url;
        obj.sourceId = expObj.info.id;
        obj.hash = helper.getHashFromString(url);
        obj.isSaved = false;
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
        $($('div#chapter > div.manga-info-chapter > div.chapter-list').get(0)).children('div.row').each((index, el) => {
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
                tmp.isRead = false;
                tmp.isDownloaded = false;
                tmp.hash = helper.getHashFromString(tmp.url);
                tmp.order = index;
                tmp.images = [];
            })
            obj.chapters.push(tmp);
        })

        obj.reading = obj.chapters.length - 1;
        return obj;
    } catch (e) { console.log(e); }
}

async function getChapterImages(payload) {
    try {
        let $ = await helper.loadUrl(payload.url, expObj.info.baseUrl);
        let promises = [];
        let imageUrls = [];
        await $('.container-chapter-reader > img').each(async (index, element) => {
            let url = $(element).attr('src');
            imageUrls.push(url);
            promises.push(downloader(
                url,
                index.toString().padStart(5, '0'),
                payload.outputPath,
                expObj.info.baseUrl,
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
    } catch (e) { console.log(e); }
}

async function getChapterImageUrl(payload) {
    return helper.getChapterImageUrls(payload, '.container-chapter-reader > img', expObj.info.baseUrl);
}

export default expObj;