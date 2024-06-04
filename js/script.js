$(document).ready(function () {
	const $canvas = $(".canvas");
	const $tooltip = $("#tooltip");
	const $yearDisplay = $("#year-display");
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

	function draw() {
		$canvas.empty();

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

		const totalCountries = Object.keys(countryColors).length;
		const angleIncrement = 360 / (totalCountries * months.length); // Ensure full circle

		let index = 0;
		Object.keys(countryColors).forEach((country) => {
			months.forEach((month, i) => {
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

				let angle = (index * angleIncrement - 90) * (Math.PI / 180); // Adjust angle to start from top (12 o'clock)
				let radius = 20 + 10 * Math.sqrt(index); // Adjusting radius for better spacing
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
	}

	$("#year, #caseModel").on("input change", function () {
		year = $("#year").val();
		caseModel = $("#caseModel").val();
		draw();
	});

	draw();
});
