# PX Blue CLI

This Command Line Interface is a utility for creating new PX Blue applications with automatic integration of themes, components, etc.

## Prerequisites

In order to use this utility you must have the following installed:

-   [NodeJS](https://nodejs.org/en/download/) 12+
-   npm or yarn
-   Git

Additional requirements for creating React Native projects:

-   [Cocoapods](https://cocoapods.org/) 1.8+ (for ios)
-   [Expo CLI](https://docs.expo.io/versions/latest/workflow/expo-cli/) - only if you want to scaffold your project with Expo

## Usage

The PX Blue CLI can be utilized via npx without having to install any global packages (recommended):

```
npx -p @pxblue/cli pxb <command>
```

If you would prefer to have a global install of the CLI you may do so via:

```shell
$ yarn global add @pxblue/cli
```

or

```shell
$ npm install -g @pxblue/cli
```

> **NOTE:** If you are using NPM v7, the CLI will not work via npx — you _must_ install it globally. Check periodically to make sure you have the latest version.

### Available Commands

| command               | description                                                                                                                                                              |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pxb help`            | lists all available commands and descriptions                                                                                                                            |
| `pxb version`         | displays the version of the currently installed CLI                                                                                                                      |
| `pxb new <framework>` | Creates a new skeleton project with PX Blue integration. You'll be prompted to give your project a name and select various options depending on your selected framework. |

#### Available options

The following table list out some options for the `pxb new` command. All these options can be configured

| Option                                                         | Description                                                                                                                                                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <code>--framework=<angular\|react\|ionic\|react-native></code> | The framework in which the project will be generated.                                                                                                                                                                                 |
| ```--name=<name>```                                            | Project name                                                                                                                                                                                                                          |
| <code>--cli=<rnc\|expo></code>                                 | (React Native projects only) which CLI to use to generate the project. We support `rnc` ([React-Native Community CLI](https://github.com/react-native-community/cli)) or `expo` ([Expo CLI](https://docs.expo.io/workflow/expo-cli/)) |
| `--lint`                                                       | (TypeScript projects only) Install and configure [PX Blue lint package](https://www.npmjs.com/package/@pxblue/eslint-config) (omit or `--lint=false` to disable)                                                                      |
| `--prettier`                                                   | Install and configure [PX Blue prettier package](https://www.npmjs.com/package/@pxblue/prettier-config) (omit or `--prettier=false` to disable)                                                                                       |
| <code>--language=<typescript\|javascript></code>               | (React & React Native Only) The language in which the project will be generated                                                                                                                                                       |
| <code>--template=<blank\|routing\|authentication></code>       | (React or Angular Only) Template to use to start the project                                                                                                                                         |

## Detailed Usage

To start a new project with PX Blue integration follow the steps below. We recommend using `npx` (instead of installing it globally) to run the CLI as it will ensure you are always using the most up-to-date version.

1. `npx -p @pxblue/cli pxb new`
2. Choose your desired framework from the list

    - Alternatively, you can pre-select a framework by running `npx -p @pxblue/cli pxb new <framework>`

        > **Note for Ionic:** If you are creating an Ionic project and you are behind a proxy, ensure that you have set an environment variable for `IONIC_HTTP_PROXY`. Depending on your firewall settings, you may also need to temporarily add an environment variable for `NODE_TLS_REJECT_UNAUTHORIZED=0` (remove this promptly after your project is created).

3. You will be prompted to enter a name for your project. Make sure the name you select meets the requirements of the CLI for your chosen framework.
4. If you are creating a React or React Native project, you will be prompted to choose JavaScript or Typescript for your project language.
5. For React Native projects, you'll be asked which CLI to use to scaffold your project. You can choose between the React Native Community CLI (recommended) or Expo (better for smaller demo or proof-of-concept projects).

    > **Note for Expo projects:** If you are creating an Expo project and you are behind a proxy, you will need to ensure that you have environment variables set for `HTTP_PROXY` and `HTTPS_PROXY`. Depending on your firewall settings, you may also need to temporarily add an environment variable for `NODE_TLS_REJECT_UNAUTHORIZED=0` (remove this promptly after your project is created).

6. You will be asked if you want to use the PX Blue Linting configuration and code formatting packages (recommended).
7. If you are creating an Angular, React, or React Native project, you will be prompted to choose a template from our list of [angular](https://github.com/pxblue/angular-cli-templates), [react](https://github.com/pxblue/react-cli-templates), or [react native](https://github.com/pxblue/react-native-cli-templates) templates to scaffold your project:
    -   Blank: a basic application with a simple placeholder homepage
    -   Routing: integrates React Router with a simple drawer navigation and several placeholder routes
    -   Authentication: integrates the [react](https://www.npmjs.com/package/@pxblue/react-auth-workflow), [angular](https://www.npmjs.com/package/@pxblue/angular-auth-workflow), or [react native](https://www.npmjs.com/package/@pxblue/react-native-auth-workflow) auth-workflow login and registration screens plus everything from the routing template
8. The CLI will install all of the necessary dependencies for your project and integrate the PX Blue components, themes, and fonts. When complete, the CLI should present you instructions for running your project.

    > **Note for React Native projects:** If you are using the React Native Community CLI for your react native project, there are additional steps you must run for your project to run on iOS. Follow the on-screen instructions for running `pod install` to link the react-native-vector-icons package. If you are using xCode 11+, you will also need to update the Build Phases in xCode to avoid duplicated resources errors (refer to [this issue](https://github.com/oblador/react-native-vector-icons/issues/1074)).
