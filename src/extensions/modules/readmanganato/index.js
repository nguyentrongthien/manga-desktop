import helper from "../../helper";

const expObj = {
    info: {
        name: 'Read Manganto',
        id: 'manganato.com',
        version: '0.0.1',
        baseUrl: 'https://manganato.com',
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
        return $('.content-genres-item').map((index, element) => {
            return {
                url: $($(element).find('a.genres-item-img').get(0)).attr('href'),
                title: $($(element).find('div.genres-item-info > h3 > a.genres-item-name').get(0)).text(),
                img: $($(element).find('img.img-loading').get(0)).attr('src'),
                latestChapter: $($(element).children('div.genres-item-info > a.genres-item-chap').get(0)).text(),
                latestChapterUrl: $($(element).children('div.genres-item-info > a.genres-item-chap').get(0)).attr('href'),
                views: $($(element).find('div.genres-item-info > p.genres-item-view-time > span.genres-item-view').get(0)).text(),
                sourceId: expObj.info.id
            }
        }).get();
    } catch (e) { console.log(e); }
}

async function searchSeries(payload) {
    try {
        let $ = await helper.loadUrl(getUrl(payload), expObj.info.baseUrl);
        return $('div.panel-search-story > div.search-story-item').map((index, element) => {
            return {
                url: $($(element).find('a.item-img').get(0)).attr('href'),
                title: $($(element).find('div.item-right > h3 > a.item-title').get(0)).text(),
                img: $($(element).find('a.item-img > img.img-loading').get(0)).attr('src'),
                latestChapter: $($(element).children('div.item-right > a.item-chapter').get(0)).text(),
                latestChapterUrl: $($(element).children('div.item-right > a.item-chapter').get(0)).attr('href'),
                views: $($(element).find('div.item-right > span').last()).text(),
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
        $('div.panel-category > p.pn-category-row').each((index, element) => {
            if(index <= 1) {
                arr.push({
                    name: index === 0 ? 'Type' : 'State',
                    key: index === 0 ? 'type' : 'state',
                    selected: 0,
                    values: $(element).find('a.a-h').map((i, child) => ({
                        name: $(child).text(),
                        value: helper.getParams($(child).attr('href'), 'type'),
                    })).get()
                });
            } else {
                $(element).find('a.a-h').each((i, child) => {
                    let href = $(child).attr('href');
                    arr[0].values.push({
                        name: $(child).text(),
                        value: href.substr(href.lastIndexOf('/') + 1),
                    })
                })
            }
        });
        return arr;
    } catch (e) { console.log(e); }

}

function getUrl(payload) {
    let url = expObj.info.baseUrl;
    let firstPart = null;
    let secondPart = '?';
    if(!payload || !payload.search) {
        firstPart = '/genre-all';
        if(payload.filter) {
            for(let item of payload.filter) {
                if(item.key === 'category')
                    firstPart = '/' + item.values[item.selected].value;
                else
                    secondPart += item.selected !== 0 ? item.key + '=' + item.values[item.selected].value + '&' : '';
            }
        }
        url += firstPart;

        if(payload.page)
            url += '/' + payload.page;

        url += secondPart;
    } else if(payload.search) {
        url += '/search/story/' + formatSearchTerm(payload.search) + secondPart + 'page=' + payload.page;
    }
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
        obj.url = url;
        obj.sourceId = expObj.info.id;
        obj.hash = helper.getHashFromString(url);
        obj.title = $($('div.panel-story-info > div.story-info-right > h1').get(0)).text();
        obj.isSaved = false;
        obj.authors = _getAuthors($);
        obj.status = _getStatus($);
        obj.views = _getViews($);
        obj.genres = _getGenres($);
        obj.img = $($('div.panel-story-info > div.story-info-left > span.info-image > img.img-loading').get(0)).attr('src');
        obj.summary = $($('div#panel-story-info-description').get(0)).text();
        obj.chapters = _getChapters($);
        obj.reading = obj.chapters.length - 1;
        return obj;
    } catch (e) { console.log(e); }
}

function _getAuthors($) {
    let tableRow = $('div.panel-story-info > div.story-info-right > table.variations-tableInfo > tbody > tr')
        .filter((i, el) => $(el).html().toLowerCase().includes('author(s)')).get(0);
    return $(tableRow).find('td.table-value > a.a-h').map((i, e) => $(e).text()).get()
}

function _getStatus($) {
    let tableRow = $('div.panel-story-info > div.story-info-right > table.variations-tableInfo > tbody > tr')
        .filter((i, el) => $(el).html().toLowerCase().includes('status')).get(0);
    return $($(tableRow).find('td.table-value').get(0)).text();
}

function _getViews($) {
    let element = $('div.panel-story-info > div.story-info-right > table.story-info-right-extent > p')
        .filter((i, el) => $(el).html().toLowerCase().includes('views :')).get(0);
    return $($(element).find('span.stre-value').get(0)).text();
}

function _getGenres($) {
    let tableRow = $('div.panel-story-info > div.story-info-right > table.variations-tableInfo > tbody > tr')
        .filter((i, el) => $(el).html().toLowerCase().includes('genres :')).get(0);
    return $(tableRow).find('td.table-value > a.a-h').map((i, e) => $(e).text()).get()
}

function _getChapters($) {
    return $('div.panel-story-chapter-list > ul.row-content-chapter > li.a-h').map((i, el) => ({
        url: $($(el).find('a.chapter-name').get(0)).attr('href'),
        title: $($(el).find('a.chapter-name').get(0)).attr('title'),
        name: $($(el).find('a.chapter-name').get(0)).text(),
        views: $($(el).find('span.chapter-view').get(0)).text(),
        updated: $($(el).find('span.chapter-time').get(0)).text(),
        isRead: false,
        isDownloaded: false,
        hash: helper.getHashFromString($($(el).find('a.chapter-name').get(0)).attr('href')),
        order: i,
        images: [],
    })).get();
}

async function getChapterImages(payload) {
    try {
        return await helper.getImages(payload, '.container-chapter-reader > img', expObj.info.baseUrl);
    } catch (e) { console.log(e); }
}

async function getChapterImageUrl(payload) {
    return helper.getChapterImageUrls(payload, '.container-chapter-reader > img', expObj.info.baseUrl);
}

export default expObj;