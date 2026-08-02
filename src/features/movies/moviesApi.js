const TMDB_BASE_URL = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w342";

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Normalizes a raw TMDB result into the shared movie data structure used
// throughout the app: { id, title, poster, rating, overview }
export function mapToMovie(raw) {
    return {
        id: raw.id,
        title: raw.title || "Untitled",
        poster: raw.poster_path ? `${TMDB_IMAGE_BASE_URL}${raw.poster_path}` : null,
        rating: typeof raw.vote_average === "number" ? raw.vote_average.toFixed(1) : "N/A",
        overview: raw.overview || "No description available.",
    };
}

export async function fetchPopularMovies() {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`);

    if (!response.ok) {
        throw new Error(`TMDB request failed with status ${response.status}`);
    }

    const data = await response.json();
    return (data.results || []).map(mapToMovie);
}

export async function searchMovies(query) {
    const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`TMDB request failed with status ${response.status}`);
    }

    const data = await response.json();
    return (data.results || []).map(mapToMovie);
}
