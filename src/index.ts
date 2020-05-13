import { Compiler, compilation } from 'webpack';
import { RawSource } from 'webpack-sources';
import { Service, startService } from 'esbuild';
import pLimit, { Limit } from 'p-limit';

let service: Service;
class ESBuildMinifierWebpackPlugin {
  apply(compiler: Compiler) {
    const pluginName = 'ESBuildMinifierWebpackPlugin';
    const limit: Limit = pLimit(Infinity);
    const queue: Array<Promise<() => Promise<void>>> = [];

    compiler.hooks.emit.tapAsync(
      pluginName,
      async (compilation: compilation.Compilation, callback) => {
        for (const key of Object.keys(compilation.assets)) {
          if (/\.(js)$/.test(key)) {
            queue.push(limit(() => async () => {
              const source: string = compilation.assets[key].source();
              const { js } = await service.transform(source, { minify: true });
              compilation.assets[key] = new RawSource(js || '');
            }));
          }
        }

        try{
          await Promise.all(queue).then(() => callback);
        } catch (e) {
          throw e;
        }
      }
    );

    compiler.hooks.shouldEmit.tap(
      pluginName, 
      async () => {
        if (!service) {
          service = await startService()
        }
      }
    );

    compiler.hooks.afterEmit.tapAsync(
      pluginName, 
      async () => {
        if (service) {
          await service.stop();
        }
      }
    );
  }
}

module.exports = ESBuildMinifierWebpackPlugin;
