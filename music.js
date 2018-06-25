const { Client, Util } = require('discord.js');
const Discord = require("discord.js");
const { TOKEN, PREFIX, GOOGLE_API_KEY } = require('./config');
const YouTube = require('simple-youtube-api');
const ytdl = require('ytdl-core');

const client = new Client({ disableEveryone: true });

const youtube = new YouTube(GOOGLE_API_KEY);

const queue = new Map();

client.on('ready', () => {
console.log('Logging into discord..');
console.log(`
Login successful.

-----------------
RoyalDev - Discord Bot
-----------------
${client.user.username}

Connected to:
${client.guilds.size} servers
${client.channels.size} channel
${client.users.size} users

Prefix: ${PREFIX}
-----------------

Use this url to bring your bot to a server:
https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=2146958588585`);

});

client.on('warn', console.warn);

client.on('error', console.error);

client.on('ready', () => console.log('Yo this ready!'));

// client.on('disconnect', () => console.log('I just disconnected, making sure you know, I will reconnect now...'));

// client.on('reconnecting', () => console.log('I am reconnecting now!'));

client.on('message', async msg => { // eslint-disable-line
	if (msg.author.bot) return undefined;
	if (!msg.content.startsWith(PREFIX)) return undefined;

	const args = msg.content.split(' ');
	const searchString = args.slice(1).join(' ');
	const url = args[1] ? args[1].replace(/<(.+)>/g, '$1') : '';
	const serverQueue = queue.get(msg.guild.id);

	let command = msg.content.toLowerCase().split(" ")[0];
	command = command.slice(PREFIX.length)

	if (command === `play`) {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('you should be in voice channel!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('i cant join this channel !');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('i cant speak !');
		}
		if (!permissions.has('EMBED_LINKS')) {
			return msg.channel.sendMessage("**i don't have premitions `EMBED LINKS`**")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send(` **${playlist.title}** add song to queue!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
					const embed1 = new Discord.RichEmbed()
			        .setDescription(`**chosse number of video** :
${videos.map(video2 => `[${++index} ] \`${video2.title}\``).join('\n')}`)
					.setFooter("© copyright 2012. all rights reserved to chill out hut")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('timeout.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send(':X: i cant find anything.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		} else if (command === `p`) {
		const voiceChannel = msg.member.voiceChannel;
		if (!voiceChannel) return msg.channel.send('you should be in voice channel!');
		const permissions = voiceChannel.permissionsFor(msg.client.user);
		if (!permissions.has('CONNECT')) {
			return msg.channel.send('i cant join this channel !');
		}
		if (!permissions.has('SPEAK')) {
			return msg.channel.send('i cant speak !');
		}
		if (!permissions.has('EMBED_LINKS')) {
			return msg.channel.sendMessage("**i don't have premitions `EMBED LINKS`**")
		}

		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			const playlist = await youtube.getPlaylist(url);
			const videos = await playlist.getVideos();
			for (const video of Object.values(videos)) {
				const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
				await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
			}
			return msg.channel.send(` **${playlist.title}** add song to queue!`);
		} else {
			try {
				var video = await youtube.getVideo(url);
			} catch (error) {
				try {
					var videos = await youtube.searchVideos(searchString, 5);
					let index = 0;
					const embed1 = new Discord.RichEmbed()
			        .setDescription(`**chosse number of video** :
${videos.map(video2 => `[${++index} ] \`${video2.title}\``).join('\n')}`)
					.setFooter("© copyright 2012. all rights reserved to chill out hut")
					msg.channel.sendEmbed(embed1).then(message =>{message.delete(20000)})
					
					// eslint-disable-next-line max-depth
					try {
						var response = await msg.channel.awaitMessages(msg2 => msg2.content > 0 && msg2.content < 11, {
							maxMatches: 1,
							time: 10000,
							errors: ['time']
						});
					} catch (err) {
						console.error(err);
						return msg.channel.send('timeout.');
					}
					const videoIndex = parseInt(response.first().content);
					var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
				} catch (err) {
					console.error(err);
					return msg.channel.send(':X: i cant find anything.');
				}
			}
			return handleVideo(video, msg, voiceChannel);
		}
	} else if (command === `s`) {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === `skip`) {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could skip for you.');
		serverQueue.connection.dispatcher.end('Skip command has been used!');
		return undefined;
	} else if (command === `stop`) {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing that I could stop for you.');
		serverQueue.songs = [];
		serverQueue.connection.dispatcher.end('Stop command has been used!');
		return undefined;
	} else if (command === `vol`) {
		if (!msg.member.voiceChannel) return msg.channel.send('You are not in a voice channel!');
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		if (!args[1]) return msg.channel.send(`:loud_sound: Current volume is **${serverQueue.volume}**`);
		serverQueue.volume = args[1];
		serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
		return msg.channel.send(`:speaker: voice change **${args[1]}**`);
	} else if (command === `np`) {
		if (!serverQueue) return msg.channel.send('there is nothing playing.');
		const embedNP = new Discord.RichEmbed()
	.setDescription(`:notes: playing: **${serverQueue.songs[0].title}**`)
		return msg.channel.sendEmbed(embedNP);
	} else if (command === `queue`) {
		
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		let index = 0;
		const embedqu = new Discord.RichEmbed()
	.setDescription(`**Songs Queue**

${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}

**now playing** ${serverQueue.songs[0].title}`)
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `q`) {
		
		if (!serverQueue) return msg.channel.send('There is nothing playing.');
		let index = 0;
		const embedqu = new Discord.RichEmbed()
	.setDescription(`**Songs Queue**

${serverQueue.songs.map(song => `**${++index} -** ${song.title}`).join('\n')}

**now playing** ${serverQueue.songs[0].title}`)
		return msg.channel.sendEmbed(embedqu);
	} else if (command === `pause`) {
		if (serverQueue && serverQueue.playing) {
			serverQueue.playing = false;
			serverQueue.connection.dispatcher.pause();
			return msg.channel.send('song paused!');
		}
		return msg.channel.send('There is nothing playing.');
	} else if (command === `resume`) {
		if (serverQueue && !serverQueue.playing) {
			serverQueue.playing = true;
			serverQueue.connection.dispatcher.resume();
			return msg.channel.send('song resumed!');
		}
		return msg.channel.send('there is nothing playing.');
	}

	return undefined;
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
	const serverQueue = queue.get(msg.guild.id);
	console.log(video);
	
//	console.log('yao: ' + Util.escapeMarkdown(video.thumbnailUrl));
	const song = {
		id: video.id,
		title: Util.escapeMarkdown(video.title),
		url: `https://www.youtube.com/watch?v=${video.id}`
	};
	if (!serverQueue) {
		const queueConstruct = {
			textChannel: msg.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true
		};
		queue.set(msg.guild.id, queueConstruct);

		queueConstruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueConstruct.connection = connection;
			play(msg.guild, queueConstruct.songs[0]);
		} catch (error) {
			console.error(`I could not join the voice channel: ${error}`);
			queue.delete(msg.guild.id);
			return msg.channel.send(`I could not join the voice channel: ${error}`);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		if (playlist) return undefined;
		else return msg.channel.send(` **${song.title}** song add to queue!`);
	}
	return undefined;
}

function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}
	console.log(serverQueue.songs);

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', reason => {
			if (reason === 'Stream is not generating quickly enough.') console.log('Song ended.');
			else console.log(reason);
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

	serverQueue.textChannel.send(`playing: **${song.title}**`);
}

client.on('message', message => {

if (!message.content.startsWith(tokens.prefix)) return;
var args = message.content.split(' ').slice(1);
var argresult = args.join(' ');
if (message.author.id == 321017208740380673) return;
if (message.content.startsWith(tokens.prefix + 'playing')) {
if (message.author.id !== '321017208740380673') return message.reply('** sorry it only for OWNER **')
client.user.setGame(argresult);
 message.channel.sendMessage(`**${argresult}** : playing change`)
} else


if (message.content.startsWith(tokens.prefix + 'stream')) {
if (message.author.id !== '321017208740380673') return message.reply('** sorry it only for OWNER **')
client.user.setGame(argresult, "http://twitch.tv/y04zgamer");
 message.channel.sendMessage(`**${argresult}** :stream change`)
} else

if (message.content.startsWith(tokens.prefix + 'setname')) {
if (message.author.id !== '321017208740380673') return message.reply('** sorry it only for OWNER **')
client.user.setUsername(argresult).the
message.channel.sendMessage(`**${argresult}** : name change`)
return message.reply("**i cant change it only after 2 hours**");
} else
 
if (message.content.startsWith(tokens.prefix + 'setavatar')) {
if (message.author.id !== '321017208740380673') return message.reply('** sorry it only for OWNER **')
client.user.setAvatar(argresult);
 message.channel.sendMessage(`**${argresult}** : avatar change`);
} else


if (message.content.startsWith(tokens.prefix + 'watching')) {
if (message.author.id !== '321017208740380673') return message.reply('** sorry it only for OWNER **')
 client.user.setActivity(argresult, {type : 'watching'});
message.channel.sendMessage(`**${argresult}** : watching change`)
}
if (message.content.startsWith(prefix + 'listening')) {
if (message.author.id !== '321017208740380673') return message.reply('** sorry it only for OWNER **')
client.user.setActivity(argresult, {type : 'listening'});
message.channel.sendMessage(`**${argresult}**: listing change`)
}

});


client.login(TOKEN);
