var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var xCat = "Timeline",
	yCat = "Time of Day", // First interaction that day
	rCat = "Total Number of Messages Exchanged",
	// Color legend:
	// 1 message (red), 2 - 3 messages (pink), 
	// >3 messages (blue), >=10 messages (yellow), phone number (green)
	colorCat = "Successful";

var minDate = -1;
var maxDate = -1;

d3.json("data.json", function(data) {

	// Hash map of dates with message and user data in value
	var dateMap = {};
	var personByDate = {};
	var personByDateArray = [];
	
	data.updates.matches.forEach(function(d){
	  	// Save only 1 yes/no record for each day a message was sent
	  	// Each record is a message:
	  	// Save id, name, main image, sent date, message count
	  	// console.log(d);

	  	if (d.messages !== undefined){
		  	if (d.messages.length > 0) {
			  	
			  	// console.log(d.messages.length);

			  	d.messages.forEach(function(message){
		          	// var messageDate = moment(message.sent_date).format('ddd MMM DD YYYY');
		          	// messageDate += " 00:00:00 GMT-0400 (Eastern Daylight Time)"; // To make date compatible with building calendar below
		          	// console.log(message.message);
		          	if (message.message !== undefined){
		          		// console.log(message.message);
						var date = moment(message.sent_date).format('L');
						var month = date.substring(0,2);
						var day = date.substring(3, 5);
						var year = date.substring(6, 10);
						// console.log(date, month, day, year)
						var messageDate = new Date(parseInt(year), parseInt(month)-1, parseInt(day));
						if (minDate === -1){
							minDate = messageDate;
						}
						else if (messageDate < minDate){
							minDate = messageDate;
						}

						if (maxDate === -1){
							maxDate = messageDate;
						}
						else if (messageDate > maxDate){
							maxDate = messageDate;
						}
						var unformattedTimeOfDay = moment(message.timestamp).format('HHmm');
						// Change time to something between 0 and 24. 1:30 pm -> 13.5
						// Ignore seconds
						var hour = unformattedTimeOfDay.substring(0, 2);
						var minute = unformattedTimeOfDay.substring(2, 4);		
						var timeNumString = hour + '.' + minute;
						var timeOfDay = parseFloat(timeNumString);
						// console.log(hour, minute, timeNum);
						// Save this match's ID and the time and date of the interaction
					  	// Hashed by date of interaction
					  	if (!(messageDate in personByDate)){
			  				personByDate[messageDate] = [];
					  	}
					  	if (!(d._id in personByDate[messageDate])){  
				  			personByDate[messageDate].push({
				  				id: d._id,
				  				time: timeOfDay,
				  				date: messageDate
				  			});
					  	}
				  	}
			  	});
			  	
			  	// Save details about this user (will only do this once)
			  	if (!(d._id in dateMap) && d.person !== undefined) {
			  		var image_url = d.person.photos.length > 0 ? d.person.photos[0].url : "http://a3.mzstatic.com/us/r30/Purple19/v4/86/bf/53/86bf5324-e2fb-b196-aa1a-bcde5f0e84fe/screen696x696.jpeg";
			  		dateMap[d._id] = {
			  			id: d._id,
			  			name: d.person.name,
			  			image_url: image_url,
			  			message_count: d.messages.length,
			  			success_category: 1
			  		}
			  	}
			}
		}
	});

	Object.keys(personByDate).forEach(function (key){
		var people = personByDate[key];
		personByDateArray = personByDateArray.concat(people);
	});

	// console.log(dateMap);
	// Get category of interaction success
	Object.keys(dateMap).forEach(function (key){
		match = dateMap[key];
		// console.log(data.updates.messages);
		if (match.message_count > 1){
			result = true;

			var messages = data.updates.matches.filter(function (m) {
				return m.id === key;
			})[0].messages;

			for (let message of messages) {
				// console.log(message);
				// result = libphonenumber.isPossibleNumber(libphonenumber.findNumbers(message.message));
				result = false;
				if (result){
					match.success_category = 5;
					break;
				}
			}

			if (match.success_category != 5){
				var message_count = match.message_count;
				if (message_count >= 10){
					match.success_category = 4;
				}
				else if (message_count > 3){
					match.success_category = 3;
				}
				else if (message_count > 2){
					match.success_category = 2;
				}
			}
		}
	});

	var y = d3.scale.linear()
    .range([height, 0]).nice()
    .domain([0, 24]);

	// y.domain([Object.keys(personByDate).map(function(d){ return personByDate[d].time })]);

    // y.domain([0, d3.max(Object.keys(personByDate), function(d) { return personByDate[d].time; })]);

	var x = d3.time.scale()
		.range([0, width]); //.nice()
		// .domain(Object.keys(personByDate).map(function(d){ return d.id }));

	x.domain([minDate, maxDate]);
	// x.domain(d3.extent(Object.keys(personByDate).map(function(d) {
	// 	return personByDate[d].messageDate;
	// })));

	var xAxis = d3.svg.axis().scale(d3.scale.ordinal().rangePoints([0, width ], .25))
		.scale(x)
		.orient("bottom")
		.tickSize(-height)
		.tickFormat(d3.time.format("%b %d %Y"))
		.ticks(4)
		.tickPadding(2);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickSize(-width);

	var color = d3.scale.category10();

  var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return xCat + ": " + d[xCat] + "<br>" + yCat + ": " + d[yCat];
      });

  var zoomBeh = d3.behavior.zoom()
      .x(x)
      .y(y)
      .scaleExtent([0, 500])
      .on("zoom", zoom);

  var svg = d3.select("#scatter")
    .append("svg")
      .attr("width", outerWidth)
      .attr("height", outerHeight)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      .call(zoomBeh);

  svg.call(tip);

  svg.append("rect")
      .attr("width", width)
      .attr("height", height);

  svg.append("g")
      .classed("x axis", true)
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .classed("label", true)
      .attr("x", width)
      .attr("y", margin.bottom - 10)
      .style("text-anchor", "end")
      .text(xCat);

  svg.append("g")
      .classed("y axis", true)
      .call(yAxis)
    .append("text")
      .classed("label", true)
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text(yCat);

  var objects = svg.append("svg")
      .classed("objects", true)
      .attr("width", width)
      .attr("height", height);

  objects.append("svg:line")
      .classed("axisLine hAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", width)
      .attr("y2", 0)
      .attr("transform", "translate(0," + height + ")");

  objects.append("svg:line")
      .classed("axisLine vAxisLine", true)
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", 0)
      .attr("y2", height);

  objects.selectAll(".dot")
      .data(personByDateArray)
    .enter().append("circle")
      .classed("dot", true)
      .attr("r", 4) //function (d) { return 6 * Math.sqrt(dateMap[d.id].message_count / Math.PI); })
      // .attr("transform", transform)
      // .style("fill", function(d) { return color(dateMap[d.id].success_category); })
      .attr("cx", function (d) { return d.time; })
      .attr("cy", function (d) { return d.date; })
      .on("mouseover", tip.show)
      .on("mouseout", tip.hide);

  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .classed("legend", true)
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("circle")
      .attr("r", 3.5)
      .attr("cx", width + 20)
      .attr("fill", color);

  legend.append("text")
      .attr("x", width + 26)
      .attr("dy", ".35em")
      .text(function(d) { return d; });

  d3.select("input").on("click", change);

  function change() {
    xCat = "Carbs";
    xMax = d3.max(data, function(d) { return d[xCat]; });
    xMin = d3.min(data, function(d) { return d[xCat]; });

    zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

    var svg = d3.select("#scatter").transition();

    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
  }

  function zoom() {
    svg.select(".x.axis").call(xAxis);
    svg.select(".y.axis").call(yAxis);

    svg.selectAll(".dot")
        .attr("transform", transform);
  }

  function transform(d) {
    return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
  }
});