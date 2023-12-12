import { useEffect, useState, useRef, useCallback } from "react";
import StarRating from "./StarRating";
import { useMovies, KEY } from "./hooks/useMovies";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useKeyPress } from "./hooks/useKeyPress";

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// const initialWatched = JSON.parse(localStorage.getItem("watched")) || [];

export default function App() {
  // const [watched, setWatched] = useState(initialWatched);

  const [selectedId, setSelectedId] = useState(null);
  const [result, setResult] = useState("");

  const { movies, isLoading, errorMsg } = useMovies(
    result,
    useCallback(movieDetailCloseHandler, [])
  );
  const [watched, setWatched] = useLocalStorage([], "watched");

  useKeyPress(
    "Escape",
    useCallback(() => setResult(""), [setResult])
  );

  function movieDetailHandler(id) {
    setSelectedId((oldId) => (oldId === id ? null : id));
  }
  function movieDetailCloseHandler() {
    setSelectedId(null);
  }
  function movieWatchedHandler(movie) {
    setWatched((watchedList) => [...watchedList, movie]);
  }

  return (
    <>
      <NavBar>
        <Logo />
        <Search query={result} setResult={setResult} />
        <NumResult movies={movies} />
      </NavBar>
      <Main>
        <ContentBox>
          {errorMsg === "" && !isLoading && movies.length > 0 && (
            <MovieList movies={movies} onSelected={movieDetailHandler} />
          )}
          {errorMsg !== "" ? (
            <Loader text={errorMsg} />
          ) : isLoading ? (
            <Loader text="Loading..." />
          ) : movies.length <= 0 ? (
            <Loader text="No Result" />
          ) : null}
        </ContentBox>
        <ContentBox>
          {selectedId ? (
            <MovieDetails
              watched={watched}
              selectedId={selectedId}
              onMovieClick={movieDetailCloseHandler}
              onMovieWatched={movieWatchedHandler}
            />
          ) : (
            <>
              <SummaryCard watched={watched} />
              <MovieList
                movies={watched}
                cardType={2}
                onSelected={movieDetailHandler}
              />
            </>
          )}
        </ContentBox>
      </Main>
    </>
  );
}

function Loader({ text, className = "loader" }) {
  return <p className={className}>{text}</p>;
}

//header
function NavBar({ children }) {
  return <nav className="nav-bar">{children}</nav>;
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setResult }) {
  const searchRef = useRef(null);
  useKeyPress(
    "Enter",
    useCallback(() => {
      if (document.activeElement === searchRef.current) return;
      searchRef.current.focus();
    }, [searchRef])
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setResult(e.target.value)}
      ref={searchRef}
    />
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

//content
function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ContentBox({ children }) {
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

function MovieList({ movies, cardType = 1, onSelected }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) =>
        cardType === 1 ? (
          <MovieCard1
            key={movie.imdbID}
            movie={movie}
            onSelected={onSelected}
          />
        ) : (
          <MovieCard2
            key={movie.imdbID}
            movie={movie}
            onSelected={onSelected}
          />
        )
      )}
    </ul>
  );
}

function SummaryCard({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <InfoItem icon={"#️⃣"} text={watched.length} />
        <InfoItem icon={"⭐️"} text={avgImdbRating.toFixed(1)} />
        <InfoItem icon={"🌟"} text={avgUserRating.toFixed(1)} />
        <InfoItem icon={"⏳"} text={`${avgRuntime.toFixed(0)} min`} />
      </div>
    </div>
  );
}

//reuseable components
function MovieCard1({ movie, onSelected }) {
  return (
    <li onClick={() => onSelected(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <InfoItem icon={"🗓"} text={movie.Year} />
      </div>
    </li>
  );
}

function MovieCard2({ movie, onSelected }) {
  return (
    <li onClick={() => onSelected(movie.imdbID)}>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <InfoItem icon={"⭐️"} text={movie.imdbRating} />
        <InfoItem icon={"🌟"} text={movie.userRating} />
        <InfoItem icon={"⏳"} text={`${movie.runtime} min`} />
      </div>
    </li>
  );
}

function InfoItem({ icon, text }) {
  return (
    <p>
      <span>{icon}</span>
      <span>{text}</span>
    </p>
  );
}

function MovieDetails({ watched, selectedId, onMovieClick, onMovieWatched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const movieIndex = watched.findIndex((movie) => movie.imdbID === selectedId);

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
    imdbRating,
  } = movie;
  useEffect(() => {
    const keyUpHandler = () => {
      onMovieClick();
    };
    document.addEventListener("keyup", keyUpHandler);
    return function () {
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, [onMovieClick]);
  useEffect(() => {
    const getMovieDetail = async () => {
      setIsLoading(true);
      const res = await fetch(
        `https://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    };
    if (movieIndex >= 0) {
      setMovie({
        Title: watched[movieIndex].title,
        Year: watched[movieIndex].year,
        Poster: watched[movieIndex].poster,
        Runtime: watched[movieIndex].runtime,
        Plot: watched[movieIndex].plot,
        Released: watched[movieIndex].released,
        Actors: watched[movieIndex].actors,
        Director: watched[movieIndex].director,
        Genre: watched[movieIndex].genre,
        imdbRating: watched[movieIndex].imdbRating,
      });
      setUserRating(watched[movieIndex].userRating);
    } else {
      getMovieDetail();
    }
  }, [selectedId, movieIndex, watched]);

  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return function () {
      document.title = "usePopcorn";
    };
  }, [title]);

  const addHandler = () => {
    onMovieWatched({
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: +imdbRating,
      runtime: +runtime.split(" ").at(0),
      userRating: userRating,
      plot,
      actors,
      director,
    });
    onMovieClick();
  };
  return (
    <div className="details">
      {isLoading ? (
        <Loader text="Loading..." />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onMovieClick}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {movieIndex < 0 ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onCallBack={setUserRating}
                  />
                  <button className="btn-add" onClick={addHandler}>
                    + Add to list
                  </button>
                </>
              ) : (
                <p>
                  You rated with movie {userRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
