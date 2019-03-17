"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var os = _interopRequireWildcard(require("os"));

var _child_process = require("child_process");

var _process = _interopRequireDefault(require("process"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var EOL = os.EOL;
var PLUGIN_PREFIX = '[flow-webpack-plugin]';

var FlowWebpackPlugin =
/*#__PURE__*/
function () {
  function FlowWebpackPlugin(options) {
    var _this = this;

    _classCallCheck(this, FlowWebpackPlugin);

    options = options || {};
    this.options = (0, _utils.applyOptionsDefaults)(options);
    (0, _utils.validateOptions)(this.options);

    if (this.options.verbose) {
      (0, _utils.pluginPrint)('Options:');
      Object.keys(this.options).forEach(function (optionName) {
        return (0, _utils.pluginPrint)("".concat(optionName, "=").concat(_this.options[optionName]));
      });
    }
  }

  _createClass(FlowWebpackPlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var plugin = this;
      var flowResult;
      var flowExecutionError = undefined;

      var runCallback = function runCallback(failOnError) {
        return function (compiler, webpackCallback) {
          flowCheck().then(function (result) {
            flowResult = result;
            callUserCallback(webpackCallback);
          }).catch(function (error) {
            flowExecutionError = error;
            failOnError ? webpackCallback('Flow execution failed. ' + error) : webpackCallback();
          });
        };
      };

      compiler.hooks.afterEmit.tap('FlowWebpackPlugin', function (compilation) {
        var reportingCollectionName = _utils.REPORTING_SEVERITY[plugin.options.reportingSeverity];

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

        var details = plugin.options.printFlowOutput ? EOL + formatFlowOutput(flowResult) : '';
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
        var userCallbackResult;

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
        userCallbackResult.then(function () {
          log('User callback promise resolved.');
          afterUserCallback(webpackCallback);
        }, function (userCallbackException) {
          console.warn(PLUGIN_PREFIX, 'Callback failed throwing:', userCallbackException);
          afterUserCallback(webpackCallback);
        });
      }

      function afterUserCallback(webpackCallback) {
        if (!flowResult.successful && plugin.options.failOnError) {
          var details = plugin.options.printFlowOutput ? EOL + formatFlowOutput(flowResult) : '';
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
        return new Promise(function (resolve, reject) {
          log("spawning flow");
          var flowProcess = (0, _child_process.spawn)(plugin.options.flowPath, plugin.options.flowArgs, {
            stdio: getStdioOptions()
          });
          var stdout = '';
          var stderr = '';
          plugin.options.printFlowOutput && flowProcess.stdout.on('data', function (data) {
            return stdout += data.toString();
          });
          plugin.options.printFlowOutput && flowProcess.stderr.on('data', function (data) {
            return stderr += data.toString();
          });
          var resolved = false;
          flowProcess.on('error', function (error) {
            (0, _utils.pluginPrint)('flow execution failed. Please make sure that the `flowPath` option is correctly set.', error);
            reject(error);
            resolved = true;
          });
          flowProcess.on('exit', function (exitCode) {
            log('flow exited with return code ' + exitCode);

            if (resolved) {
              return;
            }

            resolve({
              get successful() {
                return this.exitCode === 0;
              },

              exitCode: exitCode,
              stdout: stdout,
              stderr: stderr
            });
          });
        });
      }

      function getStdioOptions() {
        return plugin.options.printFlowOutput || plugin.options.callback === _utils.NOOP ? 'pipe' : 'ignore';
      }

      function log() {
        if (plugin.options.verbose) {
          _utils.pluginPrint.apply(void 0, arguments);
        }
      }
    }
  }]);

  return FlowWebpackPlugin;
}();

var _default = FlowWebpackPlugin;
exports.default = _default;
module.exports = exports.default;