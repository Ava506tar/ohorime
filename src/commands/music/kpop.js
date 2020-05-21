'use strict';
const Command = require('../../plugin/Command');
const language = require('../../translate');

/**
 * Command class
 */
class Kpop extends Command {
  /**
   * @param {Client} client - Client
   */
  constructor(client) {
    super(client, {
      name: 'kpop',
      category: 'music',
      description: 'command_broadcast_kpop_description',
      usage: 'kpop',
      nsfw: false,
      enable: true,
      guildOnly: true,
      aliases: [],
      mePerm: ['CONNECT', 'SPEAK', 'EMBED_LINKS'],
    });
    this.client = client;
  };
  /**
   * @param {Message} message - message
   * @param {Array} query - arguments
   * @param {Object} options - options
   * @param {Object} options.guild - guild data
   * @return {Message}
   */
  async launch(message, query, {guild}) {
    const {initQueue, join} = new (require('./play'))(this.client);
    const joining = await join(message);
    if (joining === 'PLAYING' && message.member.voice.channel.id !==
    message.guild.me.voice.channel.id) {
      return message.reply(`Vous devez être dans le même salon que le bot ! ${
        this.client.config.emote.no.id
      }`);
    } else if (joining === 'MEMBER_NOT_JOIN') {
      // eslint-disable-next-line max-len
      return message.reply(`Vous devez vous connectez à un salon vocal avant ! ${this.client.config.emote.no.id}`);
    };
    await initQueue(this.client.music, message.guild.id);
    if (this.client.music[message.guild.id].dispatcher) {
      this.client.music[message.guild.id].dispatcher.destroy();
    };
    this.client.music[message.guild.id].connection =
      await message.member.voice.channel.join();
    this.client.music[message.guild.id].dispatcher =
      await this.client.music[message.guild.id].connection
          .play(this.client.kpop.broadcast);
    this.client.music[message.guild.id].broadcast = true;
    return message.channel.send({embed: {
      color: '#2F3136',
      description: language(guild.lg,
          'command_broadcast_actualPlaying')
          .replace('{{title}}', this.client.kpop.data.song.title),
      thumbnail: {
        url: `https://cdn.listen.moe/covers/${this.client.kpop.data.song.albums[0].image}`,
      },
    },
    });
  };
};

module.exports = Kpop;
