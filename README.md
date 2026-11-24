# CineScope

CineScope is a responsive movie discovery web application. It loads movie data from an external API and lets users search, filter, sort, view details, browse pages, and save favorites.

## Features

- Browse paginated movie results
- Search movies by title, overview, or cast
- Filter movies by minimum rating
- Sort by rating, title, and release date
- View a movie details modal with cast information
- Add or remove movies from a personal watchlist
- Persist watchlist items with browser local storage
- Responsive movie grid and loading/error states

## Technologies

- HTML5
- CSS3
- JavaScript
- jQuery
- JSON Fakery Movies API

## Project Structure

```text
FakeApiRequest/
|-- index.html
|-- README.md
`-- assets/
    |-- css/
    |   `-- style.css
    `-- js/
        `-- script.js
```

## Getting Started

1. Clone or download this repository.
2. Open the `FakeApiRequest` folder.
3. Start a local server:

```bash
python -m http.server 8000
```

4. Visit `http://localhost:8000` in your browser.

You can also open `index.html` directly, but a local server is recommended.

## API

The application retrieves paginated movie data from:

```text
https://jsonfakery.com/movies/paginated
```

Example request:

```text
https://jsonfakery.com/movies/paginated?page=1
```

An internet connection is required to load movie data and poster images.
