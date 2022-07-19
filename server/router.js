const router = require("express").Router();

const axios = require("axios");
const { hubApiKey } = require("../config/index");
const {
  languageToJSON,
  saveToSearchLog,
  getSearchLog,
  getExample,
  saveExample
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
      const url = `https://api.hubapi.com/crm/v3/objects/${ObjectCRM}/search`;
      responseData.url = url;
      const { data, status } = await axios({
        method: "post",
        url,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hubApiKey}`
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
  const settings = getExample();
  response.render("settings", {
    settings
  });
});

router.post("/api/v1/settings", (request, response) => {
  const settings = request.body?.prompt || "";
  saveExample(settings);
  response.render("settings.ejs", {
    settings: settings
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
