import { Compiler, compilation } from 'webpack';
import { RawSource } from 'webpack-sources';
import { Service, startService } from 'esbuild';

let _service: Service;
const ensureService: () => Promise<Service> = async () => {
  if (!_service) {
    _service = await startService();
  }
  return _service;
};

class ESBuildMinifierWebpackPlugin {
  apply(compiler: Compiler) {
    const pluginName = 'ESBuildMinifierWebpackPlugin';

    compiler.hooks.compilation.tap(
      pluginName,
      (compilation: compilation.Compilation) => {
        compilation.hooks.optimizeChunkAssets.tapAsync(
          pluginName,
          async (chunks: compilation.Chunk[], callback) => {
            const service = await ensureService();

            for (const chunk of chunks) {
              for (const file of chunk.files) {
                if (/\.(js)$/.test(file)) {
                  const source: string = compilation.assets[file].source();
                  const { js } = await service.transform(source, { minify: true });
                  compilation.assets[file] = new RawSource(js || '');
                }
              };
            };

            callback();
          }
        )
      }
    )

    compiler.hooks.afterEmit.tapAsync(
      pluginName, 
      async () => {
        if (_service) {
          await _service.stop();
        }
      }
    );
  }
}

module.exports = ESBuildMinifierWebpackPlugin;
