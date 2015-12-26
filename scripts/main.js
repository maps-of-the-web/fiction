sigma.settings.labelThreshold = 12;
sigma.settings.scalingMode = "outside";

// Add a method to the graph model that returns an
//  object with every neighbors of a node inside:
sigma.classes.graph.addMethod('neighbors', function(nodeId) {
  var k,
    neighbors = {},
    index = this.allNeighborsIndex[nodeId] || {};

  for (k in index)
    neighbors[k] = this.nodesIndex[k];

  return neighbors;
});

sigma.parsers.json('//raw.githubusercontent.com/maps-of-the-web/fiction/master/data.json', {
  container: 'sigma-container'
}, function(s) {
  s.graph.nodes().forEach(function(node, i, a) {
    // Display the nodes on a circle:
    // We do this so we can have randomly placed nodes,
    //   that are then organized.
    node.x = Math.cos(Math.PI * 2 * i / a.length);
    node.y = Math.sin(Math.PI * 2 * i / a.length);

    // Give color to nodes of a certain type.
    switch (node.type) {
      case "character":
        node.color = "#0000FF";
        break;
      case "tv-show":
        node.color = "#FF0000";
        break;
      case "movie":
        node.color = "#00FF00";
        break;
      default:
        break;
    }

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
    var nodeId = e.data.node.id,
    toKeep = s.graph.neighbors(nodeId);
    toKeep[nodeId] = e.data.node;

    s.graph.nodes().forEach(function(n) {
      if (toKeep[n.id])
        n.color = n.originalColor;
      else
        n.color = '#eee';
      });

    s.graph.edges().forEach(function(e) {
      if (toKeep[e.source] && toKeep[e.target])
        e.color = e.originalColor;
      else
        e.color = '#eee';
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
