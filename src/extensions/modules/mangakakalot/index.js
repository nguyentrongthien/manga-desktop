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
    getChapterImageUrl : payload => isUrlValid(payload.url) ? getChapterImageUrl(payload) : null,
    getAvailableFilters : () => getAvailableFilters(),
}

function isUrlValid(url) {
    return url.includes(expObj.info.id)
}

async function browseSeries(payload) {
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
}

async function searchSeries(payload) {
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
}

async function getAvailableFilters() {
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
    let obj = {};
    let $ = await helper.loadUrl(url, expObj.info.baseUrl);
    obj.url = url;
    obj.sourceId = expObj.info.id;
    obj.hash = helper.getHashFromString(url);
    obj.isSaved = false;
    obj.title = $($('div.manga-info-top > ul.manga-info-text > li > h1').get(0)).text();
    obj.authors = _getAuthors($);
    obj.status = _getStatus($);
    obj.views = _getViews($);
    obj.genres = _getGenres($);
    obj.img = $($($('.manga-info-pic').get(0)).find('img').get(0)).attr('src')
    obj.summary = $($('#noidungm').get(0)).text();
    obj.chapters = _getChapters($);
    obj.reading = obj.chapters.length - 1;
    return obj;
}

function _getAuthors($) {
    let row = $('div.manga-info-top > ul.manga-info-text > li')
        .filter((i, el) => $(el).html().toLowerCase().includes('author(s)')).get(0);
    return $(row).find('a').map((i, e) => $(e).text()).get()
}

function _getStatus($) {
    let row = $('div.manga-info-top > ul.manga-info-text > li')
        .filter((i, el) => $(el).html().toLowerCase().includes('status')).get(0);
    return $(row).text().substr($(row).text().indexOf(':') + 1);
}

function _getViews($) {
    let element = $('div.manga-info-top > ul.manga-info-text > li')
        .filter((i, el) => $(el).html().toLowerCase().includes('views :')).get(0);
    return $(element).text().substr($(element).text().indexOf(':') + 1);
}

function _getGenres($) {
    let row = $('div.manga-info-top > ul.manga-info-text > li')
        .filter((i, el) => $(el).html().toLowerCase().includes('genres :')).get(0);
    return $(row).find('a').map((i, e) => $(e).text()).get()
}

function _getChapters($) {
    return $('div#chapter > div.manga-info-chapter > div.chapter-list > div.row').map((i, el) => ({
        url: $($(el).find('span > a').get(0)).attr('href'),
        title: $($(el).find('span > a').get(0)).attr('title'),
        name: $($(el).find('span > a').get(0)).text(),
        updated: $($(el).find('span').get(2)).text(),
        views: $($(el).find('span').get(1)).text(),
        isRead: false,
        isDownloaded: false,
        hash: helper.getHashFromString($($(el).find('span > a').get(0)).attr('href')),
        order: i,
        images: [],
    })).get();
}

async function getChapterImageUrl(payload) {
    return helper.getChapterImageUrls(payload, '.container-chapter-reader > img', expObj.info.baseUrl);
}

export default expObj;