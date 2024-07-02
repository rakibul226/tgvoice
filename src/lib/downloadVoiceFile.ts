import { createWriteStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import { Telegraf } from "telegraf";
import axios from "axios";

export async function downloadVoiceFile(
  workDir: string,
  fileId: string,
  bot: Telegraf
) {
  const oggDestination = `${workDir}/${fileId}.ogg`;
  const wavDestination = `${workDir}/${fileId}.mp3`;
  const fileLink = await bot.telegram.getFileLink(fileId);

  const writestream = createWriteStream(oggDestination);
  const response = await axios({
    method: "GET",
    url: fileLink.toString(),
    responseType: "stream",
  });

  await new Promise(async (resolve, reject) => {
    response.data.pipe(writestream);
    writestream.on("finish", resolve);
    writestream.on("error", reject);
  });

  await new Promise((resolve, reject) => {
    ffmpeg(oggDestination)
      .format("mp3")
      .on("error", (err) => reject(err))
      .on("end", () => {
        console.log("Conversion finished!");
        resolve(void 0);
      })
      .save(wavDestination);
  });

  return wavDestination;
}


// import { createWriteStream, unlink } from "fs";
// import ffmpeg from "fluent-ffmpeg";
// import { Telegraf } from "telegraf";
// import axios from "axios";

// export async function downloadVoiceFile(
//   workDir: string,
//   fileId: string,
//   bot: Telegraf
// ): Promise<string> {
//   const oggDestination = `${workDir}/${fileId}.ogg`;
//   const mp3Destination = `${workDir}/${fileId}.mp3`;
  
//   try {
//     // Get file link from Telegram
//     const fileLink = await bot.telegram.getFileLink(fileId);

//     // Download the file using Axios
//     const response = await axios({
//       method: "GET",
//       url: fileLink.toString(),
//       responseType: "stream",
//     });

//     // Create a writable stream and pipe the response to it
//     const writestream = createWriteStream(oggDestination);
//     response.data.pipe(writestream);

//     // Wait for download to finish
//     await new Promise<void>((resolve, reject) => {
//       writestream.on("finish", () => resolve()); // Resolve without arguments
//       writestream.on("error", reject);
//     });

//     // Convert OGG to MP3 using FFmpeg
//     await new Promise<void>((resolve, reject) => {
//       ffmpeg()
//         .input(oggDestination)
//         .format("mp3")
//         .on("error", (err) => reject(err))
//         .on("end", () => {
//           console.log("Conversion to MP3 finished!");
//           resolve(); // Resolve without arguments
//         })
//         .save(mp3Destination);
//     });

//     // Clean up: delete the original OGG file
//     unlink(oggDestination, (err) => {
//       if (err) {
//         console.error("Error deleting OGG file:", err);
//       } else {
//         console.log("OGG file deleted successfully.");
//       }
//     });

//     // Return the path to the converted MP3 file
//     return mp3Destination;
//   } catch (error) {
//     console.error("Error downloading or converting file:", error);
//     throw error; // Rethrow the error to handle it elsewhere if needed
//   }
// }
