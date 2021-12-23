// http://bl.ocks.org/3687826
d3.divgrid = function(config) {
  var columns = [];

  var dg = function(selection) {
    if (columns.length == 0) columns = d3.keys(selection.data()[0][0]);

    // header
    selection.selectAll(".gridheader")
        .data([true])
      .enter().append("div")
        .attr("class", "gridheader")

    var header = selection.select(".gridheader")
      .selectAll(".cell")
      .data(columns);

    header.enter().append("div")
      .attr("class", function(d,i) { return "col-" + i; })
      .classed("cell", true)

    selection.selectAll(".gridheader .cell")
      .text(function(d) { return d; });

    header.exit().remove();

    // rows
    var rows = selection.selectAll(".gridrow")
        .data(function(d) { return d; })

    rows.enter().append("div")
        .attr("class", "gridrow")

    rows.exit().remove();

    var cells = selection.selectAll(".gridrow").selectAll(".cell")
        .data(function(d) { return columns.map(function(col){return d[col];}) })

    // cells
    cells.enter().append("div")
      .attr("class", function(d,i) { return "col-" + i; })
      .classed("cell", true)

    cells.exit().remove();

    selection.selectAll(".cell")
      .text(function(d) { return d; });

    return dg;
  };

  dg.columns = function(_) {
    if (!arguments.length) return columns;
    columns = _;
    return this;
  };

  return dg;
};
