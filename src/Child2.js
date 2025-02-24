import React, { Component } from "react";
import * as d3 from 'd3';

class Child2 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.svgRef = React.createRef();
  }

  componentDidMount() {
    this.drawChart();
  }

  componentDidUpdate() {
    this.drawChart();
  }

  drawChart() {
    if (!this.props.data2 || this.props.data2.length === 0) {
      return;
    }

    
    d3.select(this.svgRef.current).selectAll("*").remove();

    
    const width = 500;
    const height = 300;
    const margin = { top: 50, right: 20, bottom: 50, left: 50 }; // Increased top and bottom margins

    
    const dataByDay = d3.group(this.props.data2, d => d.day);
    const avgTipsByDay = Array.from(dataByDay, ([key, value]) => ({
      day: key,
      avgTip: d3.mean(value, d => d.tips)
    }));

    
    const svg = d3.select(this.svgRef.current)
      .attr("width", width)
      .attr("height", height);

    
    const xScale = d3.scaleBand()
      .domain(avgTipsByDay.map(d => d.day))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(avgTipsByDay, d => d.avgTip)])
      .range([height - margin.bottom, margin.top]);

    
    svg.selectAll("rect")
      .data(avgTipsByDay)
      .enter()
      .append("rect")
      .attr("x", d => xScale(d.day))
      .attr("y", d => yScale(d.avgTip))
      .attr("width", xScale.bandwidth())
      .attr("height", d => height - margin.bottom - yScale(d.avgTip))
      .attr("fill", "steelblue");

    
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis);

    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", height - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .text("Day");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 30)
      .attr("text-anchor", "middle")
      .text("Average Tip");

    
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Average Tip by Day");
  }

  render() {
    return <svg className="child2_svg" ref={this.svgRef}></svg>;
  }
}

export default Child2;

