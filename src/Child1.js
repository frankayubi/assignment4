import React, { Component } from "react";
import * as d3 from 'd3';

class Child1 extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.svgRef = React.createRef(); 
  }

  componentDidMount() {
    console.log(this.props.data1);
    this.drawChart();
  }

  componentDidUpdate() {
    console.log("ComponentDidUpdate", this.props.data1);
    this.drawChart(); 
  }

  drawChart() {
    if(!this.props.data1 || this.props.data1.length === 0){
      return
    }
    
    d3.select(this.svgRef.current).selectAll("*").remove();

   
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    
    const svg = d3.select(this.svgRef.current)
      .attr("width", width)
      .attr("height", height)

    
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(this.props.data1, d => d.total_bill)])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.props.data1, d => d.tips)])
      .range([height - margin.bottom, margin.top]);

    
    svg.selectAll("circle")
      .data(this.props.data1)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.total_bill))
      .attr("cy", d => yScale(d.tips))
      .attr("r", 5)
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
      .attr("y", height - margin.bottom + 30)
      .attr("text-anchor", "middle")
      .text("Total Bill");

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", margin.left - 30)
      .attr("text-anchor", "middle")
      .text("Tip");

      svg.append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Total Bill vs. Tips");
  }

  render() {
    return <svg className="child1_svg" ref={this.svgRef}></svg>;
  }
}

export default Child1;
