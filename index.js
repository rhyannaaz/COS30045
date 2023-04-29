/**
* Authors: Hayden Tran (102882815), Rhyanna Arisya Zaharom (103698709)
* Target: index.html
* Purpose:
* Created: 29th April 2023
**/

function init() {

  // initialize variables for width and height
  var w = 500;
  var h = 300;

  var svg = d3.select("#chart1")   // define the chart that will be displayed
      .append("svg")
      .attr("width", w)
      .attr("height", h);

  var svg = d3.select("#chart2")   // define the chart that will be displayed
      .append("svg")
      .attr("width", w)
      .attr("height", h);

  var svg = d3.select("#chart3")   // define the chart that will be displayed
      .append("svg")
      .attr("width", w)
      .attr("height", h);
}

window.onload = init;
