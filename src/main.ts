import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { speechToText } from "./utils";

// Configure the WhatsApp client and save session locally
const client = new Client({
	authStrategy: new LocalAuth(),
});

client.on("ready", () => {
	console.log("Client is ready!");
});

client.on("qr", (qr) => {
	qrcode.generate(qr, { small: true });
});

client.on("message_create", async (message: any) => {
	// Ignore if the message is within a group
	const chat = await message.getChat();
	if (chat.isGroup) {
		return;
	}

	// Handle incoming audio messages
	if (message.hasMedia && message.rawData.mimetype.includes("audio")) {
		const audio = await message.downloadMedia();
		const transcription = await speechToText(audio.data);
		await message.reply(`Auto transcribed 🎤:\n\n${transcription}`);
		chat.markUnread();
	}
});

client.initialize();
