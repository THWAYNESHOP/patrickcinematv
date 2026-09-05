export type ScalingMode = 'fit' | 'stretch' | 'zoom' | 'crop' | '16:9' | '4:3';

export const SCALING_MODES: { label: string; value: ScalingMode }[] = [
  { label: 'Fit', value: 'fit' },
  { label: 'Stretch', value: 'stretch' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Crop', value: 'crop' },
  { label: '16:9', value: '16:9' },
  { label: '4:3', value: '4:3' },
];
