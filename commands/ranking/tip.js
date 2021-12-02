const moment = require('moment');
const text = require(`${process.cwd()}/util/string`);
const profile = require(`${process.cwd()}/data/user.js`);
const Discord = require("discord.js")
const { Color } = require("../../config.js")
module.exports = {
  name: "tip",
  aliases: ["tip"],
  enabled: true,
 description: ["Tip any one you  want "],			    
  memberPermissions: [ "SEND_MESSAGES" ],			
  botPermissions: [ "SEND_MESSAGES", "EMBED_LINKS" ],		
  ownerOnly: false,			
  cooldown: 5000,
  run: async (bot, message, args, dev, ) => {
    
const user = message.mentions.members.first() 
    
    
let tipper = await profile.findOne({userID: user.id})
    if (!tipper){
      tipper = new profile({ userID: user.id });
    };
    const now = Date.now();

   if (tipper.data.tips.timestamp !== 0 && tipper.data.tips.timestamp - now > 0){
      return message.channel.send({content:`\\❌ **${message.author.tag}**, you already used your tip. You can wait for ${moment.duration(tipper.data.tips.timestamp - now).format('H [hours,] m [minutes, and] s [seconds]')} to tip someone again.`});
    } else if (!user){
      return message.channel.send({content:`\\✔️ **${message.author.tag}**, you can now tip someone from this server!`});
    };
     if(user.id === message.author.id){ return message.reply({content:` You can't tip Your self`})};
    const member = await message.guild.members
    .fetch(user)

    if (!member){
      return message.channel.send({content:`\\❌ **${message.author.tag}**, could not add tip to this user. Reason: User not found!`});
    } else if (member.user.bot){
      return message.channel.send({content:`\\❌ **${message.author.tag}**, you cannot tip a bot!`});
    };


    let doc = await profile.findOne({userID: member.id})
      if (!doc){
        doc = new profile.findOne({userID:member.id });
      };

      const amount = 1000;
      let overflow = false, excess = null, unregistered = false;

      if (doc.money === null){
        unregistered = true;
      } else if (doc.money + amount > 50000){
        overflow = true;
        excess = doc.money + amount - 50000;
        doc.money = 50000;
      } else {
        doc.money += amount;
      };

      tipper.data.tips.timestamp = now + 432e5;
      tipper.data.tips.given++;
      doc.data.tips.received++;

      return Promise.all([ doc.save(), tipper.save() ])
      .then(() => message.channel.send({content:[
        `\\✔️ **${message.author.tag}**, tipped **${amount}** to **${member.user.tag}**.`,
        overflow ? `\n\\⚠️ **Overflow Warning**: **${member.user.tag}**'s wallet just overflowed! You need to transfer some of your credits to your bank!` : '',
        unregistered ? `\n\\⚠️ **Unregistered**: **${member.user.tag}** is unregistered, the bonus credits will not be added.` : ''
      ].join('')}))
      .catch(() => message.channel.send({content:`\`❌ [DATABASE_ERR]:\` Unable to save the document to the database, please try again later!`}))
    
  
}

    
    
}
