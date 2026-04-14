export type DowntimeLogs = [Date, Date][];

export function merge(...args: DowntimeLogs[]): DowntimeLogs {
  const sortedLogs = args
    .flat()
    .slice()
    .sort(([leftStart], [rightStart]) => leftStart.getTime() - rightStart.getTime());

  return sortedLogs.reduce<DowntimeLogs>((mergedLogs, [start, end]) => {
    const latestLog = mergedLogs[mergedLogs.length - 1];

    if (!latestLog) {
      mergedLogs.push([start, end]);
      return mergedLogs;
    }

    const [latestStart, latestEnd] = latestLog;

    if (start.getTime() <= latestEnd.getTime()) {
      latestLog[0] = latestStart;
      latestLog[1] = new Date(Math.max(latestEnd.getTime(), end.getTime()));
      return mergedLogs;
    }

    mergedLogs.push([start, end]);
    return mergedLogs;
  }, []);
}
