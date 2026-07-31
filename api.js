const BASE_URL = "https://api.themoviedb.org/3";

async function fetchPopularMovies() {
    const response = await fetch(
        `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
    );

    if (!response.ok) {
        throw new Error(`TMDB request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
}