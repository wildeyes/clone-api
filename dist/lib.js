"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = require("path");
var fs = __importStar(require("fs"));
var yaml = __importStar(require("yaml"));
var express_1 = __importDefault(require("express"));
var axios_1 = __importDefault(require("axios"));
var url_parse_1 = __importDefault(require("url-parse"));
var mkdirp_promise_1 = __importDefault(require("mkdirp-promise"));
exports.path = {
    out: path_1.resolve(__dirname, 'out'),
    data: function (name) {
        return path_1.resolve(this.out, name + '.json');
    },
};
mkdirp_promise_1.default(exports.path.out);
function start(filepath, port) {
    return __awaiter(this, void 0, void 0, function () {
        function baseurl() {
            return 'http://localhost:' + port;
        }
        var file, datafile, outfile, endpointData, _a, app, server;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    file = fs.readFileSync(filepath);
                    datafile = yaml.parse(file.toString());
                    outfile = getOutFileForYAML(datafile);
                    if (!fs.existsSync(outfile)) return [3 /*break*/, 1];
                    _a = JSON.parse(fs.readFileSync(outfile).toString());
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, clone(filepath)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    endpointData = _a;
                    app = express_1.default();
                    console.log('Setting up endpoints...');
                    datafile.forEach(function (_a, index) {
                        var url = _a.url, _b = _a.method, method = _b === void 0 ? 'GET' : _b, headers = _a.headers;
                        var data = endpointData[index].data;
                        var pathname = url_parse_1.default(url).pathname;
                        console.log("[" + method + "] " + baseurl() + pathname + " " + headersTxt(headers));
                        app[method.toLowerCase()](pathname, function (req, res, next) {
                            console.log("Request from client: " + method + " " + url + " " + headersTxt(headers));
                            if (headers)
                                for (var _i = 0, _a = Object.entries(headers); _i < _a.length; _i++) {
                                    var _b = _a[_i], key = _b[0], value = _b[1];
                                    if (req.headers[key.toLowerCase()] !== value) {
                                        return next( /* {
                                          err: 'headers mismatch',
                                          details: { sentHeaders: req.headers, wantedHeaders: headers },
                                        } */);
                                    }
                                }
                            res.send(data);
                        });
                    });
                    server = app.listen(port, function () {
                        return console.log('Running CloneAPI at ' + baseurl());
                    });
                    return [2 /*return*/, { close: server.close.bind(server) }];
            }
        });
    });
}
exports.start = start;
/**
 * Note: the clone function depends on the order, if the order changes without clearing the cache, it'll fuck things up.
 */
function clone(filepath) {
    return __awaiter(this, void 0, void 0, function () {
        var file, datafile, apiData;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    file = fs.readFileSync(filepath);
                    datafile = yaml.parse(file.toString());
                    return [4 /*yield*/, Promise.all(datafile.map(function (config, index) { return __awaiter(_this, void 0, void 0, function () {
                            var url, headers, data;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        url = config.url, headers = config.headers;
                                        console.log("Requesting " + url + "...  " + headersTxt(headers));
                                        return [4 /*yield*/, axios_1.default.request(config)];
                                    case 1:
                                        data = (_a.sent()).data;
                                        return [2 /*return*/, { index: index, url: url, data: data }];
                                }
                            });
                        }); }))
                        // its easier to manage in one file, but i would have also preferred it in a seperate file per request
                    ];
                case 1:
                    apiData = _a.sent();
                    // its easier to manage in one file, but i would have also preferred it in a seperate file per request
                    fs.writeFileSync(getOutFileForYAML(datafile), JSON.stringify(apiData));
                    return [2 /*return*/, apiData];
            }
        });
    });
}
function getOutFileForYAML(config) {
    // this line here means we choose the first url as the name for the json file in out/XXX.json
    // TODO validation on yaml scheme
    var baseurl = config[0].url;
    var basename = url_parse_1.default(baseurl).hostname;
    return exports.path.data(basename);
}
function headersTxt(headers) {
    return headers
        ? Object.entries(headers)
            .map(function (_a) {
            var k = _a[0], v = _a[1];
            return k + ":" + v;
        })
            .join(',')
        : '';
}
