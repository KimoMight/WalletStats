import ReactApexChart from "react-apexcharts";
import React, { useState } from "react";

const NegativeBarPlot = ({ dataX, dataY }) => {
  const [state, setState] = useState({
    series: [
      {
        name: "Transaction Value",
        data: dataY,
      },
    ],
    options: {
      chart: {
        type: "bar",
        height: 350,
      },
      plotOptions: {
        bar: {
          colors: {
            ranges: [
              {
                from: -100,
                to: -46,
                color: "#F15B46",
              },
              {
                from: -45,
                to: 0,
                color: "#FEB019",
              },
            ],
          },
          columnWidth: "80%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: {
        labels: {
          formatter: function (y) {
            return y;
          },
        },
      },
      xaxis: {
        categories: dataX,
        labels: {
          rotate: -90,
        },
      },
    },
  });

  return (
    <div id="chart">
      <ReactApexChart
        options={state.options}
        series={state.series}
        type="bar"
        height={450}
      />
    </div>
  );
};

export default NegativeBarPlot;
