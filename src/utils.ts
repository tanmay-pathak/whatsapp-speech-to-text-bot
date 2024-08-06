/**
 * Functions copied from Andriel123's repository.
 */
import fs from "fs";
import { Readable } from "stream";
import OpenAI from "openai";
const openai = new OpenAI();

async function speechToText(base64AudioString: string): Promise<string> {
	const fileName = await createAudioFile(base64AudioString);

	const transcription = await openai.audio.translations.create({
		file: fs.createReadStream(fileName),
		model: "whisper-1",
	});

	deleteAudioFile(fileName);

	return transcription.text;
}

export { speechToText };

export function createAudioFile(base64AudioString: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const buffer = Buffer.from(base64AudioString, "base64");

		const readStream = new Readable();
		readStream._read = () => {};
		readStream.push(buffer);
		readStream.push(null);

		const fileName = "tempAudioFile.mp3";

		const writeStream = fs.createWriteStream(fileName);

		readStream.pipe(writeStream);

		writeStream.on("finish", () => {
			resolve(fileName);
		});

		writeStream.on("error", (err) => {
			reject(`Error when creating temporary audio file ${err}`);
		});
	});
}

export function deleteAudioFile(filePath: string) {
	fs.unlink(filePath, (err) => {
		if (err) {
			console.error(`Error on deleting temporary file: ${err}`);
		}
	});
}
