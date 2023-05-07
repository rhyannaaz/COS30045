/**
* Authors: Hayden Tran (102882815), Rhyanna Arisya Zaharom (103698709)
* Target: index.html
* Created: 29th April 2023
**/

function init() {

  // Define the SVG width and height
  var width = 800;
  var height = 600;
  var bar_padding = 5;

  //Visualiztion 1 START
  // Create the SVG element and set its dimensions
  var svg1 = d3.select("#chart1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Load the GeoJSON file containing the map data of Somalia
  d3.json("json/somalia_with_regions.json").then(function (data) {
    // Create a projection of the GeoJSON data onto the SVG element
    var projection = d3.geoMercator()
      .center([48.5, 5.5])
      .scale(2300)
      .translate([width / 2, height / 2]);

    // Create a path for the projected GeoJSON data
    var path = d3.geoPath().projection(projection);

    // Append a path element to the SVG element and set its "d" attribute to the path generated by the D3.geoPath() method
    svg1.append("path")
      .datum(data)
      .attr("d", path)
      .attr("fill", "#A3CACC")
      .attr("stroke", "#373E40")
      .attr("stroke-width", 0.5);
  });

  //Visualization 1 END

  //Visualiztion 2 START
  var svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  //Visualization 2 END


  //Visualization 3 START
  var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  d3.csv("data/consumer_price_food_indices_som.csv").then(function (data3) {
    var bar_number = data3.length
    var quarterlyChange = data3.map(function (d) {
      return Number(d.quarterlyChange);
    });

    //add scale for visualization
    var xScale = d3.scaleBand()
      .range([0, width])
      .domain(data3.map(function (d) { return d.date; }))
      .padding(bar_padding);

    var yScale = d3.scaleLinear()
      .range([height, height * 2 / 3, 0])
      .domain([d3.min(quarterlyChange), 0, d3.max(quarterlyChange)]);
    //

    //add axis
    var xAxis = d3.axisBottom()
      .scale(xScale);

    var yAxis = d3.axisLeft()
      .scale(yScale)
      .ticks(10)
      .tickSizeInner(-width);

    svg3.append("g")
      .attr("transform", "translate(30," + height * (2 / 3) + ")")
      .call(xAxis);

    svg3.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(30, 0)")
      .call(yAxis);

    svg3.selectAll(".grid line") //add grid line
      .style("stroke-width", "0.5px")
      .style("stroke", "#cccccc");
    //

    //add bars
    svg3.selectAll("rect")
      .data(data3)
      .enter()
      .append("rect")
      .attr("x", function (d, i) {
        return i * (width * (11 / 12) / bar_number) + 50;
      })
      .attr("y", function (d) {
        if (d.quarterlyChange >= 0) {
          return yScale(d.quarterlyChange);
        } else {
          return height * (2 / 3);
        }
      })
      .attr('width', width * (11 / 13) / bar_number - bar_padding)
      .attr('height', function (d) {
        return Math.abs(height * 2 / 3 - yScale(d.quarterlyChange));
      })
      .attr("fill", "darkred")
      .on("mouseover", function () { //hover effect to blur out line chart
        d3.selectAll("path")
          .style("opacity", 0.2);
        d3.selectAll("circle")
          .style("opacity", 0.2);
        d3.select("rect")
          .style("opacity", 1);
        d3.select(this)
          .attr("fill", "#ff6666")
      })
      .on("mouseout", function () {
        d3.selectAll("path")
          .style("opacity", 1);
        d3.selectAll("rect")
          .style("opacity", 1);
        d3.selectAll("circle")
          .style("opacity", 1);
        d3.select(this)
          .attr("fill", "darkred");
      })
    //

    //scatter plot
    svg3.selectAll("circle")
      .data(data3)
      .enter()
      .append("circle")
      .attr("cx", function (d, i) {
        return i * (width * (11 / 12) / bar_number) + 64;
      })
      .attr("cy", function (d) {
        return yScale(d.annualChange);
      })
      .attr("r", 5)
      .attr("fill", "darkgreen");
    //

    var lineGenerator = d3.line()
      .x(function (d, i) { return i * (width * (11 / 12) / bar_number) + 64; })
      .y(function (d) { return yScale(d.annualChange); })
      .curve(d3.curveLinear);

    // Add the line to the chart
    svg3.append("path")
      .datum(data3)
      .attr("fill", "none")
      .attr("stroke", "#2b8cbe")
      .attr("stroke-width", 5)
      .attr("d", lineGenerator)
      .on("mouseover", function () { // hover efect to blur out bar chart
        d3.selectAll("rect")
          .style("opacity", 0.2);
        d3.select("path")
          .style("filter", "none");
      })
      .on("mouseout", function () {
        d3.selectAll("rect")
          .style("opacity", 1);
        d3.select("path")
          .style("filter", "blur(2px)");
      });
  })
  //


  //Visualization 3 END
}

window.onload = init;
