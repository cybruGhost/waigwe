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
        var PROVIDER, DOMAIN, headers, decryptWithPassword, serverIDs, _i, serverIDs_1, serverID, urlDirect, dataDirect, decodedData, encryptedData, decryptedData, directUrl, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    PROVIDER = 'TomAutoEmbed';
                    DOMAIN = "https://test.autoembed.cc";
                    headers = {
                        'user-agent': "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
                        'Referer': DOMAIN + "/",
                        'Origin': DOMAIN,
                    };
                    
                    // Enhanced decryption function with better error handling
                    decryptWithPassword = function (encryptedObj) {
                        try {
                            if (!encryptedObj || !encryptedObj.salt || !encryptedObj.iv || !encryptedObj.encryptedData || !encryptedObj.key) {
                                throw new Error("Invalid encrypted data structure");
                            }
                            
                            var salt = cryptoS.enc.Hex.parse(encryptedObj.salt);
                            var iv = cryptoS.enc.Hex.parse(encryptedObj.iv);
                            var encrypted = encryptedObj.encryptedData;
                            
                            var key = cryptoS.PBKDF2(encryptedObj.key, salt, {
                                keySize: 8,
                                iterations: encryptedObj.iterations || 1000,
                                hasher: cryptoS.algo.SHA256
                            });
                            
                            var decrypted = cryptoS.AES.decrypt(encrypted, key, {
                                iv: iv,
                                padding: cryptoS.pad.Pkcs7,
                                mode: cryptoS.mode.CBC
                            }).toString(cryptoS.enc.Utf8);
                            
                            if (!decrypted) {
                                throw new Error("Decryption failed - empty result");
                            }
                            
                            return JSON.parse(decrypted);
                        } catch (error) {
                            libs.log({ error: error.message }, PROVIDER, "DECRYPTION ERROR");
                            throw error;
                        }
                    };
                    
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 7, , 8]);
                    serverIDs = [1, 2, 3, 4]; // Server IDs to try
                    _i = 0, serverIDs_1 = serverIDs;
                    _a.label = 2;
                case 2:
                    if (!(_i < serverIDs_1.length)) return [3, 6];
                    serverID = serverIDs_1[_i];
                    
                    // Build URL based on media type
                    if (movieInfo.type === "movie") {
                        urlDirect = DOMAIN + "/api/server?id=" + movieInfo.tmdb_id + "&sr=" + serverID;
                    } else {
                        urlDirect = DOMAIN + "/api/server?id=" + movieInfo.tmdb_id + "&sr=" + serverID + 
                                   "&ep=" + (movieInfo.episode || 1) + "&ss=" + (movieInfo.season || 1);
                    }
                    
                    libs.log({ url: urlDirect }, PROVIDER, "TRYING SERVER " + serverID);
                    return [4, libs.request_get(urlDirect, headers, false)];
                case 3:
                    dataDirect = _a.sent();
                    
                    if (!dataDirect || !dataDirect.data) {
                        libs.log({ server: serverID, status: "No data" }, PROVIDER, "SERVER FAILED");
                        return [3, 5];
                    }
                    
                    try {
                        // Decode and parse the base64 data
                        decodedData = libs.string_atob(dataDirect.data);
                        encryptedData = JSON.parse(decodedData);
                        libs.log({ encryptedData: encryptedData }, PROVIDER, "ENCRYPTED DATA");
                        
                        // Decrypt the data
                        decryptedData = decryptWithPassword(encryptedData);
                        libs.log({ decryptedData: decryptedData }, PROVIDER, "DECRYPTED DATA");
                        
                        // Validate the URL
                        if (!decryptedData.url || typeof decryptedData.url !== "string") {
                            throw new Error("Invalid URL in decrypted data");
                        }
                        
                        if (!decryptedData.url.startsWith("/") || 
                            !decryptedData.url.includes("/api/embed-proxy")) {
                            throw new Error("URL format invalid");
                        }
                        
                        // Build final URL and return
                        directUrl = DOMAIN + decryptedData.url;
                        libs.log({ url: directUrl }, PROVIDER, "FINAL URL");
                        
                        libs.embed_callback(
                            directUrl, 
                            PROVIDER, 
                            PROVIDER, 
                            'hls', 
                            callback, 
                            1, 
                            [], 
                            [{ file: directUrl, quality: 1080 }], 
                            headers, 
                            { type: "m3u8" }
                        );
                        
                        return [2]; // Exit early if successful
                    } catch (parseError) {
                        libs.log({
                            server: serverID,
                            error: parseError.message
                        }, PROVIDER, "PARSE/DECRYPT ERROR");
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3, 2];
                case 5:
                    return [3, 2];
                case 6:
                    libs.log({ status: "All servers failed" }, PROVIDER, "FINAL RESULT");
                    return [3, 8];
                case 7:
                    e_1 = _a.sent();
                    libs.log({
                        error: e_1.message,
                        stack: e_1.stack
                    }, PROVIDER, "GLOBAL ERROR");
                    return [3, 8];
                case 8:
                    return [2];
            }
        });
    });
};
