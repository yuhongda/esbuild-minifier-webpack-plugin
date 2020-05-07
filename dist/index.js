"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
class ESBuildMinifierWebpackPlugin {
    apply(compiler) {
        compiler.hooks.emit.tapAsync('ESBuildMinifierWebpackPlugin', async (compilation, callback) => {
            const esbuild = require('esbuild');
            const service = await esbuild.startService();
            for (const key of Object.keys(compilation.assets)) {
                if (/\.(js)$/.test(key)) {
                    const source = compilation.assets[key].source();
                    const { js } = await service.transform(source, { minify: true });
                    // compilation.updateAsset(key, js);
                    compilation.assets[key] = new webpack_sources_1.RawSource(js);
                }
            }
            service.stop();
            callback();
        });
    }
}
module.exports = ESBuildMinifierWebpackPlugin;
