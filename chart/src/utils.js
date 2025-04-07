export function formatData(rawData) {
  const labels = rawData.map((d) => new Date(d[0] * 1000).toLocaleDateString());
  const values = rawData.map((d) => d[4]); // 종가 (close)

  return { labels, values };
}
