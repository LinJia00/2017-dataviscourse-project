let dataCache = {};

function loadJson(url, callback) {
    if (dataCache[url]) {
        callback(dataCache[url]);
    } else {
        d3.json(url, function(data) {
            dataCache[url] = data;
            callback(data);
        });
    }
}