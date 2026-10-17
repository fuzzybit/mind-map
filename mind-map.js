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
		if (i % 4 == s.rad) {
			// continue;
		}
		var id = "id_0_" + i;

		var circle = document.getElementById(id);
		if (circle == null) {
			circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			circle.id = id;
			circle.addEventListener("click",
				function(e) {
					s.littleClick(this.id, e.ctrlKey);
				}
			);

			svg.appendChild(circle);
		}

		circle.setAttribute("data-stream", streamForInnerPoint(i));
		c.set(id, i/4);
	}
	syncInnerStreamSelections();

	focusedAreaId = label;
	drawFocusedStreams();
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

function drawFocusedStreams() {
	var svg = document.getElementsByTagName("svg")[0];
	var oldLines = document.querySelectorAll('line[id^="id_1_"], line#id_1');
	for (var i = 0; i < oldLines.length; i++)
		oldLines[i].parentNode.removeChild(oldLines[i]);

	if (focusedAreaId == null)
		return;

	var streamLabels = document.querySelectorAll(".stream-label[data-stream-active='true']");
	for (var j = 0; j < streamLabels.length; j++) {
		var streamId = streamLabels[j].getAttribute("data-stream");
		var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
		line.id = "id_1_" + streamId;
		line.setAttribute("stroke", streamColor(streamId));
		line.setAttribute("stroke-width", "2");
		svg.appendChild(line);

		var focusedStream = new stream(c.cx, c.cy, c.ring);
		focusedStream.outerRing = focusedStream.ring + 14;
		focusedStream.set(line.id, streamIndex(streamId));
	}
}

function streamIndex(label) {
	switch (label) {
		case "RE":
			return 0;
		case "PR":
			return 1;
		case "EX":
			return 2;
		case "AN":
			return 3;
	}
}

function streamForInnerPoint(index) {
	return ["RE", "PR", "EX", "AN"][index % 4];
}

function streamColor(label) {
	switch (label) {
		case "EX":
			return "#7651a8";
		case "AN":
			return "#c06b22";
		case "RE":
			return "#087f8c";
		case "PR":
			return "#32804a";
	}
}

function syncInnerStreamSelections() {
	var innerPoints = document.querySelectorAll('circle[id^="id_0_"]');
	for (var i = 0; i < innerPoints.length; i++) {
		var streamLabel = document.querySelector(
			".stream-label[data-stream='" + innerPoints[i].getAttribute("data-stream") + "']"
		);
		innerPoints[i].setAttribute(
			"data-stream-active",
			streamLabel != null && streamLabel.getAttribute("data-stream-active") == "true" ?
				"true" : "false"
		);
	}
}

/**
 * Set the endpoints of an existing SVG line across the stream's outer ring.
 *
 * @param {string} id - ID of the existing SVG line element.
 * @param {number} rad - Line angle in quarter-PI steps.
 */
stream.prototype.set = function(id, rad) {
	var angle = rad * Math.PI / 4;
	var line = document.getElementById(id);
	line.setAttribute("x1", this.cx - this.outerRing * Math.cos(angle));
	line.setAttribute("y1", this.cy - this.outerRing * Math.sin(angle));
	line.setAttribute("x2", this.cx + this.outerRing * Math.cos(angle));
	line.setAttribute("y2", this.cy + this.outerRing * Math.sin(angle));
}

/**
 * Set the stream line and place its text label near the selected endpoint.
 *
 * @param {string} id - Base ID shared by the line and its `${id}_label` text element.
 * @param {string} label - Text to append to the label element.
 * @param {number} [rad] - Angle in quarter-PI steps; omitted places the label at the centre.
 */
stream.prototype.label = function(id, label, rad) {
	if (typeof rad === 'undefined') {
		rad = 0;
		this.outerRing = 0;
	}

	this.set(id, rad);

	var angle = rad * Math.PI / 4;
	var margin = 7;

	var text = document.getElementById(id + "_label");

	var node = document.createTextNode(label);
	// TODO: Keep initialization idempotent if init() can be called more than once.
	text.appendChild(node);
	text.setAttribute("x", this.cx - this.outerRing * Math.cos(angle) + margin);
	text.setAttribute("y", this.cy - this.outerRing * Math.sin(angle) + margin);
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
stream.prototype.click = function(label, ctrlKey) {
	switch (label) {
		case "RE":
			this.rad = 0;

			break;
		case "PR":
			this.rad = 1;

			break;
		case "EX":
			this.rad = 2;

			break;
		case "AN":
			this.rad = 3;

			break;
	}

	var streamLabels = document.querySelectorAll(".stream-label[data-stream]");
	if (ctrlKey) {
		var selectedLabel = document.querySelector(
			".stream-label[data-stream='" + label + "']"
		);
		var isSelected = selectedLabel.getAttribute("data-stream-active") == "true";
		selectedLabel.setAttribute("data-stream-active", isSelected ? "false" : "true");
	} else {
		for (var i = 0; i < streamLabels.length; i++) {
			streamLabels[i].setAttribute(
				"data-stream-active",
				streamLabels[i].getAttribute("data-stream") == label ? "true" : "false"
			);
		}
	}

	var activeStreams = [];
	for (var j = 0; j < streamLabels.length; j++) {
		var streamId = streamLabels[j].getAttribute("data-stream");
		var active = streamLabels[j].getAttribute("data-stream-active") == "true";
		document.getElementById(streamId).setAttribute(
			"visibility",
			active ? "visible" : "hidden"
		);
		document.getElementById(streamId + "_label").setAttribute(
			"fill",
			active ? "black" : "white"
		);
		streamLabels[j].setAttribute("aria-pressed", active ? "true" : "false");
		if (active)
			activeStreams.push(streamId);
	}

	var areaCards = document.querySelectorAll(".area-card[data-stream]");
	for (var k = 0; k < areaCards.length; k++) {
		areaCards[k].setAttribute(
			"data-stream-active",
			activeStreams.indexOf(areaCards[k].getAttribute("data-stream")) >= 0 ? "true" : "false"
		);
	}
	syncInnerStreamSelections();

	if (ctrlKey && activeStreams.length == 0) {
		resetMap();
		return;
	}

	if (activeStreams.indexOf(label) < 0)
		this.rad = activeStreams.length > 0 ? streamIndex(activeStreams[activeStreams.length - 1]) : undefined;

	drawFocusedStreams();
}

/**
 * Select a smaller point in an expanded cluster and map it back to its stream.
 *
 * @param {string} label - ID of the selected small point (`id_0_0` through `id_0_7`).
 */
stream.prototype.littleClick = function(label, ctrlKey) {
	switch (label) {
		case "id_0_0":
		case "id_0_4":
			this.rad = 0;
			label = "RE";

			break;
		case "id_0_1":
		case "id_0_5":
			this.rad = 1;
			label = "PR";

			break;
		case "id_0_2":
		case "id_0_6":
			this.rad = 2;
			label = "EX";

			break;
		case "id_0_3":
		case "id_0_7":
			this.rad = 3;
			label = "AN";

			break;
	}

	this.click(label, ctrlKey);
	if (document.querySelectorAll(".stream-label[data-stream-active='true']").length == 0)
		return;
}

/**
 * Restore the initial mind-map and clear selected area and stream states.
 */
function resetMap() {
	c = new cluster(cx, cy, ring, r);
	focusedAreaId = undefined;
	c.set("PS");

	var areaPositions = [
		["FI", 0/4],
		["ML", 1/4],
		["MV", 2/4],
		["MA", 3/4],
		["SM", 4/4],
		["OP", 5/4],
		["GP", 6/4],
		["RA", 7/4]
	];
	for (var i = 0; i < areaPositions.length; i++)
		c.set(areaPositions[i][0], areaPositions[i][1]);

	s = new stream(cx, cy, ring);
	var streamIds = ["EX", "AN", "RE", "PR"];
	var streamAngles = [2, 3, 4, 5];
	for (var j = 0; j < streamIds.length; j++) {
		s.set(streamIds[j], streamAngles[j]);
		document.getElementById(streamIds[j]).setAttribute("visibility", "visible");
		document.getElementById(streamIds[j] + "_label").setAttribute("fill", "black");
	}

	var expandedPoints = document.querySelectorAll('circle[id^="id_0_"]');
	for (var k = 0; k < expandedPoints.length; k++)
		expandedPoints[k].parentNode.removeChild(expandedPoints[k]);

	var expandedStreams = document.querySelectorAll('line[id^="id_1_"], line#id_1');
	for (var l = 0; l < expandedStreams.length; l++)
		expandedStreams[l].parentNode.removeChild(expandedStreams[l]);

	var areaCards = document.querySelectorAll("[data-area-card]");
	for (var m = 0; m < areaCards.length; m++) {
		areaCards[m].setAttribute("aria-pressed", "false");
		areaCards[m].setAttribute("data-stream-active", "false");
		areaCards[m].setAttribute("data-area-focused", "false");
		areaCards[m].setAttribute("data-multi-selected", "false");
	}
	syncAreaSelections();

	var streamLabels = document.querySelectorAll(".stream-label[data-stream]");
	for (var n = 0; n < streamLabels.length; n++) {
		streamLabels[n].setAttribute("data-stream-active", "false");
		streamLabels[n].setAttribute("aria-pressed", "false");
	}
}

var focusedAreaId;

function setFocusedArea(areaId) {
	var areaCards = document.querySelectorAll("[data-area-card]");
	var multiSelectedCount = 0;
	for (var i = 0; i < areaCards.length; i++) {
		if (areaCards[i].getAttribute("aria-pressed") == "true")
			multiSelectedCount++;
	}
	for (var j = 0; j < areaCards.length; j++) {
		var isFocused = areaCards[j].getAttribute("data-area-card") == areaId;
		var isMultiSelected = areaCards[j].getAttribute("aria-pressed") == "true" && multiSelectedCount > 1;
		areaCards[j].setAttribute("data-area-focused", isFocused ? "true" : "false");
		areaCards[j].setAttribute("data-multi-selected", isMultiSelected ? "true" : "false");
	}
	focusedAreaId = areaId;
}

function syncAreaSelections() {
	var areaCards = document.querySelectorAll("[data-area-card]");
	var multiSelectedCount = 0;
	for (var i = 0; i < areaCards.length; i++) {
		if (areaCards[i].getAttribute("aria-pressed") == "true")
			multiSelectedCount++;
	}
	for (var j = 0; j < areaCards.length; j++) {
		var areaId = areaCards[j].getAttribute("data-area-card");
		var selected = areaCards[j].getAttribute("aria-pressed") == "true";
		var areaCircle = document.getElementById(areaId);
		if (areaCircle != null)
			areaCircle.setAttribute("aria-pressed", selected ? "true" : "false");
		areaCards[j].setAttribute(
			"data-multi-selected",
			selected && multiSelectedCount > 1 ? "true" : "false"
		);
	}
}

function resetAreaFocus() {
	c = new cluster(cx, cy, ring, r);
	c.set("PS");

	var areaPositions = [
		["FI", 0/4],
		["ML", 1/4],
		["MV", 2/4],
		["MA", 3/4],
		["SM", 4/4],
		["OP", 5/4],
		["GP", 6/4],
		["RA", 7/4]
	];
	for (var i = 0; i < areaPositions.length; i++)
		c.set(areaPositions[i][0], areaPositions[i][1]);

	var expandedPoints = document.querySelectorAll('circle[id^="id_0_"]');
	for (var j = 0; j < expandedPoints.length; j++)
		expandedPoints[j].parentNode.removeChild(expandedPoints[j]);

	var expandedStreams = document.querySelectorAll('line[id^="id_1_"], line#id_1');
	for (var k = 0; k < expandedStreams.length; k++)
		expandedStreams[k].parentNode.removeChild(expandedStreams[k]);

	setFocusedArea(null);
}

/**
 * Focus an area in the mind-map and sync its selected state in the area grid.
 *
 * @param {string} areaId - ID of the selected area.
 * @param {boolean} [ctrlKey] - Toggle this area without clearing other selections.
 */
function selectArea(areaId, ctrlKey) {
	if (areaId == "PS") {
		resetMap();
		return;
	}

	var areaCards = document.querySelectorAll("[data-area-card]");
	var selectedCard;
	for (var i = 0; i < areaCards.length; i++) {
		if (areaCards[i].getAttribute("data-area-card") == areaId) {
			selectedCard = areaCards[i];
			break;
		}
	}

	if (ctrlKey) {
		var isSelected = selectedCard.getAttribute("aria-pressed") == "true";
		selectedCard.setAttribute("aria-pressed", isSelected ? "false" : "true");
		syncAreaSelections();

		if (isSelected) {
			if (focusedAreaId == areaId) {
				var nextFocus;
				for (var j = areaCards.length - 1; j >= 0; j--) {
					if (areaCards[j].getAttribute("aria-pressed") == "true") {
						nextFocus = areaCards[j].getAttribute("data-area-card");
						break;
					}
				}
				if (nextFocus != null) {
					c.click(nextFocus);
					setFocusedArea(nextFocus);
				} else {
					resetAreaFocus();
				}
			}
			return;
		}
		if (selectedCard.getAttribute("aria-pressed") == "true") {
			c.click(areaId);
			setFocusedArea(areaId);
		}
		return;
	} else {
		for (var k = 0; k < areaCards.length; k++) {
			areaCards[k].setAttribute(
				"aria-pressed",
				areaCards[k].getAttribute("data-area-card") == areaId ? "true" : "false"
			);
		}
		syncAreaSelections();
	}

	c.click(areaId);
	setFocusedArea(areaId);
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

	s.label("EX", "EXECUTIVE", 2);
	s.label("AN", "ANALYTICAL", 3);
	s.label("RE", "REVENUE", 4);
	s.label("PR", "PRODUCTION", 5);
	syncAreaSelections();

	var areaCards = document.querySelectorAll("[data-area-card]");
	for (var i = 0; i < areaCards.length; i++) {
		areaCards[i].addEventListener("click", function(e) {
			selectArea(this.getAttribute("data-area-card"), e.ctrlKey);
		});
	}
}