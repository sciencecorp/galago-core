import moment from "moment";

enum TimeScale {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
}

export const calculateTimelinePosition = (
  visibleStart: moment.Moment,
  startTime: moment.Moment,
  totalDuration: number
): string => {
  return `${(visibleStart.diff(startTime, "seconds") / totalDuration) * 100}%`;
};

export const calculateBlockWidth = (
  visibleStart: moment.Moment,
  visibleEnd: moment.Moment,
  totalDuration: number
): string => {
  return `${(visibleEnd.diff(visibleStart, "seconds") / totalDuration) * 100}%`;
};

export const getIntervalDuration = (scale: TimeScale) => {
  switch (scale) {
    case TimeScale.SECONDS:
      return moment.duration(1, "seconds");
    case TimeScale.HOURS:
      return moment.duration(10, "minutes");
    default: // MINUTES
      return moment.duration(5, "minutes");
  }
};

export const calculateCurrentTimePosition = (
  currentTime: moment.Moment,
  startTime: moment.Moment,
  endTime: moment.Moment
): number => {
  const totalMinutes = endTime.diff(startTime, "minutes");
  const currentMinutes = currentTime.diff(startTime, "minutes");
  return (currentMinutes / totalMinutes) * 100;
};
