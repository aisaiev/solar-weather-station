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
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
  });
};

export const convertDateStringToKyivTimeString = (
  value: string | undefined,
): string => {
  return (value ? new Date(value) : new Date()).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
  });
};

export const convertDateStringToKyivDateTimeString = (
  value: string | undefined,
): string => {
  return (value ? new Date(value) : new Date()).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Kiev',
    timeZoneName: 'short',
  });
};

export const uvIndexToText = (
  uvRisk: number | undefined,
  uvIndex: number | undefined,
): string => {
  if (uvRisk === undefined || uvIndex === undefined) return 'N/A';
  if (uvRisk === 99) return 'Out of range';
  if (uvIndex === 1) return 'Low';
  if (uvIndex === 2) return 'Mid';
  if (uvIndex === 3) return 'High';
  if (uvIndex === 4) return 'Danger';
  if (uvIndex === 5) return 'Burn level 1/2';
  if (uvIndex === 6) return 'Burn level 3';
  if (uvIndex === 7) return 'Extreme';
  return 'Out of range';
};

export const formatUvPower = (value: number | undefined): number => {
  if (!value) return 0;
  const [valueIntPart, valueDecPart] = `${value}`.split('.');
  if (!valueDecPart) return value;
  let valueNewDecPart = '';
  for (let i = 0; i < valueDecPart.length; i++) {
    valueNewDecPart += valueDecPart[i];
    if (`${+valueNewDecPart}`.length === 3) break;
  }
  return +`${valueIntPart}.${valueNewDecPart}`;
};
