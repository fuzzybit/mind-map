/**
 * FuzzyBit Mind-Map Business Modelling Framework by fuzzybit.com is licensed
 * under a Creative Commons Attribution-ShareAlike 4.0 International License.
 *
 * Based on a work at https://www.fuzzybit.com/mind-map/.
 */

/**
 * Centres of circles
 */
var cx = 300;
var cy = 300;
/**
 * Diameter of primary circle
 */
var ring = 170;
/**
 * Diameter of cluster point
 */
var r = 8;

/**
 * Cluster and stream object creation
 */
var c = new cluster(cx, cy, ring, r);
var s = new stream(cx, cy, ring);

/**
 * Cluster Class
 */
function cluster(cx, cy, ring, r) {
	this.cx = cx;
	this.cy = cy;
	this.ring = ring;
	this.r = r;

	// quarter pi radians 
	this.z = 1/4;
	this.a = 0 * this.z;
	this.b = 1 * this.z;
	this.c = 2 * this.z;
	this.d = 3 * this.z;
	this.e = 4 * this.z;
	this.f = 5 * this.z;
	this.g = 6 * this.z;
	this.h = 7 * this.z;
}

cluster.prototype.set = function(id, rad) {
	var innerRing = 0;
	if (typeof rad !== 'undefined')
		innerRing = this.ring;
	else
		rad = 0;

	var circle = document.getElementById(id);
	circle.setAttribute("r", this.r);
	circle.setAttribute("cx", this.cx - innerRing * Math.cos(rad * Math.PI));
	circle.setAttribute("cy", this.cy - innerRing * Math.sin(rad * Math.PI));
}

cluster.prototype.label = function(id, label, rad) {
	this.set(id, rad);

	var innerRing = 0;
	if (typeof rad === 'undefined')
		rad = 0;
	else
		innerRing = this.ring;

	var margin = 24;

	var text = document.getElementById(id + "_label");

	var node = document.createTextNode(label);
	text.appendChild(node);
	text.setAttribute("x", this.cx - innerRing * Math.cos(rad * Math.PI));
	text.setAttribute("y", this.cy - innerRing * Math.sin(rad * Math.PI) + margin);
}

cluster.prototype.click = function(label) {
	var data = document.getElementById(label);

	this.cx = parseInt(data.getAttribute("cx"));
	this.cy = parseInt(data.getAttribute("cy"));
	this.ring = 40;
	this.r = 5;

	var svg = document.getElementsByTagName("svg")[0];

	var c = new cluster(this.cx, this.cy, this.ring, this.r);
	for (var i = 0; i < 8; i++) {
		var id = "id_0_" + i;

		var circle = document.getElementById(id);
		if (circle == null) {
			circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.id = id;
			circle.setAttribute("fill", "black");
			circle.addEventListener("click",
				function(e) {
					s.littleClick(this.id);
				}
			);

			svg.appendChild(circle);
		}

		c.set(id, i/4);
	}

	if (typeof s.rad !== 'undefined') {
		s.cx = this.cx;
		s.cy = this.cy;
		s.ring = this.ring;
		s.outerRing = this.ring + 14;
		s.set("id_1", s.rad);
	}
}

/**
 * Stream Class
 */
function stream(cx, cy, ring) {
	this.cx = cx;
	this.cy = cy;
	this.ring = ring;
	this.outerRing = ring + 50;

	this.rad;
}

stream.prototype.set = function(id, rad) {
	var line = document.getElementById(id);
	line.setAttribute("x1", this.cx - this.outerRing * Math.cos(rad * Math.PI));
	line.setAttribute("y1", this.cy - this.outerRing * Math.sin(rad * Math.PI));
	line.setAttribute("x2", this.cx + this.outerRing * Math.cos(rad * Math.PI));
	line.setAttribute("y2", this.cy + this.outerRing * Math.sin(rad * Math.PI));
}

stream.prototype.label = function(id, label, rad) {
	if (typeof rad === 'undefined') {
		rad = 0;
		this.outerRing = 0;
	}

	this.set(id, rad);

	var margin = 7;

	var text = document.getElementById(id + "_label");

	var node = document.createTextNode(label);
	text.appendChild(node);
	text.setAttribute("x", this.cx - this.outerRing * Math.cos(rad * Math.PI) + margin);
	text.setAttribute("y", this.cy - this.outerRing * Math.sin(rad * Math.PI) + margin);
}

stream.prototype.streamHelper = function(label, datum) {
	var text = document.getElementById(datum + "_label");
	text.setAttribute("fill", label == datum ? "black" : "white");
}

stream.prototype.lineHelper = function(label, datum) {
	var line = document.getElementById(datum);
	line.setAttribute("visibility", label == datum ? "visible" : "hidden");
}

stream.prototype.setHelper = function(label, datum) {
	this.streamHelper(label, datum);
	this.lineHelper(label, datum);
}

stream.prototype.click = function(label) {
	switch (label) {
		case "RE":
			this.rad = 0/4;

			break;
		case "PR":
			this.rad = 1/4;

			break;
		case "EX":
			this.rad = 2/4;

			break;
		case "AN":
			this.rad = 3/4;

			break;
	}

	this.setHelper(label, "EX");
	this.setHelper(label, "AN");
	this.setHelper(label, "RE");
	this.setHelper(label, "PR");

	var svg = document.getElementsByTagName("svg")[0];

	var id = "id_1";

	var line = document.getElementById(id);
	if (line == null) {
		line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.id = id;
		line.setAttribute("stroke", "black");
		line.setAttribute("stroke-width", "1");

		svg.appendChild(line);
	}

	var s = new stream(c.cx, c.cy, c.ring);
	s.outerRing = s.ring + 14;
	s.set(id, this.rad);
}

stream.prototype.littleClick = function(label) {
	switch (label) {
		case "id_0_0":
		case "id_0_4":
			this.rad = 0/4;
			label = "RE";

			break;
		case "id_0_1":
		case "id_0_5":
			this.rad = 1/4;
			label = "PR";

			break;
		case "id_0_2":
		case "id_0_6":
			this.rad = 2/4;
			label = "EX";

			break;
		case "id_0_3":
		case "id_0_7":
			this.rad = 3/4;
			label = "AN";

			break;
	}

	this.click(label);

	var svg = document.getElementsByTagName("svg")[0];

	var id = "id_1";

	var line = document.getElementById(id);
	if (line == null) {
		line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.id = id;
		line.setAttribute("stroke", "black");
		line.setAttribute("stroke-width", "1");

		svg.appendChild(line);
	}

	var s = new stream(c.cx, c.cy, c.ring);
	s.outerRing = s.ring + 14;
	s.set(id, this.rad);
}

function init() {
	c.label("PS", "Product / Service");
	c.label("FI", "Financial", 0/4);
	c.label("ML", "Management & Labour", 1/4);
	c.label("MV", "Mission & Vision", 2/4);
	c.label("MA", "Market Analysis", 3/4);
	c.label("SM", "Sales & Marketing", 4/4);
	c.label("OP", "Operations", 5/4);
	c.label("GP", "Governance, Policy, Ethics", 6/4);
	c.label("RA", "Risk Analysis", 7/4);

	s.label("EX", "EXECUTIVE", 2/4);
	s.label("AN", "ANALYTICAL", 3/4);
	s.label("RE", "REVENUE", 4/4);
	s.label("PR", "PRODUCTION", 5/4);
}