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

export const toLocaleDateStringFormat = {
  month: "short" as const,
  day: "numeric" as const,
  year: "numeric" as const,
  hour: "2-digit" as const,
  minute: "2-digit" as const,
};

export const toLocaleDateString = (date: Date, compact = false) =>
  date.toLocaleDateString("en-US", {
    month: toLocaleDateStringFormat.month,
    day: toLocaleDateStringFormat.day,
    year: compact ? undefined : toLocaleDateStringFormat.year,
  });

export const timestampToHumanReadable = (unixTimestamp: number) =>
  toLocaleDateString(new Date(unixTimestamp * 1000));

export const formatRelativeTime = (
  date: Date,
  referenceTime: Date = new Date(),
): string => {
  const diffMs = date.getTime() - referenceTime.getTime();
  const dayMs = toMilliseconds.fromDays(1);
  const diffDays = Math.ceil(diffMs / dayMs);

  if (diffDays < 0) return "Past due";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays < 7) return `${diffDays} days`;

  return toLocaleDateString(date);
};
