/*
Authors: Hayden Tran (102882815), Rhyanna Arisya Zaharom (103698709)
Target: index.html
Created: 29th April 2023
Semester 1 2023
COS30045
*/

function init() {

  // Define the SVG width, height bar paddng, and margin
  var width = 700;
  var height = 600;
  var bar_padding = 5;
  margin = {top: 80, right: 135, bottom: 80, left: 150}

  // Visualization 1 START

  // Create a tooltip
  var Tooltip = d3.select("#chart1")
    .append("div")
    .style("opacity", 0)
    .attr("class", "map-tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-radius", "5px")
    .style("padding", "7px")
    .style("position", "absolute")
    .style("text-align", "left");

  var fillColor = '#dddddd';
  var inactiveFillColor = '#ffffff';
  var csvData;
  var year = 2022;
  var svg1;

  // Display choropleth map onload with default year (2022)
  updateMap(year);

  // Add event listeners to the buttons

  d3.select('#button1').on('click', function() {
    updateMap(2017);
    console.log('onClick button1 event');
  });

  d3.select('#button2').on('click', function() {
    updateMap(2018);
    console.log('onClick button2 event');
  });

  d3.select('#button3').on('click', function() {
    updateMap(2019);
    console.log('onClick button3 event');
  });

  d3.select('#button4').on('click', function() {
    updateMap(2020);
    console.log('onClick button4 event');
  });

  d3.select('#button5').on('click', function() {
    updateMap(2021);
    console.log('onClick button5 event');
  });

  d3.select('#button6').on('click', function() {
    updateMap(2022);
    console.log('onClick button6 event');
  });

  // Update map with selected year
  function updateMap(year) {

    // Remove the previous choropleth map
    d3.select("#chart1 svg").remove();

    // Remove the background color from all buttons
    d3.selectAll("#buttons button").style("background-color", "#8DB9B8");

    // Add the background color to the selected button
    d3.select(`#button${year - 2016}`).style("background-color", "#426B69");

    // Load JSON files
    d3.json('json/som-merged-topo.json').then(function(adm1) {
      d3.json('json/som_adm1.json').then(function(somArgs) {
        // Load data file
        d3.csv('data/acute_food_insecurity.csv').then(function(csvData) {

          // Parse the CSV data
          csvData.forEach(function(d) {
            d.year = +d.year;
            d.percentage = +d.percentage;
            d.population = +d.population;
          });

          // Filter the data based on default year - 2022
          var filteredData = csvData.filter(function(d) {
            return d.year === year;
          });

          // Create the color scale based on the percentage values
          var colorScale = d3.scaleLinear()
            .domain([20, 40, 60, 80, 100])
            .range(['#C4FACA', '#F7EB17', '#FBA918', '#ED1E23', '#93191A']);

          // Generate the map
          var projection = d3.geoMercator()
            .center([47, 5])
            .scale(2300)
            .translate([width / 2, height / 2]);

          var path = d3.geoPath().projection(projection);

          var svg1 = d3.select('#chart1')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

          var map = svg1.append('g').attr('id', 'adm1layer');

          map.selectAll('path')
            .data(adm1.features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('id', function(d) {
              return d.properties.admin1Name;
            })
            .attr('class', function(d) {
              return (d.properties.admin1Name !== '0') ? 'adm1' : 'inactive';
            })
            .attr('fill', function(d) {
              return (d.properties.admin1Name !== '0') ? fillColor : inactiveFillColor;
            })
            .each(function(d) {
              if (d.properties.admin1Name !== '0') {
                d3.select(this)
                  .attr('stroke-width', 2)
                  .attr('stroke', '#FFFFFF');
              }
            })
            .on('mouseover', handleMouseOver)
            .on('mouseleave', handleMouseLeave)
            .on('mousemove', handleMouseMove);

          // Function to handle mouseover event on map paths
          function handleMouseOver(d) {
            Tooltip.style("opacity", 1);
            d3.select(this)
              .style("stroke", function(d) {
                return d.properties.admin1Name === '0' ? "white" : "red"})
              .style('stroke-width', 2)
              .style("opacity", 1)
              .transition()
              .duration(500);
            console.log('Mouseover event');
          }

          // Function to handle mouseleave event on map paths
          function handleMouseLeave(d) {
            Tooltip.style("opacity", 0);
            d3.select(this)
              .style("stroke", "#FFFFFF")
              .style("opacity", 1);
            console.log('Mouseleave event');
          }

          // Function to handle mousemove event on map paths
          function handleMouseMove(event, d) {
            var d = d; // Access the feature data

            // Check if admin1Name is not '0' before showing the tooltip
            if (d.properties.admin1Name !== '0') {
              var regionData = filteredData.find(function(data) {
                return data.region === d.properties.admin1Name;
              });

              // Update the tooltip position and content
              Tooltip
                .style("left", (d3.pointer(event)[0] + 300) + "px")
                .style("top", (d3.pointer(event)[1] + 20) + "px")
                .html("Region: " + d.properties.admin1Name + "<br>Population: " +
                regionData.population + "<br>Percentage: " + regionData.percentage + "%");

              Tooltip.style("opacity", 1); // Show the tooltip
            } else {
              Tooltip.style("opacity", 0); // Hide the tooltip
            }
            console.log('Mousemove event');
          }

          // Update the fill color of the regions based on the percentage values
          svg1.selectAll('.adm1')
            .attr('fill', function(d) {
              var regionData = filteredData.find(function(data) {
                return data.region === d.properties.admin1Name;
              });
              if (regionData) {
                var percentage = regionData.percentage;
                return percentage <= 100 && percentage > 80 ? '#93191A'
                  : percentage <= 80 && percentage > 60 ? '#ED1E23'
                  : percentage <= 60 && percentage > 40 ? '#FBA918'
                  : percentage <= 40 && percentage > 20 ? '#F7EB17'
                  : percentage <= 20 ? '#C4FACA'
                  : fillColor;
              } else {
                return fillColor;
              }
            });

          // LEGEND //

          // Add the legend
          var legend = svg1.append("g")
            .attr("transform", "translate(" + (width - 200) + "," + (height - 200) + ")"); // Update the transform attribute

          // Array to display for legend
          var allgroups = ["Minimal (IPC Phase 1)", "Stressed (IPC Phase 2)", "Crisis (IPC Phase 3)", "Emergency (IPC Phase 4)", "Famine (IPC Phase 5)"];

          legend.selectAll()
            .data(allgroups)
            .enter()
            .append("text")
              .attr('x', 30)
              .attr('y', function(d,i){ return 30 * i + 12;})
              .style("fill", function(d){ return colorScale(d);})
              .text(function(d){ return d;})
              .attr("text-anchor", "left")
              .style("alignment-baseline", "middle")
              .style("font-size", 14);

          // Add one square in the legend for each name.
          var legendDots = legend.selectAll()
            .data(colorScale.range())
            .enter()
            .append("rect")
              .attr('x', 0)
              .attr('y', function(d, i){ return 30 * i; })  // Stacking rectangles vertically
              .attr('width', 20)
              .attr('height', 20)
              .style("fill", function(d){ return d; });

        });
      });
    });
  }

  // Visualization 1 END

  // Visualization 2 START

  // Append the svg object to the body of the page
  svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",`translate(${margin.left +100}, ${margin.top})`);

  // Parse the Data
  d3.csv("data/rural_urban_areas_total.csv").then( function(data) {

    // Exlude first column
    const areas = data.columns.slice(1);

    // Color palette
    const color = d3.scaleOrdinal()
      .domain(areas)
      .range(["#8338ec","#ff0054", "#0496FF"]);

    // Stack the data
    const stackedData = d3.stack()
      .keys(areas)
      (data);

    // Add X axis
    const x = d3.scaleLinear()
      .domain([2015, 2023])
      .range([ 0, width ]);
    const xAxis = svg2.append("g")
      .attr("transform", `translate(0, ${height})`)
      .style('font-family', 'Arial')
      .style("font-size", 15)
      .call(d3.axisBottom(x).ticks(5)
      .tickFormat(d3.format('d')));

    // Add X axis label
    svg2.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height+60 )
      .style('font-family', 'Arial')
      .style("font-size", 20)
      .text("Year");

    // Add Y axis label
    svg2.append("text")
      .attr('x', -240)
      .attr("y", -100 )
      .attr('transform', 'rotate(270)')
      .text("Total Number of People Affected")
      .style('font-family', 'Arial')
      .style("font-size", 20)
      .attr('text-anchor', 'middle');

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 10000000])
      .range([ height, 0 ]);

    svg2.append("g")
      .call(d3.axisLeft(y).ticks(10))
      .style('font-family', 'Arial')
      .style("font-size", 15);

    // BRUSHING AND CHART //

    // Create a clip path element within the SVG element
    const clip = svg2.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

    // Add brushing
    const brush = d3.brushX()
      .extent( [ [0,0], [width,height] ] )
      .on("end", updateAreaChart);

    const areaChart = svg2.append('g')
      .attr("clip-path", "url(#clip)");

    // Area generator
    const area = d3.area()
      .x(function(d) { return x(Number(d.data.Year)); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); });

    // Show the areas
    areaChart
      .selectAll("mylayers")
      .data(stackedData)
      .join("path")
      .attr("class", function(d) { return "myArea " + d.key })
      .style("fill", function(d) { return color(d.key); })
      .attr("d", area);

    // Add the brushing
    areaChart
      .append("g")
      .attr("class", "brush")
      .call(brush);

    let idleTimeout
    function idled() { idleTimeout = null; }


    function updateAreaChart(event,d) {

      extent = event.selection

      if (!extent) {
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        x.domain(d3.extent(data, function(d) { return Number(d.Year); }))
      } else {
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        areaChart.select(".brush").call(brush.move, null)
      }

      // Update axis and area position
      xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d3.format('d')));
      areaChart
        .selectAll("path")
        .transition().duration(1000)
        .attr("d", area);
      }

      // HIGHLIGHT GROUP //

      // When one group is hovered
      const highlight = function(event,d){
        // Reduce opacity of all groups
        d3.selectAll(".myArea")
          .transition()
          .duration(500)
          .style("opacity", .1);
        // Except the one that is hovered
        d3.select("."+d)
          .transition()
          .duration(500)
          .style("opacity", 1);
      }

      // When group is not hovered anymore
      const noHighlight = function(event,d){
        d3.selectAll(".myArea")
          .transition()
          .duration(500)
          .style("opacity", 1);
      }

      // LEGEND //

      // Add one square in the legend for each name
      const size = 30
      svg2.selectAll("myrect")
        .data(areas)
        .join("rect")
        .attr("x", 700)
        .attr("y", function(d,i){ return 10 + i*(size+5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight);

      // Add one square in the legend for each name
      svg2.selectAll("mylabels")
        .data(areas)
        .join("text")
        .attr("x", 720 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
        .text(function(d){ return d})
        .style('font-family', 'Arial')
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight);
  })

  // Visualization 2 END

  // Visualization 3 START

  var width3 = 900;
  var height3 = 750;

  var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", width3)
    .attr("height", height3 + margin.top + margin.bottom)
    .attr("transform", "translate(100,80)");

  d3.csv("data/consumer_price_food_indices_som.csv").then(function (data3) {
    var bar_number = data3.length
    console.log(data3)
    var quarterlyChange = data3.map(function (d) {
      return Number(d.quarterlyChange);
    });

    // Add X axis label
    svg3.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width3/2)
      .attr("y", height3+50 )
      .style('font-family', 'Arial')
      .style("font-size", 20)
      .text("Quarterly Months");

    // Add Y axis label
    svg3.append("text")
      .attr("text-anchor", "middle")
      .attr("x", -400)
      .attr("y", 20)
      .style("font-family", "Arial")
      .style("font-size", 20)
      .text("CPI Value")
      .attr("transform", "rotate(270)");


    // Add scale for visualization
    var xScale = d3.scaleBand()
      .range([0, width3])
      .padding(bar_padding);

    var yScale = d3.scaleLinear()
      .range([height3, height3 * 2 / 3, 0])
      .domain([-8, 0, 15]);

    svg3.append("g")
      .attr("transform", "translate(50," + height3 * (2 / 3) + ")")
      .call(d3.axisBottom(xScale).tickFormat(""));

    svg3.append("g")
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft().scale(yScale).tickValues(d3.range(-8, 21, 2)).ticks(10));

    // Add y-axis grid lines
    svg3.append("g")
      .attr("transform", "translate(50,0)")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickValues(d3.range(-8, 21, 2))
        .ticks(10)
        .tickSizeInner(-width3)
        .tickFormat("")
      );

    // Style the grid lines
    svg3.selectAll(".grid line")
      .style("stroke-width", "0.5px")
      .style("stroke", "#cccccc");

    // Add bars
    svg3.selectAll("rect")
      .data(data3)
      .enter()
      .append("rect")
      .attr("id", "bar-chart")
      .attr("x", function (d, i) {
        return i * (width3 * (11 / 12) / bar_number) + 60;
      })
      .attr("y", function (d) {
        if (d.quarterlyChange >= 0) {
          return yScale(d.quarterlyChange);
        } else {
          return height3 * (2 / 3);
        }
      })
      .attr('width', width3 / bar_number - bar_padding)
      .attr('height', function (d) {
        return Math.abs(height3 * 2 / 3 - yScale(d.quarterlyChange));
      })
      .attr("fill", "#FF6363")
      .on("mouseover", function (event, d, i) {
        // Hover effect to blur out line chart
        d3.selectAll("path")
          .style("opacity", 0.2);
        d3.selectAll("circle")
          .style("opacity", 0.2);
        d3.select("rect")
          .style("opacity", 1);
        d3.select(this)
          .attr("fill", "#ff6666")

        var xPosition = parseFloat(d3.select(this).attr('x'))
        var yPosition = parseFloat(d3.select(this).attr('y'))

        // Background for text when hovering
        svg3.append('rect')
          .attr('id', 'tooltip-background')
          .attr('x', xPosition )
          .attr('y', yPosition + 14)
          .attr('width', 155)
          .attr('height', 30)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.7)
          .attr('rx', 5)
          .attr('ry', 5);

        // Display text when hovering
        svg3.append('text')
          .style("font", "18px sans-serif")
          .attr('id', 'tooltip')
          .attr('x', xPosition + 5)
          .attr('y', yPosition + 35)
          .text(d.Date + ": " + d.quarterlyChange + "%")
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
          .attr("fill", "#FF6363");

        // Remove tool tip
        d3.select('#tooltip').remove()
        // Remove background
        d3.select('#tooltip-background').remove();

      })

    // Scatter plot
    svg3.selectAll("circle")
      .data(data3)
      .enter()
      .append("circle")
      .attr("cx", function (d, i) {
        return i * (width3 * (11 / 12) / bar_number) + 78;
      })
      .attr("cy", function (d) {
        return yScale(d.annualChange);
      })
      .attr("r", 8)
      .attr("fill", "#1B9C85")
      // Creat hover effect for scatter plot
      .on('mouseover', function (event, d) {
        var xPosition = parseFloat(d3.select(this).attr('cx'))
        var yPosition = parseFloat(d3.select(this).attr('cy'))

        // Background for text when hovering
        svg3.append('rect')
          .attr('id', 'tooltip-background')
          .attr('x', xPosition - 70)
          .attr('y', yPosition + 21)
          .attr('width', 155)
          .attr('height', 30)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.7)
          .attr('rx', 5)
          .attr('ry', 5);

        // Display text when hovering
        svg3.append('text')
          .style("font", "18px sans-serif")
          .attr('id', 'tooltip')
          .attr('x', xPosition - 65)
          .attr('y', yPosition + 43)
          .text(d.Date + ": " + d.annualChange + "%")
          .attr('fill', 'black');

        // Blur out the bar chart when hovering
        d3.selectAll("#bar-chart")
          .style("opacity", 0.2);
        d3.select("path")
          .style("filter", "none");
      })
      .on('mouseout', function () {
         // Remove tool tip
        d3.select('#tooltip').remove()
        // Remove background
        d3.select('#tooltip-background').remove();
        // Make the bar chart normal when not hovering the scatter plot
        d3.selectAll("rect")
          .style("opacity", 1);
      })


    var lineGenerator = d3.line()
      .x(function (d, i) { return i * (width3 * (11 / 12) / bar_number) + 78; })
      .y(function (d) { return yScale(d.annualChange); })
      .curve(d3.curveLinear);

    // Add the line to the chart
    svg3.append("path")
      .datum(data3)
      .attr("fill", "none")
      .attr("stroke", "#FFE194")
      .attr("stroke-width", 5)
      .attr("d", lineGenerator)
      // hHver efect to blur out bar chart
      .on("mouseover", function () {
        d3.selectAll("rect")
          .style("opacity", 0.2);
        d3.select("path")
          .style("filter", "none");
      })
      .on("mouseout", function () {
        d3.selectAll("rect")
          .style("opacity", 1);
      });

    // LEGEND //
    var legendSvg = d3.select("#chart3")
      .append("svg")
      .attr("width", width3)
      .attr("height", 50);

    var barLegend = legendSvg.append("g")
      .attr("transform", "translate(20, 20)");

    barLegend.append("rect")
      .attr("x", 290)
      .attr("y", 0)
      .attr("width", 40)
      .attr("height", 25)
      .attr("fill", "#FF6363");

    barLegend.append("text")
      .attr("x", 340)
      .attr("y", 24)
      .text("Quarterly change")
      .style("font-size", "24px");

    var lineLegend = legendSvg.append("g")
      .attr("transform", "translate(200, 34)");

    lineLegend.append("circle")
      .attr("cx", 400)
      .attr("cy", 0)
      .attr("r", 10)
      .attr("fill", "#1B9C85");

    lineLegend.append("text")
      .attr("x", 420)
      .attr("y", 10)
      .text("Annual change")
      .style("font-size", "24px");
  })

  //Visualization 3 END
}

window.onload = init;
