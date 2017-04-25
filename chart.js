var diameter = 70, //max size of the bubbles
    w = 700,
    h = 700;
    n_min = 10; //minimal number of mentions for tag

var decade = 1890;

var setTags = [
{key:"monster"}, {key:"zombies"}, {key:"demon"}, {key:"ghost"},  {key:"alien"}, {key:"gore"},
{key:"witch"}, {key:"slasher"}, {key:"scientist"}, {key:"vampire"}];
var customColors = {
    "monster": d3.rgb(5,48,97),
    "demon": d3.rgb(33,102,172),
    "alien": d3.rgb(67,147,195),
    "witch": d3.rgb(146,197,222),
    "scientist": d3.rgb(209,229,240),

    "zombies": d3.rgb(103,0,31),
    "ghost": d3.rgb(178,24,43),
    "gore": d3.rgb(214,96,77),
    "slasher": d3.rgb(244,165,130),
    "vampire": d3.rgb(253,219,199)

}

var svg = d3.select("#area1")
        .append("svg")
        .attr("id", "bubbleChart")
        .attr("width", w)
        .attr("height", h);

d3.csv("data.csv", function(error, data){

    data = data.map(function(d){
        d.year = +d["year"];
        d.year_bucket = +d["year_bucket"];
        return d;
        });

    // count tne number of mentions for all tags
    var tagCount = d3.nest()
                      .key(function(d) { return d.name; })
                      .rollup(function(v) { return v.length; })
                      .entries(data);
    // select tags that were mentioned more than n_min times
    var tagsToDraw = tagCount.filter(function(d) {
                                        return d.value > n_min;
                                     });
    var radiusScale = d3.scaleSqrt()
                    .domain([n_min, d3.max(tagsToDraw, function(d){
                        return d.value})])
                    .range([0,diameter]);

    var colorScale    = d3.scaleSequential()
                        .domain([0,d3.max(tagsToDraw, function(d){return d.value})])
    //                    .interpolator(d3.interpolateCool);
                        .interpolator(d3.interpolate("darkslategrey","lightgrey"));
    var setColor = function(d) {
        if (d.key in customColors) {
            return customColors[d.key];
        } else {
            return colorScale(d.value);
        }
    }

    var simulation = d3.forceSimulation()
                        .force("x", d3.forceX().strength(0.03))
                        .force("y", d3.forceY().strength(0.03))
                        .force("collide", d3.forceCollide(function(d){
                           return radiusScale(d.value)+1;
                        }).strength(0.6));

    var key = function(d) {
        return d.key;
    }

    var tag = function(d) {
        // label to display for bigger bubbles
        if (radiusScale(d.value) > 10) {
            return d.key;
        }
    }

    var tagUrl = function(d) {
        // creates clipPath url from tag name
        return d.key.split(" ").join("-");
    }

    var g = svg.append("g")
        .attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");

    // creating bubbles
    var circles = g.append("g")
        .attr("id","bubbles")
        .selectAll("circle")
        .data(tagsToDraw, key)
        .enter()
        .append("circle")
        .attr("class","bubble")
        .attr("r", function(d) {
            return radiusScale(d.value);
        })
        // .attr("fill",function(d) {
        //     return colorScale(d.value);
        .attr("fill", function(d) {return setColor(d)});
        //});

    // creating paths
    var paths = g.append("g")
            .attr("id", "clips")
            .selectAll("clipPath")
            .data(tagsToDraw, key)
            .enter()
            .append("clipPath")
                .attr("id", function(d) { return "clip-" + tagUrl(d) });

        paths.append("circle")
            .attr("class","path")
            .attr("r", function(d) {return radiusScale(d.value) });

    // creating labels
    var labels = g.append("g")
            .attr("id", "tags")
            .selectAll("text")
            .data(tagsToDraw, key)
            .enter()
            .append("text")
            .attr("class","tag")
            .attr("clip-path", function(d) {
                return "url(#clip-" + tagUrl(d) + ")";
            })
            .text(tag)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");

    pathCircles = d3.select("#clips")
            .selectAll(".path");

    simulation.nodes(tagsToDraw)
        .on("tick", ticked);

    d3.select("#all")
        .on("click", unselect);
    d3.selectAll(".decade")
        .on("click", selectDecade);

    // tooltips
    d3.selectAll(".bubble")
        .on("mouseover",showTooltip)
        .on("mouseout", function() {
            d3.select("#tooltip").classed("hidden", true);
        });



    function ticked() {

        circles
            .attr("cx", function(d){ return d.x})
            .attr("cy", function(d){ return d.y});


        pathCircles
            .attr("cx", function(d){ return d.x})
            .attr("cy", function(d){ return d.y});

        labels
            .attr("x", function(d){ return d.x})
            .attr("y", function(d){ return d.y});
    }



    function selectDecade() {
        d3.selectAll("button").classed("pressed",false);
        buttonPressed = d3.select(this);
        buttonPressed.classed("pressed",true);
        decade = parseInt(buttonPressed.attr("id"),10);
        // filter data for chosen decade

        n_min = 2;
        tagCount = d3.nest()
                      .key(function(d) { return d.name; })
                      .rollup(function(v) { return v.length; })
                      .entries(data.filter(function(d) {
                                        return d.year_bucket === decade;
                                     }));
        tagsToDraw = tagCount.filter(function(d) {
                                        return d.value > n_min;
                                     });
        // update scales
        radiusScale.domain([n_min,d3.max(tagsToDraw,function(d){return d.value})]);
        colorScale.domain([0,d3.max(tagsToDraw, function(d){return d.value})]);

        updateChart(tagsToDraw);
    };

    function updateChart(tagsToDraw) {

        // binding  with new data
        circles = circles
            .data(tagsToDraw, key);
        labels = labels
            .data(tagsToDraw, key);
        paths = d3.select("#clips")
            .selectAll("clipPath")
            .data(tagsToDraw, key);

        // removing unnesessary bubbles
        circles.exit()
            .transition(2000)
            .attr("r",0)
            .remove();

        labels.exit()
            .remove();

        paths.exit()
            .remove();

        // adding and updatind bubbles
        circles = circles.enter()
            .append("circle")
            .attr("class", "bubble")
            .merge(circles)
            .call(function(node) {
                node.transition(2000)
                .attr("r", function(d) {
                    return radiusScale(d.value);
                })
                .attr("fill",function(d) {
                    return setColor(d);
                })
            });

        paths = paths.enter()
            .append("clipPath")
            .attr("id", function(d) { return "clip-" + tagUrl(d) })
            .append("circle")
            .attr("class","path")
            .attr("r", function(d) {return radiusScale(d.value) })
            .merge(paths);


        paths.select("circle")
            .attr("r", function(d) {return radiusScale(d.value) });

        labels = labels.enter()
            .append("text")
            .attr("class","tag")
            .merge(labels)
            .attr("clip-path", function(d) {
                return "url(#clip-" + tagUrl(d) + ")";
            })
            .text(tag)
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "white")
            .attr("text-anchor", "middle");

        // tooltips
        d3.selectAll(".bubble")
        .on("mouseover",showTooltip)
        .on("mouseout", function() {
            d3.select("#tooltip").classed("hidden", true);
        });

        // restarting simulation
        simulation.nodes(tagsToDraw);
        simulation.alpha(1).restart();
        pathCircles = d3.select("#clips")
            .selectAll(".path");
    };


    function unselect() {

        d3.selectAll("button").classed("pressed",false);

        buttonPressed = d3.select(this);
        buttonPressed.classed("pressed",true);

        n_min = 10;

        tagCount = d3.nest()
            .key(function(d) { return d.name; })
            .rollup(function(v) { return v.length; })
            .entries(data);

        // select tags that were mentioned more than n_min times
        tagsToDraw = tagCount.filter(function(d) {
                                        return d.value > n_min;
                                     });
        // update scales
        radiusScale.domain([n_min,d3.max(tagsToDraw,function(d){return d.value})])
        colorScale.domain([0,d3.max(tagsToDraw, function(d){return d.value})])
        updateChart(tagsToDraw);
    }

    function showTooltip(d) {

        var x = parseFloat(d3.select(this).attr("cx")) + w / 2 ;
        var y = parseFloat(d3.select(this).attr("cy")) + h / 2;


        var tooltip = d3.select("#tooltip");

        tooltip.style("left", x + "px")
            .style("top", y + "px");

        tooltip.select("#key")
            .text(d.key);
        tooltip.select("#value")
            .text(d.value);

        tooltip.classed("hidden",false);

    }
 // Second chart - multiline

 // preparing data
toTime = d3.timeParse("%Y");

tagsByDecade = d3.nest() // summing up number of movies by decade for every tag
    .key(function (d) { return d.name})
    .key(function (d) { return d.year_bucket}).sortKeys(d3.ascending)
    .rollup(function(v) { return v.length})
    .entries(data.filter(function(d) { return (d.year_bucket > 0)}));

// filter only selected tags
setTagsByDecade = tagsByDecade.filter(function(d) { return (d.key in customColors)});

setTags.forEach(function(d,i) {
    d.active = i < 6 ? true : false; // first six will be active by default
});
console.log("qq");

setTagsByDecade.forEach(function(d,i) {
    var status = setTags.find(function(v){
        console.log(v.key == d.key);
        return v.key == d.key
    })
    debugger;
    d.active = status.active; // first six will be active by default
});


var margin = {top: 50, right: 30, bottom: 400, left: 30},
    width = 500 - margin.left - margin.right,
    height =700 - margin.top - margin.bottom;

// create second chart
var svg2 = d3.select("#area2")
        .append("svg")
        .attr("id", "lineChart")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

var g = svg2.append("g")
            .attr("transform", "translate(" + margin.left+ "," + margin.top+ ")");

// creating scales
var timeScale = d3.scaleTime()
    .range([0, width - 5])
    .domain([ new Date(1900,0,1), new Date(2010,0,1)]);

var yScale = d3.scaleLinear()
    .range([height,0])
    .domain([
        d3.min(tagsByDecade, function(v) {
            return d3.min(v.values, function(d) {return d.value})
        }),
        d3.max(tagsByDecade, function(v) {
            return d3.max(v.values, function(d) {return d.value})
        })
    ]);

// add axis
xAxis = d3.axisBottom(timeScale)
            .ticks(10);
g.append("g")
    .attr("class", "axis xAxis")
    .attr("transform", "translate(0," + height+ ")")
    .call(xAxis);


g.append("g")
    .attr("class", "axis yAxis")
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left)
    .attr("fill", "#000")
    .text("Number of movies");

var line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function (d) {return timeScale(toTime(d.key))})
        .y(function (d) {return yScale(d.value)});

// adding lines
lines = g.selectAll(".tagLine")
            .data(setTagsByDecade)
            .enter()
            .append("g")
            .attr("class","tagline");

lines.append("path")
    .attr("class", "line")
    .attr("id", function(d) { return "line-" + tagUrl(d)})
    .attr("d", function(d) { return line(d.values)})
    .style("stroke", function(d) {return setColor(d)})
    .style("opacity", function(d) {
        return d.active ? 1 : 0;
    });

// adding legend
var legendWidht = 220,
    legendHeight = 20,
    legendPoint = {x:margin.left, y: (700 - margin.bottom + legendHeight*2)},
    rCircle = 5,
    colorInactive = d3.rgb(200,200,200);

    legend = svg2.append("g")
        .selectAll(".legend")
        .data(setTags);

    legendEnter = legend.enter().append('g').attr('class', 'legend');

    legendEnter.append("circle")
    .attr("cx", function(d,i) {return legendPoint.x + legendWidht * (i % 2)  })
    .attr("cy", function(d,i) {return  legendPoint.y + legendHeight * Math.floor(i/2) - 4})
    .attr("r", rCircle)
    .style("fill", function(d){return  d.active ?setColor(d) : colorInactive})
    .on("click", function(d) {
        var newStatus = d.active ? false : true;
        var newOpacity = newStatus ? 1 : 0;
        d3.select("#line-"+ tagUrl(d))
            .style("opacity", newOpacity)

        newColor = newStatus ?  setColor(d): colorInactive;
        d3.select(this).style("fill", newColor)
        d.active = newStatus;
    });
    legendEnter.append("text")
    .attr("x", function(d,i) {return legendPoint.x + legendWidht * (i % 2) + 10 })
    .attr("y", function(d,i) {return legendPoint.y + legendHeight * Math.floor(i/2) })
    .text(function(d) {return d.key});

 });
