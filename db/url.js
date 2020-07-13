const mongoose = require("mongoose");

mongoose.connect("mongodb://localhost:27017/test", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UrlSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    images: [
      {
        fileName: String,
        remoteFile: String,
        localFile: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Url', UrlSchema);
