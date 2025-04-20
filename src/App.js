import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      chartRendered: false,
    };
    this.svgRef = React.createRef();
    this.tooltipRef = React.createRef();
    this.legendRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.data !== this.state.data && this.state.data.length > 0 && !this.state.chartRendered) {
      this.renderStreamgraph();
      this.renderLegend();
      this.setState({ chartRendered: true });
    }
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data, chartRendered: false });
  }

  renderStreamgraph = () => {
    const { data } = this.state;
    const margin = { top: 20, right: 30, bottom: 50, left: 50 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Define model colors as specified in the assignment
    const modelColors = {
      "GPT-4": "#e41a1c",
      "Gemini": "#377eb8",
      "PaLM-2": "#4daf4a",
      "Claude": "#984ea3",
      "LLaMA-3.1": "#ff7f00"
    };

    // Order of models for stacking (bottom to top)
    const modelOrder = ["LLaMA-3.1", "Claude", "PaLM-2", "Gemini", "GPT-4"];

    // Create SVG
    const svg = d3.select(this.svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom);

    svg.selectAll("*").remove(); // Clear previous content

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    if (data.length === 0) return;

    // Get dates in order
    const dates = data.map(d => d.Date);

    // Create scales
    const x = d3.scalePoint()
      .domain(dates)
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => {
        return d3.sum(modelOrder, model => +d[model]);
      })])
      .range([height, 0]);

    // Stack the data
    const stack = d3.stack()
      .keys(modelOrder)
      .value((d, key) => +d[key] || 0);

    const stackedData = stack(data);

    // Create the streamgraph generator
    const area = d3.area()
      .x(d => x(d.data.Date))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveCardinal);

    // Add the streamgraph paths
    g.selectAll(".stream")
      .data(stackedData)
      .join("path")
      .attr("class", "stream")
      .attr("fill", d => modelColors[d.key])
      .attr("d", area)
      .on("mouseover", (event, d) => {
        // Highlight the hovered stream
        d3.select(event.currentTarget).attr("opacity", 0.8);
        
        // Show tooltip with bar chart
        this.showTooltip(event, d.key, data);
      })
      .on("mousemove", (event) => {
        // Update tooltip position on mouse move
        this.updateTooltipPosition(event);
      })
      .on("mouseout", (event) => {
        // Remove highlighting
        d3.select(event.currentTarget).attr("opacity", 1);
        
        // Hide tooltip
        d3.select(".tooltip").style("opacity", 0);
      });

    // Add X axis
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle");

    // Create tooltip div if it doesn't exist
    if (d3.select(".tooltip").empty()) {
      d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    }
  }

  renderLegend = () => {
    // Define model colors as specified in the assignment
    const modelColors = {
      "GPT-4": "#e41a1c",
      "Gemini": "#377eb8",
      "PaLM-2": "#4daf4a",
      "Claude": "#984ea3",
      "LLaMA-3.1": "#ff7f00"
    };

    // Order of models for legend
    const modelOrder = ["LLaMA-3.1", "Claude", "PaLM-2", "Gemini", "GPT-4"];

    const legendContainer = d3.select(this.legendRef.current);
    legendContainer.selectAll("*").remove(); // Clear previous content

    // Create legend items
    const legendItems = legendContainer.selectAll(".legend-item")
      .data(modelOrder)
      .enter()
      .append("div")
      .attr("class", "legend-item");

    // Add color box
    legendItems.append("div")
      .attr("class", "legend-color")
      .style("background-color", d => modelColors[d]);

    // Add label
    legendItems.append("span")
      .text(d => d);
  }

  showTooltip = (event, model, data) => {
    // Define model colors as specified in the assignment
    const modelColors = {
      "GPT-4": "#e41a1c",
      "Gemini": "#377eb8",
      "PaLM-2": "#4daf4a",
      "Claude": "#984ea3",
      "LLaMA-3.1": "#ff7f00"
    };

    const tooltip = d3.select(".tooltip");
    
    // Show tooltip
    tooltip
      .style("opacity", 1)
      .style("display", "block");
    
    // Clear previous tooltip content
    tooltip.html("");
    
    // Add model name as title
    tooltip.append("h3")
      .text(`${model} Hashtag Usage`);
    
    // Create mini bar chart
    const margin = { top: 10, right: 10, bottom: 30, left: 40 };
    const width = 280 - margin.left - margin.right;
    const height = 180 - margin.top - margin.bottom;
    
    const svg = tooltip.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Extract data for the selected model
    const modelData = data.map(d => ({
      date: d.Date,
      value: +d[model]
    }));
    
    // Create scales
    const x = d3.scaleBand()
      .domain(modelData.map(d => d.date))
      .range([0, width])
      .padding(0.1);
    
    const y = d3.scaleLinear()
      .domain([0, d3.max(modelData, d => d.value)])
      .nice()
      .range([height, 0]);
    
    // Add X axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");
    
    // Add Y axis
    svg.append("g")
      .call(d3.axisLeft(y));
    
    // Add bars
    svg.selectAll(".bar")
      .data(modelData)
      .join("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.date))
      .attr("y", d => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", modelColors[model]);
    
    // Update tooltip position
    this.updateTooltipPosition(event);
  }

  updateTooltipPosition = (event) => {
    const tooltip = d3.select(".tooltip");
    
    // Get tooltip dimensions
    const tooltipNode = tooltip.node();
    const tooltipWidth = tooltipNode.offsetWidth;
    const tooltipHeight = tooltipNode.offsetHeight;
    
    // Get page dimensions
    const pageWidth = window.innerWidth;
    const pageHeight = window.innerHeight;
    
    // Calculate position to ensure tooltip stays in viewport
    let left = event.pageX + 10;
    let top = event.pageY + 10;
    
    // Adjust if tooltip would go off right edge
    if (left + tooltipWidth > pageWidth - 10) {
      left = event.pageX - tooltipWidth - 10;
    }
    
    // Adjust if tooltip would go off bottom edge
    if (top + tooltipHeight > pageHeight - 10) {
      top = event.pageY - tooltipHeight - 10;
    }
    
    // Ensure tooltip doesn't go off left or top edge
    left = Math.max(10, left);
    top = Math.max(10, top);
    
    // Update tooltip position
    tooltip
      .style("left", left + "px")
      .style("top", top + "px");
  }

  render() {
    return (
      <div className="app-container">
        <h1>LLM Hashtag Usage Over Time</h1>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="visualization-container">
          <svg ref={this.svgRef} className="streamgraph"></svg>
          <div ref={this.legendRef} className="legend"></div>
        </div>
      </div>
    );
  }
}

export default App;