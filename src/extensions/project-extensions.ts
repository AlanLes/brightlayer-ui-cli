/*
 * This file includes utilities for creating new skeleton projects in any framework using
 * the associated CLIs via npx.
 */
import { GluegunToolbox } from 'gluegun';
import { QUESTIONS } from '../constants';
import {
    assignJsTs,
    stringToLowerCaseNoSpace,
    Cli,
    AngularProps,
    ReactProps,
    ReactNativeProps,
    Template,
} from '../utilities';

module.exports = (toolbox: GluegunToolbox): void => {
    const { system, parse, print } = toolbox;

    const createAngularProject = async (): Promise<AngularProps> => {
        const [name, lint, prettier]: [string, boolean, boolean] = await parse([
            QUESTIONS.name,
            QUESTIONS.lint,
            QUESTIONS.prettier,
        ]);

        const command = `npx -p @angular/cli@^10.1.7 ng new ${name} --directory "${name}" --style=scss`;

        const spinner = print.spin('Creating a new Angular project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton Angular project in ${timer() / 1000} seconds`);

        return { name, lint, prettier };
    };

    const createReactProject = async (): Promise<ReactProps> => {
        let lint = true;

        const [name, languageTemp]: [string, string] = await parse([QUESTIONS.name, QUESTIONS.language]);
        const language = assignJsTs(languageTemp);
        const isTs = language === 'ts';

        if (isTs) {
            [lint] = await parse([QUESTIONS.lint]);
        }

        const [prettier, template]: [boolean, Template] = await parse([QUESTIONS.prettier, QUESTIONS.template]);

        // Map the template selection to template name
        let templateName = '';
        switch (template) {
            case 'Basic Routing': // Coming Soon: templateName = isTs ? '@pxblue/routing-typescript' : '@pxblue/routing';
            case 'Authentication': // Coming Soon: templateName = isTs ? '@pxblue/authentication-typescript' : '@pxblue/authentication';
            case 'Blank':
            default:
                templateName = isTs ? '@pxblue/blank-typescript' : '@pxblue/blank';
        }

        const command = `npx create-react-app ${name} --template ${templateName}`;

        const spinner = print.spin('Creating a new React project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton React project in ${timer() / 1000} seconds`);

        return { name, language, lint, prettier };
    };

    const createIonicProject = async (): Promise<AngularProps> => {
        const [name, lint, prettier]: [string, boolean, boolean] = await parse([
            QUESTIONS.name,
            QUESTIONS.lint,
            QUESTIONS.prettier,
        ]);

        const command = `npx ionic start ${name} blank`;

        const spinner = print.spin('Creating a new Ionic project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton Ionic project in ${timer() / 1000} seconds`);

        return { name, lint, prettier };
    };

    const createReactNativeProject = async (): Promise<ReactNativeProps> => {
        let lint = true;

        const [name]: [string] = await parse([QUESTIONS.name]);

        const [languageTemp]: [string] = await parse([QUESTIONS.language]);
        const language = assignJsTs(languageTemp);
        const isTs = language === 'ts';

        if (isTs) {
            [lint] = await parse([QUESTIONS.lint]);
        }
        const [prettier] = await parse([QUESTIONS.prettier]);

        let [cliTemp]: [string] = await parse([QUESTIONS.cli]);
        cliTemp = stringToLowerCaseNoSpace(cliTemp);
        const cli: Cli = cliTemp === 'expo' ? 'expo' : 'rnc';

        let command: string;
        if (cli === 'expo') {
            command = `npx -p expo-cli expo init --name=${name} --template=${
                isTs ? 'expo-template-blank-typescript' : 'blank'
            } "${name}"`;
        } else {
            command = `npx react-native init ${name} ${isTs ? '--template react-native-template-typescript' : ''}`;
        }

        const spinner = print.spin('Creating a new React Native project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton React Native project in ${timer() / 1000} seconds`);

        return { name, language, lint, prettier, cli };
    };

    toolbox.createProject = {
        angular: createAngularProject,
        react: createReactProject,
        ionic: createIonicProject,
        reactNative: createReactNativeProject,
    };
};
