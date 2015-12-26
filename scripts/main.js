sigma.settings.labelThreshold = 12;
sigma.settings.scalingMode = "outside";
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
});
