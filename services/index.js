const { Configuration, OpenAIApi } = require("openai");
const { openAIKey } = require("../config/index");
const fs = require("fs");
const path = require("path");

const configuration = new Configuration({
  apiKey: openAIKey
});
const openai = new OpenAIApi(configuration);

const context = fs.readFileSync(
  path.join(__dirname, "..", "config", "example.txt"),
  "utf8"
);

async function languageToJSON(search) {
  const aiResponse = await openai.createCompletion({
    model: "text-davinci-002",
    prompt: context + search + "#",
    temperature: 0.0,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: ["\n", "#"]
  });

  // const response = {
  //   id: "cmpl-5KBcghnzpHIF7bDWWU5AeXWg4Vxq4",
  //   object: "text_completion",
  //   created: 1655492922,
  //   model: "text-davinci-002",
  //   choices: [
  //     {
  //       text:
  //         "\n" +
  //         '{"contacts":{ "filterGroups":[{ "filters": [{ "propertyName": "firstname", "operator": "EQ", "value": "Roman"}]}]}}\n',
  //       index: 0,
  //       logprobs: null,
  //       finish_reason: "stop"
  //     }
  //   ]
  // };

  if (aiResponse.data && Array.isArray(aiResponse.data.choices)) {
    return {
      error: null,
      text: aiResponse.data.choices[0].text,
      data: aiResponse.data
    };
  }
  return {
    error: null,
    text: null,
    data: null
  };
}

function saveToSearchLog(saveData) {
  const searchLog = fs.readFileSync(
    path.join(__dirname, "..", "data", "search.json"),
    "utf8"
  );
  const searchLogJSON = JSON.parse(searchLog);
  searchLogJSON.push(saveData);

  fs.writeFileSync(
    path.join(__dirname, "..", "data", "search.json"),
    JSON.stringify(searchLogJSON)
  );
}

function getSearchLog() {
  const searchLog = fs.readFileSync(
    path.join(__dirname, "..", "data", "search.json"),
    "utf8"
  );
  return JSON.parse(searchLog);
}

module.exports = {
  languageToJSON,
  saveToSearchLog,
  getSearchLog
};
