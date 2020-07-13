const axios = require("axios");
const cheerio = require("cheerio");
const Url = require("../db/url");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

const IMG_BASEURL = "/urls";
const ROOT = path.resolve(`${__dirname}/..`);

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("a user connected");

    updateClient();

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("extract", (url) => {
      console.log("io", url);
      extractImages(url, updateClient);
    });

    function updateClient() {
      console.log(new Date(), "updateClient()");
      Url.find({})
        .sort({ createdAt: -1 })
        .exec((err, urls) => {
          socket.emit("data", urls);
        });
    }
  });

  function extractImages(url, cb) {
    axios
      .get(url)
      .then((response) => {
        const $ = cheerio.load(response.data);
        let imgs_url = [];
        var newUrl = new Url({ url });
        $("img").each((i, elem) => {
          let src = $(elem).attr("src");
          let remoteFile = `${url}${src}`;
          let fileName = path.basename(src);
          let shasum = crypto.createHash("sha1");
          shasum.update(remoteFile);
          let localFile = `${IMG_BASEURL}/${shasum.digest("hex")}${path.extname(
            fileName
          )}`;
          axios({
            method: "get",
            url: remoteFile,
            responseType: "stream",
          }).then(function (imgStream) {
            imgStream.data.pipe(
              fs.createWriteStream(`${ROOT}/public/${localFile}`)
            );
          });
          newUrl.images.push({
            fileName,
            localFile,
            remoteFile,
          });
        });
        newUrl.save(cb);
        console.log(newUrl);
      })
      .catch((error) => {
        console.log(error);
      });
  }
};
