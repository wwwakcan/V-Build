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


# React Version Checker

A lightweight, customizable React component for notifying users when a new version of your application is available.

## Features

- ✨ **No dependencies** - Pure React component
- 🌍 **Multilingual support** - English, Turkish, Chinese, French and German included
- 🎨 **Customizable UI** - Modal or Card display options
- 🛠️ **Easily extendable** - Custom content and styles
- 🔄 **Automatic updates** - Checks for updates on load and periodically
- 🧩 **Modular design** - Single file with modular structure

## Installation

Simply copy the `VersionChecker.js` file into your project.

## Basic Usage

```jsx
import React from 'react';
import VersionChecker from './VersionChecker';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>My Application</h1>
      </header>
      
      {/* Basic usage */}
      <VersionChecker />
      
      {/* Your app content */}
    </div>
  );
}
```

## How It Works

1. The component checks for a `version.json` file in your public directory
2. It compares the current version (stored in localStorage) with the latest version
3. If a new version is detected, it shows a notification to the user
4. When the user clicks "Update", it clears the cache and reloads the page

### Required version.json format

Create a `version.json` file in your public directory with this structure:

```json
{
  "version": "1.2.3",
  "buildTime": "2023-04-15T12:00:00Z",
  "description": "New features and bug fixes"
}
```

## Configuration Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | string | `'modal'` | Display type: `'modal'` or `'card'` |
| `lang` | string | `'en'` | Language code: `'en'`, `'tr'`, `'zh'`, `'fr'`, `'de'` |
| `customStyles` | object | `{}` | Override default styles |
| `CustomModalContent` | component | `null` | Custom content for modal |
| `CustomCardContent` | component | `null` | Custom content for card |
| `CustomModal` | component | `null` | Completely custom modal component |
| `CustomCard` | component | `null` | Completely custom card component |

## Examples

### Different display types

```jsx
// Modal display (default)
<VersionChecker type="modal" />

// Card display
<VersionChecker type="card" />
```

### Language options

```jsx
// English (default)
<VersionChecker lang="en" />

// Turkish
<VersionChecker lang="tr" />

// Chinese
<VersionChecker lang="zh" />

// French
<VersionChecker lang="fr" />

// German
<VersionChecker lang="de" />
```

### Custom styling

```jsx
<VersionChecker 
  customStyles={{
    updateButton: {
      backgroundColor: '#4CAF50',
      borderRadius: '8px'
    },
    currentVersion: {
      color: '#E91E63'
    }
  }}
/>
```

### Custom content

```jsx
<VersionChecker 
  CustomModalContent={({ t, currentVersion, latestVersion, latestDescription }) => (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h3>🚀 Time to upgrade!</h3>
      <p>Your version: <b>{currentVersion}</b></p>
      <p>New version: <b>{latestVersion}</b></p>
      <p>{latestDescription}</p>
    </div>
  )}
/>
```

### Fully custom component

```jsx
<VersionChecker
  CustomModal={({ t, onClose, onUpdate, currentVersion, latestVersion }) => (
    <div className="my-custom-modal">
      <h2>Update Available!</h2>
      <p>Current: {currentVersion}</p>
      <p>New: {latestVersion}</p>
      <div className="actions">
        <button onClick={onClose}>Later</button>
        <button onClick={onUpdate}>Update Now</button>
      </div>
    </div>
  )}
/>
```

## Behavior

- **Modal type**: Stays open until user clicks update or close button
- **Card type**: Can be closed by clicking outside the card or the close button
- **Version footer**: Always shows the current version at the bottom

## License

MIT
