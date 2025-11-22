import { FONTS } from '../config/fonts';

export const typography = {
  // Headings using Crushed font
  h1: {
    fontFamily: FONTS.crushed,
    fontSize: 32,
    lineHeight: 38,
  },
  h2: {
    fontFamily: FONTS.crushed,
    fontSize: 28,
    lineHeight: 34,
  },
  h3: {
    fontFamily: FONTS.crushed,
    fontSize: 24,
    lineHeight: 30,
  },
  
  // Body text using Albert Sans
  body: {
    fontFamily: FONTS.albertSans.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FONTS.albertSans.medium,
    fontSize: 16,
    lineHeight: 24,
  },
  bodyBold: {
    fontFamily: FONTS.albertSans.bold,
    fontSize: 16,
    lineHeight: 24,
  },
  
  // Small text
  caption: {
    fontFamily: FONTS.albertSans.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  captionMedium: {
    fontFamily: FONTS.albertSans.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  
  // Button text
  button: {
    fontFamily: FONTS.albertSans.semiBold,
    fontSize: 16,
    lineHeight: 20,
  },
  
  // Navigation text
  tabLabel: {
    fontFamily: FONTS.albertSans.medium,
    fontSize: 12,
    lineHeight: 16,
  },
};