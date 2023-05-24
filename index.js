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
    displayChart(name);
  }

  // Load json files
  var somCall = d3.json('json/som-merged-topo.json');
  var adm1Call = d3.json('json/som_adm1.json');
  // Load Somalia details
  var countrieslabelCall = {
    "countries": [
      { "country": "Somalia", "coordinates": [46.1996, 5.1521] }
    ]
  };
  // Load data file
  var csvCall = d3.csv('data/acute_food_insecurity_by_region.csv');
  var year = 2022;

  Promise.all([adm1Call, somCall, countrieslabelCall, csvCall]).then(function(values) {
    // Store data collected from loaded files
    var adm1Args = values[0];
    var somArgs = values[1];
    var countrieslabelArgs = values[2];
    var csvData = values[3];
    var selectedYear = year;
    // Extract the 'countries' property if 'countries.json' is provided, otherwise set it as an empty array
    var countrieslabel = (countrieslabelArgs) ? countrieslabelArgs.countries : [];
    // Call the 'generateMap' function with the loaded data
    generateMap(somArgs, countrieslabel);
    // Call the 'displayChart' function with the loaded CSV data
    displayChart(csvData, selectedYear);
  });

  // Get all the year buttons
  var yearButtons = document.getElementsByClassName("year-btn");

  // Attach event listeners to the buttons using a loop
  for (var i = 0; i < yearButtons.length; i++) {
    yearButtons[i].addEventListener("click", function() {
      var year = parseInt(this.dataset.year); // Get the year value from the data attribute
    });
  }

  function displayChart(csvData, selectedYear) {
    // Parse the CSV data
    csvData.forEach(function(d) {
      d.year = +d.year;
      d.percentage = +d.percentage;
    });

    // Filter the data based on default year - 2022
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

  // set the dimensions and margins of the graph
  margin = {top: 80, right: 135, bottom: 80, left: 150}

  // append the svg object to the body of the page
  svg2 = d3.select("#chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 100)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",`translate(${margin.left}, ${margin.top})`);

  // Parse the Data
  d3.csv("data/rural_urban_areas_total.csv").then( function(data) {

    //GENERAL//

    const areas = data.columns.slice(1)

    // color palette
    const color = d3.scaleOrdinal()
      .domain(areas)
      .range(["#8338ec","#ff0054", "#0496FF"]);

    //stack the data
    const stackedData = d3.stack()
      .keys(areas)
      (data)

    svg2.append("text")
      .attr("x", ((width + 150) / 2))
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "26px")
      .style('font-family', 'Arial')
      .style("font-weight", "bold")
      .text("Total Acute Food Insecurity in Somalia Regions (2015 - 2023)");

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

    // Add X axis label:
    svg2.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height+60 )
      .style('font-family', 'Arial')
      .style("font-size", 20)
      .text("Year");

    // Add Y axis label:
    svg2.append("text")
      .attr('x', -240)
      .attr("y", -100 )
      .attr('transform', 'rotate(270)')
      .text("Total Number of People Affected")
      .style('font-family', 'Arial')
      .style("font-size", 20)
      .attr('text-anchor', 'middle')

    // Add Y axis
    const y = d3.scaleLinear()
      .domain([0, 10000000])
      .range([ height, 0 ]);
    svg2.append("g")
      .call(d3.axisLeft(y).ticks(10))
      .style('font-family', 'Arial')
      .style("font-size", 15)

    // BRUSHING AND CHART //

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
      .on("end", updateAreaChart)

    const areaChart = svg2.append('g')
      .attr("clip-path", "url(#clip)")

    // Area generator
    const area = d3.area()
      .x(function(d) { return x(Number(d.data.Year)); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })

    // Show the areas
    areaChart
      .selectAll("mylayers")
      .data(stackedData)
      .join("path")
      .attr("class", function(d) { return "myArea " + d.key })
      .style("fill", function(d) { return color(d.key); })
      .attr("d", area)


    // Add the brushing
    areaChart
      .append("g")
      .attr("class", "brush")
      .call(brush);

    let idleTimeout
    function idled() { idleTimeout = null; }


    function updateAreaChart(event,d) {

      extent = event.selection

      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
        x.domain(d3.extent(data, function(d) { return Number(d.Year); }))
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        areaChart.select(".brush").call(brush.move, null)
      }

      // Update axis and area position
      xAxis.transition().duration(1000).call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')))
      areaChart
        .selectAll("path")
        .transition().duration(1000)
        .attr("d", area)
      }

      // HIGHLIGHT GROUP //

      // What to do when one group is hovered
      const highlight = function(event,d){
        // reduce opacity of all groups
        d3.selectAll(".myArea").transition().duration(500).style("opacity", .1)
        // except the one that is hovered
        d3.select("."+d).transition().duration(500).style("opacity", 1)
      }

      // And when it is not hovered anymore
      const noHighlight = function(event,d){
        d3.selectAll(".myArea").transition().duration(500).style("opacity", 1)
      }

      // LEGEND //

      // Add one dot in the legend for each name.
      const size = 30
      svg2.selectAll("myrect")
        .data(areas)
        .join("rect")
        .attr("x", 770)
        .attr("y", function(d,i){ return 10 + i*(size+5)})
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)

      // Add one dot in the legend for each name.
      svg2.selectAll("mylabels")
        .data(areas)
        .join("text")
        .attr("x", 790 + size*1.2)
        .attr("y", function(d,i){ return 10 + i*(size+5) + (size/2)})
        .text(function(d){ return d})
        .style('font-family', 'Arial')
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .on("mouseover", highlight)
        .on("mouseleave", noHighlight)
  })

  //Visualization 2 END


  //Visualization 3 START

  var svg3 = d3.select("#chart3")
    .append("svg")
    .attr("width", width + margin.left + margin.right )
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform",`translate(${margin.left}, ${margin.top})`);

  d3.csv("data/consumer_price_food_indices_som.csv").then(function (data3) {
    var bar_number = data3.length
    console.log(data3)
    var quarterlyChange = data3.map(function (d) {
      return Number(d.quarterlyChange);
    });

    //add scale for visualization
    var xScale = d3.scaleBand()
      .range([0, width])
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
      .attr("transform", "translate(0," + height * (2 / 3) + ")")
      .call(xAxis)
      .attr("marker-end","url(#arrow)");

    svg3.append("g")
      .attr("class", "grid")
      .call(yAxis)
      .attr("marker-end","url(#arrow)");

    svg3.selectAll(".grid line") //add grid line
      .style("stroke-width", "0.5px")
      .style("stroke", "#cccccc");
    //

    //add bars
    svg3.selectAll("rect")
      .data(data3)
      .enter()
      .append("rect")
      .attr("id", "bar-chart")
      .attr("x", function (d, i) {
        return i * (width * (11/12) / bar_number) + 20;
      })
      .attr("y", function (d) {
        if (d.quarterlyChange >= 0) {
          return yScale(d.quarterlyChange);
        } else {
          return height * (2 / 3);
        }
      })
      .attr('width', width  / bar_number - bar_padding)
      .attr('height', function (d) {
        return Math.abs(height * 2 / 3 - yScale(d.quarterlyChange));
      })
      .attr("fill", "#FF6363")
      .on("mouseover", function (event, d, i) {
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
          .attr('width', 118)
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

        d3.select('#tooltip').remove() //remove tool tip
        d3.select('#tooltip-background').remove(); // remove background

      })
    //
      
    //scatter plot
    svg3.selectAll("circle")
      .data(data3)
      .enter()
      .append("circle")
      .attr("cx", function (d, i) {
        return i * (width * (11 / 12) / bar_number) + 34;
      })
      .attr("cy", function (d) {
        return yScale(d.annualChange);
      })
      .attr("r", 8)
      .attr("fill", "#1B9C85")
      .on('mouseover', function (event, d) {  //creat hover effect for scatter plot
        var xPosition = parseFloat(d3.select(this).attr('cx'))
        var yPosition = parseFloat(d3.select(this).attr('cy'))

        svg3.append('rect') //background for text when hovering
          .attr('id', 'tooltip-background')
          .attr('x', xPosition - 68)
          .attr('y', yPosition + 21)
          .attr('width', 118)
          .attr('height', 20)
          .attr('fill', 'lightblue')
          .attr('opacity', 0.7)
          .attr('rx', 5)
          .attr('ry', 5);

        svg3.append('text')   //display text when hovering
          .style("font", "14px sans-serif")
          .attr('id', 'tooltip')
          .attr('x', xPosition - 65)
          .attr('y', yPosition + 35)
          .text(d.Date + ": " + d.annualChange + "%")
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
      .x(function (d, i) { return i * (width * (11 / 12) / bar_number) + 34; })
      .y(function (d) { return yScale(d.annualChange); })
      .curve(d3.curveLinear);

    // Add the line to the chart
    svg3.append("path")
      .datum(data3)
      .attr("fill", "none")
      .attr("stroke", "#FFE194")
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



  //Visualization 3 END
}

window.onload = init;
