import {
  useFonts,
  Crushed_400Regular,
} from '@expo-google-fonts/crushed';

import {
  AlbertSans_100Thin,
  AlbertSans_200ExtraLight,
  AlbertSans_300Light,
  AlbertSans_400Regular,
  AlbertSans_500Medium,
  AlbertSans_600SemiBold,
  AlbertSans_700Bold,
  AlbertSans_800ExtraBold,
  AlbertSans_900Black,
} from '@expo-google-fonts/albert-sans';

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    Crushed_400Regular,
    AlbertSans_100Thin,
    AlbertSans_200ExtraLight,
    AlbertSans_300Light,
    AlbertSans_400Regular,
    AlbertSans_500Medium,
    AlbertSans_600SemiBold,
    AlbertSans_700Bold,
    AlbertSans_800ExtraBold,
    AlbertSans_900Black,
  });

  return fontsLoaded;
};

// Font family constants for easy use across the app
export const FONTS = {
  crushed: 'Crushed_400Regular',
  albertSans: {
    thin: 'AlbertSans_100Thin',
    extraLight: 'AlbertSans_200ExtraLight',
    light: 'AlbertSans_300Light',
    regular: 'AlbertSans_400Regular',
    medium: 'AlbertSans_500Medium',
    semiBold: 'AlbertSans_600SemiBold',
    bold: 'AlbertSans_700Bold',
    extraBold: 'AlbertSans_800ExtraBold',
    black: 'AlbertSans_900Black',
  },
};