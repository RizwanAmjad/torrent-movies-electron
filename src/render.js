const TorrentSearchApi = require("torrent-search-api");
TorrentSearchApi.enableProvider("1337x");

const { openMovie, playMovie, stopMovie } = require("./torrent");

const searchForm = document.getElementById("search-form");
const searchButton = document.getElementById("search-button");

const playButton = document.getElementById("play-button");
const pauseButton = document.getElementById("pause-button");

const statusText = document.getElementById("status-text");
const movieText = document.getElementById("movie-text");
const speedText = document.getElementById("speed-text");
const progressText = document.getElementById("progress-text");

playButton.addEventListener("click", playMovie);
pauseButton.addEventListener("click", stopMovie);

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
