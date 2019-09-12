import React from "react";
import debounce from "lodash/debounce";
import queryString from "query-string";
import "./App.css";

const api = "https://api.github.com/search/repositories";
const fetchRepo = async (q, page = 1) => {
  const query = queryString.stringify({ q, page, per_page: 10 });
  const request = `${api}?${query}`;
  const res = await fetch(request);
  return res.json();
};

function App() {
  const [search, setSearch] = React.useState("");
  const [result, setResult] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const query = React.useRef(
    debounce(async search => {
      if (loading) {
        return;
      }
      setLoading(true);
      const data = await fetchRepo(search);
      setPage(2);
      setLoading(false);
      if (data.items) {
        setResult(data.items);
      } else if (data.message) {
        setResult([]);
        setError(data.message);
      }
    }, 500)
  ).current;

  const updateSearch = e => {
    setSearch(e.target.value);
  };

  React.useEffect(() => {
    setError("");
    if (search) {
      query(search);
    } else {
      setResult([]);
    }
  }, [query, search]);

  React.useEffect(() => {
    window.onscroll = async () => {
      if (window.scrollY + window.innerHeight === document.body.scrollHeight) {
        setError("");
        if (search && !loading) {
          setLoading(true);
          const data = await fetchRepo(search, page);
          setPage(page => page + 1);
          setLoading(false);
          if (data.items) {
            setResult([...result, ...data.items]);
          } else if (data.message) {
            setError(data.message);
          }
        }
      }
    };
    return () => {
      window.onscroll = () => {};
    };
  }, [loading, page, query, result, search]);

  return (
    <div className="App">
      <div className="header">Github Repo Search</div>
      <input className="input" value={search} onChange={updateSearch} />
      {result.map(repo => (
        <div className="repo" key={repo.id}>
          <a className="repo-name" href={repo.html_url} target="__blank">
            {repo.full_name}
          </a>
          <div className="repo-info">
            <div>Stars: {repo.watchers}</div>
            &nbsp;|&nbsp;
            <div>Forks: {repo.forks}</div>
          </div>
        </div>
      ))}
      {loading && <div className="loading">Loading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
