var winston = require('winston');
var logConfig = {
  levels: {
    silly: 0,
    input: 1,
    verbose: 2,
    prompt: 3,
    debug: 4,
    info: 5,
    data: 6,
    help: 7,
    warn: 8,
    error: 9
  },
  colors: {
    silly: 'magenta',
    input: 'grey',
    verbose: 'cyan',
    prompt: 'grey',
    debug: 'blue',
    info: 'green',
    data: 'grey',
    help: 'cyan',
    warn: 'yellow',
    error: 'red'
  }
};

/**
 * try to find line number of error
 * generate new error
 * trace the error stack
 *
 * @returns {string} number of error
 */
function traceCaller() {
  var stack = ((new Error()).stack).split('\n');
  if (stack.length > 4) {
    var line = stack[4];
    var start = line.indexOf(':', line.lastIndexOf('.'));
    var end = line.indexOf(')', start);
    return line.slice(start, end);
  }
  return '';
}
function getLogger(module) {
  var path = module.filename
    .replace(process.cwd(), '')
    .split('\\')
    .join('/');
  var transports = [
    new winston.transports.Console({
      colorize: true,
      levels: 'debug',
      label: path
    })
  ];
  var logger = new winston.Logger({
    transports: transports,
    levels: logConfig.levels,
    colors: logConfig.colors
  });
  var oldLog = logger.log;
  logger.log = function () {
    var args = Array.prototype.slice.call(arguments);
    args.splice(1, 0, traceCaller());
    oldLog.apply(logger, args);
  };
  return logger;
}

module.exports = getLogger;
