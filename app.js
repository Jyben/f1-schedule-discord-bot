const Config = require('./config.js');
const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageAttachment } = require('discord.js');
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
        date.locale(fr);
        const response = await getScheduleAsync();
        const embed = getEmbed(response[0].Circuit.Location.locality,
            response[0].Circuit.Location.country,
            date.transform(response[0].FirstPractice.date, 'YYYY-MM-DD', 'DD/MM',) + ' - ' + response[0].FirstPractice.time.slice(0, -4),
            date.transform(response[0].SecondPractice.date, 'YYYY-MM-DD', 'DD/MM') + ' - ' + response[0].SecondPractice.time.slice(0, -4),
            date.transform(response[0].ThirdPractice.date, 'YYYY-MM-DD', 'DD/MM') + ' - ' + response[0].ThirdPractice.time.slice(0, -4),
            date.transform(response[0].Qualifying.date, 'YYYY-MM-DD', 'DD/MM') + ' - ' + response[0].Qualifying.time.slice(0, -4),
            response[0].Sprint === undefined ? "Pas de sprint" : date.transform(response[0].Sprint.date, 'YYYY-MM-DD', 'DD/MM') + ' - ' + response[0].Sprint.time.slice(0, -4),
            date.transform(response[0].date, 'YYYY-MM-DD', 'DD/MM') + ' - ' + response[0].time.slice(0, -4));

        await interaction.reply({ embeds: [embed], files: [calendar, f1] });
    }
});

const calendar = new MessageAttachment('./assets/calendar.png');
const f1 = new MessageAttachment('./assets/f1.png');

function getEmbed(locality, country, fp1, fp2, fp3, quali, sprint, race) {
    return new MessageEmbed()
        .setColor('#0099ff')
        .setAuthor({ name: 'Calendrier F1 de la semaine', iconURL: 'attachment://calendar.png' })
        .setThumbnail('attachment://f1.png')
        .addFields(
            { name: 'Circuit', value: `${locality} - ${country}` },
            { name: '\u200B', value: '\u200B' },
            { name: 'Free practice 1️⃣', value: fp1, inline: true },
            { name: 'Free practice 2️⃣', value: fp2, inline: true },
            { name: 'Free practice 3️⃣', value: fp3, inline: true },
            { name: 'Qualification ⏱', value: quali, inline: true },
            { name: 'Course sprint 🏎', value: sprint, inline: true },
            { name: 'Course principale 🏁', value: race, inline: true },
            { name: '\u200B', value: '\u200B' },
            { name: 'Timezone', value: 'UTC' },
        )
        .setTimestamp()
        .setFooter({ text: 'Built by Jyben', iconURL: 'https://www.gravatar.com/avatar/06cabe00b60eefa20db5f265960b86d5' })
}


async function getScheduleAsync() {
    const response = await axios.get('http://ergast.com/api/f1/current.json');
    const races = response.data.MRData.RaceTable.Races;
    const now = new Date()

    return races.filter(x => x.date >= date.format(now, 'YYYY-MM-DD'));
}

client.login(token);