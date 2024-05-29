function drawSnailDiagram(data, selectedDataPoint) {
	const canvas = document.getElementById("heatmapCanvas");
	const ctx = canvas.getContext("2d");
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

	const centerX = canvas.width / 2;
	const centerY = canvas.height / 2;
	const maxRadius = Math.min(canvas.width, canvas.height) / 2 - 20; // Adjusted to ensure it fits within the canvas
	const totalDays = 366; // Total days in a year
	const angleStep = (2 * Math.PI) / 365; // Full circle divided by the number of days
	const radiusStep = maxRadius / totalDays; // Decrease radius step to create a tighter spiral

	console.log(
		"Drawing diagram with data:",
		data,
		"and data point:",
		selectedDataPoint
	);

	data.forEach((d) => {
		const date = new Date(d.Date);
		const dayOfYear =
			(date - new Date(date.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24;
		const value = parseFloat(d[selectedDataPoint]); // Ensure the value is a number

		const radius = radiusStep * dayOfYear;
		const angle = angleStep * dayOfYear;
		const x = centerX + radius * Math.cos(angle - Math.PI / 2); // Adjust angle for canvas coordinate system
		const y = centerY + radius * Math.sin(angle - Math.PI / 2); // Adjust angle for canvas coordinate system

		const bubbleSize = Math.min(radiusStep, 5 + value / 1000000); // Adjust size based on value

		const color =
			value > 0
				? `rgba(255, 0, 0, ${Math.min(value / 1000000000, 1)})`
				: "#eee";

		ctx.beginPath();
		ctx.arc(x, y, bubbleSize, 0, 2 * Math.PI);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.closePath();
	});

	$("#heatmapCanvas")
		.off("mousemove")
		.on("mousemove", function (e) {
			const rect = canvas.getBoundingClientRect();
			const mouseX = e.clientX - rect.left;
			const mouseY = e.clientY - rect.top;
			let tooltipText = "";

			data.forEach((d) => {
				const date = new Date(d.Date);
				const dayOfYear =
					(date - new Date(date.getFullYear(), 0, 0)) /
					1000 /
					60 /
					60 /
					24;
				const value = parseFloat(d[selectedDataPoint]); // Ensure the value is a number

				const radius = radiusStep * dayOfYear;
				const angle = angleStep * dayOfYear;
				const x = centerX + radius * Math.cos(angle - Math.PI / 2);
				const y = centerY + radius * Math.sin(angle - Math.PI / 2);

				const bubbleSize = Math.min(radiusStep, 5 + value / 1000000);

				const distance = Math.sqrt(
					(mouseX - x) ** 2 + (mouseY - y) ** 2
				);
				if (distance < bubbleSize) {
					tooltipText = `Value: ${value}`;
				}
			});

			if (tooltipText) {
				$("#tooltip")
					.text(tooltipText)
					.show()
					.css({
						left: e.pageX + 10,
						top: e.pageY + 10,
					});
			} else {
				$("#tooltip").hide();
			}
		});
}

function populateCountrySelector(data) {
	const countries = [...new Set(data.map((d) => d.Country))].sort();
	const countrySelector = $("#countrySelector");
	countries.forEach((country) => {
		countrySelector.append(new Option(country, country));
	});
}

$(document).ready(function () {
	// Assuming 'data' is a global variable defined in 'influenza.js'
	console.log("Data loaded:", data); // Debugging statement to check the loaded data

	populateCountrySelector(data);

	const timeSlider = $("#timeSlider");
	const yearLabel = $("#yearLabel");
	const dataPointSelector = $("#dataPointSelector");

	function updateHeatmap() {
		const selectedCountry = $("#countrySelector").val();
		const selectedYear = timeSlider.val();
		const selectedDataPoint = dataPointSelector.val();
		yearLabel.text(selectedYear);
		const filteredData = data.filter(
			(d) =>
				d.Country === selectedCountry &&
				new Date(d.Date).getFullYear() == selectedYear
		);
		console.log("Filtered data:", filteredData); // Debugging statement to check the filtered data
		drawSnailDiagram(filteredData, selectedDataPoint);
	}

	$("#countrySelector").change(updateHeatmap);
	timeSlider.on("input", updateHeatmap);
	dataPointSelector.change(updateHeatmap);

	// Trigger initial drawing
	$("#countrySelector").trigger("change");
});
