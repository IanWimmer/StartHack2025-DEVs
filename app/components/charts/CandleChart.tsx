import { ApexOptions } from 'apexcharts';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import React from 'react';
import { candle_series } from './PlaceholderData';

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });






const CandlestickChart = ({
  series,
}: {
  series?: ApexAxisChartSeries
}) => {
  const { theme, setTheme } = useTheme();




  const options: ApexOptions = {
    chart: {
      type: 'candlestick',
      height: 250,
      toolbar: {
        show: false,
      },
      background: "transparent"
    },
    title: {
      text: '',
    },
    theme: {mode: (theme as 'light' | 'dark' | undefined)},
    xaxis: {
      type: 'datetime',
    },
    yaxis: {
      show: true,
      tooltip: {
        enabled: false,
      },
    },
  };

  

  return (
    <div className="candlestick-chart">
      <ReactApexChart options={options} series={ series ? series : candle_series } type="candlestick" height={250} />
    </div>
  );
};

export default CandlestickChart;