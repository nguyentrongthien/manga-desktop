// Check if an object is valid

let seriesOfListProperties = [
    'url',
    'title',
    'img',
    'latestChapter',
    'latestChapterUrl',
    'views',
    'sourceId'
];

let seriesProperties = [
    'url',
    'sourceId',
    'hash',
    'isSaved',
    'title',
    'authors',
    'status',
    'views',
    'genres',
    'img',
    'summary',
    'chapters',
    'reading',
];

let htmlPageProperties = [
    'htmlDoc',
    'isSeries',
    'sourceId',
    'originalUrl'
]

let chapterProperties = [

];

function validate(targetObject, properties) {
    for (let property of properties)
        if (!targetObject.hasOwnProperty.call(targetObject, property)) {
            throw 'Object is missing property <' + property + '>'
        }
    return targetObject;
}

export default {
    validateSeries : (targetObject) => validate(targetObject, seriesProperties),
    validateChapter : (targetObject) => validate(targetObject, chapterProperties),
    validateSeriesList : targetObjectArray => {
        if(targetObjectArray.length > 0)
            validate(targetObjectArray[0], seriesOfListProperties)

        return targetObjectArray;
    },
    validateHtmlPage : (targetObject) => validate(targetObject, htmlPageProperties),
}