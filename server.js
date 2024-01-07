const express = require("express");
const StreamAudio = require("ytdl-core");
const app = express();
const port = process.env.PORT || 4000;
const cors = require("cors");
const fs = require("fs");

app.use(cors());
app.use(express.static("./"));

app.get("/", async (req, res) => {
  try {
    const Link = req.query.url;
    if (!Link) {
      res.status(400).json({ error: "url not provided" });
      return;
    }
    const SongId = StreamAudio.getVideoID(Link);

    if (fs.existsSync(`music/${SongId}.mp4`)) {
      SendStream(res, SongId);
    } else {
      const Download = StreamAudio(Link, {
        filter: "videoandaudio",
        quality: "highestvideo",
      }).pipe(fs.createWriteStream(`music/${SongId}.mp4`));
      Download.on("finish", () => {
        SendStream(res, SongId);
      });
    }
  } catch (error) {
    res.status(500).json({ Error: error.message });
  }
});

function SendStream(res, Id) {
  try {
    const Data = fs.statSync(`music/${Id}.mp4`);
    const file = fs.createReadStream(`music/${Id}.mp4`);
  
    res.setHeader("content-type", "audio/mp3");
    res.setHeader("content-length", Data.size);
     
    console.log("streaming");
     
    file.pipe(res);
    
  } catch (error) {
    console.log(error);
  }
 
}

app.listen(port, () => {
  console.log(`http://localhost:${port}`);
});

module.exports = app;
