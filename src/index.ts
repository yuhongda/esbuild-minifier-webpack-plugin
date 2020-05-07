import { Compiler, compilation } from 'webpack';
import { RawSource } from 'webpack-sources';

class ESBuildMinifierWebpackPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.emit.tapAsync(
      'ESBuildMinifierWebpackPlugin',
      async (compilation: compilation.Compilation, callback) => {
        const esbuild = require('esbuild')
        const service = await esbuild.startService()

        for (const key of Object.keys(compilation.assets)) {
          if (/\.(js)$/.test(key)) {
            const source = compilation.assets[key].source();
            const { js } = await service.transform(source, { minify: true });
            // compilation.updateAsset(key, js);
            compilation.assets[key] = new RawSource(js)
          }
        }
        service.stop();
        callback();
      }
    );
  }
}

module.exports = ESBuildMinifierWebpackPlugin;
