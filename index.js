// imports
const discord = require('discord.js')
const client = new discord.Client();
const ytdl = require('ytdl-core');
const https = require('https');
const request = require('request');
const dotenv = require('dotenv').config();
const token = process.env.DISCORD_KEY;

// Embedded msg templates
const helpCmds = require('./templates/help.json');
const queueTemplate = require('./templates/queue.json');
const easterEgg = require('./templates/easterEgg.json');

const PREFIX = '?';
var version = 'Version 1.0.1';

var videoId = 'test';

// Video Queue for YouTube Videos to be played
const videoQueue = [];

// Checks Whether Bot Successfully is online
client.on('ready', () => {
    console.log('Bot Online...')
})

// For each valid command a user enters 
client.on('message', msg => {
    let args = msg.content.substring(PREFIX.length).split(" ");
    // console.log(args);
    if(msg.content.charAt(0) === PREFIX) {
        switch(args[0]){
            case 'ping':
                msg.channel.send('pong!')
                break;
            
            case 'help':
                msg.channel.send({embed: helpCmds});
                break;
            
            case 'info':
                if(args[1] === 'version'){
                    msg.channel.send(version);
                }
                else if(args[1] === 'secret') {
                    msg.channel.send("You found Secret #2. Here is a Hint for another secret - \"egg\"");
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
                    return msg.reply('You forgot to Enter the video name...')
                } else {
                    const search = args[1].split("=");
                    try {
                        if (msg.member.voice.channel) {
                            const connection = msg.member.voice.channel.join().then(connection => {
                                // msg.channel.send({embed: videoQueue[i].embed});
                                connection.play((ytdl(`${search[0]}=${search[1]}`, { quality: 'highestaudio' })), {seek: 0, volume: 0.5});
                            });
                        } else {
                            msg.reply('You need to join a voice channel first!');
                        }
                    } catch (err) {
                        console.error(err);
                        msg.channel.send("Could not find video, try typing it differently.");
                    }
                }
                break;
            case 'next':
                if(videoQueue.length === 0) {
                    return msg.reply('The Queue is Empty... Use "?add" to add a video.');
                } else {

                    // this is to remove the first song so it does repeat it after its been played once.
                    if(videoQueue.length >= 1) videoQueue.shift();

                    // if user try to plays the next video when there is an empty queue
                    if(videoQueue.length === 0) {
                        msg.member.voice.channel.leave();
                        return msg.reply('The Queue is Empty... Use "?add" to add a video.');
                    }

                    try {
                        if (msg.member.voice.channel) {
                            const connection = msg.member.voice.channel.join().then(connection => {
                                for(let i = 0; i < videoQueue.length; i++) {
                                    msg.channel.send({embed: videoQueue[i].embed});
                                    connection.play((ytdl(videoQueue[i].url, { quality: 'highestaudio' })), {seek: 0, volume: 0.5});
                                    // Remove first video in Queue
                                    videoQueue.shift();
                                }
                            });
                        } else {
                            msg.reply('You need to join a voice channel first!');
                        }
                    } catch (err) {
                        console.error(err);
                        msg.channel.send("Could not find video, try typing it differently.");
                    }
                }
                break;
            case 'add':
                if(!args[1]) {
                    return msg.reply('You forgot to Enter the video name...')
                } else {
                    var full = '';
                    var i;
                    for(i = 1; i < args.length; i++){
                        full += args[i];
                        full += '%';
                    }
                    console.log(full);

                    // try {
                    request('https://www.googleapis.com/youtube/v3/search?part=snippet&q='+full+'&key='+process.env.YOUTUBE_API_KEY, function (error, response, body) {
                        data = [JSON.parse(body)];
                        // console.log(data[0].pageInfo);
                        if(data[0].pageInfo.totalResults === 0) return;
                        console.log('error:', error); // Print the error if one occurred
                        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
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

                        // Adds video link to Queue
                        videoQueue.push({url: `https://www.youtube.com/watch?v=${videoId}`, embed: embeded, title: videoTitle});
                        // Prints out the video that was added to the Queue
                        msg.channel.send({embed: embeded});

                        // if the added video is the first in the queue play it
                        if(videoQueue.length === 1) {
                            try {
                                if (msg.member.voice.channel) {
                                    const connection = msg.member.voice.channel.join().then(connection => {
                                        for(let i = 0; i < videoQueue.length; i++) {
                                            // msg.channel.send({embed: videoQueue[i].embed});
                                            connection.play((ytdl(videoQueue[i].url, { quality: 'highestaudio' })), {seek: 0, volume: 0.5});
                                            // Remove first video in Queue
                                            // videoQueue.shift();
                                        }
                                    });
                                } else {
                                    msg.reply('You need to join a voice channel first!');
                                }
                            } catch (err) {
                                console.error(err);
                                msg.channel.send("Could not find video, try typing it differently.");
                            }
                        }
                        });
                    // } catch (err) {
                    //     console.error(err);
                    //     msg.channel.send("Could not find video, try typing it differently.");
                    // }
                }
                msg.channel.send("Could not find video, try typing it differently.");
                break;
            case 'leave':
                msg.member.voice.channel.leave();
                break;
            case 'queue':
                let videoStr = '';
                for(let i = 0; i < videoQueue.length; i++) {
                    videoStr += `${i}: ${videoQueue[i].title}\n`;
                }
                queueTemplate.description = videoStr;
                msg.channel.send({embed: queueTemplate});
                break;
            case 'rm':
                videoQueue.pop();
                msg.reply("The Previous video has been removed.");
                break;
            case 'secret':
                msg.channel.send("Congratz on finding Secret #1... there are others.");
                break;
            case 'easter':
                msg.channel.send({embed: easterEgg});
                break;
        }
    }
})

client.login(token);