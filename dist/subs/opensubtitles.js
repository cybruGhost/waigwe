subs.getResource = async function (movieInfo, config, callback) {
    const PROVIDER = "OpenSubtitles";
    const DOMAIN = "https://www.opensubtitles.org";
    const subLang = {
        eng: "English",
        spa: "Spanish",
        fre: "French",
        ger: "German",
        ita: "Italian",
        por: "Portuguese",
        rus: "Russian",
        chi: "Chinese",
        jpn: "Japanese",
        kor: "Korean",
        ara: "Arabic",
        hin: "Hindi",
        dut: "Dutch",
        swe: "Swedish",
        pol: "Polish",
        tur: "Turkish",
        dan: "Danish",
        nor: "Norwegian",
        fin: "Finnish",
        vie: "Vietnamese",
        ind: "Indonesian",
    };
    const subLanguageIds = [
        { name: 'English', id: 'eng' },
        { name: 'Arabic', id: 'ara' },
        { name: 'Spanish', id: 'spa' },
        { name: 'French', id: 'fre' },
        { name: 'Vietnamese', id: 'vie' },
        { name: 'Italian', id: 'ita' },
        { name: 'Portuguese', id: 'por' },
        { name: 'Chinese', id: 'chi' },
        { name: 'Korean', id: 'kor' },
        { name: 'Hindi', id: 'hin' },
        { name: 'Dutch', id: 'dut' },
        { name: 'Swedish', id: 'swe' },
        { name: 'Polish', id: 'pol' },
        { name: 'Turkish', id: 'tur' },
        { name: 'Indonesian', id: 'ind' },
    ];

    try {
        // Create the base search URL for OpenSubtitles API
        const url = `https://rest.opensubtitles.org/search/imdbid-${movieInfo.imdb_id.replace("tt", "")}`;
        libs.log({ url }, PROVIDER, "URL SEARCH");

        for (let item of subLanguageIds) {
            const urlLang = `${url}/sublanguageid-${item.id}`;
            const responseLang = await fetch(urlLang, {
                method: "GET",
                headers: {
                    "x-user-agent": "VLSub 0.10.2",
                },
            });
            const dataLang = await responseLang.json();
            libs.log({ urlLang, dataLang, item }, PROVIDER, "URL SEARCH LANG");

            // Loop through subtitle data
            for (let itemLang of dataLang) {
                const fileName = itemLang.SubFileName;
                const lang = itemLang.SubLanguageID.toLowerCase();

                libs.log({ fileName, langID: itemLang.SubLanguageID, zip: itemLang.ZipDownloadLink }, PROVIDER, "ITEM INFO");

                // Check if it's a TV show and validate season and episode
                if (movieInfo.type == "tv") {
                    const season = Number(itemLang.SeriesSeason);
                    const episode = Number(itemLang.SeriesEpisode);

                    libs.log({ episode, season, fileName, lang, zip: itemLang.ZipDownloadLink, movieInfo }, PROVIDER, "EPISODE COMPARE");

                    if (movieInfo.season !== season || movieInfo.episode !== episode) {
                        continue;
                    }
                }

                // Check for language and subtitle file link
                if (!subLang[lang] || !itemLang.ZipDownloadLink) {
                    continue;
                }

                libs.log({ fileName, lang, zip: itemLang.ZipDownloadLink }, PROVIDER, "ITEM INFO PASS==>");

                // Call the callback with the subtitle file
                callback({
                    file: itemLang.ZipDownloadLink,
                    kind: "Captions",
                    label: subLang[lang],
                    type: "zip",
                    provider: PROVIDER,
                    headers: {
                        "x-user-agent": "VLSub 0.10.2",
                    },
                });
            }
        }

    } catch (e) {
        libs.log({ e }, PROVIDER, "ERROR");
        // Optionally, you could call a fallback function here if needed
        fetchAlternativeSubtitles(movieInfo, callback);  // Fallback mechanism
    }
};

// Fallback function to fetch subtitles from an alternative provider like YIFY or Subscene
async function fetchAlternativeSubtitles(movieInfo, callback) {
    const altProvider = "YIFY";  // Example fallback provider
    const altUrl = `https://yts-subs.com/movie-imdb/${movieInfo.imdb_id}`;

    try {
        const response = await fetch(altUrl);
        const data = await response.json();

        if (data && data.subtitles && data.subtitles.length > 0) {
            callback({
                file: data.subtitles[0].download_url,
                kind: "Captions",
                label: "English",  // Default language or detect based on the response
                type: "zip",
                provider: altProvider,
            });
        } else {
            libs.log({ data }, altProvider, "NO SUBTITLES FOUND");
        }
    } catch (err) {
        libs.log({ err }, altProvider, "ERROR FALLBACK PROVIDER");
    }
}
