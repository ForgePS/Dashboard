const { onRequest } = require("firebase-functions/v2/https");
const { app, startBackgroundWork } = require("./server");

startBackgroundWork();

exports.api = onRequest(
  {
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 60,
    secrets: [
      "ACTIVE911_ACCESS_TOKEN",
      "ACTIVE911_REFRESH_TOKEN",
      "ACTIVE911_CLIENT_ID",
      "GOOGLE_MAPS_API_KEY"
    ]
  },
  app
);
