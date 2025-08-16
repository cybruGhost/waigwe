var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

subs.getResource = function (movieInfo, config, callback) { return __awaiter(_this, void 0, void 0, function () {
    var PROVIDER, DOMAIN, MAX_RETRIES, RETRY_DELAY, currentRetry, cleanTitle, normalizeTitle, getSubsceneUrl, getSubtitles, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                PROVIDER = "SubScene";
                DOMAIN = "https://sub-scene.com";
                MAX_RETRIES = 3;
                RETRY_DELAY = 2000;
                currentRetry = 0;
                
                // Skip TV shows as the original code does
                if (movieInfo.type === "tv") {
                    return [2];
                }
                
                cleanTitle = function (title) {
                    return title.split(":")[0].trim();
                };
                
                normalizeTitle = function (title) {
                    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
                };
                
                getSubsceneUrl = function () { return __awaiter(_this, void 0, void 0, function () {
                    var searchTitle, searchUrl, searchData, foundUrl, _i, _b, item, itemTitle, itemHref;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                searchTitle = cleanTitle(movieInfo.title);
                                searchUrl = "".concat(DOMAIN, "/search?query=").concat(encodeURIComponent(searchTitle));
                                return [4, libs.request_get(searchUrl, {}, {}, true)];
                            case 1:
                                searchData = _c.sent();
                                foundUrl = "";
                                
                                searchData("div.title").each(function (key, item) {
                                    var itemElement = searchData(item);
                                    var itemHref = itemElement.find("a").attr("href");
                                    var itemTitle = itemElement.find("a").text().trim();
                                    
                                    // More flexible title matching
                                    var cleanItemTitle = normalizeTitle(itemTitle);
                                    var cleanMovieTitle = normalizeTitle("".concat(movieInfo.title, " (").concat(movieInfo.year, ")"));
                                    
                                    if (cleanItemTitle.includes(cleanMovieTitle) {
                                        foundUrl = itemHref;
                                        return false; // Break the loop
                                    }
                                });
                                
                                return [2, foundUrl];
                        }
                    });
                }); };
                
                getSubtitles = function (subpageUrl) { return __awaiter(_this, void 0, void 0, function () {
                    var subData, subtitles, _i, _b, item, lang, title, href, downloadUrl;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0: return [4, libs.request_get(subpageUrl, {}, {}, true)];
                            case 1:
                                subData = _c.sent();
                                subtitles = [];
                                
                                subData("td.a1").each(function (key, item) {
                                    var itemElement = subData(item);
                                    var href = itemElement.find("a").attr("href");
                                    var title = itemElement.find("span.new").text().trim();
                                    var lang = itemElement.find("span.l.r").text().trim();
                                    
                                    if (href && title && lang) {
                                        subtitles.push({
                                            title: title,
                                            lang: lang,
                                            href: href
                                        });
                                    }
                                });
                                _i = 0, _b = subtitles;
                                _c.label = 2;
                            case 2:
                                if (!(_i < _b.length)) return [3, 6];
                                item = _b[_i];
                                return [4, libs.request_get("".concat(DOMAIN).concat(item.href), {}, {}, true)];
                            case 3:
                                subData = _c.sent();
                                downloadUrl = subData("div.download").find("a.button").attr("href");
                                
                                if (downloadUrl) {
                                    callback({
                                        file: "".concat(DOMAIN).concat(downloadUrl),
                                        kind: "Captions",
                                        label: item.lang,
                                        type: "zip",
                                        provider: PROVIDER,
                                        headers: {
                                            "Referer": "".concat(DOMAIN).concat(item.href)
                                        }
                                    });
                                }
                                _c.label = 4;
                            case 4:
                                _i++;
                                return [3, 2];
                            case 5: return [3, 8];
                            case 6: return [4, new Promise(function (resolve) { return setTimeout(resolve, RETRY_DELAY); })];
                            case 7:
                                _c.sent();
                                _c.label = 8;
                            case 8: return [2];
                        }
                    });
                }); };
                _a.label = 1;
            case 1:
                _a.trys.push([1, 7, , 8]);
                _a.label = 2;
            case 2:
                if (!(currentRetry < MAX_RETRIES)) return [3, 6];
                return [4, getSubsceneUrl()];
            case 3:
                subpageUrl = _a.sent();
                
                if (!subpageUrl) {
                    libs.log("No matching title found", PROVIDER, "WARNING");
                    currentRetry++;
                    return [3, 2];
                }
                
                return [4, getSubtitles("".concat(DOMAIN).concat(subpageUrl))];
            case 4:
                _a.sent();
                return [3, 6];
            case 5:
                e_1 = _a.sent();
                libs.log({ error: e_1, retry: currentRetry + 1 }, PROVIDER, "ERROR");
                currentRetry++;
                return [3, 2];
            case 6: return [3, 8];
            case 7:
                e_2 = _a.sent();
                libs.log({ error: e_2 }, PROVIDER, "FATAL ERROR");
                return [3, 8];
            case 8: return [2, true];
        }
    });
}); };
