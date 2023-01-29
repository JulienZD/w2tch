import { WatchableType } from '@prisma/client';
import type { z } from 'zod';
import { env } from '~/env/server.mjs';
import {
  type TMDBEntryType,
  zTMDBMovieDetailsResult,
  zTMDBMoviePaginatedSearchResult,
  zTMDBTvShowDetailsResult,
  zTMDBTVShowPaginatedSearchResult,
} from './tmdb/models';
import * as Sentry from '@sentry/nextjs';

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

export const findTMDBEntry = async (entryId: string, type: TMDBEntryType) => {
  if (type === WatchableType.MOVIE) {
    const movie = await findTMDBMovie(entryId);
    return movie ? mapMovieToEntry(movie) : null;
  }

  const tvShow = await findTMDBTvShow(entryId);
  return tvShow ? mapTvShowToEntry(tvShow) : null;
};

export const findTMDBMovie = async (movieId: string) => {
  const url = buildUrl(`movie/${movieId}`, {});
  const response = await fetch(url);
  if (!response.ok) {
    await captureTMDBApiError(response, url);
    return null;
  }

  const parseResult = zTMDBMovieDetailsResult.safeParse(await response.json());

  if (!parseResult.success) {
    Sentry.captureException(new Error('Failed to parse movie find response', { cause: parseResult.error }), {
      extra: { movieId },
      tags: { type: 'tmdb' },
    });
    console.log('Failed to parse movie find response');
    return null;
  }

  return parseResult.data;
};

export const findTMDBTvShow = async (tvShowId: string) => {
  const url = buildUrl(`tv/${tvShowId}`, {});
  const response = await fetch(url);
  if (!response.ok) {
    await captureTMDBApiError(response, url);
    return null;
  }

  const parseResult = zTMDBTvShowDetailsResult.safeParse(await response.json());

  if (!parseResult.success) {
    Sentry.captureException(new Error('Failed to parse TV show find response', { cause: parseResult.error }), {
      extra: { tvShowId },
      tags: { type: 'tmdb' },
    });
    console.log('Failed to parse tv show find response');
    return null;
  }

  return parseResult.data;
};

export const searchTMDBTvShows = async (query: string) => {
  const url = buildUrl('search/tv', { query });
  const response = await fetch(url);
  if (!response.ok) {
    await captureTMDBApiError(response, url);
    return [];
  }

  const parseResult = zTMDBTVShowPaginatedSearchResult.safeParse(await response.json());

  if (!parseResult.success) {
    Sentry.captureException(new Error('Failed to parse TV show search response', { cause: parseResult.error }), {
      extra: { query },
      tags: { type: 'tmdb' },
    });

    console.log('Failed to parse tv show search response');
    return [];
  }

  return parseResult.data.results.map((result) => ({
    id: result.id,
    name: result.name,
    image: result.poster_path,
    popularity: result.popularity,
    rating: result.vote_average,
    overview: result.overview,
    type: WatchableType.TV_SHOW,
  }));
};

export const searchTMDBMovies = async (query: string) => {
  const url = buildUrl('search/movie', { query });
  const response = await fetch(url);
  if (!response.ok) {
    await captureTMDBApiError(response, url);
    return [];
  }

  const parseResult = zTMDBMoviePaginatedSearchResult.safeParse(await response.json());

  if (!parseResult.success) {
    Sentry.captureException(new Error('Failed to parse movie search response', { cause: parseResult.error }), {
      extra: { query },
      tags: { type: 'tmdb' },
    });
    console.log('Failed to parse movie search response');
    return [];
  }

  return parseResult.data.results.map((result) => ({
    id: result.id,
    name: result.title,
    image: result.poster_path,
    popularity: result.popularity,
    rating: result.vote_average,
    overview: result.overview,
    type: WatchableType.MOVIE,
  }));
};

const mapMovieToEntry = (movie: z.infer<typeof zTMDBMovieDetailsResult>) => {
  return {
    id: String(movie.id),
    name: movie.title,
    image: movie.poster_path,
    popularity: movie.popularity,
    rating: movie.vote_average,
    runtime: movie.runtime ?? 0,
  };
};

const mapTvShowToEntry = (tvShow: z.infer<typeof zTMDBTvShowDetailsResult>) => {
  return {
    id: String(tvShow.id),
    name: tvShow.name,
    image: tvShow.poster_path,
    popularity: tvShow.popularity,
    rating: tvShow.vote_average,
    runtime: tvShow.episode_run_time[0] ?? 0,
  };
};

const captureTMDBApiError = async (response: Response, url: URL, extra: Record<string, unknown> = {}) => {
  const urlCopy = new URL(url.toString());
  urlCopy.searchParams.delete('api_key');

  Sentry.captureException(new Error('TMDB API responded with a non-200 status code'), {
    extra: {
      requestUrl: urlCopy,
      statusCode: response.status,
      responseText: await response.text().catch(() => 'Failed to read response text'),
      ...extra,
    },
    tags: { type: 'tmdb' },
  });
};
