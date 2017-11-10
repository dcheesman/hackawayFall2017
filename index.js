var file = "Hackaway Fall 2017 - Sheet1.csv";

var svg = d3.select('svg'),
  width = +svg.attr("width"),
  height = +svg.attr("height");

var view = svg.append("g");

var zoom = d3.zoom()
    .scaleExtent([0.25, 40])
    .translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);

var color = d3.scaleOrdinal(d3.schemeCategory20);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(110))
    .force("charge", d3.forceManyBody().strength(-500))
    .force("center", d3.forceCenter(width / 2, height / 2));


function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

svg.call(zoom);

function zoomed() {
  view.attr("transform", d3.event.transform);
}

d3.csv(file, function(data) {
  console.log(data);

  var people = d3.map(data, function (d) {return d.person;}).keys();
  var companies = d3.map(data, function (d) {return d.subject;}).keys();

  var nodes = [];

  people.forEach(function(d){
    nodes.push({id: d, group: "person"});
  });

  companies.forEach(function(d){
    nodes.push({id: d, group: "company"});
  });

  console.log(nodes);

  var links = [];
  // {"source": "Napoleon", "target": "Myriel", "value": 1},

  data.forEach(function(d){
    links.push({
      source: d.person,
      target: d.subject,
      state: d.state
    });
  });

  console.log(links);

  var link = view.append("g")
      .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("stroke-width", function(d) {
        return d.state === 'current' ? 4 : 1;
      })
      .attr("stroke", function(d) {
        return d.state === 'current' ? '#F5A623' : '#C0C0C0';
      })
      .attr("stroke-opacity", function(d) {
        return d.state === 'current' ? 1 : 0.75;
      });

  var node = view.append("g")
      .attr("class", "nodes")
    .selectAll(".node");

  var node_enter = node.data(nodes)
    .enter();

  var person_nodes = node_enter.filter(function(d){ return d.group === "person";})
      .append("circle")
      .attr("r", 16)
      .classed('person', true)
      .classed('node', true)
      .attr("fill", '#4A90E2')
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));


  var company_nodes = node_enter.filter(function(d){ return d.group === "company";})
      .append("circle")
      .attr("r", 29)
      .classed('company', true)
      .classed('node', true)
      .attr("fill", 'rgb(70,97,135)')
      .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  var text = node_enter.append("text")
    .attr('dx', 0)
    .attr('dy', 20)
    .attr('text-anchor', 'middle')
    .text(function(d){ return d.id;});

  node.append("title")
      .text(function(d) { return d.id; });

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(links);

  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    person_nodes
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    company_nodes
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });

    text
        .attr("dx", function(d) { return d.x; })
        .attr("dy", function(d) {
          if(d.group == "company"){
            return d.y + 52;
          }
          return d.y + 36;

        });
  }

});