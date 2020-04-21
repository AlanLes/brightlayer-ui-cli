/*
 * This file includes utilities for creating new skeleton projects in any framework using
 * the associated CLIs via npx.
 */
import { GluegunToolbox } from 'gluegun';
import { QUESTIONS } from '../constants';
import { assignJsTs, stringToLowerCaseNoSpace, Language, Cli } from '../utilities';
import { AngularProps, ReactProps, ReactNativeProps } from '../utilities';

module.exports = (toolbox: GluegunToolbox): void => {
    const { system, parse, print } = toolbox;

    const createAngularProject = async (): Promise<AngularProps> => {
        let name: string,
            nameOption = toolbox.parameters.options.name;
        if (nameOption === undefined || nameOption == true) {
            [name] = await parse([QUESTIONS.name]);
        } else {
            name = nameOption;
        }

        let lint: boolean,
            lintOption = toolbox.parameters.options.lint;
        if (lintOption === undefined) {
            const [lintTemp] = await parse([QUESTIONS.lint]);
            lint = lintTemp === 'Yes';
        } else {
            lint = !!lintOption;
        }

        const command = `npx -p @angular/cli ng new ${name} --directory "${name}" --style=scss`;

        const spinner = print.spin('Creating a new Angular project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton Angular project in ${timer() / 1000} seconds`);

        return { name, lint };
    };

    const createReactProject = async (): Promise<ReactProps> => {
        print.info(toolbox.parameters.options);
        let name: string,
            nameOption = toolbox.parameters.options.name;
        if (nameOption === undefined || nameOption === true) {
            [name] = await parse([QUESTIONS.name]);
        } else {
            name = nameOption;
        }

        let language: Language,
            languageTemp: string,
            languageOption = toolbox.parameters.options.language;
        if (languageOption === undefined || languageOption === true) {
            [languageTemp] = await parse([QUESTIONS.language]);
        } else {
            languageTemp = languageOption;
        }

        language = assignJsTs(languageTemp);
        const isTs = language === 'ts';

        let lint: boolean = false;
        if (isTs) {
            let lintOption = toolbox.parameters.options.lint;
            if (lintOption === undefined) {
                const [lintTemp] = await parse([QUESTIONS.lint]);
                lint = lintTemp === 'Yes';
            } else {
                lint = !!lintOption;
            }
        }

        const command = `npx create-react-app ${name} ${isTs ? '--template typescript' : ''}`;

        const spinner = print.spin('Creating a new React project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton React project in ${timer() / 1000} seconds`);

        return { name, language, lint };
    };

    const createIonicProject = async (): Promise<AngularProps> => {
        let name: string,
            nameOption = toolbox.parameters.options.name;
        if (nameOption === undefined || nameOption === true) {
            [name] = await parse([QUESTIONS.name]);
        } else {
            name = nameOption;
        }

        let lint: boolean = false,
            lintOption = toolbox.parameters.options.lint;
        if (lintOption === undefined) {
            const [lintTemp] = await parse([QUESTIONS.lint]);
            lint = lintTemp === 'Yes';
        } else {
            lint = !!lintOption;
        }

        const command = `npx ionic start ${name} blank`;

        const spinner = print.spin('Creating a new Ionic project (this may take a few minutes)...');
        const timer = system.startTimer();
        const output = await system.run(command);
        spinner.stop();

        print.info(output);
        print.success(`Created skeleton Ionic project in ${timer() / 1000} seconds`);

        return { name, lint };
    };

    const createReactNativeProject = async (): Promise<ReactNativeProps> => {
        let name: string,
            nameOption = toolbox.parameters.options.name;
        if (nameOption === undefined || nameOption === true) {
            [name] = await parse([QUESTIONS.name]);
        } else {
            name = nameOption;
        }

        let language: Language,
            languageTemp: string,
            languageOption = toolbox.parameters.options.language;
        if (languageOption === undefined || languageOption === true) {
            [languageTemp] = await parse([QUESTIONS.language]);
        } else {
            languageTemp = languageOption;
        }
        language = assignJsTs(languageTemp);
        const isTs = language === 'ts';

        let lint: boolean = false;
        if (isTs) {
            let lintOption = toolbox.parameters.options.lint;
            if (lintOption === undefined) {
                const [lintTemp] = await parse([QUESTIONS.lint]);
                lint = lintTemp === 'Yes';
            } else {
                lint = !!lintOption;
            }
        }

        let cli: Cli,
            cliTemp: string,
            cliOption = toolbox.parameters.options.cli;
        if (cliOption === undefined || cliOption === true) {
            [cliTemp] = await parse([QUESTIONS.cli]);
        } else {
            cliTemp = stringToLowerCaseNoSpace(cliOption);
        }
        if (cliTemp === 'Expo') {
            cli = 'expo';
        } else {
            cli = 'rnc';
        }

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

        return { name, language, lint, cli };
    };

    toolbox.createProject = {
        angular: createAngularProject,
        react: createReactProject,
        ionic: createIonicProject,
        reactNative: createReactNativeProject,
    };
};
