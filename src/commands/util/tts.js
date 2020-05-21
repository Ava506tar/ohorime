'use strict';
const Command = require('../../plugin/Command');
const textToSpeech = require('@google-cloud/text-to-speech');
const client = new textToSpeech.TextToSpeechClient();
const fs = require('fs');
const util = require('util');

/**
 * Tts command
 */
class Tts extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'tts',
      category: 'util',
      description: 'command_tts_description',
      usage: 'tts',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: [
        'CONNECT',
        'SPEAK',
      ],
    });
    this.language = new Map();
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array<String>} query - argument
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @return {Promise<Message>}
   */
  async launch(message, query, {guild}) {
    /**
     * Import player to play command
     */
    const player = new (require('../music/play'))(this.client);
    /**
     * Join bot
     */
    const joining = await player.join(message);
    /**
     * Check join status
     */
    if (joining === 'PLAYING') {
      return message.reply(`Vous devez arrêter la musique avant, \`${
        guild.prefix}destroy\``);
    } else if (joining === 'MEMBER_NOT_JOIN') {
      return message.reply('Vous devez rejoindre le salon avant');
    };
    /**
     * Config language
     */
    if (!this.language.has(message.guild.id)) {
      this.language.set(message.guild.id, 'en-US');
    };
    /**
     * Check if it's query
     */
    if (query[0] === 'setVoice') {
      query.shift();
      this.language.set(message.guild.id, query.join(''));
      return message.channel.send(`Now language is ${query.join(' ')}`);
    };
    /**
     * Check if it's query
     */
    if (!query.join('')) {
      return message.reply('Vous devez écrire quelque chose');
    };
    /**
     * Create request
     */
    const request = {
      input: {text: query.join(' ')},
      voice: {
        languageCode: this.language.get(message.guild.id),
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {audioEncoding: 'MP3'},
    };
    /**
     * Get request response
     */
    const [response] = await client.synthesizeSpeech(request);
    /**
     * promisify fs functions
     */
    const writeFile = util.promisify(fs.writeFile);
    const rmFile = util.promisify(fs.unlink);
    /**
     * Create data
     */
    const data = {
      now: Date.now(),
      user: message.author,
    };
    /**
     * Create [mp3] file
     */
    await writeFile(process.cwd() +
      `/temp/tts/audio-${data.now}-${data.user.id}.mp3`,
    response.audioContent,
    'binary');
    /**
     * Delete [mp3] file
     */
    setTimeout(() => {
      rmFile(process.cwd() +
      `/temp/tts/audio-${data.now}-${data.user.id}.mp3`);
    }, 2000);
    /**
     * Play [mp3] file
     */
    this.client.music[message.guild.id].dispatcher =
    this.client.music[message.guild.id].connection
        .play(fs.createReadStream(process.cwd()+
        `/temp/tts/audio-${data.now}-${data.user.id}.mp3`));
  };
};

module.exports = Tts;
