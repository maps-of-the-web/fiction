var hui = document.styleSheets[0].rules || document.styleSheets[0].cssRules;

var styleBySelector = {};
for (var i=0; i<hui.length; i++)
    styleBySelector[hui[i].selectorText] = hui[i].style;

sigma.settings.labelThreshold = 12;
sigma.settings.scalingMode = "outside";

// Add a method to the graph model that returns an
//  object with every neighbors of a node inside:
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
  var neighbors = {}, index = this.allNeighborsIndex[nodeId] || {};

  for (var k in index)
    neighbors[k] = this.nodesIndex[k];

  return neighbors;
});

// Give color to nodes of a certain type.
//  Character nodes are given a Blue color.
//  TV Show nodes are given a Red color.
//  Movie nodes are given a Green color.
//  Nodes with an unknown type are given a Pink color.
function colorNode(node) {
  switch (node.type) {
    case "character":
      node.color = styleBySelector["#graph.character-node"].color || '#303F9F';
      break;
    case "tv-show":
      node.color = styleBySelector["#graph.show-node"].color || '#D32F2F';
      break;
    case "movie":
      node.color = styleBySelector["#graph.movie-node"].color || '#388E3C';
      break;
    default:
      node.color = styleBySelector["#graph.unknown-node"].color || '#C21F5D';
      break;
  }
}

sigma.parsers.json('//raw.githubusercontent.com/maps-of-the-web/fiction/master/data.json', {
  container: 'graph'
}, function(s) {
  s.graph.nodes().forEach(function(node, i, a) {
    // Display the nodes on a circle:
    // We do this so we can have randomly placed nodes,
    //   that are then organized.
    node.x = Math.cos(Math.PI * 2 * i / a.length);
    node.y = Math.sin(Math.PI * 2 * i / a.length);

    // Give color to nodes of a certain type.
    colorNode(node)

    //Add a size if there isn't one.
    node.size = node.size || 1
  });

  sigma.plugins.relativeSize(s, 1);

  s.startForceAtlas2({
    outboundAttractionDistribution: true,
    adjustSizes: true,
    barnesHutOptimize: false
  });

  setTimeout(function() {
    s.stopForceAtlas2();
  }, 60 * 1000);

  // We first need to save the original colors of our
  // nodes and edges, like this:
  s.graph.nodes().forEach(function(n) {
    n.originalColor = n.color;
  });
  s.graph.edges().forEach(function(e) {
    e.originalColor = e.color;
  });

  // When a node is clicked, we check for each node
  // if it is a neighbor of the clicked one. If not,
  // we set its color as grey, and else, it takes its
  // original color.
  // We do the same for the edges, and we only keep
  // edges that have both extremities colored.
  s.bind('clickNode', function(e) {
    var nodeId = e.data.node.id;
    var toKeep = s.graph.neighbors(nodeId);
    var disabledColor = styleBySelector["#graph.disabled-node"].color || "#424242"

    toKeep[nodeId] = e.data.node;

    s.graph.nodes().forEach(function(n) {
      if (toKeep[n.id])
        n.color = n.originalColor;
      else
        n.color = disabledColor;
      });

    s.graph.edges().forEach(function(e) {
      if (toKeep[e.source] && toKeep[e.target])
        e.color = e.originalColor;
      else
        e.color = disabledColor;
    });

    // Since the data has been modified, we need to
    // call the refresh method to make the colors
    // update effective.
    s.refresh();
  });

  // When the stage is clicked, we just color each
  // node and edge with its original color.
  s.bind('clickStage', function(e) {
    s.graph.nodes().forEach(function(n) {
      n.color = n.originalColor;
    });

    s.graph.edges().forEach(function(e) {
      e.color = e.originalColor;
    });

    // Same as in the previous event:
    s.refresh();
  });
});
