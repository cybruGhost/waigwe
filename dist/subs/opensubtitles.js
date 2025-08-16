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
    var PROVIDER, DOMAINS, subLang, subLanguageIds, currentDomainIndex, lastRequestTime, MIN_REQUEST_DELAY, tryWithNextDomain, makeRequest, baseUrl, _i, subLanguageIds_1, item, url, response, data, _a, data_1, itemData, fileName, lang, season, episode, e_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                PROVIDER = "OpenSubtitles";
                // Multiple domain options as fallbacks
                DOMAINS = [
                    "https://rest.opensubtitles.org",
                    "https://opensubtitles.venom.global",
                    "https://opensubtitles.website"
                ];
                subLang = {
                    eng: "English", spa: "Spanish", fre: "French", ger: "German",
                    ita: "Italian", por: "Portuguese", rus: "Russian", chi: "Chinese",
                    jpn: "Japanese", kor: "Korean", ara: "Arabic", hin: "Hindi",
                    dut: "Dutch", swe: "Swedish", pol: "Polish", tur: "Turkish",
                    dan: "Danish", nor: "Norwegian", fin: "Finnish", vie: "Vietnamese",
                    ind: "Indonesian"
                };
                subLanguageIds = [
                    { name: 'English', id: 'eng' }, { name: 'Arabic', id: 'ara' },
                    { name: 'Spanish', id: 'spa' }, { name: 'French', id: 'fre' },
                    { name: 'Vietnamese', id: 'vie' }, { name: 'Italian', id: 'ita' },
                    { name: 'Portuguese', id: 'por' }, { name: 'Chinese', id: 'chi' },
                    { name: 'Korean', id: 'kor' }, { name: 'Hindi', id: 'hin' },
                    { name: 'Dutch', id: 'dut' }, { name: 'Swedish', id: 'swe' },
                    { name: 'Polish', id: 'pol' }, { name: 'Turkish', id: 'tur' },
                    { name: 'Indonesian', id: 'ind' }
                ];
                currentDomainIndex = 0;
                lastRequestTime = 0;
                MIN_REQUEST_DELAY = 1500; // 1.5 seconds between requests to avoid rate limiting

                // Function to cycle through available domains
                tryWithNextDomain = function () {
                    currentDomainIndex = (currentDomainIndex + 1) % DOMAINS.length;
                    libs.log({ newDomain: DOMAINS[currentDomainIndex] }, PROVIDER, "SWITCHING DOMAIN");
                };

                // Throttled request function
                makeRequest = function (url) { return __awaiter(_this, void 0, void 0, function () {
                    var now, delay, response, error_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                now = Date.now();
                                delay = lastRequestTime + MIN_REQUEST_DELAY - now;
                                if (delay > 0) {
                                    libs.log({ delay: delay }, PROVIDER, "THROTTLING REQUEST");
                                    return [2, new Promise(function (resolve) {
                                            setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                                                var result;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0: return [4, makeRequest(url)];
                                                        case 1:
                                                            result = _a.sent();
                                                            resolve(result);
                                                            return [2];
                                                    }
                                                });
                                            }); }, delay);
                                        })];
                                }
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                libs.log({ url: url }, PROVIDER, "MAKING REQUEST");
                                return [4, fetch(url, {
                                        method: "GET",
                                        headers: {
                                            "X-User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                                            "Accept": "application/json"
                                        }
                                    })];
                            case 2:
                                response = _a.sent();
                                lastRequestTime = Date.now();
                                return [2, response];
                            case 3:
                                error_1 = _a.sent();
                                libs.log({ error: error_1 }, PROVIDER, "REQUEST FAILED");
                                tryWithNextDomain();
                                throw error_1;
                            case 4: return [2];
                        }
                    });
                }); };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 7, , 8]);
                baseUrl = movieInfo.type === "tv" 
                    ? DOMAINS[currentDomainIndex] + `/search/episode-${movieInfo.episode}/imdbid-${movieInfo.imdb_id}/season-${movieInfo.season}` 
                    : DOMAINS[currentDomainIndex] + `/search/imdbid-${movieInfo.imdb_id}`;
                libs.log({ baseUrl: baseUrl }, PROVIDER, "BASE URL");
                _i = 0, subLanguageIds_1 = subLanguageIds;
                _b.label = 2;
            case 2:
                if (!(_i < subLanguageIds_1.length)) return [3, 6];
                item = subLanguageIds_1[_i];
                url = baseUrl + `/sublanguageid-${item.id}`;
                return [4, makeRequest(url)];
            case 3:
                response = _b.sent();
                if (!response.ok) {
                    libs.log({ status: response.status }, PROVIDER, "RESPONSE ERROR");
                    tryWithNextDomain();
                    return [3, 5];
                }
                return [4, response.json()];
            case 4:
                data = _b.sent();
                libs.log({ dataLength: data ? data.length : 0 }, PROVIDER, "DATA RECEIVED");
                if (data && data.length) {
                    for (_a = 0, data_1 = data; _a < data_1.length; _a++) {
                        itemData = data_1[_a];
                        if (!itemData || !itemData.SubDownloadLink) continue;
                        
                        fileName = itemData.SubFileName || "subtitle";
                        lang = (itemData.SubLanguageID || '').toLowerCase();
                        
                        // TV show validation
                        if (movieInfo.type == "tv") {
                            season = Number(itemData.SeriesSeason || 0);
                            episode = Number(itemData.SeriesEpisode || 0);
                            if (movieInfo.season !== season || movieInfo.episode !== episode) {
                                continue;
                            }
                        }
                        
                        if (!subLang[lang]) continue;
                        
                        callback({
                            file: itemData.SubDownloadLink,
                            kind: "Captions",
                            label: subLang[lang],
                            type: "zip",
                            provider: PROVIDER,
                            headers: {
                                "X-User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                                "Accept": "application/json"
                            }
                        });
                    }
                }
                _b.label = 5;
            case 5:
                _i++;
                return [3, 2];
            case 6: return [3, 8];
            case 7:
                e_1 = _b.sent();
                libs.log({ error: e_1 }, PROVIDER, "FINAL ERROR");
                return [3, 8];
            case 8: return [2, true];
        }
    });
}); };
