const padding = 100,
  width = 1000 - padding,
  height = 600 - padding;

const svg = d3
  .select(".svg-container")
  .append("svg")
  .attr("width", width + padding)
  .attr("height", height + padding);

const colors = d3
  .scaleQuantize()
  .domain([1, 75.21])
  .range(d3.schemeBlues[9]);

const tooltip = d3
  .select(".svg-container")
  .append("div")
  .style("display", "none")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("background-color", "LightBlue")
  .style("border", "solid")
  .style("border-width", "3px")
  .style("border-radius", "10px")
  .style("padding", "8px");

const path = d3.geoPath();
const projection = d3.geoMercator();

const data = d3.map();

const URLS = [
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json",
  "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
];

Promise.all(URLS.map(url => d3.json(url))).then(data =>
  processData(data[0], data[1])
);

function processData(map, data) {
  svg
    .append("g")
    .selectAll("path")
    .data(topojson.feature(map, map.objects.counties).features)
    .enter()
    .append("path")
    .attr("class", "county")
    // draw counties
    .attr("d", path)
    .attr("data-fips", value => value.id)
    .attr(
      "data-education",
      value => data.filter(data => data.fips == value.id)[0].bachelorsOrHigher
    )
    // set the counties color
    .attr("fill", value =>
      colors(data.filter(data => data.fips == value.id)[0].bachelorsOrHigher)
    )
    .on("mouseover", function(d) {
      tooltip.style("display", "block");
      tooltip
        .html(() => {
          var info = data.filter(values => values.fips == d.id);

          return (
            info[0]["area_name"] +
            ", " +
            info[0]["state"] +
            ": " +
            info[0].bachelorsOrHigher +
            "%"
          );
        })
        .attr("data-education", function() {
          var result = data.filter(function(obj) {
            return obj.fips == d.id;
          });
          if (result[0]) {
            return result[0].bachelorsOrHigher;
          }
          //could not find a matching fips id in the data
          return 0;
        })
        .style("left", d3.event.pageX + 20 + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })
    .on("mouseout", function(d) {
      tooltip.style("display", "none");
    });
}

//
const legendScale = d3
  .scaleLinear()
  .domain([1, 75.1])
  .rangeRound([450, 800]);

const legend = svg.append("g").attr("id", "legend");

legend
  .selectAll("rect")
  .data(colors.range().map(data => colors.invertExtent(data)))
  .enter()
  .append("rect")
  .attr("height", 8)
  .attr("x", data => legendScale(data[0]))
  .attr("width", data => legendScale(data[1]) - legendScale(data[0]))
  .attr("fill", data => colors(data[0]));

const legendAxis = d3
  .axisBottom()
  .scale(legendScale)
  .ticks(20)
  .tickFormat(value => value + "%");

const legendAxisGroup = svg
  .append("g")
  .call(legendAxis)
  .attr("id", "legend-axis")
  .attr("transform", "translate(0, 8)");
