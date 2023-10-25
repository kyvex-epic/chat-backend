const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const typeColours = {
    WARNING: chalk.rgb(20, 20, 20).bgYellow.bold,
    ERROR: chalk.rgb(235, 235, 235).bgRed.bold,
    SUCCESS: chalk.rgb(20, 20, 20).bgGreen.bold,
    INFO: chalk.rgb(20, 20, 20).bgBlue.bold,
    DATE: chalk.rgb(0, 0, 0).bgRgb(200, 200, 200).bold,
    LOGGER: chalk.rgb(20, 20, 20).bgRgb(200, 200, 200).bold,
}

const loggers = []

class Logger {
    constructor(name = '', silent = false) {
        this.logFileName = this.getFormattedFileName(name);
        this.logFilePath = path.join('logs', this.logFileName);
        this.logTypes = ["WARNING", "ERROR", "SUCCESS", "INFO"];
        this.maxLogTypeLength = this.getMaxLogTypeLength();
        this.name = name;
        this.silent = silent;
        this.ensureLogDirectory();

        loggers.push(this)

        if (!silent) {
            this.log(`SUCCESS`, `New logger ${typeColours.LOGGER(this.name)} created`)
            this.log(`INFO`,    `Logging to ${this.logFilePath}`)
        }
    }

    getFormattedFileName(name) {
        const now = new Date();
        const date = now.toISOString().slice(0, 10);
        const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
        return `${date}-${time}${name ? '-' + name : ''}.log`;
    }

    getMaxLogTypeLength() {
        return this.logTypes.reduce((max, type) => Math.max(max, type.length), 0);
    }

    formatLogType(type) {
        const padding = ' '.repeat(this.maxLogTypeLength - type.length);
        const centered = ` ` + padding.slice(0, padding.length / 2) + type + padding.slice(padding.length / 2) + ' ';
        return centered.toUpperCase();
    }

    formatName(name) {
        // Get the longest name from all loggers
        const maxNameLength = loggers.reduce((max, logger) => Math.max(max, logger.name.length), 0);
        const padding = ' '.repeat(maxNameLength - name.length);
        const centered = ` ` + padding.slice(0, padding.length / 2) + name + padding.slice(padding.length / 2) + ' ';
        return centered.toUpperCase();
    }

    ensureLogDirectory() {
        const logDir = path.join(__dirname, 'logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
    }

    separator() {
        console.log()
        this.writeToFile(``)
    }

    log(type, text) {
        if (!this.logTypes.includes(type)) throw new Error(`Invalid log type: ${type}`);

        const date = new Date().toLocaleString('en-gb', { month: 'short', day: 'numeric' }).toUpperCase();
        const timestamp = new Date().toLocaleTimeString('en-gb', { hour12: false });
        const formattedName = this.formatName(this.name);

        //

        // formattedLog: [NAME] | [JUL 20] [15:30:00] [INFO] | Hello World

        // Log to console using Chalk for formatting
        console.log(
            typeColours.LOGGER(` ${formattedName} `)
            + ` `
            + typeColours.DATE(` ${date} | `)
            + typeColours.DATE(`${timestamp} `)
            + ` `
            + typeColours[type](`${this.formatLogType(type)}`)
            + ` ${text}`
        );

        const formattedLog = `[${date} | ${timestamp}] ${this.formatLogType(type)} | ${text}`;
        this.writeToFile(formattedLog);
    }

    writeToFile(log) {
        fs.appendFile(this.logFilePath, log + '\n', (err) => {
            if (err) console.error(typeColours.ERROR(`[ERROR] | ${err}`));
        });
    }

    warn(text) {
        this.log(`WARNING`, text)
    }

    error(text) {
        this.log(`ERROR`, text)
    }

    success(text) {
        this.log(`SUCCESS`, text)
    }

    info(text) {
        this.log(`INFO`, text)
    }

}



const systemLogger = new Logger('logger', false)
const logger = new Logger('main')

// wait 10s
setTimeout(() => {
    logger.log(`SUCCESS`, `Hello World`)
    logger.log(`INFO`, `Hello World`)
}, 10000)

function processDeaded(reason) {
    systemLogger.separator()
    systemLogger.log(`ERROR`, `Process terminated, reason: ${reason}`)
    loggers.forEach(logger => {
        logger.log(`INFO`, `Find this log at ${logger.logFilePath}`)
    })
}

// When the process is terminated, log to console
const events = [ 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGPIPE', 'SIGHUP', 'SIGTERM', 'SIGINT', 'SIGBREAK', 'exit' ];
events.forEach(event => { process.on(event, processDeaded) })

module.exports = { Logger, logger }
