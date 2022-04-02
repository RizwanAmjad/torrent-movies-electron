const { dialog } = require("@electron/remote");

const TorrentSearchApi = require("torrent-search-api");
TorrentSearchApi.enableProvider("1337x");

const { openMovie, playMovie, clearDownloads } = require("./torrent");

const searchForm = document.getElementById("search-form");
const searchButton = document.getElementById("search-button");

const playButton = document.getElementById("play-button");
const clearDownloadsButton = document.getElementById("clear-downloads-button");

const statusText = document.getElementById("status-text");
const movieText = document.getElementById("movie-text");
const speedText = document.getElementById("speed-text");
const progressText = document.getElementById("progress-text");

playButton.addEventListener("click", playMovie);
clearDownloadsButton.addEventListener("click", async () => {
  const { response } = await dialog.showMessageBox({
    type: "question",
    title: "Clear Downloads?",
    message:
      "Are you sure to Clear downloads. Downloads will go to Trash Folder",
    buttons: ["Yes", "No"],
  });

  if (response == 0) clearDownloads();
});

searchForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  searchButton.disabled = true;
  const formData = new FormData(this);
  const searchQuery = formData.get("query");

  const torrentResult = await TorrentSearchApi.search(
    searchQuery,
    "Movies",
    20
  );

  searchButton.disabled = false;

  showMovies(torrentResult);
});

function showMovies(movies) {
  const moviesList = document.getElementById("movies-list");
  movies.forEach((movie) => {
    const movieItem = document.createElement("li");
    movieItem.innerHTML = `${movie.title.substring(0, 35)}... - Seeds ${
      movie.seeds
    } - Peers ${movie.peers} - Size ${movie.size}`;
    movieItem.title = movie.title;
    movieItem.classList.add("list-group-item", "cursor-pointer", "p-3");

    movieItem.addEventListener("click", async () => {
      movieText.innerText = movie.title;
      openMovie(
        await TorrentSearchApi.getMagnet(movie),
        (speed, progress) => {
          speedText.innerText = `${(speed / 1024).toFixed(2)}KB/s`;
          progressText.innerText = `${(progress * 100).toFixed(2)}%`;
        },
        (status) => {
          statusText.innerHTML = status;
        }
      );
    });
    moviesList.appendChild(movieItem);
  });
}
