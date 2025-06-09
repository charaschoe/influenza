$(document).ready(function () {
	const $canvas = $(".canvas");
	const $tooltip = $("<div>").appendTo("body");
	const $yearDisplay = $("#year-display");
	const $monthsContainer = $("#months-container");
	let year = $("#year").val();
	let caseModel = "Share of positive tests - All types of surveillance";

	// Prepare the data
	data.forEach((d) => {
		d.shareUndefined = parseFloat(
			d["Share of positive tests - Undefined surveillance"]
		);
		d.shareAll = parseFloat(
			d["Share of positive tests - All types of surveillance"]
		);
	});

	// Event listener for case model selection
	$(".case-model-option").on("click", function () {
		const validModels = [
			"Reported cases of influenza-like illnesses",
			"Reported cases of acute respiratory infections",
			"Reported cases of severe acute respiratory infections",
			"Reported deaths caused by severe acute respiratory infections",
			"Reported cases of influenza-like illness per thousand outpatients",
			"Share of positive tests - All types of surveillance",
		];

		const newModel = $(this).data("value");
		if (validModels.includes(newModel)) {
			$(".case-model-option").removeClass("selected");
			$(this).addClass("selected");
			caseModel = newModel;
			draw();
		}
	});

	// Generate consistent pastel colors for each country and store them in a persistent map
	const countryColors = {
		Japan: "#FF4C4C",
		"North Korea": "#36CFC9",
		Germany: "#FFEC3D",
		Iceland: "#9254DE",
		"United Arab Emirates": "#69C0FF",
		Iran: "#FF9C6E",
	};

	function assignColorsToCountries(data) {
		const countries = [...new Set(data.map((record) => record.Country))];
		countries.forEach((country) => {
			if (!countryColors[country]) {
				countryColors[country] = "#888888"; // Default color if not assigned
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
		const radius = 400; // Adjusted radius for month labels to be at the outer edge
		monthNames.forEach((month, i) => {
			const angle = (i * 30 - 90 + 15) * (Math.PI / 180); // Angle for each month label
			const x = Math.cos(angle) * radius + $canvas.width() / 2; // Adjusted radius for month labels
			const y = Math.sin(angle) * radius + $canvas.height() / 2;
			$("<div>")
				.addClass("month-label")
				.text(month)
				.css({
					left: `${x}px`,
					top: `${y}px`,
					transform: "translate(-50%, -50%)", // Center the labels
				})
				.appendTo($monthsContainer);
		});
	}

	// Initial call to create month labels
	createMonthLabels();

	function drawGridLines() {
		const linesContainer = $("<div>")
			.addClass("lines-container")
			.css({ position: "absolute", width: "100%", height: "100%" });
		for (let i = 0; i < 12; i++) {
			const angle = ((i * 360) / 12 - 90) * (Math.PI / 180); // Angle for each line
			const x1 = Math.cos(angle) * 50 + $canvas.width() / 2;
			const y1 = Math.sin(angle) * 50 + $canvas.height() / 2;
			const x2 = Math.cos(angle) * 375 + $canvas.width() / 2; // Increase the length by 25%
			const y2 = Math.sin(angle) * 375 + $canvas.height() / 2; // Increase the length by 25%
			$("<div>")
				.addClass("grid-line")
				.css({
					position: "absolute",
					border: "1px solid #444",
					transformOrigin: "top left",
					transform: `rotate(${angle + Math.PI / 2}rad)`,
					top: `${$canvas.height() / 2}px`,
					left: `${$canvas.width() / 2}px`,
					width: "375px", // Increase the width by 25%
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
		const maxCaseValue = Math.max(...data.map((d) => d[caseModel] || 0));
		console.log(caseModel);
		console.log(maxCaseValue);

		// Generate all months for the selected year
		// const months = generateMonths(year);

		let months = [];
		for (let i = 2012; i < 2021; i++) {
			let month = generateMonths(i);
			months = months.concat(month);
		}
		const totalDots = months.length * Object.keys(countryColors).length;
		const radiusIncrement = 20 / 72; // Fixed radius increment for spacing (30px per full circle; 6 countries * 12 month = 72 dots)
		const baseRadius = 150; // Starting radius
		let index = 0;
		months.forEach((month, monthIndex) => {
			const angleStart = ((monthIndex * 360) / 12 - 90) * (Math.PI / 180); // Starting angle for each month
			Object.keys(countryColors).forEach((country, countryIndex) => {
				const monthString = month
					.toISOString()
					.split("T")[0]
					.slice(0, 7);
				const monthData = data.find(
					(d) =>
						d.Date.startsWith(monthString) && d.Country === country
				) || { Country: "No Data", Date: monthString, [caseModel]: 0 };
				const value = monthData[caseModel] || 0;
				const colorIntensity = Math.max(value / maxCaseValue, 0.3); // Ensuring minimum opacity for visibility
				const color = countryColors[country] || "#888888"; // Default color for 'No Data'
				let angle = angleStart; // Fixed angle for each month
				let radius = baseRadius + radiusIncrement * index; // Adjusting radius for 5px spacing
				let angleDeg = gmynd.degrees(angle);
				angle = gmynd.radians(angleDeg + (360 / 12 / 6) * countryIndex);
				let x = Math.cos(angle) * radius + $canvas.width() / 2;
				let y = Math.sin(angle) * radius + $canvas.height() / 2;
				console.log(country, monthString, value);
				const dot = $("<div>");
				dot.addClass("dot")
					.css({
						width: "10px",
						height: "10px",
						backgroundColor: color,
						left: `${x}px`,
						top: `${y}px`,
						opacity: colorIntensity,
						border: `1px solid ${color}`, // Adding a border for better visibility
						display: "none", // Initially hide the dot
					})
					.attr("data-country", country)
					.attr("data-month", monthString)
					.attr("data-value", value)
					.appendTo($canvas)
					.fadeIn(1000); // Apply fade-in effect with 1 second duration
				index++;
				if (value === 0) dot.css("display", "none");
			});
		});
		$(".dot")
			.on("mouseenter", function () {
				const country = $(this).data("country");
				const month = $(this).data("month");
				const value = parseFloat($(this).data("value"));
				
				// Format the date nicely
				const date = new Date(month + "-01");
				const monthNames = [
					"January", "February", "March", "April", "May", "June",
					"July", "August", "September", "October", "November", "December"
				];
				const formattedDate = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
				
				// Get shorter, more readable case model names
				const caseModelDisplayNames = {
					"Reported cases of influenza-like illnesses": "Influenza-like Illnesses",
					"Reported cases of acute respiratory infections": "Acute Respiratory Infections",
					"Reported cases of severe acute respiratory infections": "Severe Acute Respiratory Infections",
					"Reported deaths caused by severe acute respiratory infections": "Deaths from Severe ARI",
					"Reported cases of influenza-like illness per thousand outpatients": "ILI per 1,000 Outpatients",
					"Share of positive tests - All types of surveillance": "Share of Positive Tests"
				};
				
				const displayName = caseModelDisplayNames[caseModel] || caseModel;
				
				// Find previous month's data for comparison
				const currentDate = new Date(month + "-01");
				let previousValue = null;
				let previousMonth = null;
				
				// Look for data in previous months, going back up to 12 months
				for (let i = 1; i <= 12; i++) {
					const prevDate = new Date(currentDate);
					prevDate.setMonth(prevDate.getMonth() - i);
					const prevMonthString = prevDate.toISOString().slice(0, 7);
					
					const prevData = data.find(d => 
						d.Date.startsWith(prevMonthString) && 
						d.Country === country && 
						d[caseModel] && 
						parseFloat(d[caseModel]) > 0
					);
					
					if (prevData) {
						previousValue = parseFloat(prevData[caseModel]);
						previousMonth = `${monthNames[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
						break;
					}
				}
				
				// Calculate change and format accordingly
				let changeText = "";
				let changeClass = "";
				
				if (previousValue !== null && value > 0) {
					const absoluteChange = value - previousValue;
					const percentChange = ((value - previousValue) / previousValue) * 100;
					
					if (Math.abs(percentChange) >= 0.1) { // Only show if change is significant
						const changeSymbol = absoluteChange > 0 ? "+" : "";
						
						if (caseModel.includes("Share of positive tests")) {
							changeText = `${changeSymbol}${absoluteChange.toFixed(2)}pp (${changeSymbol}${percentChange.toFixed(1)}%)`;
						} else if (caseModel.includes("per thousand")) {
							changeText = `${changeSymbol}${absoluteChange.toFixed(1)} (${changeSymbol}${percentChange.toFixed(1)}%)`;
						} else {
							changeText = `${changeSymbol}${Math.round(absoluteChange).toLocaleString('en-US')} (${changeSymbol}${percentChange.toFixed(1)}%)`;
						}
						
						// Determine color based on change direction
						changeClass = absoluteChange > 0 ? "change-increase" : "change-decrease";
					}
				}
				
				// Format the current value
				let formattedValue;
				if (caseModel.includes("Share of positive tests")) {
					formattedValue = `${value.toFixed(2)}%`;
				} else if (caseModel.includes("per thousand")) {
					formattedValue = `${value.toFixed(1)}`;
				} else {
					formattedValue = Math.round(value).toLocaleString('en-US');
				}
				
				// Create structured tooltip content with change information
				let tooltipContent = `
					<div class="tooltip-header">${country}</div>
					<div class="tooltip-date">${formattedDate}</div>
					<div class="tooltip-metric">${displayName}</div>
					<div class="tooltip-value">${formattedValue}</div>
				`;
				
				if (changeText) {
					tooltipContent += `<div class="tooltip-change ${changeClass}">vs. ${previousMonth}: ${changeText}</div>`;
				}
				
				$(".info-box").html(tooltipContent);
			})
			.on("mouseleave", function () {
				$(".info-box").empty();
			});

		createMonthLabels();
	}

	$("#year").on("input change", function () {
		const newYear = parseInt($(this).val());
		if (newYear >= 2009 && newYear <= 2024) {
			year = newYear;
			draw();
		} else {
			$(this).val(year); // Reset to previous valid value
		}
	});

	$(".case-model-option").on("click", function () {
		const validModels = [
			"Reported cases of influenza-like illnesses",
			"Reported cases of acute respiratory infections",
			"Reported cases of severe acute respiratory infections",
			"Reported deaths caused by severe acute respiratory infections",
			"Reported cases of influenza-like illness per thousand outpatients",
			"Share of positive tests - All types of surveillance",
		];

		const newModel = $(this).data("value");
		if (validModels.includes(newModel)) {
			$(".case-model-option").removeClass("selected");
			$(this).addClass("selected");
			caseModel = newModel;
			draw();
		}
	});

	// Toggle explanation panel
	$("#toggle-explanation").on("click", function() {
		const $panel = $("#explanation-panel");
		const $button = $(this);
		
		if ($panel.is(":visible")) {
			$panel.fadeOut(300);
			$button.text("Show Info");
		} else {
			$panel.fadeIn(300);
			$button.text("Hide Info");
		}
	});

	// Set dynamic year and last updated date
	function updateTimestamps() {
		const currentYear = new Date().getFullYear();
		const currentDate = new Date();
		const months = [
			"January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"
		];
		const lastUpdated = `${months[currentDate.getMonth()]} ${currentYear}`;
		
		$("#current-year").text(currentYear);
		$("#last-updated").text(lastUpdated);
	}

	// Update timestamps on any interaction
	$(".case-model-option").on("click", updateTimestamps);
	$("#year").on("input change", updateTimestamps);

	// Initialize timestamps
	updateTimestamps();

	draw();
});
