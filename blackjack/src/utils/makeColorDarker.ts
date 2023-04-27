export function makeColorDarker(color: string, percents: number): string {
  let red = parseInt(color.substring(1, 3), 16);
  let green = parseInt(color.substring(3, 5), 16);
  let blue = parseInt(color.substring(5, 7), 16);

  red = Math.floor(red * (1 - percents / 100));
  green = Math.floor(green * (1 - percents / 100));
  blue = Math.floor(blue * (1 - percents / 100));

  const darkColor = `#${red.toString(16).padStart(2, '0')}${green
    .toString(16)
    .padStart(2, '0')}${blue.toString(16).padStart(2, '0')}`;

  return darkColor;
}
