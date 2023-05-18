/**
* Authors: Hayden Tran (102882815), Rhyanna Arisya Zaharom (103698709)
* Target: index.html
* Created: 29th April 2023
**/

function init() {

  // Define the SVG width and height
  var width = 700;
  var height = 600;
  var bar_padding = 5;

  //Visualization 1 START

  var svg1, centered;
  var fillColor = '#dddddd';
  var hoverColor = '#f24b2e';
  var inactiveFillColor = '#ffffff';

  function generateMap(adm1, countrieslabel) {

      var width = 700;
      var height = 600;

      svg1 = d3.select('#chart1')
          .append('svg')
          .attr('width', width)
          .attr('height', height);

      var mapprojection = d3.geoMercator()
          .center([47, 5])
          .scale(2300)
          .translate([width / 2, height / 2]);

      var g = svg1.append('g').attr('id', 'adm1layer');
      var path = g.selectAll('path')
          .data(adm1.features)
          .enter()
          .append('path')
          .attr('d', d3.geoPath().projection(mapprojection))
          .attr('id', function(d) {
              return d.properties.admin1Name;
          })
          .attr('class', function(d) {
              var classname = (d.properties.admin1Name !== '0') ? 'adm1' : 'inactive';
              return classname;
          })
          .attr('fill', function(d) {
              var clr = (d.properties.admin1Name !== '0') ? fillColor : inactiveFillColor;
              return clr;
          })
          .each(function(d) {
              if (d.properties.admin1Name !== '0') {
                  d3.select(this)
                      .attr('stroke-width', 1)
                      .attr('stroke', '#F8F5F2');
              }
      });

      //map tooltips
      path.filter('.adm1')
          .on('mouseover', function(d, event) {
            d3.select(this)
                .transition()
                .duration(200);
                // .attr('fill', hoverColor);

            var mouse = d3.pointer(event);
            var tooltip = d3.select('#chart1')
              .append('div')
              .attr('class', 'map-tooltip')
              .style("left", (mouse[0] + 90) + "px")
              .style("top", (mouse[1] + 10) + "px")
              .text(d && d.properties ? d.properties.admin1Name : '')
            d3.select('#chart1').on('mousemove', function(event) {
              var mouse = d3.pointer(event);
              tooltip.style('left', (mouse[0] + 10) + 'px')
                .style('top', (mouse[1] + 10) + 'px');
            });
            console.log('Mouseover event');
          })
          .on('mouseout', function(d) {
            d3.select('.map-tooltip').remove();
            console.log('Mouseout event');
          })
          .on('click', function(d) {
              if (d && d.properties && d.properties.admin1Name) {
                  selectRegion(d3.select(this), d.properties.admin1Name);
              }
              console.log('Click event');
          });
  }

  function selectRegion(region, name) {
      region.siblings().data('selected', false);
      region.siblings('.adm1').attr('fill', fillColor);
      region.attr('fill', hoverColor);
      region.data('selected', true);
      d3.select('.regionLabel > div > strong').html(name);
      updateCharts(name);
  }

  var somCall = d3.json('json/som-merged-topo.json'); // Load 'json/som-merged-topo.json' file
  var adm1Call = d3.json('json/som_adm1.json'); // Load 'json/som_adm1.json' file
  var countrieslabelCall = d3.json('json/countries.json'); // Load 'json/countries.json' file
  var csvCall = d3.csv('data/acute_food_insecurity_by_region.csv'); // Load 'data/acute_food_insecurity_by_region.csv' file

  Promise.all([adm1Call, somCall, countrieslabelCall, csvCall]).then(function(values) {
      var adm1Args = values[0]; // Store the data from 'json/som_adm1.json'
      var somArgs = values[1]; // Store the data from 'json/som-merged-topo.json'
      var countrieslabelArgs = values[2]; // Store the json from 'data/countries.json'
      var csvData = values[3]; // Store the data from 'data/acute_food_insecurity_by_region.csv'
      var countrieslabel = (countrieslabelArgs) ? countrieslabelArgs.countries : []; // Extract the 'countries' property if 'countries.json' is provided, otherwise set it as an empty array
      generateMap(somArgs, countrieslabel); // Call the 'generateMap' function with the loaded data
      updateCharts(csvData); // Call the 'updateCharts' function with the loaded CSV data
  });

  function updateCharts(csvData) {
    // Parse the CSV data
    csvData.forEach(function(d) {
        d.year = +d.year;
        d.percentage = +d.percentage;
    });

    // Filter the data based on the selected year
    var selectedYear = 2017; // Change this based on user selection or update it dynamically
    var filteredData = csvData.filter(function(d) {
        return d.year === selectedYear;
    });

    // Create the color scale based on the percentage values
    var colorScale = d3.scaleLinear()
        .domain([25, 50, 75, 90])
        .range(['#F9EDDC', '#F4C0B3', '#EA6661', '#E53838']);

    // Update the fill color of the regions based on the percentage values
    svg1.selectAll('.adm1')
        .attr('fill', function(d) {
            var regionData = filteredData.find(function(data) {
                return data.region === d.properties.admin1Name;
            });
            return regionData ? colorScale(regionData.percentage) : fillColor;
        });
  }

  //Visualization 1 END

  //Visualization 2 START

  // Set up the SVG dimensions
  var margin = { top: 20, right: 20, bottom: 30, left: 50 };
  // Create the SVG element
  var svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Create the tooltip element
  var tooltip2 = d3.select("#chart2")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // Load the data from the CSV file
  d3.csv("data/rural_urban_areas.csv").then(function(data) {
    // Parse the data
    data.forEach(function(d) {
      d.year = +d.year;
      d.stressed = +d.stressed;
      d.crisis = +d.crisis;
      d.emergency = +d.emergency;
      d.catastrophe = +d.catastrophe;
    });

    // // Group the data by region
    // var dataByRegion = d3.group(data, function(d) { return d.region; });
    //
    // // Convert the grouped data back into an array of objects
    // var dataByRegionArray = Array.from(dataByRegion, function([key, values]) {
    //   return { region: key, values: values };
    // });

    // Extract the unique years from the data
    var years = [...new Set(data.map(function(d) { return d.year; }))];

    // Define the x and y scales
    var xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.1);

    var yScale = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) {
        return Math.max(d.stressed, d.crisis, d.emergency, d.catastrophe);
      })])
      .range([height, 0]);

    // Define the area generators for each area category
    var areaStressed = d3.area()
      .x(function(d) { return xScale(d.year); })
      .y0(yScale(0))
      .y1(function(d) { return yScale(d.stressed); });

    var areaCrisis = d3.area()
      .x(function(d) { return xScale(d.year); })
      .y0(function(d) { return yScale(d.stressed); })
      .y1(function(d) { return yScale(d.stressed + d.crisis); });

    var areaEmergency = d3.area()
      .x(function(d) { return xScale(d.year); })
      .y0(function(d) { return yScale(d.stressed + d.crisis); })
      .y1(function(d) { return yScale(d.stressed + d.crisis + d.emergency); });

    var areaCatastrophe = d3.area()
      .x(function(d) { return xScale(d.year); })
      .y0(function(d) { return yScale(d.stressed + d.crisis + d.emergency); })
      .y1(function(d) { return yScale(d.stressed + d.crisis + d.emergency + d.catastrophe); });

    // Add the area paths for each area category
    svg2.append("path")
      .datum(data)
      .attr("class", "area stressed")
      .attr("d", areaStressed)
      .style("fill", "#f24b2e")
      .on("mouseover", function(d) {
        // Show the tooltip
        tooltip2.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip2.html("Area: Stressed<br>Year: " + d[0].year + "<br>Number: " + d[0].stressed)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        // Hide the tooltip
        tooltip2.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svg2.append("path")
      .datum(data)
      .attr("class", "area crisis")
      .attr("d", areaCrisis)
      .style("fill", "#3b88c0")
      .on("mouseover", function(d) {
        // Show the tooltip
        tooltip2.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip2.html("Area: Crisis<br>Year: " + d[0].year + "<br>Number: " + (d[0].stressed + d[0].crisis))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        // Hide the tooltip
        tooltip2.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svg2.append("path")
      .datum(data)
      .attr("class", "area emergency")
      .attr("d", areaEmergency)
      .style("fill", "#e6c229")
      .on("mouseover", function(d) {
        // Show the tooltip
        tooltip2.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip2.html("Area: Emergency<br>Year: " + d[0].year + "<br>Number: " + (d[0].stressed + d[0].crisis + d[0].emergency))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        // Hide the tooltip
        tooltip2.transition()
          .duration(500)
          .style("opacity", 0);
      });

    svg2.append("path")
      .datum(data)
      .attr("class", "area catastrophe")
      .attr("d", areaCatastrophe)
      .style("fill", "#964f8e")
      .on("mouseover", function(d) {
        // Show the tooltip
        tooltip2.transition()
          .duration(200)
          .style("opacity", 0.9);
        tooltip2.html("Area: Catastrophe<br>Year: " + d[0].year + "<br>Number: " + (d[0].stressed + d[0].crisis + d[0].emergency + d[0].catastrophe))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
          // Hide the tooltip
          tooltip2.transition()
            .duration(500)
            .style("opacity", 0);
          });

          // Add the x and y axes
          var xAxis = d3.axisBottom(xScale)
          .tickFormat(d3.format("d")) // Format the tick labels as integers
          .tickValues(years); // Specify the tick values as the unique years
          var yAxis = d3.axisLeft(yScale);

          svg2.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);

          svg2.append("g")
          .attr("class", "y-axis")
          .call(yAxis);

          // Add labels
          svg2.append("text")
          .attr("class", "x-label")
          .attr("text-anchor", "middle")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom)
          .text("Year");

          svg2.append("text")
          .attr("class", "y-label")
          .attr("text-anchor", "middle")
          .attr("x", -margin.left)
          .attr("y", height / 2)
          .attr("transform", "rotate(-90," + (-margin.left) + "," + (height / 2) + ")")
          .text("Number");
          });
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

    var annualChange = data3.map(function (d) {
      return Number(d.annualChange);
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
      .data(quarterlyChange)
      .enter()
      .append("rect")
      .attr("id", "bar-chart")
      .attr("x", function (d, i) {
        return i * (width * (11 / 12) / bar_number) + 50;
      })
      .attr("y", function (d) {
        if (d >= 0) {
          return yScale(d);
        } else {
          return height * (2 / 3);
        }
      })
      .attr('width', width * (11 / 13) / bar_number - bar_padding)
      .attr('height', function (d) {
        return Math.abs(height * 2 / 3 - yScale(d));
      })
      .attr("fill", "darkred")
      .on("mouseover", function (event, d) {
        //hover effect to blur out line chart
        d3.selectAll("path")
          .style("opacity", 0.2);
        d3.selectAll("circle")
          .style("opacity", 0.2);
        d3.select("rect")
          .style("opacity", 1);
        d3.select(this)
          .attr("fill", "#ff6666")
        //

        var xPosition = parseFloat(d3.select(this).attr('x'))
        var yPosition = parseFloat(d3.select(this).attr('y'))

        svg3.append('rect') //background for text when hovering
          .attr('id', 'tooltip-background')
          .attr('x', xPosition + 5)
          .attr('y', yPosition + 20)
          .attr('width', 50)
          .attr('height', 20)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.7)
          .attr('rx', 5)
          .attr('ry', 5);

        svg3.append('text')   //display text when hovering
          .style("font", "14px sans-serif")
          .attr('id', 'tooltip')
          .attr('x', xPosition + 10)
          .attr('y', yPosition + 35)
          .text(d + "%")
          .attr('fill', 'black');

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

        d3.select('#tooltip').remove() //remove tool tip
        d3.select('#tooltip-background').remove(); // remove background

      })
    //

    //scatter plot
    svg3.selectAll("circle")
      .data(annualChange)
      .enter()
      .append("circle")
      .attr("cx", function (d, i) {
        return i * (width * (11 / 12) / bar_number) + 64;
      })
      .attr("cy", function (d) {
        return yScale(d);
      })
      .attr("r", 8)
      .attr("fill", "darkgreen")
      .on('mouseover', function (event, d) {  //creat hover effect for scatter plot
        var xPosition = parseFloat(d3.select(this).attr('cx'))
        var yPosition = parseFloat(d3.select(this).attr('cy'))

        svg3.append('rect') //background for text when hovering
          .attr('id', 'tooltip-background')
          .attr('x', xPosition + 5)
          .attr('y', yPosition - 20)
          .attr('width', 50)
          .attr('height', 20)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.7)
          .attr('rx', 5)
          .attr('ry', 5);

        svg3.append('text')   //display text when hovering
          .style("font", "14px sans-serif")
          .attr('id', 'tooltip')
          .attr('x', xPosition + 10)
          .attr('y', yPosition - 5)
          .text(d + "%")
          .attr('fill', 'black');

        d3.selectAll("#bar-chart")  //blur out the bar chart when hovering
          .style("opacity", 0.2);
        d3.select("path")
          .style("filter", "none");
      })
      .on('mouseout', function () {
        d3.select('#tooltip').remove() //remove tool tip
        d3.select('#tooltip-background').remove(); // remove background

        d3.selectAll("rect")  //make the bar chart normal when not hovering the scatter plot
          .style("opacity", 1);
      })


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
      });

  })
  //


  //Visualization 3 END
}

window.onload = init;
