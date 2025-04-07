import React, { useRef, useEffect } from "react";
import Chart from "chart.js/auto"; // 👈 자동 등록 포함된 버전 사용

export default function Dashboard({ price, data }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!data || !data.labels || !canvasRef.current) return;

    // 기존 차트 제거
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext("2d");

    chartRef.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Price",
            data: data.values,
            fill: false,
            borderColor: "rgb(192, 75, 75)",
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Historical Price Chart",
          },
        },
        scales: {
          x: {
            type: "category", // ✅ category 스케일
          },
          y: {
            beginAtZero: false,
          },
        },
      },
    });
  }, [data]);

  return (
    <div>
      <h2>Current Price: ${price}</h2>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
