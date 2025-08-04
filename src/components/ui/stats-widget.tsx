import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

// A small utility function to generate random numbers in a range
const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// A function to generate a smooth SVG path from data points
const generateSmoothPath = (points: number[], width: number, height: number) => {
    if (!points || points.length < 2) {
        return `M 0 ${height}`;
    }

    const xStep = width / (points.length - 1);
    const pathData = points.map((point, i) => {
        const x = i * xStep;
        // Scale point to height, with a small padding from top/bottom
        const y = height - (point / 100) * (height * 0.8) - (height * 0.1);
        return [x, y];
    });

    let path = `M ${pathData[0][0]} ${pathData[0][1]}`;

    for (let i = 0; i < pathData.length - 1; i++) {
        const x1 = pathData[i][0];
        const y1 = pathData[i][1];
        const x2 = pathData[i + 1][0];
        const y2 = pathData[i + 1][1];
        const midX = (x1 + x2) / 2;
        path += ` C ${midX},${y1} ${midX},${y2} ${x2},${y2}`;
    }

    return path;
};

// The main Stats Widget Component, now shadcn/ui theme compatible
const StatsWidget = () => {
    const [stats, setStats] = useState({
        amount: 283,
        change: 36,
        chartData: [30, 55, 45, 75, 60, 85, 70],
    });
    const linePathRef = useRef<SVGPathElement>(null);
    const areaPathRef = useRef<SVGPathElement>(null);

    // Function to generate new random data for interactivity
    const updateStats = () => {
        const newAmount = getRandom(100, 999);
        const newChange = getRandom(-50, 100);
        const newChartData = Array.from({ length: 7 }, () => getRandom(10, 90));

        setStats({
            amount: newAmount,
            change: newChange,
            chartData: newChartData,
        });
    };

    // Auto-update stats every 3 seconds
    useEffect(() => {
        const intervalId = setInterval(updateStats, 3000);
        return () => clearInterval(intervalId);
    }, []);

    // SVG viewbox dimensions
    const svgWidth = 150;
    const svgHeight = 60;

    // Generate the SVG path for the line, memoized for performance
    const linePath = useMemo(() => generateSmoothPath(stats.chartData, svgWidth, svgHeight), [stats.chartData]);

    // Generate the SVG path for the gradient area
    const areaPath = useMemo(() => {
        if (!linePath.startsWith("M")) return "";
        return `${linePath} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;
    }, [linePath]);

    // Animate the line graph on change
    useEffect(() => {
        const path = linePathRef.current;
        const area = areaPathRef.current;

        if (path && area) {
            const length = path.getTotalLength();
            // --- Animate Line ---
            path.style.transition = 'none';
            path.style.strokeDasharray = length + ' ' + length;
            path.style.strokeDashoffset = length.toString();

            // --- Animate Area ---
            area.style.transition = 'none';
            area.style.opacity = '0';

            // Trigger reflow to apply initial styles before transition
            path.getBoundingClientRect();

            // --- Start Transitions ---
            path.style.transition = 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease';
            path.style.strokeDashoffset = '0';

            area.style.transition = 'opacity 0.8s ease-in-out 0.2s, fill 0.5s ease'; // Delay start
            area.style.opacity = '1';
        }
    }, [linePath]); // Re-run animation when the path data changes

    // Always use green (success) color for chart
    const changeColorClass = 'text-success';

    return (
        <div
            className="w-full max-w-md bg-card text-card-foreground rounded-3xl p-6"
        >
            <div className="flex justify-between items-center">
                {/* Left side content */}
                <div className="flex flex-col w-1/2">
                    <div className="flex items-center text-muted-foreground text-md dark:text-white">
                        <span>This Week</span>
                        <span className={`ml-2 flex items-center font-semibold ${changeColorClass}`}>
                            {Math.abs(stats.change)}%
                            {stats.change >= 0 ? <ArrowUp size={16} className="ml-1" /> : <ArrowDown size={16} className="ml-1" />}
                        </span>
                    </div>
                    <p className="text-4xl font-bold text-foreground mt-2 dark:text-white">
                        ${stats.amount}
                    </p>
                </div>

                {/* Right side chart */}
                <div className="w-1/2 h-16">
                    <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-full" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="areaGradientAlwaysGreen" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#22C55E" stopOpacity={0.4}/>
                                <stop offset="100%" stopColor="#22C55E" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <path
                            ref={areaPathRef}
                            d={areaPath}
                            fill="url(#areaGradientAlwaysGreen)"
                        />
                        <path
                            ref={linePathRef}
                            d={linePath}
                            fill="none"
                            stroke="#22C55E"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
        </div>
    );
};

export default StatsWidget; 