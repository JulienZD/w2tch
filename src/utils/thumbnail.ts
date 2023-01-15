import { ExternalWatchableSource } from '@prisma/client';

type ThumbnailSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

type TMDBImageSize = 'w92' | 'w185' | 'w342' | 'w500' | 'w780';

const tmdbSizes = {
  xs: 'w92',
  sm: 'w185',
  md: 'w342',
  lg: 'w500',
  xl: 'w780',
} satisfies Record<ThumbnailSize, TMDBImageSize>;

export const thumbnail = (source: ExternalWatchableSource, image: string, size: ThumbnailSize) => {
  if (source === ExternalWatchableSource.TMDB) {
    const tmdbSize = tmdbSizes[size];
    return `https://image.tmdb.org/t/p/${tmdbSize}${image}`;
  }

  return image;
};
