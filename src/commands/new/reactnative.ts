import { GluegunToolbox } from 'gluegun';

module.exports = {
    name: 'react-native',
    // alias: ['rn'],
    description: 'Creates a new react native project',
    run: async (toolbox: GluegunToolbox): Promise<void> => {
        const { name, language, lint, prettier, cli } = await toolbox.createProject.reactNative();
        await toolbox.addPXBlue.reactNative({ name, language, lint, prettier, cli });
    },
};
