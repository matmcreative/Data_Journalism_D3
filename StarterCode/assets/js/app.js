function responsiveChart() {
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // Define SVG area dimensions
  var svgWidth = window.innerWidth * 0.75;
  var svgHeight = window.innerHeight * 0.75;


  // Define the chart's margins as an object
  var chartMargin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
  };

  // Define dimensions of the chart area
  var chartWidth = svgWidth - chartMargin.left - chartMargin.right;
  var chartHeight = svgHeight - chartMargin.top - chartMargin.bottom;

  // Select body, append SVG area to it, and set the dimensions
  var svg = d3
    .select("body")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // Append a group to the SVG area and shift ('translate') it to the right and down to adhere
  // to the margins set in the "chartMargin" object.
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${chartMargin.left}, ${chartMargin.top})`);

  // Load the data from the csv file
  d3.csv("assets/data/data.csv").then(function(csvData) {
      // console.log(csvData);

      // Parse the income and obesity values from string to integer
      csvData.forEach(function(state) {
          state.obesity = parseInt(state.obesity);
          state.income = parseInt(state.income);
      });
      // Create axis scale functions
      var xLinearScale = d3.scaleLinear()
        .domain([(d3.min(csvData, d => d.income)) * 0.95, d3.max(csvData, d => d.income) * 1.05])
        .range([0, chartWidth]);

      var yLinearScale = d3.scaleLinear()
        .domain([d3.min(csvData, d => d.obesity) * 0.9, d3.max(csvData, d => d.obesity) * 1.1])
        .range([chartHeight, 0]);
      
      // Create axis functions
      var xAxis = d3.axisBottom(xLinearScale);
      var yAxis = d3.axisLeft(yLinearScale);

      // Append axes to chart
      chartGroup.append("g")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);
      chartGroup.append("g")
        .call(yAxis);

      // Create svg text of the abbreviation for each state
      var circleText = chartGroup.selectAll("stateText")
        .data(csvData)
        .enter()  
        .append("text")
        .classed("stateText", true)
        .attr("dx", d => xLinearScale(d.income))
        .attr("dy", d => yLinearScale(d.obesity) + 5)
        .text(d => d.abbr);
      
      // Create a circle for each state
      var circleGroup = chartGroup.selectAll("circle")
        .data(csvData)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.income))
        .attr("cy", d => yLinearScale(d.obesity))
        .attr("r", 15)
        .attr("fill", "green")
        .attr("opacity", ".6")

      // Define the tooltip
      var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([-50, 0])
        .html(function(d) {
          return (`<strong>${d.state}</strong> <hr> Median Income: $${d.income} <hr> Obesity: ${d.obesity}%`);
        });

      // Create the tooltip for the chartGroup
      chartGroup.call(toolTip);

      // Event listener for "mouseover": displays tooltip and changes circle color to red
      circleGroup.on("mouseover", function(d) {
        toolTip.show(d, this);
        d3.select(this)
          .transition()
          .duration(100)
          .attr("r", 30)
          .attr("fill", "grey")
      })
      // Event listener for  "mouseout": hides tooltip and changes circle color back to green
        .on("mouseout", function(d) {
          toolTip.hide(d);
          d3.select(this)
          .transition()
          .duration(500)
          .attr("r", 15)
          .attr("fill", "green")
      });
      // Create axes labels
      chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - chartMargin.left * 0.9)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Obesity (%)");

      chartGroup.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + chartMargin.top * 0.9})`)
        .attr("class", "axisText")
        .text("Median Income (USD)");


  }).catch(function(error) {
    console.log(error);
  });
}
  
// Call responsiveChart() when the page loads
responsiveChart();

// When the browser window is resized, responsiveChart() is called.
d3.select(window).on("resize", responsiveChart);