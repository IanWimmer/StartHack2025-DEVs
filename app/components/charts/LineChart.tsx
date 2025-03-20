import { ApexOptions } from "apexcharts";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import React, { useState } from "react";
import { line_data_list } from "./PlaceholderData";
import { apexSeriesConverter, AxisChartDataList } from "./ApexSeriesConverter";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });


const LineChart = ({
  dataList,
  id,
  onDataChange,
}: {
  dataList?: AxisChartDataList,
  id: string,
  onDataChange?: ( id: string, data: AxisChartDataList | string ) => void,
}) => {
  const { theme, setTheme } = useTheme();
    const [zoomRange, setZoomRange] = useState<{ min: number | undefined; max: number | undefined }>({
      min: undefined,
      max: undefined,
    });

  const options: ApexOptions = {
    chart: {
      height: 250,
      type: "line",
      zoom: {
        enabled: true,
      },
      background: "transparent",
      events: {
        zoomed: (chartContext: any, { xaxis }: any) => {
          const filtered = dataList ? dataList.filter((point) => point.x >= xaxis.min && point.x <= xaxis.max): []
          setZoomRange({min: xaxis.min, max: xaxis.max})
          onDataChange && onDataChange(id, filtered ? filtered : "")
        } 
      },
      toolbar: { show: false }
    },
    stroke: {
      curve: "smooth",
    },
    title: {
      text: "",
    },
    theme: {mode: (theme as 'light' | 'dark' | undefined)},
    xaxis: {
      type: 'datetime',
      min: zoomRange.min,
      max: zoomRange.max,
    },
    yaxis: {
      show: true,
      tooltip: {
        enabled: false,
      },
    },
  }

  return (
    <div>
      <ReactApexChart options={options} series={dataList ? apexSeriesConverter(dataList) : apexSeriesConverter(line_data_list)} type="line" height={250} />
    </div>
  );
};

export default LineChart;
