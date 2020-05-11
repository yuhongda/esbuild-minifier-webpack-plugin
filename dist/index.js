"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const esbuild_1 = require("esbuild");
const p_limit_1 = __importDefault(require("p-limit"));
let service;
class ESBuildMinifierWebpackPlugin {
    apply(compiler) {
        const pluginName = 'ESBuildMinifierWebpackPlugin';
        const limit = p_limit_1.default(Infinity);
        const queue = [];
        compiler.hooks.emit.tapAsync(pluginName, async (compilation, callback) => {
            for (const key of Object.keys(compilation.assets)) {
                if (/\.(js)$/.test(key)) {
                    queue.push(limit(() => async () => {
                        const source = compilation.assets[key].source();
                        const { js } = await service.transform(source, { minify: true });
                        compilation.assets[key] = new webpack_sources_1.RawSource(js || '');
                    }));
                }
            }
            try {
                await Promise.all(queue);
            }
            catch (e) {
                throw e;
            }
            callback();
        });
        compiler.hooks.shouldEmit.tap(pluginName, async () => {
            if (!service) {
                service = await esbuild_1.startService();
            }
        });
        compiler.hooks.afterEmit.tapAsync(pluginName, async () => {
            if (service) {
                await service.stop();
            }
        });
    }
}
module.exports = ESBuildMinifierWebpackPlugin;
