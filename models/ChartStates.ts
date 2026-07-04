import mongoose, { Schema, Document, Types, models } from 'mongoose';

// ==================== SUB-INTERFACES ====================

// Breaks properties
interface IBreaks {
    color: string;
    style: number;
    visible: boolean;
    width: number;
}

// Chart Events Source Properties
interface IChartEventsSourceProperties {
    breaks: IBreaks;
    futureOnly: boolean;
    visible: boolean;
}

// Axis Properties
interface IAxisProperties {
    alignLabels: boolean;
    autoScale: boolean;
    autoScaleDisabled: boolean;
    indexedTo100: boolean;
    isInverted: boolean;
    lockScale: boolean;
    log: boolean;
    logDisabled: boolean;
    percentage: boolean;
    percentageDisabled: boolean;
}

// Cross Hair Properties
interface ICrossHairProperties {
    color: string;
    style: number;
    transparency: number;
    width: number;
}

// Horizontal Grid Properties
interface IHorzGridProperties {
    color: string;
}

// Vertical Grid Properties
interface IVertGridProperties {
    color: string;
}

// Legend Properties
interface ILegendProperties {
    backgroundTransparency: number;
    showBackground: boolean;
    showBarChange: boolean;
    showLastDayChange: boolean;
    showLegend: boolean;
    showLogo: boolean;
    showPriceSource: boolean;
    showSeriesLegendCloseOnMobile: boolean;
    showSeriesOHLC: boolean;
    showSeriesTitle: boolean;
    showStudyArguments: boolean;
    showStudyTitles: boolean;
    showStudyValues: boolean;
    showTradingButtons: boolean;
    showTradingButtonsMobile: boolean;
    showVolume: boolean;
}

// Pane Properties
interface IPaneProperties {
    axisProperties: IAxisProperties;
    background: string;
    backgroundGradientEndColor: string;
    backgroundGradientStartColor: string;
    backgroundType: string;
    bottomMargin: number;
    crossHairProperties: ICrossHairProperties;
    gridLinesMode: string;
    horzGridProperties: IHorzGridProperties;
    legendProperties: ILegendProperties;
    separatorColor: string;
    topMargin: number;
    vertGridProperties: IVertGridProperties;
}

// Brackets PL
interface IBracketsPL {
    display: number;
    visibility: boolean;
}

// Position PL
interface IPositionPL {
    display: number;
    visibility: boolean;
}

// Trading Properties
interface ITradingProperties {
    bracketsPL: IBracketsPL;
    extendLeft: boolean;
    horizontalAlignment: number;
    lineLength: number;
    lineStyle: number;
    lineWidth: number;
    positionPL: IPositionPL;
    showExecutions: boolean;
    showExecutionsLabels: boolean;
    showOrders: boolean;
    showPositions: boolean;
    showReverse: boolean;
}

// Scales Properties
interface IScalesProperties {
    axisHighlightColor: string;
    axisLineToolLabelBackgroundColorActive: string;
    axisLineToolLabelBackgroundColorCommon: string;
    backgroundColor: string;
    barSpacing: number;
    crosshairLabelBgColorDark: string;
    crosshairLabelBgColorLight: string;
    fontSize: number;
    lineColor: string;
    saveLeftEdge: boolean;
    scaleSeriesOnly: boolean;
    seriesLastValueMode: number;
    showBidAskLabels: boolean;
    showFundamentalLastValue: boolean;
    showFundamentalNameLabel: boolean;
    showPrePostMarketPriceLabel: boolean;
    showPriceScaleCrosshairLabel: boolean;
    showSeriesLastValue: boolean;
    showSeriesPrevCloseValue: boolean;
    showStudyLastValue: boolean;
    showStudyPlotLabels: boolean;
    showSymbolLabels: boolean;
    showTimeScaleCrosshairLabel: boolean;
    textColor: string;
}

// Chart Properties
interface IChartProperties {
    chartEventsSourceProperties: IChartEventsSourceProperties;
    inactivityGaps: boolean;
    paneProperties: IPaneProperties;
    priceScaleSelectionStrategyName: string;
    scalesProperties: IScalesProperties;
    tradingProperties: ITradingProperties;
}

// Line Tools Groups
interface ILineToolsGroups {
    groups: any[]; // Using any[] since the schema shows array without specific items
}

// Log Formula
interface ILogFormula {
    coordOffset: number;
    logicalOffset: number;
}

// Overlay Price Scale Item
interface IOverlayPriceScaleItem {
    alignLabels: boolean;
    hasCalculatedPriceRange: boolean;
    id: string;
    logFormula: ILogFormula;
    m_bottomMargin: number;
    m_isAutoScale: boolean;
    m_isIndexedTo100: boolean;
    m_isInverted: boolean;
    m_isLockScale: boolean;
    m_isLog: boolean;
    m_isPercentage: boolean;
    m_priceRange: null;
    m_topMargin: number;
}

// Overlay Price Scales
interface IOverlayPriceScales {
    [key: string]: IOverlayPriceScaleItem; // Dynamic keys like "2jPYJK", "KlkBMn"
}

// Right Axis State
interface IRightAxisState {
    alignLabels: boolean;
    hasCalculatedPriceRange: boolean;
    id: string;
    logFormula: ILogFormula;
    m_bottomMargin: number;
    m_isAutoScale: boolean;
    m_isIndexedTo100: boolean;
    m_isInverted: boolean;
    m_isLockScale: boolean;
    m_isLog: boolean;
    m_isPercentage: boolean;
    m_priceRange: { m_maxValue: number; m_minValue: number } | null;
    m_topMargin: number;
}

// Right Axis State Item
interface IRightAxisStateItem {
    sources: string[];
    state: IRightAxisState;
}

// Formatting Dependencies
interface IFormattingDeps {
    format: string;
    minmov: number;
    minmove2: number;
    pricescale: number;
}

// HA Style
interface IHAStyle {
    studyId: string;
}

// Kagi Style
interface IKagiStyle {
    studyId: string;
}

// PB Style
interface IPBStyle {
    studyId: string;
}

// PnF Style
interface IPnFStyle {
    studyId: string;
}

// Range Style
interface IRangeStyle {
    studyId: string;
}

// Renko Style
interface IRenkoStyle {
    studyId: string;
}

// SVP Style
interface ISVPStyle {
    studyId: string;
}

// TPO Style
interface ITPOStyle {
    studyId: string;
}

// Vol Footprint Style
interface IVolFootprintStyle {
    studyId: string;
}

// Study Input
interface IStudyInput {
    defval: string | boolean | number;
    display: number;
    hideWhenPlotsHidden?: string[];
    id: string;
    isHidden?: boolean;
    max?: number;
    min?: number;
    name: string;
    optional?: boolean;
    options?: string[];
    type: string;
}

// Study Plot
interface IStudyPlot {
    id: string;
    palette?: string;
    target?: string;
    type: string;
}

// Study Meta Info
interface IStudyMetaInfo {
    _metainfoVersion: number;
    _serverMetaInfoVersion: number;
    defaults: {
        inputs: {
            col_prev_close: boolean;
            length: number;
            showMA: boolean;
            smoothingLength: number;
            smoothingLine: string;
            symbol: string;
            volumeMA: string;
        };
        palettes: {
            volumePalette: {
                colors: {
                    0: { color: string; style: number; width: number };
                    1: { color: string; style: number; width: number };
                };
            };
        };
        styles: {
            smoothedMA: {
                color: string;
                display: number;
                linestyle: number;
                linewidth: number;
                plottype: number;
                trackPrice: boolean;
                transparency: number;
            };
            vol: {
                color: string;
                display: number;
                linestyle: number;
                linewidth: number;
                plottype: number;
                trackPrice: boolean;
                transparency: number;
            };
            vol_ma: {
                color: string;
                display: number;
                linestyle: number;
                linewidth: number;
                plottype: number;
                trackPrice: boolean;
                transparency: number;
            };
        };
    };
    description: string;
    description_localized: string;
    format: { type: string };
    fullId: string;
    id: string;
    inputs: IStudyInput[];
    is_hidden_study: boolean;
    is_price_study: boolean;
    isTVScript: boolean;
    isTVScriptStub: boolean;
    packageId: string;
    palettes: {
        volumePalette: {
            colors: {
                0: { name: string };
                1: { name: string };
            };
        };
    };
    plots: IStudyPlot[];
    productId: string;
    shortDescription: string;
    shortId: string;
    styles: {
        smoothedMA: { histogramBase: number; title: string };
        vol: { histogramBase: number; title: string };
        vol_ma: { histogramBase: number; title: string };
    };
    version: number;
}

// Point
interface IPoint {
    interval: string;
    offset: number;
    price: number;
    time_t: number;
}

// Area Style
interface IAreaStyle {
    color1: string;
    color2: string;
    linecolor: string;
    linestyle: number;
    linewidth: number;
    priceSource: string;
    transparency: number;
}

// Bar Style
interface IBarStyle {
    barColorsOnPrevClose: boolean;
    dontDrawOpen: boolean;
    downColor: string;
    thinBars: boolean;
    upColor: string;
}

// Baseline Style
interface IBaselineStyle {
    baseLevelPercentage: number;
    baselineColor: string;
    bottomFillColor1: string;
    bottomFillColor2: string;
    bottomLineColor: string;
    bottomLineWidth: number;
    priceSource: string;
    topFillColor1: string;
    topFillColor2: string;
    topLineColor: string;
    topLineWidth: number;
    transparency: number;
}

// Bid Ask
interface IBidAsk {
    askLineColor: string;
    bidLineColor: string;
    lineStyle: number;
    lineWidth: number;
    visible: boolean;
}

// Candle Style
interface ICandleStyle {
    barColorsOnPrevClose: boolean;
    borderColor: string;
    borderDownColor: string;
    borderUpColor: string;
    downColor: string;
    drawBody: boolean;
    drawBorder: boolean;
    drawWick: boolean;
    upColor: string;
    wickColor: string;
    wickDownColor: string;
    wickUpColor: string;
}

// Column Style
interface IColumnStyle {
    barColorsOnPrevClose: boolean;
    baselinePosition: string;
    downColor: string;
    priceSource: string;
    upColor: string;
}

// High Low Average Price
interface IHighLowAvgPrice {
    averageClosePriceLabelVisible: boolean;
    averageClosePriceLineVisible: boolean;
    averagePriceLineColor: string;
    averagePriceLineWidth: number;
    highLowPriceLabelsVisible: boolean;
    highLowPriceLinesColor: string;
    highLowPriceLinesVisible: boolean;
    highLowPriceLinesWidth: number;
}

// Hilo Style
interface IHiloStyle {
    borderColor: string;
    color: string;
    drawBody: boolean;
    labelColor: string;
    showBorders: boolean;
    showLabels: boolean;
}

// HLC Area Style
interface IHlcAreaStyle {
    closeLineColor: string;
    closeLineStyle: number;
    closeLineWidth: number;
    closeLowFillColor: string;
    highCloseFillColor: string;
    highLineColor: string;
    highLineStyle: number;
    highLineWidth: number;
    lowLineColor: string;
    lowLineStyle: number;
    lowLineWidth: number;
}

// HLC Bars Style
interface IHlcBarsStyle {
    barColorsOnPrevClose: boolean;
    color: string;
    thinBars: boolean;
}

// Hollow Candle Style
interface IHollowCandleStyle {
    borderColor: string;
    borderDownColor: string;
    borderUpColor: string;
    downColor: string;
    drawBody: boolean;
    drawBorder: boolean;
    drawWick: boolean;
    upColor: string;
    wickColor: string;
    wickDownColor: string;
    wickUpColor: string;
}

// Intervals Visibilities
interface IIntervalsVisibilities {
    days: boolean;
    daysFrom: number;
    daysTo: number;
    hours: boolean;
    hoursFrom: number;
    hoursTo: number;
    minutes: boolean;
    minutesFrom: number;
    minutesTo: number;
    months: boolean;
    monthsFrom: number;
    monthsTo: number;
    ranges: boolean;
    seconds: boolean;
    secondsFrom: number;
    secondsTo: number;
    ticks: boolean;
    weeks: boolean;
    weeksFrom: number;
    weeksTo: number;
}

// Kagi Style Detailed
interface IKagiStyleDetailed {
    downColor: string;
    downColorProjection: string;
    inputInfo: {
        atrLength: { name: string };
        percentageLTP: { name: string };
        reversalAmount: { name: string };
        source: { name: string };
        style: { name: string };
    };
    inputs: {
        atrLength: number;
        percentageLTP: number;
        reversalAmount: number;
        source: string;
        style: string;
    };
    upColor: string;
    upColorProjection: string;
}

// Level
interface ILevel {
    coeff: number;
    color: string;
    lineStyle: number;
    lineWidth: number;
    visible: boolean;
}

// Line Style Object
interface ILineStyleObject {
    color: string;
    colorType: string;
    gradientEndColor: string;
    gradientStartColor: string;
    linestyle: number;
    linewidth: number;
    priceSource: string;
}

// Middle Line
interface IMiddleLine {
    lineColor: string;
    lineStyle: number;
    lineWidth: number;
    showLine: boolean;
}

// PB Style Detailed
interface IPBStyleDetailed {
    borderDownColor: string;
    borderDownColorProjection: string;
    borderUpColor: string;
    borderUpColorProjection: string;
    downColor: string;
    downColorProjection: string;
    inputInfo: {
        lb: { name: string };
        source: { name: string };
    };
    inputs: {
        lb: number;
        source: string;
    };
    upColor: string;
    upColorProjection: string;
}

// PnF Style Detailed
interface IPnFStyleDetailed {
    downColor: string;
    downColorProjection: string;
    inputInfo: {
        atrLength: { name: string };
        boxSize: { name: string };
        oneStepBackBuilding: { name: string };
        percentageLTP: { name: string };
        reversalAmount: { name: string };
        sources: { name: string };
        style: { name: string };
    };
    inputs: {
        atrLength: number;
        boxSize: number;
        oneStepBackBuilding: boolean;
        percentageLTP: number;
        reversalAmount: number;
        sources: string;
        style: string;
    };
    upColor: string;
    upColorProjection: string;
}

// Pre Post Market
interface IPrePostMarket {
    lineStyle: number;
    lineWidth: number;
    postMarketColor: string;
    preMarketColor: string;
    visible: boolean;
}

// Range Style Detailed
interface IRangeStyleDetailed {
    barStyle: number;
    candlesBorderDownColor: string;
    candlesBorderUpColor: string;
    candlesDownColor: string;
    candlesUpColor: string;
    candlesWickDownColor: string;
    candlesWickUpColor: string;
    downColor: string;
    downColorProjection: string;
    inputInfo: {
        phantomBars: { name: string };
        range: { name: string };
    };
    inputs: {
        phantomBars: boolean;
        range: number;
    };
    thinBars: boolean;
    upColor: string;
    upColorProjection: string;
}

// Renko Style Detailed
interface IRenkoStyleDetailed {
    borderDownColor: string;
    borderDownColorProjection: string;
    borderUpColor: string;
    borderUpColorProjection: string;
    downColor: string;
    downColorProjection: string;
    inputInfo: {
        atrLength: { name: string };
        boxSize: { name: string };
        percentageLTP: { name: string };
        source: { name: string };
        sources: { name: string };
        style: { name: string };
        wicks: { name: string };
    };
    inputs: {
        atrLength: number;
        boxSize: number;
        percentageLTP: number;
        source: string;
        sources: string;
        style: string;
        wicks: boolean;
    };
    upColor: string;
    upColorProjection: string;
    wickDownColor: string;
    wickUpColor: string;
}

// Status View Style
interface IStatusViewStyle {
    fontSize: number;
    showExchange: boolean;
    showInterval: boolean;
    symbolTextSource: string;
}

// Step Line Style
interface IStepLineStyle {
    color: string;
    colorType: string;
    gradientEndColor: string;
    gradientStartColor: string;
    linestyle: number;
    linewidth: number;
    priceSource: string;
}

// Line With Markers Style
interface ILineWithMarkersStyle {
    color: string;
    colorType: string;
    gradientEndColor: string;
    gradientStartColor: string;
    linestyle: number;
    linewidth: number;
    priceSource: string;
}

// Vol Candles Style
interface IVolCandlesStyle {
    barColorsOnPrevClose: boolean;
    borderColor: string;
    borderDownColor: string;
    borderUpColor: string;
    downColor: string;
    drawBody: boolean;
    drawBorder: boolean;
    drawWick: boolean;
    upColor: string;
    wickColor: string;
    wickDownColor: string;
    wickUpColor: string;
}

// Source State
interface ISourceState {
    alwaysShowStats?: boolean;
    areaStyle?: IAreaStyle;
    backAdjustment?: boolean;
    backgroundColor?: string;
    barStyle?: IBarStyle;
    baseLineColor?: string;
    baselineStyle?: IBaselineStyle;
    bidAsk?: IBidAsk;
    bold?: boolean;
    candleStyle?: ICandleStyle;
    color?: string;
    columnStyle?: IColumnStyle;
    currencyId?: null;
    esdFlagSize?: number;
    esdShowBreaks?: boolean;
    esdShowDividends?: boolean;
    esdShowEarnings?: boolean;
    esdShowSplits?: boolean;
    extendLeft?: boolean;
    extendRight?: boolean;
    fillBackground?: boolean;
    fontSize?: number;
    fontsize?: number;
    frozen?: boolean;
    haStyle?: {
        barColorsOnPrevClose: boolean;
        borderColor: string;
        borderDownColor: string;
        borderUpColor: string;
        downColor: string;
        drawBody: boolean;
        drawBorder: boolean;
        drawWick: boolean;
        showRealLastPrice: boolean;
        upColor: string;
        wickColor: string;
        wickDownColor: string;
        wickUpColor: string;
    };
    highLowAvgPrice?: IHighLowAvgPrice;
    hiloStyle?: IHiloStyle;
    hlcAreaStyle?: IHlcAreaStyle;
    hlcBarsStyle?: IHlcBarsStyle;
    hollowCandleStyle?: IHollowCandleStyle;
    horzLabelsAlign?: string;
    inputs?: {
        col_prev_close: boolean;
        length: number;
        showMA: boolean;
        smoothingLength: number;
        smoothingLine: string;
        symbol: string;
        volumeMA: string;
    };
    interval?: string;
    intervalsVisibilities?: IIntervalsVisibilities;
    italic?: boolean;
    kagiStyle?: IKagiStyleDetailed;
    labelBold?: boolean;
    labelFontSize?: number;
    labelHorzAlign?: string;
    labelItalic?: boolean;
    labelText?: string;
    labelTextColor?: string;
    labelVertAlign?: string;
    labelVisible?: boolean;
    leftEnd?: number;
    level1?: ILevel;
    level2?: ILevel;
    level3?: ILevel;
    level4?: ILevel;
    level5?: ILevel;
    level6?: ILevel;
    level7?: ILevel;
    linecolor?: string;
    lineColor?: string;
    lineStyle?: ILineStyleObject | number;
    linestyle?: number;
    linewidth?: number;
    lineWidth?: number;
    lineWithMarkersStyle?: ILineWithMarkersStyle;
    middleLine?: IMiddleLine;
    minTick?: string;
    palettes?: {
        volumePalette: {
            colors: {
                0: { color: string; style: number; width: number };
                1: { color: string; style: number; width: number };
            };
        };
    };
    parentSources?: any[];
    pbStyle?: IPBStyleDetailed;
    pnfStyle?: IPnFStyleDetailed;
    precision?: string;
    prePostMarket?: IPrePostMarket;
    prevClosePriceLineColor?: string;
    prevClosePriceLineWidth?: number;
    priceAxisProperties?: IAxisProperties;
    priceLineColor?: string;
    priceLineWidth?: number;
    rangeStyle?: IRangeStyleDetailed;
    renkoStyle?: IRenkoStyleDetailed;
    rightEnd?: number;
    sessionId?: string;
    sessVis?: boolean;
    settlementAsClose?: boolean;
    shortName?: string;
    showAngle?: boolean;
    showBarsRange?: boolean;
    showContinuousContractSwitches?: boolean;
    showContinuousContractSwitchesBreaks?: boolean;
    showCountdown?: boolean;
    showDateTimeRange?: boolean;
    showDistance?: boolean;
    showFuturesContractExpiration?: boolean;
    showLabel?: boolean;
    showLabelsOnPriceScale?: boolean;
    showLastNews?: boolean;
    showLegendValues?: boolean;
    showMiddlePoint?: boolean;
    showPercentPriceRange?: boolean;
    showPipsPriceRange?: boolean;
    showPrevClosePriceLine?: boolean;
    showPriceLabels?: boolean;
    showPriceLine?: boolean;
    showPriceRange?: boolean;
    statsPosition?: number;
    statusViewStyle?: IStatusViewStyle;
    steplineStyle?: IStepLineStyle;
    style?: number;
    styles?: {
        smoothedMA: {
            color: string;
            display: number;
            linestyle: number;
            linewidth: number;
            plottype: number;
            title: string;
            trackPrice: boolean;
            transparency: number;
        };
        vol: {
            color: string;
            display: number;
            linestyle: number;
            linewidth: number;
            plottype: number;
            title: string;
            trackPrice: boolean;
            transparency: number;
        };
        vol_ma: {
            color: string;
            display: number;
            linestyle: number;
            linewidth: number;
            plottype: number;
            title: string;
            trackPrice: boolean;
            transparency: number;
        };
    };
    symbol?: string;
    symbolStateVersion?: number;
    text?: string;
    textColor?: string;
    textcolor?: string;
    timeframe?: string;
    title?: string;
    transparency?: number;
    unitId?: null;
    version?: number;
    vertLabelsAlign?: string;
    visible: boolean;
    volCandlesStyle?: IVolCandlesStyle;
    zOrderVersion?: number;
}

// Source
interface ISource {
    formattingDeps?: IFormattingDeps;
    haStyle?: IHAStyle;
    id: string;
    isSelectionEnabled?: boolean;
    kagiStyle?: IKagiStyle;
    linkKey?: string;
    metaInfo?: IStudyMetaInfo;
    ownerSource?: string;
    ownFirstValue?: null;
    pbStyle?: IPBStyle;
    pnfStyle?: IPnFStyle;
    points?: IPoint[];
    rangeStyle?: IRangeStyle;
    renkoStyle?: IRenkoStyle;
    state: ISourceState;
    svpStyle?: ISVPStyle;
    tpoStyle?: ITPOStyle;
    type: string;
    userEditEnabled?: boolean;
    version?: number;
    volFootprintStyle?: IVolFootprintStyle;
    zorder: number;
}

// Pane
interface IPane {
    isCollapsed: boolean;
    isMaximized: boolean;
    leftAxisesState: any[]; // Using any[] since schema shows array without specific items
    mainSourceId: string;
    mode: number;
    overlayPriceScales: IOverlayPriceScales;
    priceScaleRatio: null;
    rightAxisesState: IRightAxisStateItem[];
    sources: ISource[];
    stretchFactor: number;
}

// Time Scale
interface ITimeScale {
    m_barSpacing: number;
    m_rightOffset: number;
    rightOffsetPercentage: number;
    usePercentageRightOffset: boolean;
}

// Session Background
interface ISessionBackground {
    color: string;
    transparency: number;
    visible: boolean;
}

// Session Backgrounds
interface ISessionBackgrounds {
    electronic: ISessionBackground;
    outOfSession: ISessionBackground;
    postMarket: ISessionBackground;
    preMarket: ISessionBackground;
}

// Session Vertlines
interface ISessionVertlines {
    sessBreaks: IBreaks;
}

// Session Highlight
interface ISessionHighlight {
    backgrounds: ISessionBackgrounds;
    vertlines: ISessionVertlines;
}

// Session Properties
interface ISessionProperties {
    sessionHighlight: ISessionHighlight;
}

// Sessions
interface ISessions {
    properties: ISessionProperties;
}

// Chart
interface IChart {
    chartId: string;
    chartProperties: IChartProperties;
    lineToolsGroups: ILineToolsGroups;
    linkingGroup: null;
    panes: IPane[];
    sessions: ISessions;
    shouldBeSavedEvenIfHidden: boolean;
    timeScale: ITimeScale;
    timezone: string;
    version: number;
}

// Layout Size Item
interface ILayoutSizeItem {
    percent: number;
}

// Layouts Sizes
interface ILayoutsSizes {
    s: ILayoutSizeItem[];
}

// Chart Data
interface IChartData {
    charts: IChart[];
    crosshairLock: number;
    dateRangeLock: number;
    intervalLock: number;
    layout: string;
    layoutsSizes: ILayoutsSizes;
    name: string;
    symbolLock: number;
    trackTimeLock: number;
}

// ==================== MAIN INTERFACE ====================

export interface IChartState extends Document {
    _id: Types.ObjectId;
    __v: number;
    chartData: IChartData;
    createdAt: Date;
    interval: string;
    name: string;
    symbol: string;
    updatedAt: Date;
    userId: Types.ObjectId;
}

// ==================== MONGOOSE SCHEMA ====================

const ChartStateSchema = new Schema<IChartState>(
    {
        chartData: {
            type: Schema.Types.Mixed,
            required: true
        },
        interval: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        symbol: {
            type: String,
            required: true
        },
        userId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'User' // Adjust the ref based on your user model name
        }
    },
    {
        timestamps: true, // This will automatically add createdAt and updatedAt
        collection: 'chartstates'
    }
);

// Create and export the model
export const ChartState = models.ChartState || mongoose.model<IChartState>('ChartState', ChartStateSchema);