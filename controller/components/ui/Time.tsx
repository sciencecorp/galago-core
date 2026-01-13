import { Tag, Wrap } from "@chakra-ui/react";
import moment from "moment-timezone";

export const renderDate = (date: string) => moment.tz(date, "America/Los_Angeles").format("ll");

export const renderDatetime = (date: string | Date) => {
  // Prefer strict ISO parsing; if we get a non-ISO string (e.g. Date.toString()), fall back to JS Date.
  if (date instanceof Date) {
    return moment.utc(date).tz("America/Los_Angeles").format("lll");
  }

  const iso = moment.utc(date, moment.ISO_8601, true);
  if (iso.isValid()) return iso.tz("America/Los_Angeles").format("lll");

  // Fallback: let JS Date parse it (avoids moment's deprecated string parsing warning)
  const d = new Date(date);
  return moment.utc(d).tz("America/Los_Angeles").format("lll");
};

export const renderDaysSince = (start: string | Date, end?: string | Date) =>
  moment
    .tz(end || moment(), "America/Los_Angeles")
    .diff(moment.tz(start, "America/Los_Angeles"), "days");

export const renderDays = (duration: moment.Duration) => {
  return Math.floor(duration.asDays());
};

export const renderHoursAndMinutes = (duration: moment.Duration) => {
  return `${duration.hours().toString().padStart(2, "0")}:${duration
    .minutes()
    .toString()
    .padStart(2, "0")}`;
};

export const renderDurationAsTags = (duration: string) => {
  const parsed = moment.duration(duration, "days");
  return (
    <Wrap>
      <Tag py={1} flexShrink={0}>{`Day ${renderDays(parsed)}`}</Tag>
      {parsed.hours() > 0 || parsed.minutes() > 0 ? (
        <Tag py={1}>{renderHoursAndMinutes(parsed)}</Tag>
      ) : null}
    </Wrap>
  );
};

export const renderDurationAsInputString = (duration: number) => {
  const parsed = moment.duration(duration, "seconds");
  return `${renderDays(parsed)} ${renderHoursAndMinutes(parsed)}`;
};

export const renderDurationAsHelperText = (duration: string) => {
  const parsed = moment.duration(duration, "days");
  return `Day ${renderDays(parsed)}, ${renderHoursAndMinutes(parsed)}`;
};
