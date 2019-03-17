"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowWebpackPlugin = void 0;

var os = _interopRequireWildcard(require("os"));

var _child_process = require("child_process");

var _process = _interopRequireDefault(require("process"));

var _utils = require("./utils");

const {
  EOL
} = os;
const PLUGIN_PREFIX = '[flow-webpack-plugin]';

class FlowWebpackPlugin {
  constructor(options) {
    options = options || {};
    this.options = (0, _utils.applyOptionsDefaults)(options);
    (0, _utils.validateOptions)(this.options);

    if (this.options.verbose) {
      (0, _utils.pluginPrint)('Options:');
      Object.keys(this.options).forEach(optionName => (0, _utils.pluginPrint)(`${optionName}=${this.options[optionName]}`));
    }
  }

  apply(compiler) {
    const plugin = this;
    let flowResult;
    let flowExecutionError = undefined;

    const runCallback = failOnError => (compiler, webpackCallback) => {
      flowCheck().then(result => {
        flowResult = result;
        callUserCallback(webpackCallback);
      }).catch(error => {
        flowExecutionError = error;
        failOnError ? webpackCallback('Flow execution failed. ' + error) : webpackCallback();
      });
    };

    compiler.hooks.afterEmit.tap('FlowWebpackPlugin', compilation => {
      const reportingCollectionName = _utils.REPORTING_SEVERITY[plugin.options.reportingSeverity];

      if (flowExecutionError) {
        /*
         * Passed object will be printed at the end of the compilation in red
         * (unless specified otherwise), webpack still emits assets,
         * return code will still 0.
         */
        compilation[reportingCollectionName].push('Flow execution: ' + flowExecutionError); // callback()

        return;
      }

      if (flowResult.successful) {
        // callback()
        return;
      }

      const details = plugin.options.printFlowOutput ? EOL + formatFlowOutput(flowResult) : '';
      compilation[reportingCollectionName].push('Flow validation' + details); // callback()
    });
    /*
     * callbacks chosen because it is required
     * * to be done before or at time of 'compilation callback' - to avoid expensive compilation when type error present
     * * hook needs to be asynchronous
     */

    compiler.hooks.run.tapAsync('FlowWebpackPlugin', runCallback(plugin.options.failOnError));
    compiler.hooks.watchRun.tapAsync('FlowWebpackPlugin', runCallback(plugin.options.failOnErrorWatch));

    function callUserCallback(webpackCallback) {
      let userCallbackResult;

      try {
        log('About to call user callback.');
        userCallbackResult = plugin.options.callback(flowResult);
      } catch (userCallbackException) {
        console.warn(PLUGIN_PREFIX, 'User callback failed throwing:', userCallbackException);
        afterUserCallback(webpackCallback);
        return;
      }

      if (!(userCallbackResult instanceof Promise)) {
        log('User callback synchronously ended.');
        afterUserCallback(webpackCallback);
        return;
      }

      log('User callback returned a promise. Waiting for it.');
      userCallbackResult.then(() => {
        log('User callback promise resolved.');
        afterUserCallback(webpackCallback);
      }, userCallbackException => {
        console.warn(PLUGIN_PREFIX, 'Callback failed throwing:', userCallbackException);
        afterUserCallback(webpackCallback);
      });
    }

    function afterUserCallback(webpackCallback) {
      if (!flowResult.successful && plugin.options.failOnError) {
        const details = plugin.options.printFlowOutput ? EOL + formatFlowOutput(flowResult) : '';
        /*
         * argument passed to callback() causes webpack to immediately stop, even in watch mode,
         * don't emit assets, and set return code to 1
         */

        webpackCallback('Flow validation failed.' + details);
        return;
      }

      webpackCallback();
    }

    function formatFlowOutput(result) {
      return prefixIfVerbose('flow stdout', result.stdout) + prefixIfVerbose('flow stderr', result.stderr);
    }

    function prefixIfVerbose(prefix, lines) {
      return plugin.options.verbose ? (0, _utils.prefixLines)(prefix, lines) : lines;
    }

    function flowCheck() {
      return new Promise((resolve, reject) => {
        log(`spawning flow`);
        const flowProcess = (0, _child_process.spawn)(plugin.options.flowPath, plugin.options.flowArgs, {
          stdio: getStdioOptions()
        });
        let stdout = '';
        let stderr = '';
        plugin.options.printFlowOutput && flowProcess.stdout.on('data', data => stdout += data.toString());
        plugin.options.printFlowOutput && flowProcess.stderr.on('data', data => stderr += data.toString());
        let resolved = false;
        flowProcess.on('error', error => {
          (0, _utils.pluginPrint)('flow execution failed. Please make sure that the `flowPath` option is correctly set.', error);
          reject(error);
          resolved = true;
        });
        flowProcess.on('exit', exitCode => {
          log('flow exited with return code ' + exitCode);

          if (resolved) {
            return;
          }

          resolve({
            get successful() {
              return this.exitCode === 0;
            },

            exitCode,
            stdout,
            stderr
          });
        });
      });
    }

    function getStdioOptions() {
      return plugin.options.printFlowOutput || plugin.options.callback === _utils.NOOP ? 'pipe' : 'ignore';
    }

    function log(...messages) {
      if (plugin.options.verbose) {
        (0, _utils.pluginPrint)(...messages);
      }
    }
  }

}

exports.FlowWebpackPlugin = FlowWebpackPlugin;