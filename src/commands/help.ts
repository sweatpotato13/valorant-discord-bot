import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, MetadataStorage, Slash } from "discordx";

@Discord()
export class Help {
    @Slash("help", { description: "description for all slash command" })
    async help(interaction: CommandInteraction): Promise<void> {
        try {
            const commands = MetadataStorage.instance.applicationCommands.map((cmd) => {
                return { description: cmd.description, name: cmd.name };
            });

            const embed = new EmbedBuilder();
            embed.setTitle("**Slash command info**")
            embed.setColor(0xfa4454)

            commands.map((cmd) => {
                embed.addFields(
                    { name: `/${cmd.name}`, value: `${cmd.description}`, inline: false },
                )
            });
            embed.setTimestamp()

            await interaction.channel?.send({ embeds: [embed] });
            await interaction.reply("This is description for all slash command");
        } catch (error: any) {
            await interaction.reply(`There was an error while executing this command!, Please try again later`);
        }
    }
}