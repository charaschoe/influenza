$(document).ready(function () {
	const $canvas = $(".canvas");
	const $tooltip = $("#tooltip");
	const $yearDisplay = $("#year-display");
	const $monthsContainer = $("#months-container");
	let year = $("#year").val();
	let caseModel = $("#caseModel").val();

	// Generate random colors for each country and store them in a persistent map
	const countryColors = {};
	function getRandomColor() {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

	function assignColorsToCountries(data) {
		data.forEach((record) => {
			if (!countryColors[record.Country]) {
				countryColors[record.Country] = getRandomColor();
			}
		});
	}

	// Initialize country colors using the entire dataset once
	assignColorsToCountries(data);

	// Generate all months in a given year
	function generateMonths(year) {
		const months = [];
		for (let month = 0; month < 12; month++) {
			months.push(new Date(year, month, 1));
		}
		return months;
	}

	// Create month labels
	function createMonthLabels() {
		const monthNames = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December",
		];
		$monthsContainer.empty();
		monthNames.forEach((month, i) => {
			const angle = ((i * 360) / 12 - 90) * (Math.PI / 180); // Angle for each month
			const x = Math.cos(angle) * 350 + $canvas.width() / 2; // Adjusted radius for month labels
			const y = Math.sin(angle) * 350 + $canvas.height() / 2;
			$("<div></div>")
				.addClass("month-label")
				.css({
					position: "absolute",
					left: `${x}px`,
					top: `${y}px`,
					transform: `translate(-50%, -50%)`,
				})
				.text(month)
				.appendTo($monthsContainer);
		});
	}

	function drawGridLines() {
		const linesContainer = $("<div></div>")
			.addClass("lines-container")
			.css({ position: "absolute", width: "100%", height: "100%" });
		for (let i = 0; i < 12; i++) {
			const angle = ((i * 360) / 12 - 90) * (Math.PI / 180); // Angle for each line
			const x1 = Math.cos(angle) * 50 + $canvas.width() / 2;
			const y1 = Math.sin(angle) * 50 + $canvas.height() / 2;
			const x2 = Math.cos(angle) * 300 + $canvas.width() / 2;
			const y2 = Math.sin(angle) * 300 + $canvas.height() / 2;
			$("<div></div>")
				.addClass("grid-line")
				.css({
					position: "absolute",
					border: "1px solid #444",
					transformOrigin: "top left",
					transform: `rotate(${angle + Math.PI / 2}rad)`,
					top: `${$canvas.height() / 2}px`,
					left: `${$canvas.width() / 2}px`,
					width: "300px",
				})
				.appendTo(linesContainer);
		}
		linesContainer.appendTo($canvas);
	}

	function draw() {
		$canvas.empty();
		drawGridLines();

		// Update year display
		$yearDisplay.text(year);

		// Filter data for the selected year and sort by date
		const filteredData = data
			.filter((d) => new Date(d.Date).getFullYear() == year)
			.sort((a, b) => new Date(a.Date) - new Date(b.Date));

		const maxCaseValue = Math.max(
			...filteredData.map((d) => d[caseModel] || 0)
		);

		// Generate all months for the selected year
		const months = generateMonths(year);

		const totalDots = months.length * Object.keys(countryColors).length;
		const radiusIncrement = 5; // Fixed radius increment for spacing
		const baseRadius = 30; // Starting radius

		let index = 0;
		months.forEach((month, monthIndex) => {
			const angleStart = ((monthIndex * 360) / 12 - 90) * (Math.PI / 180); // Starting angle for each month

			Object.keys(countryColors).forEach((country) => {
				const monthString = month
					.toISOString()
					.split("T")[0]
					.slice(0, 7);
				const monthData = filteredData.find(
					(d) =>
						d.Date.startsWith(monthString) && d.Country === country
				) || { Country: "No Data", Date: monthString, [caseModel]: 0 };
				const value = monthData[caseModel] || 0;
				const colorIntensity = Math.max(value / maxCaseValue, 0.5); // Ensuring minimum opacity for visibility
				const color = countryColors[country] || "#888888"; // Default color for 'No Data'

				let angle = angleStart; // Fixed angle for each month
				let radius = baseRadius + radiusIncrement * index; // Adjusting radius for 5px spacing

				let x = Math.cos(angle) * radius + $canvas.width() / 2;
				let y = Math.sin(angle) * radius + $canvas.height() / 2;

				$("<div></div>")
					.addClass("dot")
					.css({
						width: "10px",
						height: "10px",
						backgroundColor: color,
						left: `${x}px`,
						top: `${y}px`,
						opacity: colorIntensity,
						border: `1px solid ${color}`, // Adding a border for better visibility
					})
					.attr("data-country", country)
					.attr("data-month", monthString)
					.appendTo($canvas);

				index++;
			});
		});

		$(".dot")
			.on("mouseenter", function () {
				const country = $(this).data("country");
				const month = $(this).data("month");
				$tooltip.text(`${country}, ${month}`).show();
			})
			.on("mouseleave", function () {
				$tooltip.hide();
			})
			.on("mousemove", function (e) {
				$tooltip.css({
					left: e.pageX + 10 + "px",
					top: e.pageY + 10 + "px",
				});
			});

		createMonthLabels();
	}

	$("#year, #caseModel").on("input change", function () {
		year = $("#year").val();
		caseModel = $("#caseModel").val();
		draw();
	});

	draw();
});
