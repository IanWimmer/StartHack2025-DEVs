import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import React from "react";
import ReactApexChart from "react-apexcharts";

const series: ApexAxisChartSeries = [
  {
    name: "Desktops",
    data: [10, 41, 35, 51, 49, 62, 69, 91, 148],
  },
];

const LineChart = () => {
  const { theme, setTheme } = useTheme();

  const options: ApexOptions = {
    chart: {
      height: 250,
      type: "line",
      background: 'transparent',
      toolbar: { show: false }
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "",
    },
    theme: {mode: (theme as 'light' | 'dark' | undefined)},
    xaxis: {
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
      ],
    },
  };

  return (
    <div>
      <ReactApexChart options={options} series={series} type="line" height={250} />
    </div>
  );
};

export default LineChart;
