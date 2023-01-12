/* eslint-disable @typescript-eslint/no-non-null-assertion */
// Inspired by https://stackoverflow.com/a/71098593/16573484
import tailwindConfig from '../../tailwind.config.cjs';
import { useMediaQuery } from './useMediaQuery';
import resolveConfig from 'tailwindcss/resolveConfig';

const fullConfig = resolveConfig(tailwindConfig);

type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = fullConfig.theme!.screens as unknown as Record<BreakpointKey, number>;

export const useBreakpoint = <K extends BreakpointKey>(breakpointKey: K) => {
  type Key = `is${Capitalize<K>}`;

  const bool = useMediaQuery(`(min-width: ${breakpoints[breakpointKey]})`);
  const capitalizedKey = breakpointKey[0]!.toUpperCase() + breakpointKey.substring(1);

  return {
    [`is${capitalizedKey}`]: bool,
  } as Record<Key, boolean>;
};
