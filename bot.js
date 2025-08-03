const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");
const Tesseract = require("tesseract.js");
const links = require("./links.json");

// ⬇️ Replace this with your actual bot token
const bot = new Telegraf("8327987460:AAFWE2_3hX_QdDqyFHUTI9ZOuQzNvzPrQO0");

// Your UPI ID
const MY_UPI_ID = "9605213735@ibl";

// Image handler
bot.on("photo", async (ctx) => {
  const photo = ctx.message.photo[ctx.message.photo.length - 1];
  const fileUrl = `https://api.telegram.org/file/bot${bot.token}/${(await bot.telegram.getFile(photo.file_id)).file_path}`;
  
  try {
    const imageBuffer = await fetch(fileUrl).then(res => res.buffer());

    const { data: { text } } = await Tesseract.recognize(imageBuffer, "eng");
    const cleanedText = text.replace(/\s/g, "");

    console.log("OCR TEXT:", cleanedText);

    if (!cleanedText.includes(MY_UPI_ID)) {
      return ctx.reply("⚠️ Payment not made to correct UPI ID.");
    }

    const matchedAmount = Object.keys(links).find(amount => cleanedText.includes(amount));

    if (matchedAmount) {
      return ctx.reply(`✅ Payment of ₹${matchedAmount} verified.\nHere is your link:\n${links[matchedAmount]}`);
    } else {
      return ctx.reply("❌ Couldn't match any known amount. Please contact support.");
    }
  } catch (err) {
    console.error("OCR error", err);
    ctx.reply("⚠️ Failed to read screenshot. Try again with a clearer image.");
  }
});

bot.start((ctx) => ctx.reply("👋 Send your PhonePe/GPay screenshot to receive your link."));
bot.launch();
