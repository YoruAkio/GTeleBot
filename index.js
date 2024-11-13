require('dotenv').config();
const TeleBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const utils = require('./lib/utils');

const client = new TeleBot(process.env.TELEGRAM_BOT_TOKEN, {
    polling: true
});

const config = require('./config.json');
const userState = [];

client.onText(/\/playerinfo (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const args = match[1].split(' ');

    const playerPath = __dirname + `/${config.playerPath}/${args[0]}_.json`;
    if (!fs.existsSync(playerPath)) {
        client.sendMessage(chatId, `Player info for ${args[0]} not found.`);
        return;
    }
    const playerInfo = JSON.parse(fs.readFileSync(playerPath, 'utf8'));
    client.sendMessage(chatId, `
        *Growtopia Player Information*

*Player Name:* ${playerInfo.name}
*Player Email:* ${playerInfo.email}
*Player Gender:* ${playerInfo.gender}
*Player Level:* ${playerInfo.level}
*Player Gems:* ${playerInfo.gems}

*Player IP*: ${playerInfo.ip}
*Last Login*: ${playerInfo.lo}
        `, { parse_mode: 'Markdown' }
    );
    const inventory = utils.parseInventory(playerInfo.inventory.filter(item => item[0] !== 0 || item[1] !== 0));
    client.sendMessage(chatId, `
        \`\`\`DetailedPlayerInformation
Inventory: ${inventory.map(item => `${item[0]} (${item[1]})`).join(', ')}

Worlds: ${playerInfo.worlds_owned.join(', ')}
\`\`\`
    `, { parse_mode: 'Markdown' });
});

client.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    client.sendMessage(chatId, 'Welcome to the bot!', {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🔍 View User",
                        callback_data: "pInfo"
                    }
                ]
            ]
        }
    });
});

client.onText("/backup", (msg) => {
    const backupName = `Backup-${new Date().getTime()}.zip`;
    const backupPath = path.join(__dirname, 'backups', backupName);
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', {
        zlib: { level: 5 }
    });

    output.on('close', () => {
        client.sendMessage(chatId, 'Backup file created successfully.');
        client.sendDocument(chatId, backupPath)
            .then(() => {
                fs.unlink(backupPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete backup file: ${err}`);
                    } else {
                        console.log(`Backup file deleted: ${backupPath}`);
                    }
                });
            })
            .catch((err) => {
                console.error(`Failed to send backup file: ${err}`);
            });

    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(output);
    archive.file(config.databasePath, { name: path.basename(config.databasePath) });
    archive.finalize();
});

client.on('message', async (msg) => {
    const chatId = msg.chat.id;

    if (userState[chatId] && userState[chatId].state === "AWAITING_PLAYER_NAME") {
        const playerPath = __dirname + `/${config.playerPath}/${msg.text}_.json`;
        if (!fs.existsSync(playerPath)) {
            client.sendMessage(chatId, `Player info for ${msg.text} not found.`);
            return;
        }
        const playerInfo = JSON.parse(fs.readFileSync(playerPath, 'utf8'));
        client.sendMessage(chatId, `
        *Growtopia Player Information*

*Player Name:* ${playerInfo.name}
*Player Email:* ${playerInfo.email}
*Player Gender:* ${playerInfo.gender}
*Player Level:* ${playerInfo.level}
*Player Gems:* ${playerInfo.gems}

*Player IP*: ${playerInfo.ip}
*Last Login*: ${playerInfo.lo}
        `, { parse_mode: 'Markdown' }
        );
        const inventory = utils.parseInventory(playerInfo.inventory.filter(item => item[0] !== 0 || item[1] !== 0));
        client.sendMessage(chatId, `
        \`\`\`DetailedPlayerInformation
Inventory: ${inventory.map(item => `${item[0]} (${item[1]})`).join(', ')}

Worlds: ${playerInfo.worlds_owned.join(', ')}
\`\`\`
    `, { parse_mode: 'Markdown' });
    
        userState[chatId] = {
            state: "IDLE"
        }
    }

});

client.on('callback_query', (query) => {
    const [action, ...value] = query.data.split('_');
    const chatId = query.message.chat.id;

    switch (action) {
        case 'pInfo': {
            client.sendMessage(chatId, `Input the player name to get the information.`);
            userState[chatId] = {
                state: "AWAITING_PLAYER_NAME",
                messageId: query.message.message_id
            };
            client.answerCallbackQuery(query.id);
            break;
        }
        default: {
            break;
        }
    }
});

client.on('polling_error', (error) => {
    console.log(error);
});