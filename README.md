# HubSpot-CRM-search-with-GPT3

### How to install

Type in terminal

```
  git clone https://github.com/KozakRoman/HubSpot-CRM-search-with-GPT3.git
  cd HubSpot-CRM-search-with-GPT3
  npm install
```

### How to test locally

1) Create a new [OpenAI account](https://beta.openai.com/) and copy secret API key.

2) Open `config/index.js` and paste your OpenAI secret API key

```javascript
  const hubApiKey = "";
  const openAIKey = "PASTE_HERE";

  module.exports = { hubApiKey, openAIKey };
```

3) Copy the HubSpot API key and paste it in `config/index.js`

```javascript
  const hubApiKey = "PASTE_HERE";
  const openAIKey = "";

  module.exports = { hubApiKey, openAIKey };
```

4) start the app by typing in terminal:

```
  npm start
```
