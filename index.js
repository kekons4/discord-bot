const discord = require('discord.js')
const client = new discord.Client();
const ytdl = require('ytdl-core');
const https = require('https');
const request = require('request');
const dotenv = require('dotenv').config();
const token = process.env.DISCORD_KEY;

const helpCmds = require('./templates/help.json');

const PREFIX = '?';
var version = 'Version 1.0.0';

var videoId = 'test';

client.on('ready', () => {
    console.log('Bot Online...')
})

client.on('message', msg => {
    let args = msg.content.substring(PREFIX.length).split(" ");

    switch(args[0]){
        case 'ping':
            msg.channel.send('pong!')
            break;
        
        case 'help':
            msg.channel.send({embed: helpCmds});
            break;
        
        case 'info':
            if(args[1] === 'version'){
                msg.channel.send(version)
            } else {
                msg.channel.send('ERROR Command does not exist')
            }
            break;
        case 'clear':
            if(!args[1]) return msg.reply('ERROR please define second arg...')
            msg.channel.bulkDelete(args[1]);
            break;
        case 'play':
            if(!args[1]) {
                return msg.reply('ERROR please define second arg...')
            } else {
                var full = '';
                var i;
                for(i = 1; i < args.length; i++){
                    full += args[i];
                    full += '%';
                }
                console.log(full);

                try {
                    request('https://www.googleapis.com/youtube/v3/search?part=snippet&q='+full+'&key='+process.env.YOUTUBE_API_KEY, function (error, response, body) {
                        console.log('error:', error); // Print the error if one occurred
                        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
                        data = [JSON.parse(body)];
                        console.log('body:', data[0].items[0].id.videoId);
                        videoId = data[0].items[0].id.videoId;
                        console.log("title: " + data[0].items[0].snippet.title);
                        const videoTitle = data[0].items[0].snippet.title;
                        // console.log(data[0].items[0]);

                        const embeded = {
                            color: "f50606",
                            title: videoTitle,
                            url: `https://www.youtube.com/watch?v=${videoId}`,
                            author: {
                                name: data[0].items[0].snippet.channelTitle,
                                icon_url: 'https://cliply.co/wp-content/uploads/2019/04/371903520_SOCIAL_ICONS_YOUTUBE.png',
                                url: `https://www.youtube.com/channel/${data[0].items[0].snippet.channelId}`,
                            },
                            description: 'YouTube',
                            // thumbnail: {
                            //     url: 'https://i.imgur.com/wSTFkRM.png',
                            // },
                            image: {
                                url: data[0].items[0].snippet.thumbnails.high.url,
                            },
                            // timestamp: new Date(),
                            // footer: {
                            //     text: 'Some footer text here',
                            //     icon_url: 'https://i.imgur.com/wSTFkRM.png',
                            // },
                        };

                        if (msg.member.voice.channel) {
                            //console.log("ID3: " + videoId);
                            msg.channel.send({embed: embeded});
                            const connection = msg.member.voice.channel.join().then(connection => {
                                //c2lUhNmdXkE
                                // console.log(msg.member.voice.channel);
                                // ytdl('https://www.youtube.com/watch?v=' + videoId, { quality: 'highestaudio' })
                                connection.play((ytdl('https://www.youtube.com/watch?v=' + videoId, { quality: 'highestaudio' })), {seek: 0, volume: 0.5})
                            })
                        
                        } else {
                            msg.reply('You need to join a voice channel first!');
                        }
                    });
                } catch (err) {
                    console.error(err);
                    msg.channel.send("Could not find video, try typing it differently.");
                }
            }
            break;
        case 'stop':
            msg.member.voice.channel.leave();
            break;
    }
    /*if(msg.content === "HELLO") {
        msg.reply('HELLO FRIEND!');
    }
    if(msg.content === "sup bitch") {
        msg.reply('Shut up Bitch!');
    }*/
})

client.login(token);