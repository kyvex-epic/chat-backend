const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const colours = {
    PRIMARY: "#007bff", INFO: "#17a2b8", SUCCESS: "#28a745", WARNING: "#ffc107", ERROR: "#dc3545",
    LIGHT: "#f8f9fa", DARK: "#343a40", WHITE: "#ffffff", BLACK: "#000000"
}

const typeColours = {
    WARNING: chalk.hex(colours.WHITE).bgHex(colours.WARNING).bold,
    ERROR: chalk.hex(colours.WHITE).bgHex(colours.ERROR).bold,
    SUCCESS: chalk.rgb(20, 20, 20).bgHex(colours.SUCCESS).bold,
    INFO: chalk.hex(colours.BLACK).bgHex(colours.INFO).bold,
    DATE: chalk.hex(colours.WHITE).bgHex(colours.DARK).bold,
    LOGGER: chalk.hex(colours.WHITE).bgHex(colours.DARK).bold
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

        if (!this.silent) {
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
let terminated = false;

function processDeaded(reason) {
    if (terminated) return; terminated = true;
    systemLogger.separator()
    systemLogger.log(`ERROR`, `Process terminated, reason: ${reason}`)
    loggers.forEach(logger => {
        logger.log(`INFO`, `Find this log at ${logger.logFilePath}`)
    })
    process.exit(0)
}

// When the process is terminated, log to console
const events = [ 'SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGPIPE', 'SIGHUP', 'SIGTERM', 'SIGINT', 'SIGBREAK', 'exit' ];
events.forEach(event => { process.on(event, processDeaded) })

module.exports = { Logger, logger }
