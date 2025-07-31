const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro-1.0' });


app.post('/slack/command', async (req, res) => {
  const userText = req.body.text;
  const responseUrl = req.body.response_url;

  // Respond quickly to Slack
  res.status(200).send("✍️ Crafting your LinkedIn post...");

  try {
    // Generate content from Gemini
    const result = await model.generateContent(userText);
    const message = result.response.text();

    // Send post to Slack
    await axios.post(responseUrl, {
      response_type: "in_channel",
      text: message
    });

  } catch (error) {
    console.error("Gemini Error:", error.response?.data || error.message);
    await axios.post(responseUrl, {
      response_type: "ephemeral",
      text: `⚠️ Gemini failed: ${error.response?.data?.error?.message || error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`PostCraft (Gemini version) is live on port ${PORT}`);
});
