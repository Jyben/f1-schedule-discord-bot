# f1-schedule-discord-bot
Send the schedule of the current F1 race week on Discord. 

# result

![app](https://github.com/Jyben/f1-schedule-discord-bot/blob/main/assets/robotguitou.PNG)

# configure your own Discord bot

Create a `config.js` file in the root folder and put these parameters with your own values : 

````javascript
exports.settings = {
    auth: {
        clientId: '',
        guildId: '',
        discordToken: ''
    }
}
````

The text is hardcoded so if you want to translate all the French text you have to replace it directly in the code. 

# test

When the bot is online, by default you can use this command : `/calendrier` (or the name you have define in the constant `commands`). 

# data 

The app use this api : http://ergast.com/mrd/