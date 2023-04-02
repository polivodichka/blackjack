export function makeColorDarker(color: string) {
  // Извлекаем компоненты цвета из строки
  let red = parseInt(color.substring(1, 3), 16);
  let green = parseInt(color.substring(3, 5), 16);
  let blue = parseInt(color.substring(5, 7), 16);

  // Уменьшаем значение каждой компоненты на 10%
  red = Math.floor(red * 0.8);
  green = Math.floor(green * 0.8);
  blue = Math.floor(blue * 0.8);

  // Преобразуем компоненты обратно в строку и объединяем их
  let darkColor =
    "#" +
    red.toString(16).padStart(2, "0") +
    green.toString(16).padStart(2, "0") +
    blue.toString(16).padStart(2, "0");

  return darkColor;
}

export function getRandomBrightColor() {
  // Генерируем случайные значения красного, зеленого и синего цветов в диапазоне от 0 до 255
  let red = Math.floor(Math.random() * 256);
  let green = Math.floor(Math.random() * 256);
  let blue = Math.floor(Math.random() * 256);

  // Преобразуем каждую компоненту цвета в шестнадцатеричное число и объединяем их в строку
  let color =
    "#" +
    red.toString(16).padStart(2, "0") +
    green.toString(16).padStart(2, "0") +
    blue.toString(16).padStart(2, "0");

  return color;
}
