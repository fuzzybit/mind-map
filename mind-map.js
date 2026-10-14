/**
 * FuzzyBit Mind-Map Business Modelling Framework by fuzzybit.com is licensed
 * under a Creative Commons Attribution-ShareAlike 4.0 International License.
 *
 * Based on a work at https://www.fuzzybit.com/mind-map/.
 */

/**
 * Centre point of the main mind-map layout, in SVG user coordinates.
 */
var cx = 300;
var cy = 300;
/**
 * Radius used to position the primary cluster around the centre.
 */
var ring = 170;
/**
 * Radius of each primary cluster point.
 */
var r = 8;

/**
 * Shared layout controllers. Click handlers update these objects as the
 * selected cluster and stream change.
 */
var c = new cluster(cx, cy, ring, r);
var s = new stream(cx, cy, ring);

/**
 * Positions and labels the cluster points around a centre.
 *
 * @param {number} cx - Centre x-coordinate in SVG user units.
 * @param {number} cy - Centre y-coordinate in SVG user units.
 * @param {number} ring - Distance from the centre to an outer cluster point.
 * @param {number} r - Radius assigned to each cluster point.
 */
function cluster(cx, cy, ring, r) {
	this.cx = cx;
	this.cy = cy;
	this.ring = ring;
	this.r = r;

	// Angles are fractions of PI; successive points are spaced by PI/4 (45 degrees).
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

/**
 * Place an SVG circle at the centre or at the requested angle on the ring.
 *
 * @param {string} id - ID of the existing SVG circle element.
 * @param {number} [rad] - Angle as a multiple of PI; omitted places it at the centre.
 */
cluster.prototype.set = function(id, rad) {
	var innerRing = 0;
	if (typeof rad !== 'undefined')
		innerRing = this.ring;
	else
		rad = 0;

	var circle = document.getElementById(id);
	// TODO: Validate required SVG elements and report missing IDs rather than failing on attribute updates.
	circle.setAttribute("r", this.r);
	circle.setAttribute("cx", this.cx - innerRing * Math.cos(rad * Math.PI));
	circle.setAttribute("cy", this.cy - innerRing * Math.sin(rad * Math.PI));
}

/**
 * Position a cluster point and set the matching SVG text label.
 *
 * @param {string} id - Base ID shared by the circle and its `${id}_label` text element.
 * @param {string} label - Text to append to the label element.
 * @param {number} [rad] - Angle as a multiple of PI; omitted places the point at the centre.
 */
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
	// TODO: Preserve text-only rendering; validate length/content if labels become externally sourced.
	// TODO: Decide whether repeated initialization should replace existing label text to avoid duplicates.
	text.appendChild(node);
	text.setAttribute("x", this.cx - innerRing * Math.cos(rad * Math.PI));
	text.setAttribute("y", this.cy - innerRing * Math.sin(rad * Math.PI) + margin);
}

/**
 * Expand a selected primary cluster into eight smaller points and reposition
 * the active stream, if one has already been selected.
 *
 * @param {string} label - ID of the selected primary SVG circle.
 */
cluster.prototype.click = function(label) {
	var data = document.getElementById(label);

	// TODO: Validate the selected element and its coordinates before parsing; malformed SVG attributes currently propagate as invalid geometry.
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
 * Positions a stream line and updates its associated labels and visibility.
 *
 * @param {number} cx - Centre x-coordinate in SVG user units.
 * @param {number} cy - Centre y-coordinate in SVG user units.
 * @param {number} ring - Base distance from the centre used to size the stream.
 */
function stream(cx, cy, ring) {
	this.cx = cx;
	this.cy = cy;
	this.ring = ring;
	this.outerRing = ring + 50;

	this.rad;
}

/**
 * Set the endpoints of an existing SVG line across the stream's outer ring.
 *
 * @param {string} id - ID of the existing SVG line element.
 * @param {number} rad - Line angle as a multiple of PI.
 */
stream.prototype.set = function(id, rad) {
	var line = document.getElementById(id);
	line.setAttribute("x1", this.cx - this.outerRing * Math.cos(rad * Math.PI));
	line.setAttribute("y1", this.cy - this.outerRing * Math.sin(rad * Math.PI));
	line.setAttribute("x2", this.cx + this.outerRing * Math.cos(rad * Math.PI));
	line.setAttribute("y2", this.cy + this.outerRing * Math.sin(rad * Math.PI));
}

/**
 * Set the stream line and place its text label near the selected endpoint.
 *
 * @param {string} id - Base ID shared by the line and its `${id}_label` text element.
 * @param {string} label - Text to append to the label element.
 * @param {number} [rad] - Angle as a multiple of PI; omitted places the label at the centre.
 */
stream.prototype.label = function(id, label, rad) {
	if (typeof rad === 'undefined') {
		rad = 0;
		this.outerRing = 0;
	}

	this.set(id, rad);

	var margin = 7;

	var text = document.getElementById(id + "_label");

	var node = document.createTextNode(label);
	// TODO: Keep initialization idempotent if init() can be called more than once.
	text.appendChild(node);
	text.setAttribute("x", this.cx - this.outerRing * Math.cos(rad * Math.PI) + margin);
	text.setAttribute("y", this.cy - this.outerRing * Math.sin(rad * Math.PI) + margin);
}

/**
 * Highlight the selected stream label and dim the other stream labels.
 *
 * @param {string} label - ID of the selected stream.
 * @param {string} datum - ID of the stream label to update.
 */
stream.prototype.streamHelper = function(label, datum) {
	var text = document.getElementById(datum + "_label");
	text.setAttribute("fill", label == datum ? "black" : "white");
}

/**
 * Show the selected stream's line and hide the other stream lines.
 *
 * @param {string} label - ID of the selected stream.
 * @param {string} datum - ID of the stream line to update.
 */
stream.prototype.lineHelper = function(label, datum) {
	var line = document.getElementById(datum);
	line.setAttribute("visibility", label == datum ? "visible" : "hidden");
}

/**
 * Update both the label styling and line visibility for one stream.
 *
 * @param {string} label - ID of the selected stream.
 * @param {string} datum - ID of the stream to update.
 */
stream.prototype.setHelper = function(label, datum) {
	this.streamHelper(label, datum);
	this.lineHelper(label, datum);
}

/**
 * Select a primary stream, update all stream indicators, and draw its line.
 *
 * @param {string} label - Stream ID: RE, PR, EX, or AN.
 */
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

	// TODO: Factor shared SVG line creation into one helper to keep both click paths consistent.
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

/**
 * Select a smaller point in an expanded cluster and map it back to its stream.
 *
 * @param {string} label - ID of the selected small point (`id_0_0` through `id_0_7`).
 */
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

	// TODO: Factor shared SVG line creation into one helper to keep both click paths consistent.
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

/**
 * Populate the SVG's primary cluster labels and stream labels.
 * The corresponding circle, line, and text elements must already exist in the document.
 *
 * TODO: Add keyboard-operable controls and accessible names for interactive SVG points.
 */
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