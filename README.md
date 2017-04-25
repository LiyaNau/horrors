# 120 years of horror movies

##Summary

Some time ago I read one thougth that horror films reflect common fears of society, so I decided to make this visualisation with keywords for horror movies filmed from 1896 to 2016 to understand how things that frightened people changed with time. As a source of data I chose The Movie Database (TMDb).

##Design

I decided to do my visualisation as an animated bubble chart with possibility to chose a decade you want to look at and added tooltips to show information about every keyword. After receiving feedback I decided to add a line chart with most interesting keywords changing over time and a possibility for viewer to select keywords for comparison by clicking on corresponding bubbles. After receiving rewiev I changed colors for most bubbles to grayscale and selected by color two groups of keywords: blues for topics that today have almost the same popularity as in 50s, and reds - for topics that got much more popular in last 20 years. Colors of line chart are now correspond to bubble chart.

##Feedback

1. One potential opportunity to iterate and further improve would be to grab the top category (categories) of each decade and put them together in a viz, so that the reader can have a clear view as to the how the most popular category changes over the century.
2. To declutter bubbles delete labels that are partially visible because it is impossible to read them.
3. After click on particular bubble show history of change for this tag

##Resources

- Scott Murray,  Interactive Data Visualization for the Web. O'Reilly Media, 2013.
- D3 Nest Tutorial and examples. http://bl.ocks.org/phoebebright/raw/3176159/
- D3 in depth. http://d3indepth.com/
- Forces in D3.js v4. https://roshansanthosh.wordpress.com/2016/09/25/forces-in-d3-js-v4/
- Learn JS Data. http://learnjsdata.com/index.html
- Multi-Series Line Chart https://bl.ocks.org/mbostock/3884955
- Malcolm Maclean, D3 Tips and Tricks v4.x https://leanpub.com/d3-t-and-t-v4
