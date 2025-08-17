var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

source.getResource = function (movieInfo, config, callback) {
    return __awaiter(this, void 0, void 0, function () {
        var PROVIDER, DOMAIN, headers, urlSearch, searchHeaders, body, dataSearch, ID, DETAIL_PATH, _i, _a, item, title, releaseDate, year, urlDirect, dataDirect, streamQuality, _b, _c, item, quality, HlsQuality, _d, _e, item, quality, e_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    PROVIDER = 'CAoneroom';
                    DOMAIN = "https://h5.aoneroom.com";
                    headers = {
                        'user-agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        'referer': "https://h5.aoneroom.com/"
                    };
                    _f.label = 1;
                case 1:
                    _f.trys.push([1, 4, , 5]);
                    urlSearch = "".concat(DOMAIN, "/wefeed-h5-bff/web/subject/search");
                    searchHeaders = Object.assign({}, headers, {
                        "Content-Type": "application/json"
                    });
                    body = {
                        keyword: movieInfo.title,
                        page: 1,
                        perPage: 24,
                        subjectType: movieInfo.type === 'movie' ? 1 : 2
                    };
                    return [4, libs.request_post(urlSearch, searchHeaders, body)];
                case 2:
                    dataSearch = _f.sent();
                    libs.log({ dataSearch: dataSearch }, PROVIDER, "DATA SEARCH");
                    
                    if (!dataSearch || !dataSearch.data || !dataSearch.data.items || dataSearch.data.items.length === 0) {
                        libs.log({ error: "No search results found" }, PROVIDER, "ERROR");
                        return [2];
                    }
                    
                    ID = "";
                    DETAIL_PATH = "";
                    for (_i = 0, _a = dataSearch.data.items; _i < _a.length; _i++) {
                        item = _a[_i];
                        title = item.title;
                        
                        if (!item || !item.subjectId || !libs.string_matching_title(movieInfo, title)) {
                            continue;
                        }
                        
                        if (movieInfo.type === 'movie') {
                            releaseDate = item.releaseDate;
                            year = releaseDate ? releaseDate.split('-')[0] : "";
                            libs.log({ year: year, title: title }, PROVIDER, "YEAR INFO");
                            
                            if (year && movieInfo.year === year) {
                                ID = item.subjectId;
                                DETAIL_PATH = item.detailPath;
                                break;
                            }
                        } else {
                            ID = item.subjectId;
                            DETAIL_PATH = item.detailPath;
                            break;
                        }
                    }
                    
                    libs.log({ ID: ID, DETAIL_PATH: DETAIL_PATH }, PROVIDER, "ID AND PATH");
                    
                    if (!ID) {
                        libs.log({ error: "No matching ID found" }, PROVIDER, "ERROR");
                        return [2];
                    }
                    
                    urlDirect = "".concat(DOMAIN, "/wefeed-h5-bff/web/subject/play?subjectId=").concat(ID);
                    
                    // Add season/episode for TV shows
                    if (movieInfo.type === 'tv') {
                        urlDirect += "&se=".concat(movieInfo.season || 1, "&ep=").concat(movieInfo.episode || 1);
                    }
                    
                    return [4, libs.request_get(urlDirect, {
                        "Content-Type": "application/json",
                        'user-agent': headers['user-agent'],
                        'referer': "".concat(DOMAIN, "/movies/").concat(DETAIL_PATH)
                    })];
                case 3:
                    dataDirect = _f.sent();
                    libs.log({ dataDirect: dataDirect }, PROVIDER, "DATA DIRECT");
                    
                    if (!dataDirect || !dataDirect.data) {
                        libs.log({ error: "No direct data found" }, PROVIDER, "ERROR");
                        return [2];
                    }
                    
                    // Process streams
                    streamQuality = [];
                    if (dataDirect.data.streams) {
                        for (_b = 0, _c = dataDirect.data.streams; _b < _c.length; _b++) {
                            item = _c[_b];
                            if (!item.url) continue;
                            
                            quality = item.resolutions ? parseInt(item.resolutions.toString().replace('p', '')) : 1080;
                            streamQuality.push({
                                file: item.url,
                                quality: quality,
                                type: 'stream'
                            });
                        }
                    }
                    
                    // Process HLS streams
                    HlsQuality = [];
                    if (dataDirect.data.hls) {
                        for (_d = 0, _e = dataDirect.data.hls; _d < _e.length; _d++) {
                            item = _e[_d];
                            if (!item.url) continue;
                            
                            quality = item.resolutions ? parseInt(item.resolutions.toString().replace('p', '')) : 1080;
                            HlsQuality.push({
                                file: item.url,
                                quality: quality,
                                type: 'hls'
                            });
                        }
                    }
                    
                    // Combine and sort all sources
                    var allSources = streamQuality.concat(HlsQuality);
                    if (allSources.length > 0) {
                        allSources = _.orderBy(allSources, ['quality'], ['desc']);
                        libs.embed_callback(allSources[0].file, PROVIDER, PROVIDER, 'Hls', callback, 1, [], allSources, headers);
                    } else {
                        libs.log({ error: "No playable sources found" }, PROVIDER, "ERROR");
                    }
                    
                    return [3, 5];
                case 4:
                    e_1 = _f.sent();
                    libs.log({ error: e_1.message, stack: e_1.stack }, PROVIDER, "ERROR");
                    return [3, 5];
                case 5:
                    return [2];
            }
        });
    });
};
