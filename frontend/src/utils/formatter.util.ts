export const formatNumberPrecission = (
  value: number | undefined,
  precission: number,
): number => {
  if (!value) return 0;
  return +value.toFixed(precission);
};

export const booleanToYesNo = (value: boolean | undefined): 'Yes' | 'No' => {
  return value ? 'Yes' : 'No';
};

export const getKyivLocalTimeString = (): string => {
  const time = new Date().toLocaleTimeString('uk', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
  });
  return `${time} EEST`;
};

export const convertDateStringToKyivTimeString = (
  value: string | undefined,
): string => {
  const time = (value ? new Date(value) : new Date()).toLocaleTimeString('uk', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
  });
  return `${time} EEST`;
};
