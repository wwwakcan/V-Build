# ReactJS Build & Deploy Tiny Code

This is a compact yet powerful build and deployment script for React applications. It combines version tracking, building, and server deployment functionalities in a single tool.

## Features

- **Automatic Versioning**: Generates version numbers based on date and time
- **Version Tracking**: Creates a `version.json` file with build information and release notes
- **Secure Deployment**: Stores encrypted server credentials for quick deployment
- **Interactive CLI**: User-friendly command-line interface with visual progress indicators
- **SFTP Integration**: Automated deployment to remote servers via SFTP
- **Connection Memory**: Saves and loads server connection profiles for future use

## Usage

```bash
node vbuild.js
```

The script will guide you through the build and deployment process with interactive prompts:

1. Choose whether to deploy after building
2. Select a saved server connection or create a new one
3. Enter release notes for the version
4. Watch as the build is created and deployed to your server

## Requirements

- Node.js
- npm
- ssh2-sftp-client package

## Installation

```bash
npm install ssh2-sftp-client --save-dev
```

Add the script to your package.json file:

```json
"scripts": {
  "vbuild": "node vbuild.js",
  // your other scripts...
}
```

Now you can run the tool using:

```bash
npm run vbuild
# or with yarn
yarn vbuild
```

This lightweight tool eliminates the need for complex CI/CD configurations for small to medium React projects, allowing developers to quickly build and deploy their applications with a single command.
