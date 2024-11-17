const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE || 'Error'

const LogLevel = {
    Info: 1,
    Warning: 2,
    Error: 3,
}

const currentLogLevel = LogLevel[DEBUG_MODE] || LogLevel.Error

const Colors = {
    Reset: "\x1b[0m",
    Info: "\x1b[32m",    // Green
    Warning: "\x1b[33m", // Yellow
    Error: "\x1b[31m",   // Red
}

// Function to get current local timestamp
function getLocalTimestamp() {
    const now = new Date()
    return now.toLocaleString() // Customize format if needed
}

const logger = {
    info: (message) => {
        if (currentLogLevel <= LogLevel.Info) {
            const timestamp = getLocalTimestamp()
            console.log(`${Colors.Info}[INFO] [${timestamp}]: ${message}${Colors.Reset}`)
        }
    },
    warning: (message) => {
        if (currentLogLevel <= LogLevel.Warning) {
            const timestamp = getLocalTimestamp()
            console.log(`${Colors.Warning}[WARNING] [${timestamp}]: ${message}${Colors.Reset}`)
        }
    },
    error: (message) => {
        if (currentLogLevel <= LogLevel.Error) {
            const timestamp = getLocalTimestamp()
            console.log(`${Colors.Error}[ERROR] [${timestamp}]: ${message}${Colors.Reset}`)
        }
    },
}

export default logger