import Svg, { Circle, Rect } from 'react-native-svg';

import { MOTIFS, type MotifPalette } from './motifs';
import { CATEGORY_COLORS, type ActivityCategory } from '../../features/planning/types';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * The picture on an activity card: a wash in the app's sage, a soft light, and one drawing.
 *
 * Drawn rather than photographed. The forty-eight photographs were specified, costed and never
 * generated, and in the meantime every activity showed one of nine category pictures — so none of
 * them showed what the activity actually was. Drawing them costs nothing, weighs nothing in the
 * bundle, follows the theme into dark mode, and stays sharp at any size.
 *
 * `slice` makes this behave like `resizeMode="cover"`: the square is filled, and in the wide
 * detail header the top and bottom are cropped. motifs.tsx keeps every drawing inside the band
 * that survives.
 */
function ActivityIllustration({ category, slug }: { category: ActivityCategory; slug: string }) {
  const theme = useTheme();
  const motif = MOTIFS[slug];

  const palette: MotifPalette = {
    line: theme.primary900,
    accent: CATEGORY_COLORS[category],
    soft: theme.sage300,
  };
  return (
    <Svg width="100%" height="100%" viewBox="0 0 64 64" preserveAspectRatio="xMidYMid slice">
      {/* Two flat shapes rather than a gradient: react-native-svg resolves gradient ids per
          document, and several of these render side by side on the same screen. */}
      <Rect x={0} y={0} width={64} height={64} fill={theme.sage200} />
      <Circle cx={48} cy={12} r={26} fill={theme.sage100} />
      <Circle cx={48} cy={12} r={14} fill={palette.accent} opacity={0.1} />
      {motif(palette)}
    </Svg>
  );
}

/**
 * The drawing for an activity, or nothing at all.
 *
 * Returning undefined rather than a component that renders null is the whole point: Thumbnail
 * decides between a drawing and the category icon by whether it was given one, and a React
 * element is truthy even when it draws nothing. A row added to the catalogue after this build
 * shipped would otherwise get a blank card instead of its icon.
 */
export function activityIllustration(category: ActivityCategory, slug?: string | null) {
  return slug && MOTIFS[slug] ? <ActivityIllustration category={category} slug={slug} /> : undefined;
}
