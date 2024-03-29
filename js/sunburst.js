// Data

axios.get('/data.json')
  .then(function (response) {
    // Self object
    var self = response.data.self;

    // Messages, people
    var messages = {},
      people = {},
      messagesHashedByUser = {},
      phoneNumberMessagesHashedByUser = {},
      gifsHashedByUser = {};


    response.data.updates.matches.forEach(function (match) {
      var person = match.person,
        matchMessages = match.messages;

      // 

      if (person !== undefined) {
        people[person._id] = person;
      }

      var messageCount = 0;
      if (matchMessages !== undefined) {
        matchMessages.forEach(function (message) {
          messageCount += 1;
          // hash messages by date
          var messageDate = moment(message.sent_date).format('ddd MMM DD YYYY');
          messageDate += " 00:00:00 GMT-0400 (Eastern Daylight Time)" // To make date compatible with building calendar below
          if (messageDate in messages) {
            messages[messageDate].push(message);
          } else {
            messages[messageDate] = [message];
          }

          // Check if the message has a phone number
          // Hash the message by date as well


          // Check if a gif was used, save the message number it was used at


        });
      }

    });

});






// // Sunburst
// var width = 960,
//     height = 700,
//     radius = Math.min(width, height) / 2,
//     color = d3.scale.category20c();

// var svg = d3.select("body").append("svg")
//     .attr("width", width)
//     .attr("height", height)
//   .append("g")
//     .attr("transform", "translate(" + width / 2 + "," + height * .52 + ")");
x
// var partition = d3.layout.partition()
//     .sort(null)
//     .size([2 * Math.PI, radius * radius])
//     .value(function(d) { return 1; });

// var arc = d3.svg.arc()
//     .startAngle(function(d) { return d.x; })
//     .endAngle(function(d) { return d.x + d.dx; })
//     .innerRadius(function(d) { return Math.sqrt(d.y); })
//     .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

// d3.json("flare.json", function(error, root) {
//   if (error) throw error;

//   var path = svg.datum(root).selectAll("path")
//       .data(partition.nodes)
//     .enter().append("path")
//       .attr("display", function(d) { return d.depth ? null : "none"; }) // hide inner ring
//       .attr("d", arc)
//       .style("stroke", "#fff")
//       .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
//       .style("fill-rule", "evenodd")
//       .each(stash);

//   d3.selectAll("input").on("change", function change() {
//     var value = this.value === "count"
//         ? function() { return 1; }
//         : function(d) { return d.size; };

//     path
//         .data(partition.value(value).nodes)
//       .transition()
//         .duration(1500)
//         .attrTween("d", arcTween);
//   });
// });

// // Stash the old values for transition.
// function stash(d) {
//   d.x0 = d.x;
//   d.dx0 = d.dx;
// }

// // Interpolate the arcs in data space.
// function arcTween(a) {
//   var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
//   return function(t) {
//     var b = i(t);
//     a.x0 = b.x;
//     a.dx0 = b.dx;
//     return arc(b);
//   };
// }

// d3.select(self.frameElement).style("height", height + "px");