const WebTorrent = require("webtorrent");
const { app, shell } = require("@electron/remote");

const path = require("path");

const client = new WebTorrent();

const downloadsFolder = path.join(app.getPath("downloads"), "torrent-movies");

let nowPlaying = null;

function clearDownloads() {
  shell.trashItem(downloadsFolder);
}

function setNowPlaying(torrent) {
  if (nowPlaying && nowPlaying != torrent) {
    client.torrents.forEach((torrent) => torrent.destroy());
    clearDownloads();
  }
  nowPlaying = torrent;
}

const openMovie = async (magnet, handleDownloadUpdates, handleStatus) => {
  const torrent = client.add(magnet, { path: downloadsFolder });

  torrent.on("infoHash", () => handleStatus("Info Hash"));
  torrent.on("metadata", () => handleStatus("Meta Data"));
  torrent.on("ready", () => {
    handleStatus("Ready, Downloading");
  });

  torrent.on("done", () => {
    handleStatus("Done");
    torrent.destroy();
  });
  torrent.on("download", function () {
    handleDownloadUpdates(torrent.downloadSpeed, torrent.progress);
  });
  setNowPlaying(torrent);
};

function playMovie() {
  if (nowPlaying)
    nowPlaying.files.forEach(function (file) {
      // open the file in vlc
      console.log(file);
      shell.openPath(file.path);
    });
}

function stopMovie() {
  if (nowPlaying) nowPlaying.destroy();
}

module.exports = { openMovie, playMovie, stopMovie };
