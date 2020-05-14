"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const esbuild_1 = require("esbuild");
const p_limit_1 = __importDefault(require("p-limit"));
let _service;
const ensureService = async () => {
    if (!_service) {
        _service = await esbuild_1.startService();
    }
    return _service;
};
class ESBuildMinifierWebpackPlugin {
    apply(compiler) {
        const pluginName = 'ESBuildMinifierWebpackPlugin';
        compiler.hooks.compilation.tap(pluginName, (compilation) => {
            compilation.hooks.optimizeChunkAssets.tapAsync(pluginName, async (chunks, callback) => {
                const service = await ensureService();
                const limit = p_limit_1.default(Infinity);
                const queue = [];
                const transform = (source, cb) => new Promise(async (resolve, reject) => {
                    const { js } = await service.transform(source, { minify: true });
                    cb(js);
                    resolve(js);
                });
                for (const chunk of chunks) {
                    for (const file of chunk.files) {
                        if (/\.m?js(\?.*)?$/i.test(file)) {
                            const source = compilation.assets[file].source();
                            const setAsset = (js) => {
                                compilation.assets[file] = new webpack_sources_1.RawSource(js || '');
                            };
                            queue.push(limit(() => transform(source, setAsset)));
                        }
                    }
                    ;
                }
                ;
                await Promise.all(queue);
                callback();
            });
        });
        compiler.hooks.afterEmit.tapAsync(pluginName, async () => {
            if (_service) {
                await _service.stop();
            }
        });
    }
}
module.exports = ESBuildMinifierWebpackPlugin;
