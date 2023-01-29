import { WatchableType } from '@prisma/client';
import { z } from 'zod';

// Important to keep this in sync with WatchableType
export const TMDBEntryTypes = [WatchableType.MOVIE, WatchableType.TV_SHOW] as const;

export type TMDBEntryType = keyof typeof WatchableType;

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

export const zTMDBMoviePaginatedSearchResult = createPaginatedResult(zTMDBMovieSearchResult);
export const zTMDBTVShowPaginatedSearchResult = createPaginatedResult(zTMDBTVShowSearchResult);

export const zMovieSearchResult = zTMDBMovieSearchResult.transform((result) => ({
  id: String(result.id),
  title: result.title,
  rating: result.vote_average,
}));

export const zTMDBMovieDetailsResult = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  belongs_to_collection: z
    .object({
      id: z.number(),
      name: z.string(),
      poster_path: z.string().nullable(),
      backdrop_path: z.string().nullable(),
    })
    .nullable(),
  budget: z.number(),
  genres: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array(),
  homepage: z.string().nullable(),
  id: z.number(),
  imdb_id: z.string().nullable(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string().nullable(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z
    .object({
      id: z.number(),
      logo_path: z.string().nullable(),
      name: z.string(),
      origin_country: z.string(),
    })
    .array(),
  production_countries: z
    .object({
      iso_3166_1: z.string(),
      name: z.string(),
    })
    .array(),
  release_date: z.string(),
  revenue: z.number(),
  runtime: z.number().nullable(),
  spoken_languages: z
    .object({
      iso_639_1: z.string(),
      name: z.string(),
    })
    .array(),
  status: z.string(),
  tagline: z.string().nullable(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
});

export const zTMDBTvShowDetailsResult = z.object({
  backdrop_path: z.string().nullable(),
  created_by: z
    .object({
      id: z.number(),
      credit_id: z.string(),
      name: z.string(),
      gender: z.number(),
      profile_path: z.string().nullable(),
    })
    .array(),
  episode_run_time: z.number().array(),
  first_air_date: z.string(),
  genres: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .array(),
  homepage: z.string(),
  id: z.number(),
  in_production: z.boolean(),
  languages: z.string().array(),
  last_air_date: z.string(),
  last_episode_to_air: z.object({
    air_date: z.string(),
    episode_number: z.number(),
    id: z.number(),
    name: z.string(),
    overview: z.string(),
    production_code: z.string(),
    season_number: z.number(),
    still_path: z.string().nullable(),
    vote_average: z.number(),
    vote_count: z.number(),
  }),
  name: z.string(),
  networks: z
    .object({
      name: z.string(),
      id: z.number(),
      logo_path: z.string().nullable(),
      origin_country: z.string(),
    })
    .array(),
  number_of_episodes: z.number().catch(() => 0),
  number_of_seasons: z.number().catch(() => 0),
  origin_country: z.string().array(),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  production_companies: z
    .object({
      id: z.number(),
      logo_path: z.string().nullable(),
      name: z.string(),
      origin_country: z.string(),
    })
    .array(),
  seasons: z
    .object({
      air_date: z.string().nullable(),
      episode_count: z.number(),
      id: z.number(),
      name: z.string(),
      overview: z.string(),
      poster_path: z.string().nullable(),
      season_number: z.number(),
    })
    .array(),
  status: z.string(),
  tagline: z.string(),
  type: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
});
