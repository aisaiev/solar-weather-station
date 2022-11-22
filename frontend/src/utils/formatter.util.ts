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
  return new Date().toLocaleTimeString('us', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
  });
};

export const convertDateStringToKyivTimeString = (
  value: string | undefined,
): string => {
  return (value ? new Date(value) : new Date()).toLocaleTimeString('us', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
  });
};

export const convertDateStringToKyivDateTimeString = (
  value: string | undefined
): string => {
  return (value ? new Date(value) : new Date()).toLocaleDateString('us', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
  });
};
