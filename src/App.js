import { useEffect, useRef, useState } from "react";
import React from "react";
import StarRating from "./StarRating";
import { useMovies } from "./useMovies";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ setQuery, query }) {
  const inputSearch = useRef(null);

  useKey("Enter", function () {
    if (document.activeElement === inputSearch.current) return;

    inputSearch.current.focus();
    setQuery("");
  });

  return (
    <input
      className="search"
      name="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputSearch}
    />
  );
}

function NumResult({ movieLength }) {
  return (
    <p className="num-results">
      Found <strong>{movieLength}</strong> results
    </p>
  );
}

function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function WatchSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)}</span>
        </p>
      </div>
    </div>
  );
}

function WatchedMovie({ watched, onDeleteWatch }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchMovieItem
          movie={movie}
          key={movie.imdbID}
          onDeleteWatch={onDeleteWatch}
        />
      ))}
    </ul>
  );
}

function WatchMovieItem({ movie, onDeleteWatch }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime}</span>
        </p>

        <p>
          <button
            className="btn-delete"
            onClick={() => onDeleteWatch(movie.imdbID)}
          >
            x
          </button>
        </p>
      </div>
    </li>
  );
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>

      {isOpen && children}
    </div>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Loader() {
  return <p className="loader">Loading....</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}

const key = "33f10fa0";

export default function App() {
  //const [watched, setWatched] = useState([]);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [watched, setWatched] = useLocalStorageState([], "watched");

  //select movie details
  function selectMovieHandler(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function closeMovieHandler() {
    setSelectedId(null);
  }

  function addWatchHandler(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function queryHandler(data) {
    setQuery(data);
  }

  function deleteWatchedHandler(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  const { isLoading, error, movies } = useMovies(query);

  return (
    <React.Fragment>
      <NavBar>
        <Logo />
        <Search query={query} setQuery={queryHandler} />
        <NumResult movieLength={movies.length} />
      </NavBar>

      <Main>
        <Box>
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={selectMovieHandler} />
          )}

          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={closeMovieHandler}
              onAddWatched={addWatchHandler}
              watched={watched}
            />
          ) : (
            <>
              <WatchSummary watched={watched} />
              <WatchedMovie
                watched={watched}
                onDeleteWatch={deleteWatchedHandler}
              />
            </>
          )}
        </Box>
      </Main>
    </React.Fragment>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movieDetail, setMovieDetail] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const [userRating, setUserRating] = useState("");

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);

  const watchedUserRating = watched.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movieDetail;

  //console.log(runtime);

  useKey("escape", onCloseMovie);

  useEffect(() => {
    async function fetchMovies() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://www.omdbapi.com/?i=${selectedId}&apikey=${key}`
        );

        if (!res.ok) {
          throw new Error("Something Went Wrong with Fetching the Movies.");
        }

        const data = await res.json();
        setMovieDetail(data);
        setIsLoading(false);
      } catch (err) {
        setMovieDetail(null);
      }
    }
    fetchMovies();
  }, [selectedId]);

  //for titles
  useEffect(() => {
    if (!title) return;
    document.title = `movie | ${title}`;
    return function () {
      document.title = "usePopCorn";
    };
  }, [title]);

  function addHandler() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }
  return (
    <div className="details">
      {isLoading && <Loader />}
      {!isLoading && movieDetail && (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>

            <img src={poster} alt={`poster of ${title}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released}&bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    color="gold"
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={addHandler}>
                      + Add to List
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You already rated this {watchedUserRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring: {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <MovieListItem
          movie={movie}
          key={movie.imdbID}
          addWatch={onSelectMovie}
        />
      ))}
    </ul>
  );
}

function MovieListItem({ movie, addWatch }) {
  function onAddWatched() {
    addWatch(movie.imdbID);
  }

  return (
    <React.Fragment>
      <li onClick={onAddWatched}>
        <img src={movie.Poster} alt={`${movie.Title} poster`} />
        <h3>{movie.Title}</h3>
        <div>
          <p>
            <span>🗓</span>
            <span>{movie.Year}</span>
          </p>
        </div>
      </li>
    </React.Fragment>
  );
}
