import { z } from 'zod';
import { env } from '~/env/server.mjs';

const zTMDBMovieSearchResult = z.object({
  id: z.number(),
  title: z.string(),
  genre_ids: z.number().array(),
  release_date: z.string().nullish(),
  overview: z.string(),
  original_title: z.string(),
  original_language: z.string(),
  popularity: z.number(),
  vote_count: z.number(),
  video: z.boolean(),
  vote_average: z.number().nullable(),
  adult: z.boolean(),
  poster_path: z.string().startsWith('/').nullable(),
  backdrop_path: z.string().nullable(),
});

const zTMDBTVShowSearchResult = z.object({
  id: z.number(),
  name: z.string(),
  genre_ids: z.number().array(),
  first_air_date: z.string().nullish(),
  overview: z.string(),
  original_name: z.string(),
  original_language: z.string(),
  popularity: z.number(),
  vote_count: z.number(),
  vote_average: z.number().nullable(),
  poster_path: z.string().startsWith('/').nullable(),
  origin_country: z.string().array(),
  backdrop_path: z.string().nullable(),
});

const createPaginatedResult = <T extends z.ZodTypeAny>(result: T) =>
  z.object({
    page: z.number(),
    results: result.array(),
    total_pages: z.number(),
    total_results: z.number(),
  });

const zTMDBMoviePaginatedSearchResult = createPaginatedResult(zTMDBMovieSearchResult);
const zTMDBTVShowPaginatedSearchResult = createPaginatedResult(zTMDBTVShowSearchResult);

export const zMovieSearchResult = zTMDBMovieSearchResult.transform((result) => ({
  id: String(result.id),
  title: result.title,
  rating: result.vote_average,
}));

const buildUrl = (path: string, queryParams: Record<string, string>) => {
  const url = new URL(`${env.MOVIEDB_API_V3_URL}/${path}`);
  Object.entries(queryParams).forEach(([key, value]) => url.searchParams.set(key, value));
  url.searchParams.set('api_key', env.MOVIEDB_API_V3_KEY);
  url.searchParams.set('language', 'en-US');

  return url;
};

export const searchTMDB = async (query: string) => {
  const movies = await searchTMDBMovies(query);
  const tvShows = await searchTMDBTvShows(query);

  return { movies, tvShows };
};

export const searchTMDBTvShows = async (query: string) => {
  const url = buildUrl('search/tv', { query });
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }

  const parseResult = zTMDBTVShowPaginatedSearchResult.safeParse(await response.json());

  if (!parseResult.success) {
    console.log('Failed to parse tv show search response');
    return [];
  }

  return parseResult.data.results.map((result) => ({
    id: result.id,
    name: result.name,
    image: result.poster_path,
    popularity: result.popularity,
  }));
};

export const searchTMDBMovies = async (query: string) => {
  const url = buildUrl('search/movie', { query });
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }

  const parseResult = zTMDBMoviePaginatedSearchResult.safeParse(await response.json());

  if (!parseResult.success) {
    console.log('Failed to parse movie search response');
    return [];
  }

  return parseResult.data.results.map((result) => ({
    id: result.id,
    name: result.title,
    image: result.poster_path,
    popularity: result.popularity,
  }));
};
