import React, { Component } from 'react';
import * as d3 from 'd3';

class FileUpload extends Component {
  state = { 
    file: null,
    error: null
  };

  handleFileSubmit = (e) => {
    e.preventDefault();
    if (this.state.file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const csvText = e.target.result;
        const blob = new Blob([csvText], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);

        d3.csv(url).then((data) => {
          // Validate the CSV format
          const requiredColumns = ['Date', 'GPT-4', 'Gemini', 'PaLM-2', 'Claude', 'LLaMA-3.1'];
          const headers = Object.keys(data[0]);
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            this.setState({ 
              error: `Missing required columns: ${missingColumns.join(', ')}` 
            });
            return;
          }

          // Format data: ensure numeric values are parsed as numbers
          const formattedData = data.map(d => {
            const formattedRow = { Date: d.Date };
            requiredColumns.slice(1).forEach(model => {
              formattedRow[model] = +d[model]; // Convert to number
            });
            return formattedRow;
          });

          // Pass the formatted data to parent component
          this.props.set_data(formattedData);
          this.setState({ error: null });
          URL.revokeObjectURL(url);
        }).catch(error => {
          console.error("Error parsing CSV:", error);
          this.setState({ error: "Error parsing CSV file. Please check the format." });
        });
      };
      reader.readAsText(this.state.file);
    } else {
      this.setState({ error: "Please select a file first." });
    }
  };

  handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      this.setState({ file, error: null });
    }
  };

  render() {
    return (
      <div className="upload-container">
        <h2>Upload a CSV File</h2>
        <p>Upload a CSV file containing hashtag usage data for LLM models (Date, GPT-4, Gemini, PaLM-2, Claude, LLaMA-3.1)</p>
        <form onSubmit={this.handleFileSubmit}>
          <input 
            type="file" 
            accept=".csv" 
            onChange={this.handleFileChange} 
            className="file-input"
          />
          <button type="submit" className="upload-button">Upload</button>
        </form>
        {this.state.error && (
          <div className="error-message">{this.state.error}</div>
        )}
      </div>
    );
  }
}

export default FileUpload;