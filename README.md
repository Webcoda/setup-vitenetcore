# setup-vitenetcore - Vite.AspNetCore Setup for .NET Core Projects

## Introduction
Welcome to `@webcodateam/setup-vitenetcore`! This package will add [Vite.AspNetCore](https://github.com/Eptagone/Vite.AspNetCore) to your .NET Core project and set it up automatically, eliminating the need for manual configurations.

## Installation
To use this package, you can install it via pnpm, yarn, or npm. Choose one of the following options:

### Using pnpm
```bash
pnpm add -D @webcodateam/setup-vitenetcore
```

### Using yarn
```bash
yarn add -D @webcodateam/setup-vitenetcore
```

### Using npm
```bash
npm install -D @webcodateam/setup-vitenetcore
```

Alternatively, you can directly run the setup process using npx:
```bash
npx @webcodateam/setup-vitenetcore
```

## Usage
Before running the setup process, make sure to add a script in your package.json to execute the setup:

```json
 "scripts": {
    "setup-vite": "setup-vitenetcore"
  }
}
```

Once the package is installed and the script is added in your package.json, run the following command in your project's root directory to start the setup process:

```bash
pnpm setup-vitenetcore
```

or 

```bash
yarn setup-vitenetcore
```

or

```bash
npm run setup-vitenetcore
```

## Notes
The setup process will then guide you through a series of questions to configure Vite correctly for your .NET Core project.

1. During the setup process, a new Startup.cs file will be created for the selected .csproj file.
2. Make sure to answer all the prompts accurately to ensure proper configuration.
3. If you encounter any issues or have questions, refer to the Vite.AspNetCore documentation for further guidance.

With `@webcodateam/setup-vitenetcore`, integrating Vite into your .NET Core project has never been easier! Enjoy the benefits of Vite's fast and efficient development experience. Happy coding!