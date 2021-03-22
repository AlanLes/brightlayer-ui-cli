/*
 * This file includes utilities for adding PX Blue to a skeleton project.
 */
import { GluegunToolbox, filesystem } from 'gluegun';
import {
    DEPENDENCIES,
    DEV_DEPENDENCIES,
    LINT_DEPENDENCIES,
    LINT_SCRIPTS,
    LINT_CONFIG,
    SCRIPTS,
    ROOT_COMPONENT,
    STYLES,
    PRETTIER_DEPENDENCIES,
    PRETTIER_SCRIPTS,
    PRETTIER_CONFIG,
} from '../constants';
import {
    updateScripts,
    updateBrowsersListFile,
    updateBrowsersListJson,
    AngularProps,
    ReactProps,
    ReactNativeProps,
    IonicProps,
} from '../utilities';

module.exports = (toolbox: GluegunToolbox): void => {
    const { print, fancyPrint, system, fileModify } = toolbox;

    const printSuccess = (project: string): void => {
        print.info('');
        fancyPrint.divider('•', 60);
        fancyPrint.info('', '•', 60, 10);
        fancyPrint.info('PX Blue integration complete', '•', 60, 10);
        fancyPrint.info('Your project:', '•', 60, 10);
        fancyPrint.info(`${project}`, '•', 60, 10);
        fancyPrint.info('has been created successfully!', '•', 60, 10);
        fancyPrint.info('', '•', 60, 10);
        fancyPrint.divider('•', 60);
    };
    const printInstructions = (instructions: string[]): void => {
        fancyPrint.divider('•', 60);
        fancyPrint.info('', '•', 60, 10);
        fancyPrint.infoLeft(`To run your project:`, '•', 60, 10);
        fancyPrint.info('', '•', 60, 10);
        instructions.forEach((instruction) => fancyPrint.infoLeft(instruction, '•', 60, 10));
        fancyPrint.info('', '•', 60, 10);
        fancyPrint.divider('•', 60);
        print.info('');
    };

    const addPXBlueAngular = async (props: AngularProps): Promise<void> => {
        const { name, lint, prettier, template } = props;
        const folder = `./${name}`;

        const pathInFolder = (filename: string): string => filesystem.path(folder, filename);

        const isYarn = filesystem.exists(pathInFolder('yarn.lock')) === 'file';

        // Install ESLint Packages (optional)
        if (lint) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: LINT_DEPENDENCIES.angular,
                dev: true,
                description: 'PX Blue ESLint Packages',
            });
            fileModify.addLintConfig({
                folder: folder,
                config: LINT_CONFIG.ts,
            });

            // Remove all tslint configurations
            if (filesystem.exists(pathInFolder('tslint.json'))) {
                // remove tslint.json
                filesystem.remove(pathInFolder('tslint.json'));

                // uninstall tslint
                let output = '';
                if (isYarn) {
                    output = await system.run(`cd ${folder} && yarn remove tslint`);
                } else {
                    output = await system.run(`cd ${folder} && npm uninstall tslint`);
                }
                print.info(output);

                // remove lint attribute in angular.json
                if (filesystem.exists(pathInFolder('angular.json'))) {
                    const angularJSON = filesystem.read(pathInFolder('angular.json'), 'json');
                    delete angularJSON.projects[name].architect.lint;
                    filesystem.write(pathInFolder('angular.json'), JSON.stringify(angularJSON, null, 4));
                }
            }
        }

        // Install Code Formatting Packages (optional)
        if (prettier) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: PRETTIER_DEPENDENCIES.angular,
                dev: true,
                description: 'PX Blue Prettier Packages',
            });
        }

        // Map the template selection to template src
        let templatePackage = '';
        switch (template.toLocaleLowerCase()) {
            case 'basic routing':
            case 'routing':
                templatePackage = '@pxblue/angular-template-routing';
                break;
            case 'authentication':
                templatePackage = '@pxblue/angular-template-authentication';
                break;
            case 'blank':
            default:
                templatePackage = '@pxblue/angular-template-blank';
        }

        // Clone the template repo
        const templateSpinner = print.spin('Adding PX Blue template...');
        const templateFolder = `template-${new Date().getTime()}`;
        const command = `cd ${name} && npm install ${templatePackage} --prefix ${templateFolder}`;
        await system.run(command);

        // Copy the selected template from the repo
        filesystem.copy(`./${name}/${templateFolder}/node_modules/${templatePackage}/template`, `./${name}/src/app/`, {
            overwrite: true,
        });
        // Copy template-specific assets from the repo (if exists)
        if (filesystem.isDirectory(`./${name}/${templateFolder}/node_modules/${templatePackage}/assets`)) {
            filesystem.copy(
                `./${name}/${templateFolder}/node_modules/${templatePackage}/assets`,
                `./${name}/src/assets/`,
                {
                    overwrite: true,
                }
            );
        }

        // Install template-specific dependencies
        const dependencies = filesystem.read(
            `${name}/${templateFolder}/node_modules/${templatePackage}/template-dependencies.json`,
            'json'
        ).dependencies;
        await fileModify.installDependencies({
            folder: folder,
            dependencies,
            dev: false,
            description: 'PX Blue Template Dependencies',
        });

        // Install template-specific dev-dependencies
        const devDependencies = filesystem.read(
            `${name}/${templateFolder}/node_modules/${templatePackage}/template-dependencies.json`,
            'json'
        ).devDependencies;
        await fileModify.installDependencies({
            folder: folder,
            dependencies: devDependencies,
            dev: true,
            description: 'PX Blue Template DevDependencies',
        });

        // Remove the template package folder
        filesystem.remove(`./${name}/${templateFolder}`);
        templateSpinner.stop();

        // Final Steps: browser support, styles, theme integration
        const spinner = print.spin('Performing some final cleanup...');

        // Update package.json
        let packageJSON: any = filesystem.read(`${folder}/package.json`, 'json');
        packageJSON = updateScripts(packageJSON, SCRIPTS.angular.concat(lint ? LINT_SCRIPTS.angular : []));
        packageJSON = updateScripts(packageJSON, SCRIPTS.angular.concat(prettier ? PRETTIER_SCRIPTS.angular : []));
        if (prettier) packageJSON.prettier = '@pxblue/prettier-config';
        filesystem.write(`${folder}/package.json`, packageJSON, { jsonIndent: 4 });

        // Update browsers list
        let browsers = filesystem.read(`${folder}/.browserslistrc`, 'utf8');
        browsers = updateBrowsersListFile(browsers);
        filesystem.write(`${folder}/.browserslistrc`, browsers);

        // Update index.html
        let html = filesystem.read(`${folder}/src/index.html`, 'utf8');
        html = html
            .replace(
                /<title>.+<\/title>/gi,
                `<title>${name}</title>\r\n\t<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />`
            )
            .replace(/<body>/gi, ROOT_COMPONENT.angular);
        filesystem.write(`${folder}/src/index.html`, html);

        // Update angular.json
        const angularJSON: any = filesystem.read(`${folder}/angular.json`, 'json');
        const styles = [
            'src/styles.scss',
            './node_modules/@pxblue/angular-themes/theme.scss',
            './node_modules/@pxblue/angular-themes/open-sans.scss',
        ];
        angularJSON.projects[name].architect.build.options.styles = styles;
        angularJSON.projects[name].architect.test.options.styles = styles;

        // make it work for ie11
        angularJSON.projects[name].architect.build.configurations['es5'] = { tsConfig: './tsconfig.es5.json' };
        angularJSON.projects[name].architect.serve.configurations['es5'] = { browserTarget: `${name}:build:es5` };
        filesystem.write(
            `${folder}/tsconfig.es5.json`,
            `{\r\n\t"extends": "./tsconfig.app.json",\r\n\t"compilerOptions": {\r\n\t\t"target": "es5"\r\n\t}\r\n}`
        );

        filesystem.write(`${folder}/angular.json`, angularJSON, { jsonIndent: 4 });

        // Update styles.scss
        filesystem.remove(`${folder}/src/styles.scss`);
        filesystem.write(`${folder}/src/styles.scss`, STYLES);

        spinner.stop();

        printSuccess(name);
        printInstructions([`cd ${name}`, `${isYarn ? 'yarn' : 'npm'} start --open`]);
    };

    const addPXBlueReact = async (props: ReactProps): Promise<void> => {
        const { name, lint, prettier, language } = props;
        const folder = `./${name}`;
        const ts = language === 'ts';
        const isYarn = filesystem.exists(`./${folder}/yarn.lock`) === 'file';

        // Install ESLint Packages (optional)
        if (ts && lint) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: LINT_DEPENDENCIES.react,
                dev: true,
                description: 'PX Blue ESLint Packages',
            });
            fileModify.addLintConfig({
                folder: folder,
                config: LINT_CONFIG.tsx,
            });
        }

        // Install Code Formatting Packages (optional)
        if (prettier) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: PRETTIER_DEPENDENCIES.react,
                dev: true,
                description: 'PX Blue Prettier Packages',
            });
        }

        // Final Steps: lint and prettier scripts (if applicable) and app title
        const spinner = print.spin('Performing some final cleanup...');

        // Update package.json
        let packageJSON: any = filesystem.read(`${folder}/package.json`, 'json');
        packageJSON = updateScripts(packageJSON, lint && ts ? LINT_SCRIPTS.react : []);
        packageJSON = updateScripts(packageJSON, prettier ? PRETTIER_SCRIPTS.react : []);
        packageJSON = updateBrowsersListJson(packageJSON);
        if (prettier) packageJSON.prettier = '@pxblue/prettier-config';
        filesystem.write(`${folder}/package.json`, packageJSON, { jsonIndent: 4 });

        // Update index.html
        let html = filesystem.read(`${folder}/public/index.html`, 'utf8');
        html = html.replace(/<title>.*<\/title>/gi, `<title>${name}</title>`);
        filesystem.write(`${folder}/public/index.html`, html);

        spinner.stop();
        printSuccess(name);
        printInstructions([`cd ${name}`, `${isYarn ? 'yarn' : 'npm'} start`]);
    };

    const addPXBlueIonic = async (props: IonicProps): Promise<void> => {
        const { name, lint, prettier } = props;
        const folder = `./${name}`;

        // Install Dependencies
        await fileModify.installDependencies({
            folder: folder,
            dependencies: DEPENDENCIES.ionic,
            dev: false,
            description: 'PX Blue Ionic Dependencies',
        });

        // Install DevDependencies
        await fileModify.installDependencies({
            folder: folder,
            dependencies: DEV_DEPENDENCIES.ionic,
            dev: true,
            description: 'PX Blue Ionic Dev Dependencies',
        });

        // Install ESLint Packages (optional)
        if (lint) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: LINT_DEPENDENCIES.ionic,
                dev: true,
                description: 'PX Blue ESLint Packages',
            });
            fileModify.addLintConfig({
                folder: folder,
                config: LINT_CONFIG.ts,
            });
        }

        // Install Code Formatting Packages (optional)
        if (prettier) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: PRETTIER_DEPENDENCIES.ionic,
                dev: true,
                description: 'PX Blue Prettier Packages',
            });
        }

        // Final Steps: browser support, styles, theme integration
        const spinner = print.spin('Performing some final cleanup...');

        // Update package.json
        let packageJSON: any = filesystem.read(`${folder}/package.json`, 'json');
        packageJSON = updateScripts(packageJSON, SCRIPTS.ionic.concat(lint ? LINT_SCRIPTS.ionic : []));
        packageJSON = updateScripts(packageJSON, SCRIPTS.ionic.concat(prettier ? PRETTIER_SCRIPTS.ionic : []));
        if (prettier) packageJSON.prettier = '@pxblue/prettier-config';
        filesystem.write(`${folder}/package.json`, packageJSON, { jsonIndent: 4 });

        // Update index.html
        let html = filesystem.read(`${folder}/src/index.html`, 'utf8');
        html = html
            .replace(
                /<title>.+<\/title>/gi,
                `<title>${name}</title>\r\n\t<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />`
            )
            .replace(/<app-root>.*<\/app-root>/gi, ROOT_COMPONENT.ionic);
        filesystem.write(`${folder}/src/index.html`, html);

        // Update angular.json
        const angularJSON: any = filesystem.read(`${folder}/angular.json`, 'json');
        const styles = [
            { input: 'src/theme/variables.scss' },
            { input: 'src/global.scss' },
            { input: './node_modules/@pxblue/angular-themes/theme.scss' },
            { input: './node_modules/@pxblue/angular-themes/open-sans.scss' },
        ];
        angularJSON.projects.app.architect.build.options.styles = styles;
        filesystem.write(`${folder}/angular.json`, angularJSON, { jsonIndent: 4 });

        spinner.stop();
        printSuccess(name);
        printInstructions([`cd ${name}`, `ionic serve`]);
    };

    const addPXBlueReactNative = async (props: ReactNativeProps): Promise<void> => {
        const { name, lint, prettier, language, cli, template } = props;
        const folder = `./${name}`;
        const ts = language === 'ts';
        const expo = cli === 'expo';
        const isYarn = filesystem.exists(`./${folder}/yarn.lock`) === 'file';
        let templatePackage = '';

        if (!expo) {
            // Map the template selection to template src
            switch (template.toLocaleLowerCase()) {
                case 'basic routing':
                case 'routing':
                    templatePackage = ts
                        ? '@pxblue/react-native-template-routing-typescript'
                        : '@pxblue/react-native-template-routing';
                    break;
                case 'authentication':
                    templatePackage = ts
                        ? '@pxblue/react-native-template-authentication-typescript'
                        : '@pxblue/react-native-template-authentication';
                    break;
                case 'blank':
                default:
                    templatePackage = ts
                        ? '@pxblue/react-native-template-blank-typescript'
                        : '@pxblue/react-native-template-blank';
            }

            // Clone the template repo
            const templateSpinner = print.spin('Adding PX Blue template...');
            const templateFolder = `template-${new Date().getTime()}`;
            const installTemplateCommand = `cd ${name} && npm install ${templatePackage} --prefix ${templateFolder}`;
            await system.run(installTemplateCommand);

            // Copy template files
            filesystem.copy(`./${name}/${templateFolder}/node_modules/${templatePackage}/template`, `./${name}/`, {
                overwrite: true,
            });

            // Copy template-specific fonts
            if (filesystem.isDirectory(`./${name}/${templateFolder}/node_modules/${templatePackage}/fonts`)) {
                filesystem.copy(
                    `./${name}/${templateFolder}/node_modules/${templatePackage}/fonts`,
                    `./${name}/assets/fonts/`,
                    {
                        overwrite: true,
                    }
                );
            }

            // Copy template-specific images
            if (filesystem.isDirectory(`./${name}/${templateFolder}/node_modules/${templatePackage}/images`)) {
                filesystem.copy(
                    `./${name}/${templateFolder}/node_modules/${templatePackage}/images`,
                    `./${name}/assets/images/`,
                    {
                        overwrite: true,
                    }
                );
            }

            // Install template-specific dependencies
            const dependencies = filesystem.read(
                `${name}/${templateFolder}/node_modules/${templatePackage}/dependencies.json`,
                'json'
            ).dependencies;
            await fileModify.installDependencies({
                folder: folder,
                dependencies,
                dev: false,
                description: 'PX Blue Template Dependencies',
            });

            // Install template-specific dev-dependencies
            const devDependencies = filesystem.read(
                `${name}/${templateFolder}/node_modules/${templatePackage}/dependencies.json`,
                'json'
            ).devDependencies;
            await fileModify.installDependencies({
                folder: folder,
                dependencies: devDependencies,
                dev: true,
                description: 'PX Blue Template DevDependencies',
            });

            // Remove the template package folder
            filesystem.remove(`./${name}/${templateFolder}`);

            // Configure react-native-vector-icons for android
            filesystem.append(
                `./android/app/build.gradle`,
                `apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"`
            );

            templateSpinner.stop();
        }
        // End RNC(!expo) block

        if (expo) {
            const expoSpinner = print.spin('Adding Expo files and dependencies...');
            // Install Dependencies
            await fileModify.installDependencies({
                folder: folder,
                dependencies: DEPENDENCIES.reactNative.concat(['@use-expo/font', 'expo-app-loading']),
                dev: false,
                description: 'PX Blue React Native Dependencies',
            });

            // Install DevDependencies
            await fileModify.installDependencies({
                folder: folder,
                dependencies: DEV_DEPENDENCIES.reactNative.concat(['jest-expo']),
                dev: true,
                description: 'PX Blue React Native Dev Dependencies',
            });

            // Clone the helpers repo
            const helper = `cli-helpers-${Date.now()}`;
            const command = `git clone https://github.com/pxblue/cli-helpers ${helper}`;
            await system.run(command);

            // Copy the fonts
            filesystem.dir(`./${folder}/assets`);
            filesystem.copy(`./${helper}/fonts`, `${folder}/assets/fonts`, { overwrite: true });

            // Copy the App template with ThemeProvider (TODO: replace template with instruction insertion)
            filesystem.copy(
                `./${helper}/react-native/${cli}/App.${ts ? 'tsx' : 'js'}`,
                `${folder}/App.${ts ? 'tsx' : 'js'}`,
                { overwrite: true }
            );

            // Configure react-native-svg-transformer
            const appJSON: any = filesystem.read(`${folder}/app.json`, 'json');
            const helperAppJSON = filesystem.read(`./${helper}/react-native/expo/app.json`, 'json');
            appJSON.expo.packagerOpts = helperAppJSON.expo.packagerOpts;
            filesystem.write(`${folder}/app.json`, appJSON, { jsonIndent: 4 });

            filesystem.copy(`./${helper}/react-native/rnc/metro.config.js`, `${folder}/metro.config.js`, {
                overwrite: true,
            });

            // Remove the temporary folder
            filesystem.remove(`./${helper}`);
            expoSpinner.stop();
        }
        // End expo block

        // Install ESLint Packages (optional)
        if (ts && lint) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: LINT_DEPENDENCIES.reactNative,
                dev: true,
                description: 'PX Blue ESLint Packages',
            });
            fileModify.addLintConfig({
                folder: folder,
                config: LINT_CONFIG.tsx,
            });
        }

        // Install Code Formatting Packages (optional)
        if (prettier) {
            await fileModify.installDependencies({
                folder: folder,
                dependencies: PRETTIER_DEPENDENCIES.reactNative,
                dev: true,
                description: 'PX Blue Prettier Packages',
            });
            filesystem.write(`${folder}/.prettierignore`, `ios/\r\nandroid\r\n`);
        }

        // Final Steps: browser support, styles, theme integration
        const spinner = print.spin('Performing some final cleanup...');

        // Update package.json
        let packageJSON: any = filesystem.read(`${folder}/package.json`, 'json');
        packageJSON = updateScripts(
            packageJSON,
            SCRIPTS.reactNative.concat(lint && ts ? LINT_SCRIPTS.reactNative : [])
        );
        packageJSON = updateScripts(
            packageJSON,
            SCRIPTS.reactNative.concat(prettier ? PRETTIER_SCRIPTS.reactNative : [])
        );
        if (prettier && ts) packageJSON.prettier = '@pxblue/prettier-config';
        packageJSON.scripts.test = 'jest';
        if (!expo) packageJSON.scripts.rnlink = 'npx react-native link';
        filesystem.write(`${folder}/package.json`, packageJSON, { jsonIndent: 4 });

        // Update prettier.rc for JS projects
        if (!ts && prettier) {
            filesystem.write(`${folder}/.prettierrc.js`, PRETTIER_CONFIG.rc);
        }

        // Link native modules
        if (!expo) {
            const command = `cd ${folder} && ${isYarn ? 'yarn' : 'npm run'} rnlink`;
            const output = await system.run(command);
            print.info(output);
        }

        spinner.stop();
        printSuccess(name);
        printInstructions(
            !expo
                ? [
                      `iOS:`,
                      `• cd ${name}/ios`,
                      `• pod install`,
                      `• cd ..`,
                      `• ${isYarn ? 'yarn' : 'npm run'} ios`,
                      ``,
                      `Android:`,
                      `• Have an Android emulator running`,
                      `• ${isYarn ? 'yarn' : 'npm run'} android`,
                  ]
                : [`cd ${name}`, `${isYarn ? 'yarn' : 'npm'} start`]
        );
        if (!expo)
            print.warning(
                'Before running your project on iOS, you may need to open xCode and remove the react-native-vector-icons fonts from the "Copy Bundle Resources" step in Build Phases (refer to https://github.com/oblador/react-native-vector-icons/issues/1074).'
            );
        print.info('');
    };

    toolbox.addPXBlue = {
        angular: addPXBlueAngular,
        react: addPXBlueReact,
        ionic: addPXBlueIonic,
        reactNative: addPXBlueReactNative,
    };
};
