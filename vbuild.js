// vbuild.js - Version-aware build script for React with deployment
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');
const ssh2 = require('ssh2-sftp-client'); // You'll need to install this dependency
const crypto = require('crypto'); // For simple encryption of passwords

// Configuration
const VERSION_FILE_PATH = path.join(__dirname, 'public', 'version.json');
const BUILD_FOLDER_PATH = path.join(__dirname, 'build');
const CONFIG_FOLDER_PATH = path.join(__dirname, '.vbuild');
const CONNECTIONS_FILE_PATH = path.join(CONFIG_FOLDER_PATH, 'connections.json');

// Encryption key - in production, use a more secure approach to store this
const ENCRYPTION_KEY = 'thevobos';

// Ensure config directory exists
if (!fs.existsSync(CONFIG_FOLDER_PATH)) {
    fs.mkdirSync(CONFIG_FOLDER_PATH, { recursive: true });
}

// Default server configuration
const DEFAULT_SERVER_CONFIG = {
    host: '',
    port: 22,
    username: '',
    password: '',
    remotePath: ''
};

// Create readline interface for CLI input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Progress loader implementation
class ProgressLoader {
    constructor(message = 'Processing', interval = 100) {
        this.message = message;
        this.interval = interval;
        this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
        this.frameIndex = 0;
        this.timer = null;
        this.startTime = null;
        this.lastLineLength = 0;
        this.statusMessages = [];
    }

    start() {
        this.startTime = Date.now();
        // First immediately render to avoid delay
        this.render();
        this.timer = setInterval(() => {
            this.render();
        }, this.interval);
        return this;
    }

    updateMessage(message) {
        this.message = message;
        // Immediately render the new message
        this.render();
        return this;
    }

    addStatusMessage(message) {
        const statusMsg = `  ${this.getTimeElapsed()} ${message}`;
        this.statusMessages.push(statusMsg);
        // Print the status message immediately
        console.log(statusMsg);
        return this;
    }

    getTimeElapsed() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        return `[${elapsed.toFixed(1)}s]`;
    }

    render() {
        try {
            const frame = this.frames[this.frameIndex];
            this.frameIndex = (this.frameIndex + 1) % this.frames.length;

            // Clear the last line
            process.stdout.write('\r' + ' '.repeat(this.lastLineLength) + '\r');

            // Construct the new line with spinner and message
            const line = `${frame} ${this.message}`;
            process.stdout.write(line);
            this.lastLineLength = line.length;
        } catch (error) {
            // Silently handle stdout errors (like when piping output)
            // This prevents crashes when stdout is not available
        }
    }

    stop(finalMessage = '') {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;

            try {
                // Clear the last line
                process.stdout.write('\r' + ' '.repeat(this.lastLineLength) + '\r');
            } catch (error) {
                // Handle stdout errors silently
            }

            // Print final message if provided
            if (finalMessage) {
                console.log(finalMessage);
            }

            // We don't need to print status messages again since we're printing them in real-time now
            console.log(); // Extra line for spacing
        }
        return this;
    }
}

// Simple encryption functions for passwords
function encrypt(text) {
    try {
        if (!text) return '';
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption error:', error.message);
        return '';
    }
}

function decrypt(text) {
    try {
        if (!text || !text.includes(':')) return '';
        const textParts = text.split(':');
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) {
        console.error('Decryption error:', e.message);
        return '';
    }
}

// Load saved connections
function loadConnections() {
    try {
        if (fs.existsSync(CONNECTIONS_FILE_PATH)) {
            const data = fs.readFileSync(CONNECTIONS_FILE_PATH, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading saved connections:', error.message);
    }
    return {};
}

// Save connections
function saveConnection(name, config) {
    try {
        const connections = loadConnections();

        // Make sure we have a name
        if (!name || name.trim() === '') {
            console.error('Error: Connection name cannot be empty');
            return false;
        }

        // Make sure we have all required config properties
        if (!config.host || !config.username || !config.remotePath) {
            console.error('Error: Missing required connection information');
            return false;
        }

        // Encrypt the password before saving
        const secureConfig = {
            ...config,
            password: encrypt(config.password)
        };

        connections[name] = secureConfig;

        fs.writeFileSync(
            CONNECTIONS_FILE_PATH,
            JSON.stringify(connections, null, 2)
        );
        console.log(`✅ Connection "${name}" saved successfully`);
        return true;
    } catch (error) {
        console.error('Error saving connection:', error.message);
        return false;
    }
}

// Promise-based question function
function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

// Generate automatic version based on date and random suffix
function generateVersionNumber() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');

    return `${year}.${month}${day}.${hours}${minutes}.${randomSuffix}`;
}

const APP_VERSION = generateVersionNumber();

// Create version.json file with description
function createVersionFile(description, loader) {
    try {
        loader.updateMessage('Creating version file...').addStatusMessage('Creating version.json file');

        const versionData = {
            version: APP_VERSION,
            buildTime: new Date().toISOString(),
            description: description || 'No description provided'
        };

        // Ensure public directory exists
        if (!fs.existsSync(path.join(__dirname, 'public'))) {
            fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
            loader.addStatusMessage('Created public directory');
        }

        // Write version info to file
        fs.writeFileSync(
            VERSION_FILE_PATH,
            JSON.stringify(versionData, null, 2)
        );

        loader.addStatusMessage(`Version file created: ${VERSION_FILE_PATH}`);
        loader.addStatusMessage(`Version: ${APP_VERSION}`);
        loader.addStatusMessage(`Description: ${description}`);

        return true;
    } catch (error) {
        loader.addStatusMessage(`Error creating version file: ${error.message}`);
        return false;
    }
}

// Run standard build process
function buildApp(loader) {
    try {
        // Stop the loader completely during build process
        if (loader.timer) {
            clearInterval(loader.timer);
            loader.timer = null;
        }

        // Clear the current line
        try {
            process.stdout.write('\r' + ' '.repeat(100) + '\r');
        } catch (e) {
            // Ignore errors
        }

        // Show a clear message about build starting
        console.log('🔨 BUILDING APPLICATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('⏳ Running npm build command. Please wait...');
        console.log('');

        // Run the build
        const startTime = Date.now();
        const output = execSync('npm run build', { encoding: 'utf8', stdio: 'inherit' });
        const buildTime = ((Date.now() - startTime) / 1000).toFixed(1);

        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`✅ Build completed in ${buildTime}s`);
        console.log('');

        // Let user know next steps
        console.log('Continuing with deployment process...');
        console.log('');

        // Restart the loader for next steps
        loader.startTime = Date.now(); // Reset time for accurate logs
        loader.start();

        return true;
    } catch (error) {
        console.log('');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`❌ Build failed: ${error.message}`);
        console.log('');

        // Restart the loader for next steps if there are any
        loader.startTime = Date.now(); // Reset time for accurate logs
        loader.start();

        return false;
    }
}

// Deploy to server using SFTP
async function deployToServer(serverConfig, loader) {
    loader.updateMessage('Starting deployment to server...').addStatusMessage(`Deploying to ${serverConfig.host}`);
    loader.addStatusMessage(`Target path: ${serverConfig.remotePath}`);

    const sftp = new ssh2();
    let connected = false;

    try {
        // Connect to server
        loader.updateMessage('Connecting to server...');
        await sftp.connect({
            host: serverConfig.host,
            port: serverConfig.port,
            username: serverConfig.username,
            password: serverConfig.password,
            // Add better timeout and retry options
            retries: 3,
            retry_factor: 2,
            retry_minTimeout: 2000
        });
        connected = true;

        loader.addStatusMessage('Connected to server successfully');

        // Check if remote path exists
        loader.updateMessage('Checking remote path...');
        const exists = await sftp.exists(serverConfig.remotePath);
        if (!exists) {
            loader.addStatusMessage(`Creating remote directory: ${serverConfig.remotePath}`);
            await sftp.mkdir(serverConfig.remotePath, true);
        }

        // Delete existing files in the remote path
        loader.updateMessage('Deleting existing files on server...');
        try {
            const fileList = await sftp.list(serverConfig.remotePath);
            loader.addStatusMessage(`Found ${fileList.length} items to delete`);

            let deletedCount = 0;
            for (const file of fileList) {
                const remotePath = path.join(serverConfig.remotePath, file.name).replace(/\\/g, '/');

                try {
                    if (file.type === 'd') {
                        // Delete directory and its contents
                        await sftp.rmdir(remotePath, true);
                        loader.addStatusMessage(`Deleted directory: ${file.name}`);
                    } else {
                        // Delete file
                        await sftp.delete(remotePath);
                        deletedCount++;
                        if (deletedCount % 10 === 0) {
                            loader.updateMessage(`Deleting files (${deletedCount}/${fileList.length})...`);
                        }
                    }
                } catch (deleteError) {
                    loader.addStatusMessage(`Error deleting ${file.name}: ${deleteError.message}`);
                    // Continue with other files even if one fails
                }
            }

            loader.addStatusMessage('Existing files deleted successfully');
        } catch (listError) {
            loader.addStatusMessage(`Error listing files: ${listError.message}`);
            // Proceed with upload even if listing/deletion fails
        }

        // Upload build folder contents
        loader.updateMessage('Uploading build files...');

        // Check if build folder exists
        if (!fs.existsSync(BUILD_FOLDER_PATH)) {
            throw new Error(`Build folder not found: ${BUILD_FOLDER_PATH}`);
        }

        // Count total files to upload instead of calculating size
        const countFiles = (dirPath) => {
            try {
                const files = fs.readdirSync(dirPath, { withFileTypes: true });
                let count = 0;

                for (const file of files) {
                    const filePath = path.join(dirPath, file.name);
                    if (file.isDirectory()) {
                        count += countFiles(filePath);
                    } else {
                        count++;
                    }
                }

                return count;
            } catch (err) {
                loader.addStatusMessage(`Error counting files: ${err.message}`);
                return 0;
            }
        };

        // Track upload progress by file count
        let totalFiles = 0;
        let uploadedFiles = 0;

        try {
            totalFiles = countFiles(BUILD_FOLDER_PATH);
            loader.addStatusMessage(`Total files to upload: ${totalFiles}`);
        } catch (e) {
            loader.addStatusMessage(`Couldn't count files: ${e.message}`);
            totalFiles = 0;
        }

        // Setup upload progress tracking by file count
        sftp.on('upload', info => {
            try {
                uploadedFiles++;

                // Handle percentage calculation
                const percentage = totalFiles > 0 ? Math.round((uploadedFiles / totalFiles) * 100) : uploadedFiles;

                // Update the message with either percentage or file count
                if (totalFiles > 0) {
                    loader.updateMessage(`Uploading files (${percentage}%, ${uploadedFiles}/${totalFiles})...`);
                } else {
                    loader.updateMessage(`Uploading files (${uploadedFiles} files)...`);
                }

                // Log larger file uploads
                if (info.size > 1024 * 1024) {
                    loader.addStatusMessage(`Uploaded: ${path.basename(info.destination)} (${(info.size / 1024 / 1024).toFixed(2)} MB)`);
                }
            } catch (eventError) {
                // Silently handle event errors to prevent crashing the upload
            }
        });

        await sftp.uploadDir(BUILD_FOLDER_PATH, serverConfig.remotePath);

        loader.addStatusMessage('All files uploaded successfully');

        // Close the connection
        await sftp.end();
        connected = false;
        return true;
    } catch (error) {
        loader.addStatusMessage(`Deployment failed: ${error.message}`);
        try {
            if (connected) {
                await sftp.end();
            }
        } catch (e) {
            // Ignore errors when ending the connection
            loader.addStatusMessage(`Error closing connection: ${e.message}`);
        }
        return false;
    }
}

// Get server configuration from user input or saved connections
async function getServerConfig() {
    try {
        const connections = loadConnections();
        const connectionNames = Object.keys(connections);

        if (connectionNames.length > 0) {
            console.log('\nSaved connections:');

            // Display numbered list of saved connections
            connectionNames.forEach((name, index) => {
                console.log(`${index + 1}. ${name} (${connections[name].host})`);
            });
            console.log(`${connectionNames.length + 1}. Create new connection`);

            // Let user select a connection
            const selectionInput = await question(`\nSelect a connection (1-${connectionNames.length + 1}): `);
            const selection = parseInt(selectionInput, 10);

            // Validate selection
            if (!isNaN(selection) && selection >= 1 && selection <= connectionNames.length) {
                const selectedName = connectionNames[selection - 1];
                const config = connections[selectedName];

                // Decrypt the password and handle potential decryption failure
                const password = decrypt(config.password);
                if (!password && config.password) {
                    console.log('⚠️ Warning: Could not decrypt the saved password. You may need to enter it manually.');
                    const newPassword = await question('Password: ');
                    return {
                        ...config,
                        password: newPassword
                    };
                }

                return {
                    ...config,
                    password: password
                };
            } else if (selection === connectionNames.length + 1) {
                // User chose to create a new connection
                return await createNewConnection(true);
            } else {
                console.log('❌ Invalid selection, creating new connection...');
                return await createNewConnection(true);
            }
        } else {
            console.log('No saved connections found. Creating new connection...');
            return await createNewConnection(true);
        }
    } catch (error) {
        console.error('Error getting server config:', error.message);
        return await createNewConnection(true);
    }
}

// Create a new server connection configuration
async function createNewConnection(shouldSave = false) {
    try {
        const host = await question('Server IP/hostname: ');
        const port = await question('Port (22): ') || '22';
        const username = await question('Username: ');
        const password = await question('Password: ');
        const remotePath = await question('Remote path: ');

        const serverConfig = {
            host,
            port: parseInt(port, 10) || 22,
            username,
            password,
            remotePath
        };

        if (shouldSave) {
            const shouldSaveConnection = (await question('Save this connection for future use? (y/n): ')).toLowerCase() === 'y';

            if (shouldSaveConnection) {
                const connectionName = await question('Connection name: ');
                saveConnection(connectionName, serverConfig);
            }
        }

        return serverConfig;
    } catch (error) {
        console.error('Error creating new connection:', error.message);
        return DEFAULT_SERVER_CONFIG;
    }
}

// Main function
async function main() {
    let loader = null;

    try {
        console.log('📦 Starting version-aware build and deployment process...');

        // First ask if deployment is needed
        const shouldDeploy = (await question('Deploy to server after build? (y/n): ')).toLowerCase() === 'y';

        // Get server configuration early if deploying
        let serverConfig = null;
        if (shouldDeploy) {
            serverConfig = await getServerConfig();
        }

        // Prompt for build description
        const description = await question("What's new : ");

        console.log(''); // Add a line break for better readability

        // Start the main loader immediately with clear indication
        console.log('🔄 Starting build process...');
        loader = new ProgressLoader('Initializing build process...').start();

        // Small delay to ensure the loader is visible
        await new Promise(resolve => setTimeout(resolve, 800));

        // Create version file
        const versionCreated = createVersionFile(description, loader);
        if (!versionCreated) {
            loader.stop('❌ Failed to create version file!');
            return;
        }

        // Stop the loader before building
        if (loader.timer) {
            clearInterval(loader.timer);
            loader.timer = null;
        }
        process.stdout.write('\r' + ' '.repeat(100) + '\r');

        // Build the app without using the loader animation
        const buildSuccess = buildApp(loader);
        if (!buildSuccess) {
            // No need to stop the loader as it's already stopped in buildApp
            return;
        }

        if (shouldDeploy && serverConfig) {
            // Deploy to server
            const deploySuccess = await deployToServer(serverConfig, loader);

            if (deploySuccess) {
                loader.stop('✅ Build and deployment completed successfully!');
            } else {
                loader.stop('⚠️ Build completed but deployment failed.');
            }
        } else {
            loader.stop('✅ Build completed without deployment.');
        }
    } catch (error) {
        if (loader && loader.timer) {
            loader.stop(`❌ Process failed: ${error.message}`);
        } else {
            console.error('❌ Process failed:', error.message);
        }
    } finally {
        rl.close();
    }
}

// Handle script termination
process.on('SIGINT', () => {
    console.log('\n\n⚠️ Process terminated by user');
    rl.close();
    process.exit(0);
});

// Execute script
main();
