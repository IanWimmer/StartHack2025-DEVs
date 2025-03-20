import {AxisChartDataList, NonAxisChartDataList} from './ApexSeriesConverter';


type OrchestratorData = {
    type: "line" | "candle" | "news" | "kpi" | "pie" | "table",
    title: string,
    data: LineData | CandleData | PieData | KpiData | NewsData | TableData
}[]

type KpiData = {
    number: number
    footer: string
}

type NewsData = {
    content: string,
    source: string
}

type TableData = {
    header: string[],
    content: {
        [key: string]: string
    }[]
}

type LineData = AxisChartDataList;
type CandleData = AxisChartDataList;
type PieData = NonAxisChartDataList;