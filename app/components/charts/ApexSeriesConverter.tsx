
export type AxisChartData = {
  x: Date,
  y: number | number[],
}

export type AxisChartDataList = AxisChartData[];


export const apexSeriesConverter = (dataList: AxisChartDataList) => {
  let tempSeries = [{data: dataList}]
  
  return (tempSeries as ApexAxisChartSeries)
}