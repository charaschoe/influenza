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

	// Calculate seasonal risk patterns
	calculateSeasonalRiskPatterns();

	// Debug: Check if seasonal risk patterns were calculated
	const sampleSeasonalData = data.filter(
		(d) =>
			d[
				"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons"
			] > 0
	);
	console.log(
		`Calculated seasonal risk patterns for ${sampleSeasonalData.length} data points`
	);
	if (sampleSeasonalData.length > 0) {
		console.log(
			"Sample seasonal risk data:",
			sampleSeasonalData.slice(0, 5)
		);
	}

	// Event listener for case model selection
	$(".case-model-option").on("click", function () {
		const validModels = [
			"Reported cases of influenza-like illnesses",
			"Reported cases of acute respiratory infections",
			"Reported cases of severe acute respiratory infections",
			"Reported deaths caused by severe acute respiratory infections",
			"Reported cases of influenza-like illness per thousand outpatients",
			"Share of positive tests - All types of surveillance",
			"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons",
		];

		const newModel = $(this).data("value");
		if (validModels.includes(newModel)) {
			$(".case-model-option").removeClass("selected");
			$(this).addClass("selected");
			caseModel = newModel;

			// Show/hide seasonal risk analysis panel
			if (newModel.includes("Seasonal Risk Patterns")) {
				$("#seasonal-risk-analysis").show();
				$("#toggle-comparison").text("Risk Pattern Analysis");
			} else {
				$("#seasonal-risk-analysis").hide();
				$("#toggle-comparison").text("Country Analysis");
			}

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
		// Get current settings or use defaults
		const settings = window.visualizationSettings || {
			showMonthLabels: true,
		};

		if (!settings.showMonthLabels) {
			$monthsContainer.empty();
			return; // Skip creating month labels if disabled
		}

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
		// Get current settings or use defaults
		const settings = window.visualizationSettings || {
			showGridLines: true,
		};

		if (!settings.showGridLines) {
			return; // Skip drawing grid lines if disabled
		}

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

				// Get current settings or use defaults
				const settings = window.visualizationSettings || {
					dotSize: 10,
					dotOpacity: 0.8,
					enableTransitions: true,
					showZeroValues: false,
				};

				const dot = $("<div>");
				const dotSize = settings.dotSize;
				const effectiveOpacity = colorIntensity * settings.dotOpacity;
				const fadeInDuration = settings.enableTransitions ? 1000 : 0;

				dot.addClass("dot")
					.css({
						width: dotSize + "px",
						height: dotSize + "px",
						backgroundColor: color,
						left: `${x}px`,
						top: `${y}px`,
						opacity: effectiveOpacity,
						border: `1px solid ${color}`, // Adding a border for better visibility
						display: "none", // Initially hide the dot
						transition: settings.enableTransitions
							? "all 0.3s ease"
							: "none",
					})
					.attr("data-country", country)
					.attr("data-month", monthString)
					.attr("data-value", value)
					.attr("data-original-opacity", colorIntensity) // Store original opacity for settings changes
					.appendTo($canvas)
					.fadeIn(fadeInDuration); // Apply fade-in effect with configurable duration
				index++;

				// Handle zero values based on settings
				if (value === 0 && !settings.showZeroValues) {
					dot.css("display", "none");
				}
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
				const formattedDate = `${
					monthNames[date.getMonth()]
				} ${date.getFullYear()}`;

				// Get shorter, more readable case model names
				const caseModelDisplayNames = {
					"Reported cases of influenza-like illnesses":
						"Influenza-like Illnesses",
					"Reported cases of acute respiratory infections":
						"Acute Respiratory Infections",
					"Reported cases of severe acute respiratory infections":
						"Severe Acute Respiratory Infections",
					"Reported deaths caused by severe acute respiratory infections":
						"Deaths from Severe ARI",
					"Reported cases of influenza-like illness per thousand outpatients":
						"ILI per 1,000 Outpatients",
					"Share of positive tests - All types of surveillance":
						"Share of Positive Tests",
					"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons":
						"Seasonal Risk Patterns",
				};

				const displayName =
					caseModelDisplayNames[caseModel] || caseModel;

				// Find previous month's data for comparison
				const currentDate = new Date(month + "-01");
				let previousValue = null;
				let previousMonth = null;

				// Look for data in previous months, going back up to 12 months
				for (let i = 1; i <= 12; i++) {
					const prevDate = new Date(currentDate);
					prevDate.setMonth(prevDate.getMonth() - i);
					const prevMonthString = prevDate.toISOString().slice(0, 7);

					const prevData = data.find(
						(d) =>
							d.Date.startsWith(prevMonthString) &&
							d.Country === country &&
							d[caseModel] &&
							parseFloat(d[caseModel]) > 0
					);

					if (prevData) {
						previousValue = parseFloat(prevData[caseModel]);
						previousMonth = `${
							monthNames[prevDate.getMonth()]
						} ${prevDate.getFullYear()}`;
						break;
					}
				}

				// Calculate change and format accordingly
				let changeText = "";
				let changeClass = "";

				if (previousValue !== null && value > 0) {
					const absoluteChange = value - previousValue;
					const percentChange =
						((value - previousValue) / previousValue) * 100;

					if (Math.abs(percentChange) >= 0.1) {
						// Only show if change is significant
						const changeSymbol = absoluteChange > 0 ? "+" : "";

						if (caseModel.includes("Share of positive tests")) {
							changeText = `${changeSymbol}${absoluteChange.toFixed(
								2
							)}pp (${changeSymbol}${percentChange.toFixed(1)}%)`;
						} else if (caseModel.includes("per thousand")) {
							changeText = `${changeSymbol}${absoluteChange.toFixed(
								1
							)} (${changeSymbol}${percentChange.toFixed(1)}%)`;
						} else {
							changeText = `${changeSymbol}${Math.round(
								absoluteChange
							).toLocaleString(
								"en-US"
							)} (${changeSymbol}${percentChange.toFixed(1)}%)`;
						}

						// Determine color based on change direction
						changeClass =
							absoluteChange > 0
								? "change-increase"
								: "change-decrease";
					}
				}

				// Format the current value with better visualization
				let formattedValue;
				let riskCategory = "";
				let riskColor = "";

				if (caseModel.includes("Share of positive tests")) {
					formattedValue = `${value.toFixed(2)}%`;
				} else if (caseModel.includes("per thousand")) {
					formattedValue = `${value.toFixed(1)}`;
				} else if (caseModel.includes("Seasonal Risk Patterns")) {
					// Add risk categorization for better understanding
					if (value >= 70) {
						riskCategory = "Very High Risk";
						riskColor = "#ff4444";
					} else if (value >= 50) {
						riskCategory = "High Risk";
						riskColor = "#ff8800";
					} else if (value >= 30) {
						riskCategory = "Moderate Risk";
						riskColor = "#ffbb00";
					} else if (value >= 15) {
						riskCategory = "Low Risk";
						riskColor = "#88cc00";
					} else {
						riskCategory = "Very Low Risk";
						riskColor = "#00aa44";
					}
					formattedValue = `${value.toFixed(1)}/100`;
				} else {
					formattedValue = Math.round(value).toLocaleString("en-US");
				}

				// Create structured tooltip content with enhanced seasonal risk visualization
				let tooltipContent = `
					<div class="tooltip-header">${country}</div>
					<div class="tooltip-date">${formattedDate}</div>
					<div class="tooltip-metric">${displayName}</div>
					<div class="tooltip-value">${formattedValue}</div>
				`;

				// Enhanced seasonal risk pattern display
				if (caseModel.includes("Seasonal Risk Patterns")) {
					tooltipContent += `
						<div class="tooltip-risk-category" style="color: ${riskColor}; font-weight: bold; margin-top: 4px;">
							${riskCategory}
						</div>
						<div class="tooltip-risk-bar" style="margin-top: 6px;">
							<div style="background: #333; height: 4px; border-radius: 2px; overflow: hidden;">
								<div style="background: ${riskColor}; height: 100%; width: ${value}%; transition: width 0.3s ease;"></div>
							</div>
						</div>
					`;
				}

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
			"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons",
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
	$("#toggle-explanation").on("click", function () {
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
		const lastUpdated = `${months[currentDate.getMonth()]} ${currentYear}`;

		$("#current-year").text(currentYear);
		$("#last-updated").text(lastUpdated);
	}

	// Update timestamps on any interaction
	$(".case-model-option").on("click", updateTimestamps);
	$("#year").on("input change", updateTimestamps);

	// Initialize timestamps
	updateTimestamps();

	// Calculate seasonal risk patterns with better differentiation
	function calculateSeasonalRiskPatterns() {
		// First pass: collect all global statistics for normalization
		let globalStats = {
			allValues: [],
			countryMaxes: [],
			seasonalVariations: [],
		};

		const countrySentinelData = {};

		// Group data by country and calculate seasonal patterns
		data.forEach((d) => {
			if (!countrySentinelData[d.Country]) {
				countrySentinelData[d.Country] = {};
			}

			// Use multiple metrics for comprehensive seasonal analysis
			const iliValue =
				parseFloat(d["Reported cases of influenza-like illnesses"]) ||
				0;
			const ariValue =
				parseFloat(
					d["Reported cases of acute respiratory infections"]
				) || 0;
			const positiveShare =
				parseFloat(
					d["Share of positive tests - All types of surveillance"]
				) || 0;

			// More sophisticated combination with different weighting
			const combinedValue =
				iliValue * 0.3 + ariValue * 0.4 + positiveShare * 30; // Higher weight for positive share

			const date = new Date(d.Date);
			const month = date.getMonth();
			const year = date.getFullYear();

			if (combinedValue > 0 || positiveShare > 0) {
				if (!countrySentinelData[d.Country][month]) {
					countrySentinelData[d.Country][month] = [];
				}

				countrySentinelData[d.Country][month].push({
					value: combinedValue,
					positiveShare: positiveShare,
					iliValue: iliValue,
					ariValue: ariValue,
					year: year,
					date: d.Date,
				});

				globalStats.allValues.push(combinedValue);
			}
		});

		// Calculate global percentiles for better scaling
		globalStats.allValues.sort((a, b) => a - b);
		const globalP50 =
			globalStats.allValues[
				Math.floor(globalStats.allValues.length * 0.5)
			] || 0;
		const globalP90 =
			globalStats.allValues[
				Math.floor(globalStats.allValues.length * 0.9)
			] || 1;
		const globalP99 =
			globalStats.allValues[
				Math.floor(globalStats.allValues.length * 0.99)
			] || 1;

		// Calculate seasonal risk scores with global normalization
		Object.keys(countrySentinelData).forEach((country) => {
			const countryData = countrySentinelData[country];

			// Calculate country-specific statistics
			let allCountryValues = [];
			let monthlyAverages = {};

			Object.keys(countryData).forEach((month) => {
				const monthValues = countryData[month].map((d) => d.value);
				allCountryValues = allCountryValues.concat(monthValues);
				monthlyAverages[month] =
					monthValues.reduce((a, b) => a + b, 0) / monthValues.length;
			});

			const countryMax = Math.max(...allCountryValues, 1);
			const countryAverage =
				allCountryValues.length > 0
					? allCountryValues.reduce((a, b) => a + b, 0) /
					  allCountryValues.length
					: 0;

			// Calculate seasonal variation (how much seasonality this country shows)
			const monthAverages = Object.values(monthlyAverages);
			const seasonalVariation =
				monthAverages.length > 1
					? (Math.max(...monthAverages) -
							Math.min(...monthAverages)) /
					  (countryAverage || 1)
					: 0;

			// Calculate seasonal risk pattern for each month
			Object.keys(countryData).forEach((month) => {
				const monthData = countryData[month];
				if (monthData.length > 0) {
					const monthValues = monthData.map((d) => d.value);
					const monthAverage =
						monthValues.reduce((a, b) => a + b, 0) /
						monthValues.length;
					const monthMax = Math.max(...monthValues);

					// 1. Predictability Score (consistency across years)
					let predictabilityScore = 0;
					if (monthValues.length > 1) {
						const variance =
							monthValues.reduce(
								(sum, val) =>
									sum + Math.pow(val - monthAverage, 2),
								0
							) / monthValues.length;
						const coefficientOfVariation =
							monthAverage > 0
								? Math.sqrt(variance) / monthAverage
								: 1;
						predictabilityScore = Math.max(
							0,
							1 - Math.min(coefficientOfVariation, 1)
						);
					} else {
						predictabilityScore = 0.3; // Lower score for single data point
					}

					// 2. Global Severity Score (relative to all countries)
					let globalSeverityScore = 0;
					if (monthMax > globalP50) {
						if (monthMax > globalP99) globalSeverityScore = 1.0;
						else if (monthMax > globalP90)
							globalSeverityScore =
								0.7 +
								((monthMax - globalP90) /
									(globalP99 - globalP90)) *
									0.3;
						else
							globalSeverityScore =
								0.3 +
								((monthMax - globalP50) /
									(globalP90 - globalP50)) *
									0.4;
					} else {
						globalSeverityScore = (monthMax / globalP50) * 0.3;
					}

					// 3. Seasonal Timing Score
					const seasonalBonus = getSeasonalBonus(parseInt(month));

					// 4. Seasonal Pattern Strength (how seasonal is this country overall)
					const seasonalStrengthScore = Math.min(
						seasonalVariation,
						1
					);

					// Combined score with adjusted weights
					const seasonalRiskScore =
						(predictabilityScore * 0.25 +
							globalSeverityScore * 0.45 +
							seasonalBonus * 0.15 +
							seasonalStrengthScore * 0.15) *
						100;

					// Apply non-linear scaling to spread out the values more
					const scaledScore =
						Math.pow(seasonalRiskScore / 100, 0.7) * 100;
					const finalScore = Math.max(scaledScore, 0.1);

					// Apply the calculated score to all data entries for this country and month
					monthData.forEach((entry) => {
						const dataEntry = data.find(
							(d) =>
								d.Country === country && d.Date === entry.date
						);
						if (dataEntry) {
							dataEntry[
								"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons"
							] = finalScore;
						}
					});
				}
			});
		});
	}

	// Helper function to assign seasonal bonus based on typical flu season timing
	function getSeasonalBonus(month) {
		// Northern hemisphere flu season typically peaks in winter months
		// Assign higher bonuses to December, January, February, March
		const seasonalBonuses = {
			0: 0.9, // January
			1: 0.8, // February
			2: 0.7, // March
			3: 0.3, // April
			4: 0.1, // May
			5: 0.05, // June
			6: 0.05, // July
			7: 0.05, // August
			8: 0.1, // September
			9: 0.3, // October
			10: 0.6, // November
			11: 0.9, // December
		};
		return seasonalBonuses[month] || 0.1;
	}

	// Initial calculation of seasonal risk patterns
	calculateSeasonalRiskPatterns();

	draw();

	// Comparison functionality
	function initializeComparison() {
		// Populate year dropdown
		const years = [
			...new Set(data.map((d) => new Date(d.Date).getFullYear())),
		].sort();
		const $yearSelect = $("#comparison-year");
		const $yearsSelect = $("#comparison-years");
		const $seasonalYearSelect = $("#seasonal-year");

		years.forEach((year) => {
			$yearSelect.append(`<option value="${year}">${year}</option>`);
			$yearsSelect.append(`<option value="${year}">${year}</option>`);
			$seasonalYearSelect.append(
				`<option value="${year}">${year}</option>`
			);
		});

		// Set default to current year
		$yearSelect.val(year);
		$seasonalYearSelect.val(year);

		// Toggle comparison panel
		$("#toggle-comparison").on("click", function () {
			$("#comparison-content").toggle();
		});

		// Seasonal Risk Pattern Analysis
		$("#analyze-seasonal-risk").on("click", function () {
			const $button = $(this);
			const originalText = $button.text();

			// Show loading state
			$button.text("Analyzing...").prop("disabled", true);
			$button.addClass("loading");

			// Add small delay to show loading state
			setTimeout(() => {
				runSeasonalRiskAnalysis();

				// Reset button state
				$button.text(originalText).prop("disabled", false);
				$button.removeClass("loading");
			}, 300);
		});

		// Handle comparison mode changes
		$('input[name="comparison-mode"]').on("change", function () {
			const mode = $(this).val();
			$(".comparison-filters").hide();

			if (mode === "monthly") {
				$("#monthly-filters").show();
			} else if (mode === "yearly") {
				$("#yearly-filters").show();
			} else {
				$("#monthly-filters").show(); // seasonal uses monthly filters
			}
		});

		// Run comparison
		$("#run-comparison").on("click", function () {
			const mode = $('input[name="comparison-mode"]:checked').val();
			if (mode === "monthly") {
				runCountryComparison();
			} else if (mode === "seasonal") {
				runSeasonalComparison();
			}
		});

		// Run seasonal comparison
		$("#run-seasonal-comparison").on("click", function () {
			runSeasonalComparison();
		});

		// Run yearly comparison
		$("#run-yearly-comparison").on("click", function () {
			runYearlyComparison();
		});
	}

	function runYearlyComparison() {
		const selectedYears = $("#comparison-years").val() || [];
		const metric = $("#yearly-metric").val();

		if (selectedYears.length === 0) {
			$("#comparison-results").html(
				'<p style="color: #ff6666; font-style: italic;">Please select at least one year.</p>'
			);
			return;
		}

		// Collect data for all selected years
		const yearlyData = {};

		selectedYears.forEach((year) => {
			yearlyData[year] = {};
			Object.keys(countryColors).forEach((country) => {
				yearlyData[year][country] = {
					country: country,
					color: countryColors[country],
					values: [],
					peak: 0,
					total: 0,
					average: 0,
				};

				// Collect all monthly data for this year and country
				for (let month = 1; month <= 12; month++) {
					const monthStr = month.toString().padStart(2, "0");
					const targetDate = `${year}-${monthStr}`;

					const monthData = data.find(
						(d) =>
							d.Date.startsWith(targetDate) &&
							d.Country === country
					);

					const value = monthData
						? parseFloat(monthData[caseModel]) || 0
						: 0;
					yearlyData[year][country].values.push(value);
					yearlyData[year][country].total += value;
					yearlyData[year][country].peak = Math.max(
						yearlyData[year][country].peak,
						value
					);
				}

				yearlyData[year][country].average =
					yearlyData[year][country].total / 12;
			});
		});

		displayYearlyComparison(yearlyData, metric, selectedYears);
	}

	function displayYearlyComparison(yearlyData, metric, selectedYears) {
		const $results = $("#comparison-results");
		$results.empty();

		// Add header
		$results.append(`
			<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #444;">
				<strong>Multi-Year Analysis (${selectedYears.join(", ")})</strong>
				<br><small style="color: #999;">${getCaseModelDisplayName(
					caseModel
				)} - Focus: ${metric}</small>
			</div>
		`);

		// For each year, show country comparison
		selectedYears.forEach((year) => {
			const yearData = yearlyData[year];
			const countries = Object.values(yearData);

			// Sort countries by the selected metric
			countries.sort((a, b) => {
				if (metric === "peak") return b.peak - a.peak;
				if (metric === "total") return b.total - a.total;
				if (metric === "average") return b.average - a.average;
				return 0;
			});

			$results.append(`
				<div class="year-comparison-item">
					<div class="year-header">${year}</div>
					<div class="year-stats">
						${countries
							.map((country, index) => {
								if (country.total === 0) return ""; // Skip countries with no data

								const value =
									metric === "peak"
										? country.peak
										: metric === "total"
										? country.total
										: country.average;
								const formattedValue = formatValue(
									value,
									caseModel
								);
								const rank = index + 1;

								return `
								<div class="stat-item">
									<div class="stat-value" style="color: ${country.color};">
										${formattedValue}
									</div>
									<div class="stat-label">
										${country.country}<br>#${rank}
									</div>
								</div>
							`;
							})
							.join("")}
					</div>
				</div>
			`);
		});

		// Add cross-year insights
		if (selectedYears.length > 1) {
			const insights = generateYearlyInsights(
				yearlyData,
				metric,
				selectedYears
			);
			if (insights.length > 0) {
				$results.append(`
					<div class="comparison-insights">
						<strong>Cross-Year Insights:</strong>
						${insights
							.map(
								(insight) =>
									`<div style="margin-top: 4px; font-size: 11px;">• ${insight}</div>`
							)
							.join("")}
					</div>
				`);
			}
		}
	}

	function generateYearlyInsights(yearlyData, metric, selectedYears) {
		const insights = [];

		// Find countries with consistently high values
		const consistentPerformers = {};
		Object.keys(countryColors).forEach((country) => {
			let topRanks = 0;
			selectedYears.forEach((year) => {
				const yearData = Object.values(yearlyData[year]);
				yearData.sort((a, b) => {
					if (metric === "peak") return b.peak - a.peak;
					if (metric === "total") return b.total - a.total;
					if (metric === "average") return b.average - a.average;
					return 0;
				});

				const rank =
					yearData.findIndex((c) => c.country === country) + 1;
				if (rank <= 2 && rank > 0) topRanks++;
			});

			if (topRanks >= selectedYears.length - 1) {
				consistentPerformers[country] = topRanks;
			}
		});

		if (Object.keys(consistentPerformers).length > 0) {
			const performers = Object.keys(consistentPerformers).join(", ");
			insights.push(`Consistently high impact: ${performers}`);
		}

		// Find biggest year-over-year changes
		if (selectedYears.length === 2) {
			const [year1, year2] = selectedYears.sort();
			let biggestIncrease = { country: "", change: 0 };
			let biggestDecrease = { country: "", change: 0 };

			Object.keys(countryColors).forEach((country) => {
				const value1 = yearlyData[year1][country][metric];
				const value2 = yearlyData[year2][country][metric];
				const change = value2 - value1;

				if (change > biggestIncrease.change) {
					biggestIncrease = { country, change };
				}
				if (change < biggestDecrease.change) {
					biggestDecrease = { country, change };
				}
			});

			if (biggestIncrease.change > 0) {
				insights.push(
					`Biggest increase: ${
						biggestIncrease.country
					} (+${formatValue(biggestIncrease.change, caseModel)})`
				);
			}
			if (biggestDecrease.change < 0) {
				insights.push(
					`Biggest decrease: ${
						biggestDecrease.country
					} (${formatValue(biggestDecrease.change, caseModel)})`
				);
			}
		}

		return insights;
	}

	// Comparison functionality
	function initializeComparison() {
		// Populate year dropdown
		const years = [
			...new Set(data.map((d) => new Date(d.Date).getFullYear())),
		].sort();
		const $yearSelect = $("#comparison-year");
		const $yearsSelect = $("#comparison-years");

		years.forEach((year) => {
			$yearSelect.append(`<option value="${year}">${year}</option>`);
			$yearsSelect.append(`<option value="${year}">${year}</option>`);
		});

		// Set default to current year
		$yearSelect.val(year);

		// Toggle comparison panel
		$("#toggle-comparison").on("click", function () {
			$("#comparison-content").toggle();
		});

		// Handle comparison mode changes
		$('input[name="comparison-mode"]').on("change", function () {
			const mode = $(this).val();
			$(".comparison-filters").hide();

			if (mode === "monthly") {
				$("#monthly-filters").show();
			} else if (mode === "yearly") {
				$("#yearly-filters").show();
			} else {
				$("#monthly-filters").show(); // seasonal uses monthly filters
			}
		});

		// Run comparison
		$("#run-comparison").on("click", function () {
			const mode = $('input[name="comparison-mode"]:checked').val();
			if (mode === "monthly") {
				runCountryComparison();
			} else if (mode === "seasonal") {
				runSeasonalComparison();
			}
		});

		// Run seasonal comparison
		$("#run-seasonal-comparison").on("click", function () {
			runSeasonalComparison();
		});

		// Run yearly comparison
		$("#run-yearly-comparison").on("click", function () {
			runYearlyComparison();
		});
	}

	function runCountryComparison() {
		const selectedMonth = $("#comparison-month").val();
		const selectedYear = $("#comparison-year").val();
		const targetDate = `${selectedYear}-${selectedMonth}`;

		// Get data for all countries for the selected month/year
		const comparisonData = [];
		Object.keys(countryColors).forEach((country) => {
			const countryData = data.find(
				(d) => d.Date.startsWith(targetDate) && d.Country === country
			);

			if (countryData) {
				const value = parseFloat(countryData[caseModel]) || 0;
				comparisonData.push({
					country: country,
					value: value,
					color: countryColors[country],
					data: countryData,
				});
			}
		});

		// Sort by value (descending)
		comparisonData.sort((a, b) => b.value - a.value);

		// Display results
		displayComparisonResults(comparisonData, selectedMonth, selectedYear);
	}

	function displayComparisonResults(comparisonData, month, year) {
		const $results = $("#comparison-results");
		$results.empty();

		if (comparisonData.length === 0) {
			$results.html(
				'<p style="color: #666; font-style: italic;">No data available for the selected period.</p>'
			);
			return;
		}

		// Add header
		const monthNames = [
			"",
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
		const monthName = monthNames[parseInt(month)];

		$results.append(`
			<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #444;">
				<strong>Comparison for ${monthName} ${year}</strong>
				<br><small style="color: #999;">${getCaseModelDisplayName(caseModel)}</small>
			</div>
		`);

		// Display each country
		comparisonData.forEach((item, index) => {
			const formattedValue = formatValue(item.value, caseModel);
			const rankSuffix = getRankSuffix(index + 1);

			// Calculate relative intensity for visual comparison
			const maxValue = Math.max(...comparisonData.map((d) => d.value));
			const intensity = maxValue > 0 ? item.value / maxValue : 0;
			const barWidth = Math.max(intensity * 100, 2); // Minimum 2% width

			$results.append(`
				<div class="country-comparison-item" style="border-left-color: ${item.color};">
					<div class="country-name">
						<span class="color-indicator" style="background-color: ${item.color};"></span>
						${item.country}
					</div>
					<div class="value">${formattedValue}</div>
					<div class="rank">${index + 1}${rankSuffix} highest</div>
					<div style="background: ${
						item.color
					}; height: 4px; width: ${barWidth}%; margin-top: 5px; border-radius: 2px; opacity: 0.7;"></div>
				</div>
			`);
		});

		// Add summary statistics
		if (comparisonData.length > 1) {
			const values = comparisonData.map((d) => d.value);
			const average = values.reduce((a, b) => a + b, 0) / values.length;
			const highest = Math.max(...values);
			const lowest = Math.min(...values);

			$results.append(`
				<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #444; font-size: 11px; color: #999;">
					<div>Highest: ${formatValue(highest, caseModel)}</div>
					<div>Average: ${formatValue(average, caseModel)}</div>
					<div>Lowest: ${formatValue(lowest, caseModel)}</div>
				</div>
			`);
		}
	}

	function getCaseModelDisplayName(model) {
		const caseModelDisplayNames = {
			"Reported cases of influenza-like illnesses":
				"Influenza-like Illnesses",
			"Reported cases of acute respiratory infections":
				"Acute Respiratory Infections",
			"Reported cases of severe acute respiratory infections":
				"Severe Acute Respiratory Infections",
			"Reported deaths caused by severe acute respiratory infections":
				"Deaths from Severe ARI",
			"Reported cases of influenza-like illness per thousand outpatients":
				"ILI per 1,000 Outpatients",
			"Share of positive tests - All types of surveillance":
				"Share of Positive Tests",
			"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons":
				"Seasonal Risk Patterns",
		};
		return caseModelDisplayNames[model] || model;
	}

	function formatValue(value, model) {
		if (model.includes("Share of positive tests")) {
			return `${value.toFixed(2)}%`;
		} else if (model.includes("per thousand")) {
			return `${value.toFixed(1)}`;
		} else if (model.includes("Seasonal Risk Patterns")) {
			return `${value.toFixed(1)}/100`;
		} else {
			return Math.round(value).toLocaleString("en-US");
		}
	}

	function getRankSuffix(rank) {
		if (rank % 10 === 1 && rank % 100 !== 11) return "st";
		if (rank % 10 === 2 && rank % 100 !== 12) return "nd";
		if (rank % 10 === 3 && rank % 100 !== 13) return "rd";
		return "th";
	}

	// Initialize comparison functionality
	initializeComparison();

	// Initial draw
	draw();

	function runSeasonalComparison() {
		const selectedYear = $("#comparison-year").val();

		// Get seasonal data for all countries for the selected year
		const seasonalData = {};
		Object.keys(countryColors).forEach((country) => {
			seasonalData[country] = {
				country: country,
				color: countryColors[country],
				months: {},
				yearTotal: 0,
				peakMonth: null,
				peakValue: 0,
			};

			// Collect data for each month
			for (let month = 1; month <= 12; month++) {
				const monthStr = month.toString().padStart(2, "0");
				const targetDate = `${selectedYear}-${monthStr}`;

				const monthData = data.find(
					(d) =>
						d.Date.startsWith(targetDate) && d.Country === country
				);

				const value = monthData
					? parseFloat(monthData[caseModel]) || 0
					: 0;
				seasonalData[country].months[month] = value;
				seasonalData[country].yearTotal += value;

				if (value > seasonalData[country].peakValue) {
					seasonalData[country].peakValue = value;
					seasonalData[country].peakMonth = month;
				}
			}
		});

		// Display seasonal comparison
		displaySeasonalComparison(seasonalData, selectedYear);
	}

	function displaySeasonalComparison(seasonalData, year) {
		const $results = $("#comparison-results");
		$results.empty();

		// Add header
		$results.append(`
			<div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #444;">
				<strong>Seasonal Overview ${year}</strong>
				<br><small style="color: #999;">${getCaseModelDisplayName(caseModel)}</small>
			</div>
		`);

		// Sort countries by year total (descending)
		const countries = Object.values(seasonalData).sort(
			(a, b) => b.yearTotal - a.yearTotal
		);

		// Month names for display
		const monthNames = [
			"",
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		countries.forEach((countryData) => {
			if (countryData.yearTotal === 0) return; // Skip countries with no data

			// Create mini chart for each country
			const maxValue = Math.max(...Object.values(countryData.months));

			let monthBars = "";
			for (let month = 1; month <= 12; month++) {
				const value = countryData.months[month];
				const height = maxValue > 0 ? (value / maxValue) * 20 : 0;
				const isPeak = month === countryData.peakMonth;
				const opacity = isPeak ? "1" : "0.6";

				monthBars += `
					<div style="
						display: inline-block; 
						width: 12px; 
						height: 20px; 
						margin-right: 2px; 
						position: relative;
						vertical-align: bottom;
					">
						<div style="
							position: absolute;
							bottom: 0;
							width: 100%;
							height: ${height}px;
							background-color: ${countryData.color};
							opacity: ${opacity};
							border-radius: 1px 1px 0 0;
						" title="${monthNames[month]}: ${formatValue(value, caseModel)}"></div>
					</div>
				`;
			}

			const peakMonthName = monthNames[countryData.peakMonth];
			const totalFormatted = formatValue(
				countryData.yearTotal,
				caseModel
			);
			const peakFormatted = formatValue(countryData.peakValue, caseModel);

			$results.append(`
				<div class="country-comparison-item" style="border-left-color: ${countryData.color};">
					<div class="country-name">
						<span class="color-indicator" style="background-color: ${countryData.color};"></span>
						${countryData.country}
					</div>
					<div style="margin: 8px 0;">
						${monthBars}
					</div>
					<div class="value">
						Total: ${totalFormatted} | Peak: ${peakMonthName} (${peakFormatted})
					</div>
				</div>
			`);
		});

		// Add seasonal insights
		const insights = generateSeasonalInsights(countries);
		if (insights.length > 0) {
			$results.append(`
				<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #444;">
					<strong style="color: #36CFC9; font-size: 12px;">Seasonal Insights:</strong>
					${insights
						.map(
							(insight) =>
								`<div style="font-size: 11px; color: #999; margin-top: 4px;">• ${insight}</div>`
						)
						.join("")}
				</div>
			`);
		}
	}

	function generateSeasonalInsights(countries) {
		const insights = [];

		if (countries.length === 0) return insights;

		// Find peak months distribution
		const peakMonthCounts = {};
		countries.forEach((country) => {
			if (country.peakMonth) {
				peakMonthCounts[country.peakMonth] =
					(peakMonthCounts[country.peakMonth] || 0) + 1;
			}
		});

		// Most common peak month
		const mostCommonPeakMonth = Object.keys(peakMonthCounts).reduce(
			(a, b) => (peakMonthCounts[a] > peakMonthCounts[b] ? a : b)
		);
		const monthNames = [
			"",
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

		if (peakMonthCounts[mostCommonPeakMonth] > 1) {
			insights.push(
				`Most countries peaked in ${monthNames[mostCommonPeakMonth]} (${peakMonthCounts[mostCommonPeakMonth]} countries)`
			);
		}

		// Highest and lowest impact countries
		const highest = countries[0];
		const lowest = countries[countries.length - 1];

		if (highest && lowest && highest !== lowest) {
			insights.push(
				`${highest.country} had the highest impact, ${lowest.country} had the lowest`
			);
		}

		// Winter vs Summer comparison
		const winterMonths = [12, 1, 2, 3]; // Dec, Jan, Feb, Mar
		const summerMonths = [6, 7, 8]; // Jun, Jul, Aug

		let winterPeaks = 0;
		let summerPeaks = 0;

		countries.forEach((country) => {
			if (winterMonths.includes(country.peakMonth)) winterPeaks++;
			if (summerMonths.includes(country.peakMonth)) summerPeaks++;
		});

		if (winterPeaks > summerPeaks * 2) {
			insights.push(`Strong winter seasonality pattern observed`);
		} else if (summerPeaks > winterPeaks) {
			insights.push(`Unusual summer peak pattern detected`);
		}

		return insights;
	}

	// Special analysis function for Seasonal Risk Patterns
	function runSeasonalRiskAnalysis() {
		const selectedYear = $("#seasonal-year").val();
		const riskThreshold = parseFloat($("#risk-threshold").val());

		// Collect seasonal risk data for all countries
		const riskData = [];
		Object.keys(countryColors).forEach((country) => {
			let countryRiskData = {
				country: country,
				color: countryColors[country],
				monthlyRisks: {},
				averageRisk: 0,
				peakRisk: 0,
				peakMonth: null,
				riskCategory: "",
				seasonalPattern: "",
			};

			let totalRisk = 0;
			let monthCount = 0;

			// Collect data for each month
			for (let month = 1; month <= 12; month++) {
				const monthStr = month.toString().padStart(2, "0");
				const targetDate = `${selectedYear}-${monthStr}`;

				const monthData = data.find(
					(d) =>
						d.Date.startsWith(targetDate) && d.Country === country
				);

				if (monthData) {
					const riskScore =
						parseFloat(
							monthData[
								"Seasonal Risk Patterns - Which countries have the most predictable/severe seasons"
							]
						) || 0;
					countryRiskData.monthlyRisks[month] = riskScore;
					totalRisk += riskScore;
					monthCount++;

					if (riskScore > countryRiskData.peakRisk) {
						countryRiskData.peakRisk = riskScore;
						countryRiskData.peakMonth = month;
					}
				}
			}

			countryRiskData.averageRisk =
				monthCount > 0 ? totalRisk / monthCount : 0;

			// Categorize risk level
			if (countryRiskData.averageRisk >= 70) {
				countryRiskData.riskCategory = "Very High Risk";
			} else if (countryRiskData.averageRisk >= 50) {
				countryRiskData.riskCategory = "High Risk";
			} else if (countryRiskData.averageRisk >= 30) {
				countryRiskData.riskCategory = "Moderate Risk";
			} else if (countryRiskData.averageRisk >= 15) {
				countryRiskData.riskCategory = "Low Risk";
			} else {
				countryRiskData.riskCategory = "Very Low Risk";
			}

			// Determine seasonal pattern
			const winterMonths = [12, 1, 2, 3];
			const summerMonths = [6, 7, 8];
			let winterAvg = 0,
				summerAvg = 0,
				winterCount = 0,
				summerCount = 0;

			winterMonths.forEach((m) => {
				if (countryRiskData.monthlyRisks[m]) {
					winterAvg += countryRiskData.monthlyRisks[m];
					winterCount++;
				}
			});

			summerMonths.forEach((m) => {
				if (countryRiskData.monthlyRisks[m]) {
					summerAvg += countryRiskData.monthlyRisks[m];
					summerCount++;
				}
			});

			winterAvg = winterCount > 0 ? winterAvg / winterCount : 0;
			summerAvg = summerCount > 0 ? summerAvg / summerCount : 0;

			if (winterAvg > summerAvg * 1.5) {
				countryRiskData.seasonalPattern = "Winter-dominant";
			} else if (summerAvg > winterAvg * 1.2) {
				countryRiskData.seasonalPattern = "Summer pattern";
			} else {
				countryRiskData.seasonalPattern = "Year-round";
			}

			// Apply threshold filter
			if (countryRiskData.averageRisk >= riskThreshold) {
				riskData.push(countryRiskData);
			}
		});

		// Sort by average risk (descending)
		riskData.sort((a, b) => b.averageRisk - a.averageRisk);

		// Display results
		displaySeasonalRiskAnalysis(riskData, selectedYear, riskThreshold);
	}

	function displaySeasonalRiskAnalysis(riskData, year, threshold) {
		const $results = $("#comparison-results");
		$results.empty();

		const monthNames = [
			"",
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];

		// Add header
		$results.append(`
			<div style="margin-bottom: 15px; padding-bottom: 10px; border-top: 2px solid #ff4c4c; border-bottom: 1px solid #444;">
				<strong style="color: #ff4c4c;">Seasonal Risk Analysis ${year}</strong>
				<br><small style="color: #999;">Threshold: ${threshold}+ risk score | Found ${riskData.length} countries</small>
			</div>
		`);

		if (riskData.length === 0) {
			$results.append(`
				<div style="text-align: center; padding: 40px 20px; color: #666;">
					<div style="font-size: 48px; margin-bottom: 15px; opacity: 0.3;">📊</div>
					<div style="font-size: 16px; margin-bottom: 8px; color: #888;">No Data Available</div>
					<div style="font-size: 12px; line-height: 1.4;">
						No countries meet the selected risk threshold of ${threshold}+.<br>
						Try lowering the threshold or selecting a different year.
					</div>
				</div>
			`);
			return;
		}

		riskData.forEach((country, index) => {
			// Risk level color
			let riskColor = "#00aa44";
			if (country.averageRisk >= 70) riskColor = "#ff4444";
			else if (country.averageRisk >= 50) riskColor = "#ff8800";
			else if (country.averageRisk >= 30) riskColor = "#ffbb00";
			else if (country.averageRisk >= 15) riskColor = "#88cc00";

			// Create mini risk pattern chart
			let riskChart = "";
			for (let month = 1; month <= 12; month++) {
				const risk = country.monthlyRisks[month] || 0;
				const height = Math.max((risk / 100) * 20, 1);
				const isPeak = month === country.peakMonth;
				const opacity = isPeak ? "1" : "0.7";

				riskChart += `
					<div style="
						display: inline-block; 
						width: 10px; 
						height: 20px; 
						margin-right: 1px; 
						position: relative;
						vertical-align: bottom;
					">
						<div style="
							position: absolute;
							bottom: 0;
							width: 100%;
							height: ${height}px;
							background-color: ${riskColor};
							opacity: ${opacity};
							border-radius: 1px 1px 0 0;
						" title="${monthNames[month]}: ${risk.toFixed(1)}"></div>
					</div>
				`;
			}

			const peakMonthName = monthNames[country.peakMonth] || "N/A";
			const rankSuffix = getRankSuffix(index + 1);

			$results.append(`
				<div class="country-comparison-item" style="border-left-color: ${
					country.color
				};">
					<div class="country-name">
						<span class="color-indicator" style="background-color: ${
							country.color
						};"></span>
						${country.country}
						<span style="margin-left: 8px; font-size: 10px; color: ${riskColor}; font-weight: bold;">
							${country.riskCategory}
						</span>
					</div>
					<div style="margin: 8px 0; padding: 4px; background: rgba(255,255,255,0.02); border-radius: 3px;">
						${riskChart}
					</div>
					<div class="value" style="font-size: 12px;">
						<div>Average Risk: <strong style="color: ${riskColor};">${country.averageRisk.toFixed(
				1
			)}/100</strong></div>
						<div>Peak: ${peakMonthName} (${country.peakRisk.toFixed(1)}) | Pattern: ${
				country.seasonalPattern
			}</div>
						<div style="color: #999; font-size: 10px;">${
							index + 1
						}${rankSuffix} highest risk</div>
					</div>
				</div>
			`);
		});

		// Add insights
		if (riskData.length > 1) {
			const insights = generateRiskPatternInsights(riskData);
			if (insights.length > 0) {
				$results.append(`
					<div class="comparison-insights">
						<strong style="color: #ff4c4c;">Risk Pattern Insights:</strong>
						${insights
							.map(
								(insight) =>
									`<div style="margin-top: 4px; font-size: 11px;">• ${insight}</div>`
							)
							.join("")}
					</div>
				`);
			}
		}
	}

	function generateRiskPatternInsights(riskData) {
		const insights = [];

		if (riskData.length === 0) return insights;

		// Risk level distribution
		const riskLevels = {
			veryHigh: 0,
			high: 0,
			moderate: 0,
			low: 0,
			veryLow: 0,
		};
		riskData.forEach((country) => {
			if (country.averageRisk >= 70) riskLevels.veryHigh++;
			else if (country.averageRisk >= 50) riskLevels.high++;
			else if (country.averageRisk >= 30) riskLevels.moderate++;
			else if (country.averageRisk >= 15) riskLevels.low++;
			else riskLevels.veryLow++;
		});

		if (riskLevels.veryHigh > 0) {
			insights.push(
				`${riskLevels.veryHigh} countries show very high risk patterns (70+)`
			);
		}

		// Seasonal pattern analysis
		const patterns = { winter: 0, summer: 0, yearRound: 0 };
		riskData.forEach((country) => {
			if (country.seasonalPattern === "Winter-dominant")
				patterns.winter++;
			else if (country.seasonalPattern === "Summer pattern")
				patterns.summer++;
			else patterns.yearRound++;
		});

		if (patterns.winter > patterns.summer * 2) {
			insights.push(
				`Strong winter seasonality dominates (${patterns.winter} countries)`
			);
		} else if (patterns.summer > 0) {
			insights.push(
				`${patterns.summer} countries show unusual summer patterns`
			);
		}

		// Highest vs lowest risk
		const highest = riskData[0];
		const lowest = riskData[riskData.length - 1];

		if (highest && lowest && highest !== lowest) {
			const riskGap = highest.averageRisk - lowest.averageRisk;
			if (riskGap > 30) {
				insights.push(
					`Large risk variation: ${
						highest.country
					} (${highest.averageRisk.toFixed(1)}) vs ${
						lowest.country
					} (${lowest.averageRisk.toFixed(1)})`
				);
			}
		}

		return insights;
	}

	// Settings Panel Functionality
	function initializeSettings() {
		// Default settings
		const defaultSettings = {
			dotSize: 10,
			dotOpacity: 0.8,
			spiralThickness: 20,
			enableTransitions: true,
			showGridLines: true,
			showMonthLabels: true,
			tooltipDelay: 0,
			cursorFollowing: false,
			backgroundBrightness: 1.0,
			highContrast: false,
			showZeroValues: false,
			scalingMethod: "global",
		};

		// Load saved settings from localStorage
		let currentSettings = { ...defaultSettings };
		const savedSettings = localStorage.getItem("influenza-viz-settings");
		if (savedSettings) {
			try {
				currentSettings = {
					...defaultSettings,
					...JSON.parse(savedSettings),
				};
			} catch (e) {
				console.warn("Failed to load saved settings, using defaults");
			}
		}

		// Apply initial settings to UI
		applySettingsToUI(currentSettings);

		// Settings toggle button event handler
		$("#toggle-settings").on("click", function () {
			const $panel = $("#settings-panel");
			const $button = $(this);

			if ($panel.is(":visible")) {
				$panel.fadeOut(300);
				$button.text("Settings");
				$button.removeClass("settings-active");
			} else {
				$panel.fadeIn(300);
				$button.text("Hide Settings");
				$button.addClass("settings-active");
			}
		});

		// Close settings overlay
		$("#close-settings").on("click", function () {
			const $panel = $("#settings-panel");
			const $button = $("#toggle-settings");
			$panel.fadeOut(300);
			$button.text("Settings");
			$button.removeClass("settings-active");
		});

		// Text-based setting option handlers
		$(".setting-option").on("click", function () {
			const $option = $(this);
			const setting = $option.data("setting");
			const value = $option.data("value");

			// Remove active class from siblings and add to clicked option
			$option.siblings(".setting-option").removeClass("active");
			$option.addClass("active");

			// Parse value based on setting type
			let parsedValue = value;
			if (setting === "dotSize" || setting === "tooltipDelay") {
				parsedValue = parseInt(value);
			} else if (
				setting === "dotOpacity" ||
				setting === "backgroundBrightness"
			) {
				parsedValue = parseFloat(value);
			} else if (
				setting === "enableTransitions" ||
				setting === "showGridLines" ||
				setting === "showMonthLabels" ||
				setting === "cursorFollowing" ||
				setting === "highContrast" ||
				setting === "showZeroValues"
			) {
				parsedValue = value === "true";
			}

			// Update current settings
			currentSettings[setting] = parsedValue;

			// Update live examples
			updateLiveExamples(currentSettings);

			// Apply settings to visualization
			updateVisualizationSettings(currentSettings);
		});

		// Update live examples function
		function updateLiveExamples(settings) {
			// Update dot size example
			$(".example-dot")
				.not(".opacity-demo")
				.css({
					width: settings.dotSize + "px",
					height: settings.dotSize + "px",
				});

			// Update opacity example
			$(".opacity-demo").css("opacity", settings.dotOpacity);

			// Update brightness preview text
			$("#brightness-preview").text(
				"Brightness: " +
					Math.round(settings.backgroundBrightness * 100) +
					"%"
			);

			// Update live preview boxes
			$("#current-size").text(settings.dotSize + "px");
			$("#current-opacity").text(
				Math.round(settings.dotOpacity * 100) + "%"
			);
			$("#current-brightness").text(
				Math.round(settings.backgroundBrightness * 100) + "%"
			);

			// Highlight current size in preview dots
			$(".preview-dot").each(function (index) {
				const sizes = [5, 10, 15, 20];
				if (sizes[index] === settings.dotSize) {
					$(this).css("border", "2px solid #fff");
				} else {
					$(this).css("border", "1px solid rgba(255, 255, 255, 0.3)");
				}
			});
		}

		// Legacy slider handlers (keeping for backward compatibility)
		$("#dot-size").on("input", function () {
			currentSettings.dotSize = parseFloat($(this).val());
			updateVisualizationSettings(currentSettings);
			$("#dot-size-value").text(currentSettings.dotSize + "px");
		});

		$("#dot-opacity").on("input", function () {
			currentSettings.dotOpacity = parseFloat($(this).val());
			updateVisualizationSettings(currentSettings);
			$("#dot-opacity-value").text(
				Math.round(currentSettings.dotOpacity * 100) + "%"
			);
		});

		$("#spiral-thickness").on("input", function () {
			currentSettings.spiralThickness = parseFloat($(this).val());
			updateVisualizationSettings(currentSettings);
			$("#spiral-thickness-value").text(
				currentSettings.spiralThickness + "px"
			);
		});

		$("#enable-transitions").on("change", function () {
			currentSettings.enableTransitions = $(this).is(":checked");
			updateVisualizationSettings(currentSettings);
		});

		$("#show-grid-lines").on("change", function () {
			currentSettings.showGridLines = $(this).is(":checked");
			updateVisualizationSettings(currentSettings);
		});

		$("#show-month-labels").on("change", function () {
			currentSettings.showMonthLabels = $(this).is(":checked");
			updateVisualizationSettings(currentSettings);
		});

		$("#tooltip-delay").on("input", function () {
			currentSettings.tooltipDelay = parseInt($(this).val());
			updateVisualizationSettings(currentSettings);
			$("#tooltip-delay-value").text(currentSettings.tooltipDelay + "ms");
		});

		$("#cursor-following").on("change", function () {
			currentSettings.cursorFollowing = $(this).is(":checked");
			updateVisualizationSettings(currentSettings);
		});

		$("#background-brightness").on("input", function () {
			currentSettings.backgroundBrightness = parseFloat($(this).val());
			updateVisualizationSettings(currentSettings);
			$("#background-brightness-value").text(
				Math.round(currentSettings.backgroundBrightness * 100) + "%"
			);
		});

		$("#high-contrast").on("change", function () {
			currentSettings.highContrast = $(this).is(":checked");
			updateVisualizationSettings(currentSettings);
		});

		$("#show-zero-values").on("change", function () {
			currentSettings.showZeroValues = $(this).is(":checked");
			updateVisualizationSettings(currentSettings);
		});

		$("#scaling-method").on("change", function () {
			currentSettings.scalingMethod = $(this).val();
			updateVisualizationSettings(currentSettings);
		});

		// Reset settings button
		$("#reset-settings").on("click", function () {
			currentSettings = { ...defaultSettings };
			applySettingsToUI(currentSettings);
			updateVisualizationSettings(currentSettings);

			// Visual feedback
			const $button = $(this);
			const originalText = $button.text();
			$button.text("Reset!").addClass("resetting");
			setTimeout(() => {
				$button.text(originalText).removeClass("resetting");
			}, 1000);
		});

		// Save settings button
		$("#save-settings").on("click", function () {
			try {
				localStorage.setItem(
					"influenza-viz-settings",
					JSON.stringify(currentSettings)
				);

				// Visual feedback
				const $button = $(this);
				const originalText = $button.text();
				$button.text("Saved!").addClass("saving");
				setTimeout(() => {
					$button.text(originalText).removeClass("saving");
				}, 1500);
			} catch (e) {
				console.warn("Failed to save settings to localStorage");
				alert(
					"Failed to save settings. Please check your browser storage settings."
				);
			}
		});

		// Apply settings to UI controls
		function applySettingsToUI(settings) {
			// Legacy slider support (for backward compatibility)
			$("#dot-size").val(settings.dotSize);
			$("#dot-size-value").text(settings.dotSize + "px");

			$("#dot-opacity").val(settings.dotOpacity);
			$("#dot-opacity-value").text(
				Math.round(settings.dotOpacity * 100) + "%"
			);

			$("#spiral-thickness").val(settings.spiralThickness);
			$("#spiral-thickness-value").text(settings.spiralThickness + "px");

			$("#enable-transitions").prop(
				"checked",
				settings.enableTransitions
			);
			$("#show-grid-lines").prop("checked", settings.showGridLines);
			$("#show-month-labels").prop("checked", settings.showMonthLabels);

			$("#tooltip-delay").val(settings.tooltipDelay);
			$("#tooltip-delay-value").text(settings.tooltipDelay + "ms");

			$("#cursor-following").prop("checked", settings.cursorFollowing);

			$("#background-brightness").val(settings.backgroundBrightness);
			$("#background-brightness-value").text(
				Math.round(settings.backgroundBrightness * 100) + "%"
			);

			$("#high-contrast").prop("checked", settings.highContrast);
			$("#show-zero-values").prop("checked", settings.showZeroValues);
			$("#scaling-method").val(settings.scalingMethod);

			// Update text-based setting options
			$(".setting-option").each(function () {
				const $option = $(this);
				const setting = $option.data("setting");
				const value = $option.data("value");

				if (setting && settings.hasOwnProperty(setting)) {
					const currentValue = settings[setting];
					let match = false;

					// Compare values based on type
					if (typeof currentValue === "boolean") {
						match = (value === "true") === currentValue;
					} else if (typeof currentValue === "number") {
						match = parseFloat(value) === currentValue;
					} else {
						match = value === currentValue;
					}

					if (match) {
						$option.addClass("active");
					} else {
						$option.removeClass("active");
					}
				}
			});

			// Update live examples
			updateLiveExamples(settings);
		}

		// Apply settings to visualization
		function updateVisualizationSettings(settings) {
			// Update global settings variables that affect visualization
			window.visualizationSettings = settings;

			// Apply background brightness
			$("body").css(
				"filter",
				`brightness(${settings.backgroundBrightness})`
			);

			// Apply high contrast mode
			if (settings.highContrast) {
				$("body").addClass("high-contrast-mode");
			} else {
				$("body").removeClass("high-contrast-mode");
			}

			// Update grid lines visibility
			$(".grid-line").css(
				"display",
				settings.showGridLines ? "block" : "none"
			);

			// Update month labels visibility
			$(".month-label").css(
				"display",
				settings.showMonthLabels ? "block" : "none"
			);

			// Update dot styles for existing dots
			$(".dot").each(function () {
				const $dot = $(this);
				const originalOpacity =
					$dot.data("original-opacity") || settings.dotOpacity;

				$dot.css({
					width: settings.dotSize + "px",
					height: settings.dotSize + "px",
					opacity: originalOpacity * settings.dotOpacity,
					transition: settings.enableTransitions
						? "all 0.3s ease"
						: "none",
				});

				// Handle zero values display
				const value = parseFloat($dot.data("value")) || 0;
				if (!settings.showZeroValues && value === 0) {
					$dot.hide();
				} else if (settings.showZeroValues || value > 0) {
					$dot.show();
				}
			});

			// Update tooltip behavior
			if (settings.cursorFollowing) {
				$(document).on("mousemove.tooltip", function (e) {
					$(".info-box").css({
						left: e.pageX + 15,
						top: e.pageY - 30,
					});
				});
			} else {
				$(document).off("mousemove.tooltip");
			}

			// Update tooltip delay (would need to be implemented in tooltip handlers)
			window.tooltipDelay = settings.tooltipDelay;

			// Redraw visualization if scaling method changed
			if (settings.scalingMethod !== window.currentScalingMethod) {
				window.currentScalingMethod = settings.scalingMethod;
				draw(); // Redraw with new scaling
			}
		}

		// Initialize settings
		updateVisualizationSettings(currentSettings);
	}

	// Initialize settings functionality
	initializeSettings();
});
