import React, { useState, useEffect } from 'react';
import { ChartCanvas, Chart } from 'react-stockcharts';
import { XAxis, YAxis } from 'react-stockcharts/lib/axes';
import { discontinuousTimeScaleProvider } from 'react-stockcharts/lib/scale';
import { CandlestickSeries } from 'react-stockcharts/lib/series';
import { parse } from 'date-fns';
import { last } from 'react-stockcharts/lib/utils';
import { format } from 'd3-format';
import { timeFormat } from 'd3-time-format';
import { MouseCoordinateX, MouseCoordinateY, CrossHairCursor, EdgeIndicator } from 'react-stockcharts/lib/coordinates';
import { ClickCallback } from "react-stockcharts/lib/interactive";
import { CHART_DATE_FORMAT } from './charts';

export default function ChartCandlestick({ data: candleData, direction, width, latestTick }) {
  const [ dataset, setDataset ] = useState([]);

  useEffect(() => {
    const data = candleData.map((candle) => {
      const { High, Low, First, Last, EndDate } = candle;
      let parsedDate = parse(EndDate, CHART_DATE_FORMAT, new Date());
      return {
        date: parsedDate,
        open: +First[direction],
        close: +Last[direction],
        high: +High[direction],
        low: +Low[direction]
      }
    });
    setDataset(data);
  }, [candleData, direction]);

  useEffect(() => {
    if (latestTick) {
      setDataset(d => {
        const { High, Low, First, Last, StartDate } = latestTick;
        let datasetElement = d[d.length - 1];
        if (datasetElement) {
          const parsedDate = parse(StartDate, CHART_DATE_FORMAT, new Date());
          const date = datasetElement.date;

          if (parsedDate.getTime() === date.getTime()) {
            datasetElement.open = +First[direction];
            datasetElement.close = +Last[direction];
            datasetElement.high = +High[direction];
            datasetElement.low = +Low[direction];
          } else {
            d.push({
              date: parsedDate,
              open: +First[direction],
              close: +Last[direction],
              high: +High[direction],
              low: +Low[direction]
            });
          }
        }
        return d;
      })
    }
  }, [latestTick, direction]);

  const xScaleProvider = discontinuousTimeScaleProvider;
  const {
    data,
    xScale,
    xAccessor,
    displayXAccessor,
  } = xScaleProvider(dataset);

  const xExtents = [
    xAccessor(last(data)),
    xAccessor(data[0])
  ];

  const height = 400;
  const margin = { left: 60, right: 50, top: 10, bottom: 30 };
  const gridHeight = height - margin.top - margin.bottom;
  const gridWidth = width - margin.left - margin.right;
  const xGrid = { innerTickSize: -1 * gridHeight, tickStrokeOpacity: 0.2 };
  const yGrid = { innerTickSize: -1 * gridWidth, tickStrokeOpacity: 0.2 };

  return (
    <div className="chart-candlestick-container">
      {dataset.length > 0 &&
      <ChartCanvas
        height={height}
        ratio={1}
        width={width}
        margin={margin}
        type={"hybrid"}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >

        <Chart id={1} yExtents={d => [d.high, d.low]}>
          <XAxis
            axisAt="bottom"
            orient="bottom"
            ticks={7}
            {...xGrid}
          />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%d %b")}
          />
          <YAxis
            axisAt="left"
            orient="left"
            ticks={7}
            tickFormat={e => e.toPrecision(6)}
            {...yGrid}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".6s")}
          />
          <CandlestickSeries />
          <EdgeIndicator itemType="last" orient="right" edgeAt="right"
            fontSize={11}
            displayFormat={n => n.toPrecision(6)}
            yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>
          <ClickCallback
              onClick={ (moreProps, e) => { console.log("onClick", moreProps, e.target); } }
          />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
      }
    </div>
  );
}
