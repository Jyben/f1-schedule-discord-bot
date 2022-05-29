const Config = require('./config.js');
const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios').default;
const date = require('date-and-time');
const fr = require('date-and-time/locale/fr');

const token = Config.settings.auth.discordToken;
const clientId = Config.settings.auth.clientId;
const guildId = Config.settings.auth.guildId;

const commands = [
    new SlashCommandBuilder().setName('calendrier').setDescription('Donne le calendrier F1 de la semaine'),
]
    .map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS] });

client.once('ready', () => {
    console.log('Discord bot ready!');
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    if (commandName === 'calendrier') {
        var response = await getScheduleAsync();
        await interaction.reply(response);
    }
});

async function getScheduleAsync() {
    const response = await axios.get('http://ergast.com/api/f1/current.json');
    const races = response.data.MRData.RaceTable.Races;
    date.locale(fr);
    const now = new Date()

    var result = races.filter(x => x.date >= date.format(now, 'YYYY-MM-DD'));
    console.log(result[0]);
    console.log(result[0].FirstPractice);

    return '@everyone (ajoutez 2h à l\'horaire faites pas chier)' + '\n' + 'FP 1️⃣ :          ' + result[0].FirstPractice.date +
        ' ' + result[0].FirstPractice.time.slice(0, -4) + '\n' + 'FP 2️⃣ :          ' + result[0].SecondPractice.date +
        ' ' + result[0].SecondPractice.time.slice(0, -4) + '\n' + 'FP 3️⃣ :          ' + result[0].ThirdPractice.date +
        ' ' + result[0].ThirdPractice.time.slice(0, -4) + '\n' + 'Qualif ⏱ :   ' + result[0].Qualifying.date +
        ' ' + result[0].Qualifying.time.slice(0, -4) + '\n' + 'Course 🏁 : ' + result[0].date + ' ' + result[0].time.slice(0, -4);
}

client.login(token);