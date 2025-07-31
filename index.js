const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.post('/slack/command', async (req, res) => {
  const userText = req.body.text;
  const responseUrl = req.body.response_url;

  res.status(200).send("✍️ Crafting your LinkedIn post...");

  const prompt = `Write a professional LinkedIn post for: "${userText}"`;

  try {
    const completion = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 150
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        }
      }
    );

    const message = completion.data.choices[0].text.trim();

    await axios.post(responseUrl, {
      response_type: "in_channel",
      text: message
    });

  } catch (error) {
    console.error("OpenAI Error:", error.response?.data || error.message);
    await axios.post(responseUrl, {
      response_type: "ephemeral",
      text: `⚠️ GPT failed: ${error.response?.data?.error?.message || error.message}`
    });
  }
});

app.listen(PORT, () => {
  console.log(`PostCraft is live on port ${PORT}`);
});
