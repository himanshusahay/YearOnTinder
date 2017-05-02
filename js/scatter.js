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

d3.json("data.json", function(data) {

	// Hash map of dates with message and user data in value
	var dateMap = {};
	var personByDate = {};
	
	data.updates.matches.forEach(function(d){
	  	// Save only 1 yes/no record for each day a message was sent
	  	// Each record is a message:
	  	// Save id, name, main image, sent date, message count
	  	// console.log(d);

	  	if (d.messages !== undefined){
		  	if (d.messages.length > 0) {
			  	
			  	console.log(d.messages.length);
			  	d.messages.forEach(function(message){
		          	var messageDate = moment(message.sent_date).format('ddd MMM DD YYYY');
		          	messageDate += " 00:00:00 GMT-0400 (EDT)"; // To make date compatible with building calendar below


					// var unformattedMessageDate = moment(message.sent_date).format('l'); // 23/1/2017
					// var	parseDate = d3.time.format("%d/%m/%Y").parse;
					// var messageDate = parseDate(unformattedMessageDate);
					// console.log(messageDate);
					var timeParse = d3.time.format("%H:%M:%SZ").parse;
					// console.log(moment(message.timestamp).format('LTS'));
					var timeOfDay = moment(message.timestamp).format('LTS');
					// var timeOfDay = timeParse(unformattedTimeOfDay);
					// console.log(timeOfDay);
				  	// Save this match's ID and the time and date of the interaction
				  	// Hashed by date of interaction
				  	if (!(messageDate in personByDate)){
		  				personByDate[messageDate] = [];
				  	}
				  	if (!(d._id in personByDate[messageDate])){  
			  			personByDate[messageDate].push({
			  				id: d._id,
			  				time: timeOfDay
			  			});
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

	console.log(dateMap);
	// Get category of interaction success
	Object.keys(dateMap).forEach(function (key){
		match = dateMap[key];
		console.log(data.updates.messages);
		if (match.message_count > 1){
			result = true;

			var messages = data.updates.matches.filter(function (m) {
				return m.id === key;
			})[0].messages;

			for (let message of messages) {
				console.log(message);
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

	var y = d3.time.scale()
    .range([height, 0]).nice();

	y.domain(Object.keys(personByDate).map(function(d){ return d[1] }));

	var xScale = d3.time.scale()
		.range([0, width]).nice()
		.domain(Object.keys(personByDate).map(function(d){ return d[0] }));

	var xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom")
		.tickSize(-height);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient("left")
		.tickSize(-width);

	var color = d3.scale.category10();

	var tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return d.name + ",<br>";
      });


    var zoomBeh = d3.behavior.zoom()
      .x(xScale)
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
	  .data(personByDate)
	  .enter().append("circle")
	  .classed("dot", true)
	  .attr("r", function (d) { return 6 * Math.sqrt(dateMap[d[0]].message_count / Math.PI); })
	  .attr("transform", transform)
	  .style("fill", function(d) { return color(dateMap[d[0]].success_category); })
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

	// d3.select("input").on("click", change);

	// function change() {
	// 	xCat = "Carbs";
	// 	xMax = d3.max(data, function(d) { return d[xCat]; });
	// 	xMin = d3.min(data, function(d) { return d[xCat]; });

	// 	zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

	// 	var svg = d3.select("#scatter").transition();

	// 	svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

	// 	objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
	// }

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
