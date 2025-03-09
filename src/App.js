import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selected_data: [],
      sentimentColors: { positive: "green", negative: "red", neutral: "gray" },
      hoveredDataPoints: [],
      chartRendered: false,
    };
    this.svgRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.data !== this.state.data && this.state.data.length > 0 && !this.state.chartRendered) {
      this.renderChart();
      this.setState({ chartRendered: true });
    }
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data, chartRendered: false});
  }

  renderChart = () => {
    const { data, sentimentColors } = this.state;
    const margin = { left: 50, right: 150, top: 20, bottom: 50 }; // Increased right margin for legend
    const width = 600;
    const height = 400;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(this.svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // Clear previous content

    if (data.length === 0) return;

    const x = d3.scaleLinear()
      .domain(d3.extent(data, d => +d["Dimension 1"]))
      .range([0, innerWidth])
      .nice();

    const y = d3.scaleLinear()
      .domain(d3.extent(data, d => +d["Dimension 2"]))
      .range([innerHeight, 0])
      .nice();

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    //Axes
    g.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x));

    g.append("g")
      .call(d3.axisLeft(y));

    //add circles
    g.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(+d["Dimension 1"]))
      .attr("cy", d => y(+d["Dimension 2"]))
      .attr("r", 5)
      .attr("fill", d => sentimentColors[d.PredictedSentiment.toLowerCase()] || "gray")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        this.handleCircleClick(d);
      })
      .on("mouseover", (event, d) => {
        this.handleCircleMouseOver(event, d, x, y);
      })
      .on("mouseout", (event, d) => {
        this.handleCircleMouseOut(event, d);
      });

    //brush
    const brush = d3.brush()
      .extent([[0, 0], [innerWidth, innerHeight]])
      .on("brush", this.handleBrush.bind(this, x, y))
      .on("end", this.handleBrushEnd.bind(this, x, y));

    g.append("g")
      .call(brush);

    // Legend
    const legend = g.append("g")
      .attr("transform", `translate(${innerWidth + 20}, 20)`); // Position to the right

    const legendKeys = Object.keys(sentimentColors);

    legendKeys.forEach((key, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 20)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", sentimentColors[key]);

      legend.append("text")
        .attr("x", 25)
        .attr("y", i * 20 + 14)
        .text(key)
        .style("font-size", "12px");
    });

  }
  //Brush function
  handleBrush(x, y, event) {
    if (!event.selection) return;
    const [[x0, y0], [x1, y1]] = event.selection;

    const selectedDataPoints = this.state.data.filter(d => {
      const cx = x(d["Dimension 1"]);
      const cy = y(d["Dimension 2"]);
      return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1;
    });
    this.setState({ hoveredDataPoints: selectedDataPoints });
  }
  handleBrushEnd(x, y, event) {
    if (!event.selection) {
      this.setState({ hoveredDataPoints: [] });
    }
  }

  handleCircleMouseOver = (event, d, x, y) => {
    // add hovered circle into the hoveredDataPoints array
    this.setState((prevState) => ({
      hoveredDataPoints: [...prevState.hoveredDataPoints, d],
    }));
  };
  handleCircleMouseOut = (event, d) => {
    // remove hovered circle from the hoveredDataPoints array
    this.setState((prevState) => ({
      hoveredDataPoints: prevState.hoveredDataPoints.filter((data) => data !== d),
    }));
  };

  handleCircleClick = (clickedDataPoint) => {
    const { selected_data } = this.state;
    const isAlreadySelected = selected_data.some(
      (selected) => selected.Tweets === clickedDataPoint.Tweets
    );

    if (isAlreadySelected) {
      const updatedSelectedData = selected_data.filter(
        (selected) => selected.Tweets !== clickedDataPoint.Tweets
      );
      this.setState({ selected_data: updatedSelectedData });
    } else {
      this.setState({ selected_data: [...selected_data, clickedDataPoint] });
    }
  }

  renderSelectedTweets = () => {
    const { selected_data, hoveredDataPoints, sentimentColors } = this.state;

    const combinedData = [...selected_data, ...hoveredDataPoints];
    const uniqueData = combinedData.filter((item, index, self) =>
      index === self.findIndex((t) => (
        t.Tweets === item.Tweets
      ))
    );

    if (uniqueData.length === 0) {
      return <p>No tweets selected or hovered.</p>;
    }

    return (
      <ul>
        {uniqueData.map((tweet) => (
          <li key={tweet.Tweets}>
            <span style={{ color: sentimentColors[tweet.PredictedSentiment.toLowerCase()] || "black" }}>
              {tweet.Tweets}
            </span>
          </li>
        ))}
      </ul>
    );
  }

  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item">
            <h2>Projected Tweets</h2>
            <svg ref={this.svgRef}></svg>
          </div>
          <div className="child2 item">
            <h2>Selected Tweets</h2>
            {this.renderSelectedTweets()}
          </div>
        </div>
      </div>
    );
  }
}

export default App;
