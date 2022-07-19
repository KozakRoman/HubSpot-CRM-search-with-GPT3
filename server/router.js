const router = require("express").Router();

const axios = require("axios");
const { hubApiKey } = require("../config/index");
const {
  languageToJSON,
  saveToSearchLog,
  getSearchLog
} = require("../services/index");

router.post("/api/v1/search", (request, response) => {
  const queryString = request.body.search || null;
  const responseData = {
    error: null,
    response: null,
    queryString: queryString
  };

  if (!queryString) {
    responseData.error = "No query string provided";
    return response.json(responseData);
  }

  languageToJSON(queryString).then(async resp => {
    if (resp.error) {
      responseData.error = "AI transformation error";
      return response.json(responseData);
    }

    const saveData = {
      queryString: queryString,
      queryObjectString: resp.text ?? "",
      createdAt: new Date().toISOString()
    };

    responseData.queryObjectString = resp.text ?? null;

    let searchParameters;
    try {
      searchParameters = JSON.parse(resp.text);
    } catch (error) {
      console.log(error);

      saveData.error = String(error);
      saveToSearchLog(saveData);
      responseData.error = "AI transformation error";
      return response.json(responseData);
    }

    const ObjectCRM = Object.keys(searchParameters)[0];
    const searchQuery = searchParameters[ObjectCRM];

    saveData.ObjectCRM = ObjectCRM;
    saveData.searchQuery = JSON.stringify(searchQuery);

    responseData.ObjectCRM = ObjectCRM;
    responseData.searchQuery = searchQuery;

    if (ObjectCRM.toLocaleLowerCase() === "error") {
      saveToSearchLog(saveData);
      responseData.error = "Search Type is error";
      return response.json(responseData);
    }

    try {
      responseData.url = `https://api.hubapi.com/crm/v3/objects/${ObjectCRM}/search`;
      const url = `https://api.hubapi.com/crm/v3/objects/${ObjectCRM}/search?hapikey=${hubApiKey}`;
      const { data, status } = await axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json"
        },
        data: searchQuery
      });

      responseData.response = data;
    } catch (error) {
      console.log(error);
      //     data: error.response.data,
      //     status: error.response.status,
      //     headers: error.response.headers
      responseData.error = error.response?.data || "HubSpot API error";
    }

    saveToSearchLog(saveData);

    response.json(responseData);
  });
});

router.get("/api/v1/settings", (request, response) => {
  db.collection("settings")
    .doc("default")
    .get()
    .then(doc => {
      const settings = doc.data() || {};
      console.log(settings);
      response.render("settings", {
        settings
      });
    });
});

router.post("/api/v1/settings", (request, response) => {
  const settings = request.body;
  console.log(settings);
  db.collection("settings")
    .doc("default")
    .set(settings, { merge: true })
    .then(() => {
      response.render("settings.ejs", {
        settings: settings
      });
    });
});

router.get("/api/v1/log", (request, response) => {
  const reversedData = getSearchLog().reverse();
  response.render("requests", {
    data: reversedData
  });
});

router.get("/", (request, response) => {
  response.render("index");
});

module.exports = router;
