"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const esbuild_1 = require("esbuild");
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
                for (const chunk of chunks) {
                    for (const file of chunk.files) {
                        if (/\.m?js(\?.*)?$/i.test(file)) {
                            const source = compilation.assets[file].source();
                            const { js } = await service.transform(source, { minify: true });
                            compilation.assets[file] = new webpack_sources_1.RawSource(js || '');
                        }
                    }
                    ;
                }
                ;
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
