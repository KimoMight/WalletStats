import ReactApexChart from "react-apexcharts";
import React, { useState } from "react";

const LineChartComponent = ({ dataX, dataY }) => {
  const [state, setState] = useState({
    series: [
      {
        name: "Balance",
        data: dataY,
      },
    ],
    options: {
      chart: {
        height: 350,
        type: "line",
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "straight",
      },
      grid: {
        row: {
          colors: ["#f3f3f3", "transparent"], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: dataX,
      },
    },
  });

  return (
    <div id="chart">
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="line"
        height={450}
      />
    </div>
  );
};

export default LineChartComponent;
