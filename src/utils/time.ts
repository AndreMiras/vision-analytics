export const toSeconds = {
  fromMinutes: (minutes: number) => minutes * 60,
  fromHours: (hours: number) => hours * toSeconds.fromMinutes(60),
  fromDays: (days: number) => days * toSeconds.fromHours(24),
};

export const toMilliseconds = {
  fromSeconds: (seconds: number) => seconds * 1000,
  fromMinutes: (minutes: number) => minutes * toMilliseconds.fromSeconds(60),
  fromHours: (hours: number) => hours * toMilliseconds.fromMinutes(60),
  fromDays: (days: number) => days * toMilliseconds.fromHours(24),
};
