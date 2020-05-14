import { Compiler, compilation } from 'webpack';
import { RawSource } from 'webpack-sources';
import { Service, startService } from 'esbuild';
import pLimit, { Limit } from 'p-limit';

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
            const limit: Limit = pLimit(Infinity);
            const queue: any[] = [];
            const transform = (source: string, cb: (js: string | undefined) => void) => new Promise<string>(async (resolve, reject) => {
              const { js } = await service.transform(source, { minify: true });
              cb(js);
              resolve(js);
            });

            for (const chunk of chunks) {
              for (const file of chunk.files) {
                if (/\.m?js(\?.*)?$/i.test(file)) {
                  const source: string = compilation.assets[file].source();
                  const setAsset = (js: string | undefined) => {
                    compilation.assets[file] = new RawSource(js || '');
                  }
                  queue.push(limit(() => transform(source, setAsset)));
                }
              };
            };
            
            await Promise.all(queue);
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
