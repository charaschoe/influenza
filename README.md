# INFLUENZA

## Interactive Data Visualization Dashboard

_Advanced Spiral Timeline Visualization with Real-time Settings Control_

![Project Preview](https://neu-blush.vercel.app/)

## Overview

A sophisticated interactive dashboard visualizing WHO FluNet data (2009-2024) across six strategically selected nations. Features a revolutionary spiral timeline design with real-time customizable settings, advanced comparison tools, and comprehensive seasonal risk analysis algorithms.

## Creator

**[Jonas Wienberg](https://jonaswienberg.me)** - Interactive Data Visualization Specialist

## Nations Tracked

-   🇩🇪 **Germany** - Central European temperate pattern
-   🇮🇸 **Iceland** - Arctic climate influenza dynamics
-   🇮🇷 **Iran** - Middle Eastern seasonal variations
-   🇯🇵 **Japan** - East Asian monsoon influence
-   🇰🇵 **North Korea** - Continental climate patterns
-   🇦🇪 **UAE** - Desert tropical dual-peak dynamics

## Revolutionary Features

### 🎛️ Text-Only Settings Panel

**Full-Screen Overlay Interface**

-   **Real-time Live Previews**: Interactive preview boxes showing changes instantly
-   **Color-neutral Design**: Focus on functionality over aesthetics
-   **Persistent Settings**: localStorage integration for user preference retention
-   **Accessibility First**: High contrast mode and customizable visual elements

#### Display Settings

-   **Data Point Sizing**: 5px → 20px with live size comparison previews
-   **Opacity Control**: 30% → 100% with real-time transparency demonstration
-   **Background Brightness**: Dark (50%) → Bright (130%) with visual indicators

#### Animation & Interaction

-   **Smooth Transitions**: Configurable animation speeds
-   **Grid Line Toggle**: Show/hide radial reference lines
-   **Month Label Control**: Dynamic label visibility management

#### Tooltip Behavior

-   **Response Timing**: Instant → 1 second delay options
-   **Cursor Following**: Fixed position vs. mouse-tracking tooltips
-   **Enhanced Content**: Rich data with change calculations and risk visualizations

#### Accessibility & Data

-   **High Contrast Mode**: Enhanced visibility for accessibility compliance
-   **Zero Value Display**: Show/hide countries with no reported data
-   **Scaling Methods**: Global, yearly, or adaptive data normalization

### 🌀 Advanced Spiral Timeline

**Revolutionary Circular Data Architecture**

-   **12-Month Cycles**: Each complete rotation = 1 year
-   **Multi-Year Spirals**: Seamless navigation through 2009-2024
-   **Radial Positioning**: Month-based angular positioning with country clustering
-   **Dynamic Scaling**: Real-time data point sizing based on selected metrics

### 📊 Comprehensive Data Metrics

1. **Positive Test Share** - Laboratory confirmation rates
2. **Influenza-like Illnesses (ILI)** - Clinical symptom reporting
3. **Acute Respiratory Infections (ARI)** - Broader respiratory illness tracking
4. **Severe ARI Cases & Deaths** - Critical outcome monitoring
5. **ILI per 1000 Outpatients** - Population-normalized incidence rates
6. **Seasonal Risk Patterns** - AI-enhanced predictive risk scoring (0-100)

### 🤖 Seasonal Risk Algorithm

**Advanced Multi-Factor Analysis**

-   **25% Predictability Score**: Pattern consistency across years
-   **45% Global Severity Weight**: Relative intensity compared to worldwide data
-   **15% Seasonal Timing Bonus**: Peak occurrence during typical flu season
-   **15% Seasonal Strength**: Variation pattern analysis
-   **Percentile-based Scaling**: Non-linear distribution for better differentiation
-   **Risk Categories**: Very High (70+), High (50-69), Moderate (30-49), Low (15-29), Very Low (<15)

### 🔍 Country Analysis Tools

**Multi-Modal Comparison System**

-   **Monthly Comparison**: Deep-dive single month analysis across countries
-   **Seasonal Overview**: Winter/summer pattern comparisons
-   **Multi-Year Analysis**: Long-term trend identification and peak value tracking
-   **Risk Pattern Analysis**: Seasonal risk threshold filtering and insights generation

## Technical Architecture

### 🏗️ Core Components

-   **Visualization Engine**: Custom gmynd.js/jQuery implementation
-   **Data Processing**: 49,890+ cleaned WHO FluNet records
-   **Settings Management**: Real-time configuration system with localStorage persistence
-   **Animation System**: Configurable transitions with performance optimization
-   **Responsive Design**: Full-screen overlay interfaces with mobile considerations

### 📈 Performance Metrics

-   **Codebase**: 1,900+ lines of optimized JavaScript
-   **Load Time**: <1.5s average (Chromium testing)
-   **Data Coverage**: 7/64 FluNet categories comprehensively mapped
-   **Memory Efficiency**: Dynamic DOM management with cleanup procedures
-   **Browser Compatibility**: ES6+ with graceful degradation

### 🎨 Design System

**Cultural Color Integration**
Each nation maintains visual identity through carefully derived color schemes:

**Germany** - Yellow from national flag (black-red-gold)
**Japan** - Red representing the rising sun
**Iceland** - Purple representing the blue from Icelandic flag  
**North Korea** - Cyan representing Korean flag blue
**UAE** - Sky blue representing unity and the sky
**Iran** - Orange representing Persian cultural warmth

#### UAE

-   Vertical pan-Arab red/green/white bands
-   Traditional color symbolism

#### Iran

-   Green/white/red stripes
-   Emblem integration

#### Iceland

-   Nordic cross blue/red intersections
-   Traditional flag elements

## Live Demo

Visit the interactive dashboard at: [https://neu-blush.vercel.app/](https://neu-blush.vercel.app/)

## Development

-   Course: Programmiertes Entwerfen 2
-   Version Control: Git
-   Deployment: Vercel
-   Iterative Development Process

## Credits

Created by Jonas Wienberg

---

© 2025 All Rights Reserved

## Function Documentation

### Core Visualization Functions

#### `draw()`

**Main rendering function**

-   Clears canvas and redraws all visual elements
-   Applies current settings for dot size, opacity, transitions
-   Handles data filtering, scaling, and positioning
-   Manages zero-value display based on user preferences
-   Integrates seasonal risk color coding and tooltips

#### `drawGridLines()`

**Radial grid system**

-   Creates 12 radial lines from center to edge (one per month)
-   Respects `showGridLines` setting for dynamic visibility
-   Provides visual reference for month positioning
-   Uses 375px radius with configurable line styling

#### `createMonthLabels()`

**Dynamic month labeling**

-   Positions month names around spiral perimeter
-   Controlled by `showMonthLabels` setting
-   400px radius positioning for optimal visibility
-   Responsive to settings changes with instant updates

#### `calculateSeasonalRiskPatterns()`

**Advanced risk analysis engine**

-   Processes all historical data for predictability scoring
-   Applies global normalization and percentile scaling
-   Generates 0-100 risk scores with non-linear distribution
-   Creates seasonal bonus calculations for winter months
-   Stores results in main data array for visualization

### Settings Management System

#### `initializeSettings()`

**Complete settings infrastructure**

-   Loads saved preferences from localStorage
-   Initializes default values for all configuration options
-   Sets up event handlers for text-based setting options
-   Manages live preview updates and visual feedback
-   Handles settings persistence and restoration

#### `updateVisualizationSettings(settings)`

**Real-time settings application**

-   Updates global settings variables
-   Applies background brightness filters
-   Manages high contrast mode styling
-   Updates existing dot properties (size, opacity, transitions)
-   Controls grid lines and month labels visibility
-   Handles tooltip behavior modifications

#### `updateLiveExamples(settings)`

**Dynamic preview system**

-   Updates live preview boxes in settings panel
-   Highlights current size selection in preview dots
-   Updates text indicators for current values
-   Provides real-time feedback during settings changes
-   Maintains visual consistency across all preview elements

### Comparison Analysis Functions

#### `runSeasonalRiskAnalysis()`

**Risk pattern analysis engine**

-   Filters data by selected year and risk threshold
-   Generates comparative risk insights across countries
-   Creates visual risk distribution charts
-   Provides interpretive analysis text
-   Handles edge cases and data validation

#### `displaySeasonalRiskAnalysis(riskData, year, threshold)`

**Risk visualization renderer**

-   Creates detailed country risk breakdowns
-   Generates visual risk bars and category indicators
-   Produces analytical insights and pattern recognition
-   Formats results for user-friendly presentation
-   Integrates with main visualization color schemes

## Usage Instructions

### Getting Started

1. **Open the visualization**: Navigate to the main dashboard
2. **Select year**: Use the year control to choose 2009-2024
3. **Choose metric**: Click any metric option from the left panel
4. **Explore data**: Hover over data points for detailed tooltips

### Customizing Settings

1. **Open Settings**: Click "Settings" button (top-right)
2. **Adjust preferences**: Click text options in each category
3. **Live preview**: Watch changes in preview boxes immediately
4. **Save settings**: Click "Save Settings" to persist preferences
5. **Reset if needed**: Use "Reset to Defaults" to restore original settings

### Advanced Features

-   **Country Analysis**: Use "Country Analysis" panel for detailed comparisons
-   **Seasonal Risk**: Select "Seasonal Risk Patterns" for AI-enhanced analysis
-   **Multi-year comparison**: Use yearly analysis mode for trend identification
-   **Accessibility**: Enable high contrast mode for enhanced visibility

## Data Sources & Methodology

### WHO FluNet Integration

-   **Source**: World Health Organization Global Influenza Surveillance Network
-   **Coverage**: 2009-2024 comprehensive reporting
-   **Processing**: Advanced cleaning, normalization, and enhancement algorithms
-   **Quality**: 49,890+ validated data points across 6 countries and 7 metrics

### Seasonal Risk Algorithm Details

The proprietary seasonal risk algorithm uses sophisticated statistical methods:

1. **Predictability Analysis**: Calculates coefficient of variation across years
2. **Global Severity**: Uses percentile ranking against worldwide data
3. **Seasonal Timing**: Applies bonus scoring for winter peak months
4. **Pattern Strength**: Measures seasonal variation amplitude
5. **Non-linear Scaling**: Applies logarithmic transformation for score distribution

## File Structure

```
/
├── index.html              # Main application interface
├── README.md               # This documentation
├── css/
│   └── styles.css         # Complete styling with overlay system
├── js/
│   └── script.js          # Core functionality (1900+ lines)
├── data/
│   ├── influenza_six.js   # Processed WHO data
│   └── influenza.js       # Raw data backup
└── lib/
    ├── gmynd.js          # Mathematical utilities
    └── jquery-3.7.1.min.js # jQuery framework
```

## Browser Compatibility

-   **Chrome/Chromium**: Fully supported (recommended)
-   **Firefox**: Fully supported
-   **Safari**: Fully supported
-   **Edge**: Fully supported
-   **Mobile**: Responsive design with touch optimization

## Performance Considerations

-   **Memory Management**: Dynamic DOM cleanup prevents memory leaks
-   **Animation Optimization**: Configurable transitions for performance tuning
-   **Data Caching**: Efficient data structure for rapid year/metric switching
-   **Lazy Loading**: On-demand calculation for complex seasonal risk analysis

## License & Attribution

-   **Creator**: Jonas Wienberg
-   **Data**: WHO FluNet (World Health Organization)
-   **Framework**: jQuery, gmynd.js
-   **Hosting**: Vercel platform
-   **Analytics**: Vercel Analytics integration

---

_Last Updated: December 2024 | Version 2.0 - Text-Only Settings Enhancement_
