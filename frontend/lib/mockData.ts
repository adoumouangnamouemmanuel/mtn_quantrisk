import { Kpi, Scenario, ForecastPoint, MonteCarloResult, BoardBrief, PipelineHealth, KpiId } from './types';

export const MOCK_KPIS: Kpi[] = [
  {
    "id": "FIN01",
    "name": "Service Revenue",
    "category": "Financial",
    "unit": "GHSm",
    "fy25Value": 24400,
    "lowerThreshold": 23000,
    "upperThreshold": 26000,
    "currentStatus": "Watch",
    "trend24m": [
      23362.00676072378,
      25323.26692940081,
      24204.395533895346,
      22379.222936506314,
      25483.605368672903,
      24700.809930762323,
      22379.64324842676,
      26125.418913959173,
      23027.33280779845,
      22340.86290708492,
      23708.47500454562,
      24819.730802042268,
      26823.8910662623,
      24756.067733459175,
      22720.412573552625,
      22764.46665879738,
      23400.81582166261,
      25114.828007247943,
      22121.820261585748,
      26682.01302180091,
      26447.04088703127,
      25479.62073345374,
      23067.348134458203,
      26240.098849904094
    ]
  },
  {
    "id": "FIN02",
    "name": "EBITDA",
    "category": "Financial",
    "unit": "GHSm",
    "fy25Value": 14664,
    "lowerThreshold": 14000,
    "upperThreshold": 15000,
    "currentStatus": "Safe",
    "trend24m": [
      14431.914581449559,
      15242.809025299754,
      14571.838678623155,
      14777.301227424705,
      14879.410449688461,
      13546.360444629248,
      13872.372016195572,
      15884.099551047346,
      15725.913753993598,
      14103.734462099463,
      14349.823809658646,
      14111.376770206482,
      14803.756796759571,
      13455.466405886322,
      14651.497079997247,
      14114.714046628831,
      13206.075937903288,
      14224.283074417885,
      15883.11453566247,
      13825.655710971576,
      14798.415553809653,
      13322.343128786513,
      14095.104962737112,
      14818.771083023288
    ]
  },
  {
    "id": "FIN03",
    "name": "EBITDA Margin",
    "category": "Financial",
    "unit": "%",
    "fy25Value": 60.1,
    "lowerThreshold": 58.0,
    "upperThreshold": 62.0,
    "currentStatus": "Watch",
    "trend24m": [
      64.97006114493354,
      55.44425462848378,
      57.93261880117815,
      64.47084719211244,
      55.652856566226845,
      56.282266121646764,
      54.41092164690647,
      63.46402603272564,
      54.486921548246,
      63.49658501605819,
      65.6342748169243,
      62.23642175218871,
      64.32150329617596,
      62.97154158062954,
      63.84792542139121,
      64.38336431838994,
      60.384324329531864,
      54.74332975914355,
      64.98786125078597,
      54.86525444803956,
      65.89752300924326,
      57.2080989474355,
      65.89230929187991,
      61.81246581700947
    ]
  },
  {
    "id": "FIN04",
    "name": "PAT",
    "category": "Financial",
    "unit": "GHSm",
    "fy25Value": 8100,
    "lowerThreshold": 7500,
    "upperThreshold": 8500,
    "currentStatus": "Safe",
    "trend24m": [
      7738.279760666412,
      8248.408290572783,
      8361.082545677738,
      7659.143723085528,
      8244.121937400176,
      7908.498575354193,
      8298.645486462956,
      7303.943897284413,
      8002.286933084295,
      8500.905354098268,
      8840.576992302553,
      7543.497869078394,
      8740.77898578324,
      7399.972763549119,
      8245.64011190125,
      7945.996826736811,
      8521.836691614457,
      7852.690448821285,
      8216.434997967806,
      8263.413820366204,
      8139.56417242716,
      7580.530641864112,
      8222.894974172132,
      8520.632328650812
    ]
  },
  {
    "id": "FIN05",
    "name": "PAT Margin",
    "category": "Financial",
    "unit": "%",
    "fy25Value": 33.2,
    "lowerThreshold": 31.0,
    "upperThreshold": 35.0,
    "currentStatus": "Watch",
    "trend24m": [
      36.26076426569539,
      35.842176233556046,
      30.555236438070413,
      32.676081851598816,
      33.70821710062446,
      35.85371020690642,
      35.573319141881655,
      33.63500921104324,
      35.7200377657366,
      31.455539088834076,
      34.12081720750574,
      31.942243607348072,
      35.064164154466724,
      35.053603223104844,
      31.88627751919388,
      33.29927805515676,
      35.07042273341981,
      34.69974350999861,
      36.209239871354015,
      32.62574790228211,
      36.182702348856886,
      30.46078344500646,
      31.543698317210936,
      35.42198027062689
    ]
  },
  {
    "id": "FIN06",
    "name": "Revenue Growth YoY",
    "category": "Financial",
    "unit": "%",
    "fy25Value": 36.2,
    "lowerThreshold": 30.0,
    "upperThreshold": 40.0,
    "currentStatus": "Safe",
    "trend24m": [
      37.37074780612386,
      38.70658774114977,
      36.77385738760857,
      35.50633208967248,
      37.43514429094225,
      37.86412434631477,
      38.9147574783737,
      33.689723975521105,
      33.593223074379914,
      33.40623212401097,
      34.89796584348622,
      33.62959304703319,
      38.51118542202301,
      34.77833399711418,
      34.99490246935382,
      37.33130493500557,
      38.88149280862748,
      34.51109465511751,
      37.297020318815804,
      35.049450720181085,
      36.268662686585586,
      33.48687396069523,
      37.074561931007146,
      35.15601788254073
    ]
  },
  {
    "id": "SEG01",
    "name": "Data Revenue",
    "category": "Segment",
    "unit": "GHSm",
    "fy25Value": 8540,
    "lowerThreshold": 8000,
    "upperThreshold": 9000,
    "currentStatus": "Watch",
    "trend24m": [
      9226.534748298513,
      8859.124100676947,
      8603.180199348664,
      7841.13038753918,
      8498.140152279193,
      8949.804198517722,
      8956.632093713424,
      8261.30933353585,
      8252.606691076438,
      9362.561223992478,
      8153.689857304784,
      8636.29526584518,
      9262.074896231194,
      8528.383562935729,
      8820.194138303219,
      8009.413898872434,
      9194.06188245713,
      7876.608788780342,
      9374.919681392457,
      8583.93035756825,
      7998.611278795446,
      7750.328718562165,
      7822.2995596238625,
      8048.324701793999
    ]
  },
  {
    "id": "SEG03",
    "name": "MoMo Revenue",
    "category": "Segment",
    "unit": "GHSm",
    "fy25Value": 6000,
    "lowerThreshold": 5500,
    "upperThreshold": 6500,
    "currentStatus": "Watch",
    "trend24m": [
      5947.535204299775,
      5477.150560630364,
      6564.578339696518,
      5522.559076989442,
      5925.155229622716,
      6316.062277332248,
      5582.618681942935,
      6380.468919690425,
      5618.914742274009,
      6423.766971514572,
      6041.533782443271,
      5584.576066610806,
      5780.993244265074,
      5494.160795129824,
      5705.178904753314,
      6501.333503583907,
      6433.831708814284,
      6054.453457078508,
      5703.348428742716,
      5780.101003003204,
      6078.170082480843,
      5530.8117540494495,
      6471.534194632365,
      6141.581255234044
    ]
  },
  {
    "id": "OPS01",
    "name": "Total Subscribers",
    "category": "Operational",
    "unit": "M",
    "fy25Value": 30.2,
    "lowerThreshold": 29.0,
    "upperThreshold": 32.0,
    "currentStatus": "Watch",
    "trend24m": [
      30.724023012151555,
      29.353358596743156,
      29.635534437158142,
      32.53253714299922,
      32.40875576073656,
      29.265746749650017,
      27.379432935332588,
      31.146979080119397,
      31.332711905060606,
      32.33753834767318,
      30.465244788720234,
      32.60007921004257,
      29.566407283933305,
      29.877137669951132,
      29.17836233360826,
      32.90148311815097,
      30.18461021630166,
      32.8087702333417,
      28.227384703911483,
      32.47518399445391,
      30.541713845770595,
      29.095853635552757,
      29.03182554586302,
      27.993032730102055
    ]
  },
  {
    "id": "OPS04",
    "name": "ARPU",
    "category": "Operational",
    "unit": "GHS",
    "fy25Value": 66.9,
    "lowerThreshold": 64.0,
    "upperThreshold": 70.0,
    "currentStatus": "Safe",
    "trend24m": [
      66.98006719832439,
      60.319864152025396,
      68.11373175371641,
      71.00119251354216,
      63.357588207140054,
      60.26549093325945,
      61.56849394700786,
      63.16496560811377,
      62.85345315478062,
      71.33773547069586,
      64.27439200394731,
      68.26264863842707,
      64.79547390938588,
      69.85622531538866,
      73.30150254009081,
      67.35108482045298,
      72.88614528123348,
      64.9920631595305,
      64.4381617707307,
      63.15265838255558,
      66.01910976623459,
      65.77473976788545,
      66.45596263384519,
      66.21846827758515
    ]
  },
  {
    "id": "OPS07",
    "name": "4G Coverage",
    "category": "Operational",
    "unit": "%",
    "fy25Value": 99.5,
    "lowerThreshold": 98.0,
    "upperThreshold": 100.0,
    "currentStatus": "Watch",
    "trend24m": [
      99.83490892464437,
      94.53015000484922,
      96.18025151078523,
      107.01243993851747,
      104.60414375476222,
      108.37768220149978,
      100.02754054579307,
      93.86327291248594,
      97.35295888937867,
      95.2265253503046,
      100.24315923650967,
      91.55203720299733,
      92.50382120363328,
      104.97555278067381,
      108.75413450489722,
      99.92152916529976,
      100.07320174729414,
      102.80920361976189,
      94.15840258878167,
      100.86615392248602,
      99.1516431478751,
      97.35952917755736,
      99.44672074988166,
      107.85782648195344
    ]
  },
  {
    "id": "EXT01",
    "name": "Inflation",
    "category": "External",
    "unit": "%",
    "fy25Value": 5.4,
    "lowerThreshold": 4.0,
    "upperThreshold": 10.0,
    "currentStatus": "Warning",
    "trend24m": [
      5.707753046870575,
      5.7432591618693305,
      5.7702101378368775,
      5.918730277763611,
      5.493753036531067,
      5.819283061712936,
      5.783977757919747,
      5.881121446924879,
      5.018563005419055,
      4.982636411774045,
      5.0721403573254715,
      5.5388192102479294,
      5.489057135471378,
      4.892612526368796,
      5.066097772647176,
      5.916610854597593,
      5.651697215630192,
      4.879653329671119,
      5.197625598157878,
      4.991914875064612,
      4.863962745079175,
      5.429039418921913,
      5.739843352793905,
      5.040086093509233
    ]
  },
  {
    "id": "EXT02",
    "name": "BoG Policy Rate",
    "category": "External",
    "unit": "%",
    "fy25Value": 28.0,
    "lowerThreshold": 25.0,
    "upperThreshold": 30.0,
    "currentStatus": "Watch",
    "trend24m": [
      26.684356883595306,
      28.19363294043653,
      26.01841595016337,
      25.33934217635912,
      30.22429237782667,
      27.88559553420697,
      29.17015192132613,
      30.29740015614533,
      27.80270216545128,
      26.54280643481905,
      25.262326289959386,
      26.10668387601982,
      26.614187275414327,
      27.684697035743557,
      27.98967404254521,
      27.798576015121842,
      26.39504674192672,
      27.626987102075365,
      27.481421938562292,
      30.659257291366952,
      26.03420259395531,
      26.313681589739293,
      29.261453837400456,
      25.466378645177592
    ]
  },
  {
    "id": "EXT03",
    "name": "Cedi/USD",
    "category": "External",
    "unit": "GHS/USD",
    "fy25Value": 11.6,
    "lowerThreshold": 11.0,
    "upperThreshold": 13.0,
    "currentStatus": "Safe",
    "trend24m": [
      12.571366016794597,
      11.640195646254758,
      12.543629279517098,
      11.414506773153606,
      10.754143774730904,
      11.41528298887443,
      10.533349407568494,
      10.587234773010929,
      12.069916104625444,
      12.055987094612245,
      10.643888355020861,
      10.896006709146844,
      11.00231988219417,
      10.53462208161971,
      10.579769685682418,
      12.006285640619796,
      11.58666934657173,
      10.559710842779,
      12.118401485018815,
      11.885621048501362,
      11.522495326013436,
      11.528328377333093,
      11.305158276363453,
      11.718312408674478
    ]
  }
];

export const MOCK_SCENARIOS: Scenario[] = [
  {
    "id": "S01",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "Cedi devaluation -25%",
    "description": "Cedi drops 25% vs USD over 2 quarters",
    "severity": 2,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 25.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 5.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 2.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -2.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -15.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.5
      }
    ]
  },
  {
    "id": "S02",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "Inflation resurgence to 25%",
    "description": "CPI hits 25% due to fiscal slippage",
    "severity": 3,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 5.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 20.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 3.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -4.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.2
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": 5.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.0
      }
    ]
  },
  {
    "id": "S03",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "MoMo e-levy increase to 1.5%",
    "description": "Govt raises e-levy from 1% to 1.5%",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.5
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -25.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -15.0
      }
    ]
  },
  {
    "id": "S04",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "Sovereign debt freeze",
    "description": "IMF programme stalls, donors cut aid",
    "severity": 5,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 15.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 10.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 5.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.8
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.0
      }
    ]
  },
  {
    "id": "S05",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Stress",
    "name": "ECG tariff +40%",
    "description": "Power utility raises tariffs 40%",
    "severity": 2,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 3.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -0.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.2
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.2
      }
    ]
  },
  {
    "id": "S06",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "Major cyber breach - 5-day MoMo outage",
    "description": "Ransomware locks MoMo platform for 5 days",
    "severity": 1,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.6
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -12.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -3.0
      }
    ]
  },
  {
    "id": "S07",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "Spectrum dispute - 4G degradation",
    "description": "Regulator forces spectrum reallocation, 4G speeds drop",
    "severity": 3,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -4.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.5
      }
    ]
  },
  {
    "id": "S08",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Shock",
    "name": "Major flood - 300+ sites down",
    "description": "Heavy rains damage 300 cell sites across south",
    "severity": 2,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S09",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "Mass data privacy breach",
    "description": "Customer data of 5M users leaked online",
    "severity": 4,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.0
      }
    ]
  },
  {
    "id": "S10",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Shock",
    "name": "Competitive intensification (ARPU pressure)",
    "description": "Price war cuts data tariffs 30% across market",
    "severity": 3,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.2
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -12.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.5
      }
    ]
  },
  {
    "id": "S11",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Combined",
    "name": "Ghana macro reversal",
    "description": "IMF suspension, cedi collapse, inflation spike",
    "severity": 2,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 20.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 15.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 8.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -12.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -2.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -3.0
      }
    ]
  },
  {
    "id": "S12",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Combined",
    "name": "Fintech disruption + regulatory pressure",
    "description": "Bank-led wallets capture MoMo share + e-levy hike",
    "severity": 5,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -4.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -30.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -8.0
      }
    ]
  },
  {
    "id": "S13",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Combined",
    "name": "Network crisis + climate compound",
    "description": "Major outage + flooding + diesel shortage",
    "severity": 1,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 8.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -2.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -10.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -4.0
      }
    ]
  },
  {
    "id": "S14",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Combined",
    "name": "Reverse-FY25 - all tailwinds vanish",
    "description": "Cedi weakens, inflation rises, regulatory crackdown",
    "severity": 1,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 15.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 12.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 4.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -3.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.0
      }
    ]
  },
  {
    "id": "S15",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "Cedi devaluation -40% (severe)",
    "description": "Cedi plummets 40% in 3 months, BoG intervenes",
    "severity": 1,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 40.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 8.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 6.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -14.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -4.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -25.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 3.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -3.0
      }
    ]
  },
  {
    "id": "S16",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "Hyperinflation return - 50%+",
    "description": "Inflation exceeds 50%, currency crisis deepens",
    "severity": 2,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 25.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 45.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 10.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -12.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -6.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -20.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 5.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -5.0
      }
    ]
  },
  {
    "id": "S17",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "BoG emergency rate hike to 35%",
    "description": "MPC hikes policy rate to 35% in emergency meeting",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 8.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 5.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 7.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S18",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "Ghana sovereign downgrade to junk",
    "description": "Moody's cuts Ghana to Caa1, foreign debt payments frozen",
    "severity": 1,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 10.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 6.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 5.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.0
      }
    ]
  },
  {
    "id": "S19",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Upside",
    "name": "Cedi appreciation +30%",
    "description": "Cedi strengthens 30% on oil windfall and IMF inflows",
    "severity": 5,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": -30.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": -3.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": -2.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": 10.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": 1.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": 30.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": 1.5
      }
    ]
  },
  {
    "id": "S20",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "IMF conditionality tightening",
    "description": "IMF demands higher tariffs, spending cuts",
    "severity": 3,
    "plausibility": 2,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 2.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 1.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.6
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S21",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Stress",
    "name": "Cocoa/commodity crash - fiscal squeeze",
    "description": "Cocoa prices fall 40%, export revenues drop",
    "severity": 2,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 5.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 2.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 1.5
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.4
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.8
      }
    ]
  },
  {
    "id": "S22",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Stress",
    "name": "Oil price spike - pass-through inflation",
    "description": "Crude oil +50%, diesel +80%",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 8.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 1.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.3
      }
    ]
  },
  {
    "id": "S23",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Shock",
    "name": "BoG FX intervention failure - disorderly devaluation",
    "description": "Cedi hits 18 GHS/USD, BoG runs out of reserves",
    "severity": 5,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 50.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 20.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 10.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -18.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -5.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -30.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 4.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -4.0
      }
    ]
  },
  {
    "id": "S24",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Combined",
    "name": "Stagflation trap - GDP 1%",
    "description": "1.0",
    "severity": 1,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 10.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 0.25
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.08
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -300.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -15.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": 3.0
      }
    ]
  },
  {
    "id": "S25",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "NCA universal service levy increase",
    "description": "Levy raised from 1% to 2% of revenue",
    "severity": 5,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.6
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S26",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "Spectrum refarming forced at cost",
    "description": "Refarming 2G/3G to 4G/5G at NCA's cost",
    "severity": 1,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S27",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "Parliament social tariff floor",
    "description": "Minimum data price floor removed, intense price war",
    "severity": 1,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.0
      }
    ]
  },
  {
    "id": "S28",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "BoG MoMo interoperability mandate",
    "description": "Compulsory low\u00e2\u20ac\u2018cost interoperability with banks",
    "severity": 1,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -15.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -3.0
      }
    ]
  },
  {
    "id": "S29",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Shock",
    "name": "NCA partial licence revocation",
    "description": "NCA revokes MTN's data licence in 2 regions",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -25.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -6.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -18.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -12.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -12.0
      }
    ]
  },
  {
    "id": "S30",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Shock",
    "name": "SIM re-registration 2.0 - 6-month disruption",
    "description": "Mandatory new SIM registration, 6\u00e2\u20ac\u2018month process",
    "severity": 4,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -10.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -8.0
      }
    ]
  },
  {
    "id": "S31",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Stress",
    "name": "Data Protection Act fine - major enforcement",
    "description": "DPC fines MTN GHS 500m for data breach",
    "severity": 3,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.5
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S32",
    "pillar": "B",
    "pillarName": "Regulatory",
    "type": "Combined",
    "name": "Regulatory storm (spectrum + e-levy + tariff cap)",
    "description": "Three major regulatory hits simultaneously",
    "severity": 1,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -15.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -4.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -30.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -5.0
      }
    ]
  },
  {
    "id": "S33",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "Ransomware - core network 10-day outage",
    "description": "Full network outage due to ransomware, 10 days",
    "severity": 4,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -20.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -4.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -15.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -5.0
      }
    ]
  },
  {
    "id": "S34",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "MoMo vendor insolvency - forced migration",
    "description": "MoMo platform vendor goes bankrupt, 15\u00e2\u20ac\u2018day migration",
    "severity": 3,
    "plausibility": 2,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -2.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -25.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -8.0
      }
    ]
  },
  {
    "id": "S35",
    "pillar": "A",
    "pillarName": "Competitive",
    "type": "Stress",
    "name": "5G auction - MTN underbids",
    "description": "1.0",
    "severity": 3,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.015
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -40.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -0.5
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.0
      }
    ]
  },
  {
    "id": "S36",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "Subsea cable cut - bandwidth crisis",
    "description": "International fibre cut, 50% capacity loss for 3 weeks",
    "severity": 4,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S37",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Stress",
    "name": "AI-driven MoMo fraud surge +500%",
    "description": "AI fraud attacks cause massive MoMo losses",
    "severity": 4,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.0
      }
    ]
  },
  {
    "id": "S38",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Shock",
    "name": "National grid + telecoms cyberattack",
    "description": "State\u00e2\u20ac\u2018sponsored attack on grid and telcos",
    "severity": 2,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -15.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -3.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -18.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -6.0
      }
    ]
  },
  {
    "id": "S39",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Stress",
    "name": "Network sharing collapse - Telecel dispute",
    "description": "Telecel ends tower sharing, MTN must build own",
    "severity": 2,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.6
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S40",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Stress",
    "name": "Telecel aggressive bundle reset",
    "description": "Telecel launches low\u00e2\u20ac\u2018price voice+data bundle",
    "severity": 5,
    "plausibility": 2,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.5
      }
    ]
  },
  {
    "id": "S41",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Shock",
    "name": "New MVNO entry - tech giant",
    "description": "Amazon or Google launches MVNO in Ghana",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -6.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -3.0
      }
    ]
  },
  {
    "id": "S42",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Stress",
    "name": "AT Ghana recapitalisation",
    "description": "AirtelTigo gets new investor, aggressive marketing",
    "severity": 2,
    "plausibility": 5,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.0
      }
    ]
  },
  {
    "id": "S43",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Stress",
    "name": "Price war - all operators cut data 40%",
    "description": "Industry\u00e2\u20ac\u2018wide data price war, 40% cuts",
    "severity": 4,
    "plausibility": 2,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -12.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -2.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -10.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -8.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -2.0
      }
    ]
  },
  {
    "id": "S44",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Shock",
    "name": "Bank-led mobile wallet captures MoMo share",
    "description": "Consortium of banks launches unified wallet",
    "severity": 4,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.2
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -20.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -5.0
      }
    ]
  },
  {
    "id": "S45",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Stress",
    "name": "OTT substitution accelerates - voice collapse",
    "description": "WhatsApp voice + video kills traditional voice",
    "severity": 2,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -0.5
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.2
      }
    ]
  },
  {
    "id": "S46",
    "pillar": "D",
    "pillarName": "Competitive",
    "type": "Stress",
    "name": "Starlink Ghana rural expansion",
    "description": "Starlink launches low\u00e2\u20ac\u2018cost rural satellite broadband",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.3
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -0.5
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S47",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Stress",
    "name": "ECG load-shedding Stage 6 - 6 months",
    "description": "Daily 8\u00e2\u20ac\u2018hour power cuts, diesel costs quadruple",
    "severity": 4,
    "plausibility": 2,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 5.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -1.5
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -1.0
      }
    ]
  },
  {
    "id": "S48",
    "pillar": "A",
    "pillarName": "Operational & Climate",
    "type": "Shock",
    "name": "Accra earthquake - 500+ sites",
    "description": "1.0",
    "severity": 5,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.08
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -300.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -5.0
      }
    ]
  },
  {
    "id": "S49",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Stress",
    "name": "Tower equipment supply chain disruption",
    "description": "Huawei sanctions delay tower equipment 6 months",
    "severity": 3,
    "plausibility": 3,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.4
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.5
      }
    ]
  },
  {
    "id": "S50",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Shock",
    "name": "CEO + CFO simultaneous departure",
    "description": "Both top executives resign unexpectedly",
    "severity": 2,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -0.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.2
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -1.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.2
      }
    ]
  },
  {
    "id": "S51",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Stress",
    "name": "Labour dispute - extended strike",
    "description": "Union strikes for 4 weeks over pay",
    "severity": 2,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -1.5
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -0.8
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -2.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -0.8
      }
    ]
  },
  {
    "id": "S52",
    "pillar": "C",
    "pillarName": "Tech & Cyber",
    "type": "Upside",
    "name": "5G early mover - enterprise revenue surge",
    "description": "MTN launches 5G first, grabs enterprise share",
    "severity": 2,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": -0.5
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": 4.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": 0.8
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": 8.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 15.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": 3.0
      }
    ]
  },
  {
    "id": "S53",
    "pillar": "E",
    "pillarName": "Operational & Climate",
    "type": "Upside",
    "name": "MoMo lending / micro-insurance breakthrough",
    "description": "MoMo lending scales 5x, insurance attach rate 20%",
    "severity": 1,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": 2.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": 0.4
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 35.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": 5.0
      }
    ]
  },
  {
    "id": "S54",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Upside",
    "name": "Ghana GDP 8%+ super-cycle",
    "description": "Oil & mining boom, GDP growth >8%",
    "severity": 1,
    "plausibility": 1,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": -5.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": -3.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": -1.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": 5.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": 1.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": 10.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": 20.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": 5.0
      }
    ]
  },
  {
    "id": "S55",
    "pillar": "A",
    "pillarName": "Macro & FX",
    "type": "Upside",
    "name": "Cedi appreciation +40%",
    "description": "Cedi appreciates 40% on structural reforms",
    "severity": 4,
    "plausibility": 4,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": -40.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": -5.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": -3.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": 12.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": 4.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": 40.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -3.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": 2.0
      }
    ]
  },
  {
    "id": "S56",
    "pillar": "G",
    "pillarName": "Tail Risk",
    "type": "Combined",
    "name": "Perfect storm (macro+cyber+regulatory+climate)",
    "description": "Worst\u00e2\u20ac\u2018case combined event",
    "severity": 2,
    "plausibility": 2,
    "calibrationAnchor": "Historical Volatility",
    "lastCalibrated": "2026-06-01T00:00:00Z",
    "owner": "Risk Team",
    "kpiImpacts": [
      {
        "kpiId": "EXT03",
        "type": "pct",
        "value": 35.0
      },
      {
        "kpiId": "EXT01",
        "type": "delta",
        "value": 25.0
      },
      {
        "kpiId": "EXT02",
        "type": "delta",
        "value": 10.0
      },
      {
        "kpiId": "FIN01",
        "type": "pct",
        "value": -25.0
      },
      {
        "kpiId": "FIN03",
        "type": "delta",
        "value": -8.0
      },
      {
        "kpiId": "OPS04",
        "type": "pct",
        "value": -20.0
      },
      {
        "kpiId": "SEG03",
        "type": "pct",
        "value": -40.0
      },
      {
        "kpiId": "OPS01",
        "type": "pct",
        "value": -10.0
      }
    ]
  }
];

export const MOCK_FORECAST: ForecastPoint[] = [
  {
    "date": "2026-03-12",
    "median": 0,
    "p50": 21930.793964568307,
    "p05": 21930.793964568307,
    "p95": 21930.793964568307,
    "isHistorical": true
  },
  {
    "date": "2026-03-13",
    "median": 0,
    "p50": 21974.18858893632,
    "p05": 21974.18858893632,
    "p95": 21974.18858893632,
    "isHistorical": true
  },
  {
    "date": "2026-03-14",
    "median": 0,
    "p50": 21966.6259423525,
    "p05": 21966.6259423525,
    "p95": 21966.6259423525,
    "isHistorical": true
  },
  {
    "date": "2026-03-15",
    "median": 0,
    "p50": 22005.286120135614,
    "p05": 22005.286120135614,
    "p95": 22005.286120135614,
    "isHistorical": true
  },
  {
    "date": "2026-03-16",
    "median": 0,
    "p50": 22042.749628390757,
    "p05": 22042.749628390757,
    "p95": 22042.749628390757,
    "isHistorical": true
  },
  {
    "date": "2026-03-17",
    "median": 0,
    "p50": 21977.863334121048,
    "p05": 21977.863334121048,
    "p95": 21977.863334121048,
    "isHistorical": true
  },
  {
    "date": "2026-03-18",
    "median": 0,
    "p50": 22119.440814381833,
    "p05": 22119.440814381833,
    "p95": 22119.440814381833,
    "isHistorical": true
  },
  {
    "date": "2026-03-19",
    "median": 0,
    "p50": 22204.4428953643,
    "p05": 22204.4428953643,
    "p95": 22204.4428953643,
    "isHistorical": true
  },
  {
    "date": "2026-03-20",
    "median": 0,
    "p50": 22295.664236218887,
    "p05": 22295.664236218887,
    "p95": 22295.664236218887,
    "isHistorical": true
  },
  {
    "date": "2026-03-21",
    "median": 0,
    "p50": 22438.81838933706,
    "p05": 22438.81838933706,
    "p95": 22438.81838933706,
    "isHistorical": true
  },
  {
    "date": "2026-03-22",
    "median": 0,
    "p50": 22517.857298722793,
    "p05": 22517.857298722793,
    "p95": 22517.857298722793,
    "isHistorical": true
  },
  {
    "date": "2026-03-23",
    "median": 0,
    "p50": 22616.001975937204,
    "p05": 22616.001975937204,
    "p95": 22616.001975937204,
    "isHistorical": true
  },
  {
    "date": "2026-03-24",
    "median": 0,
    "p50": 22670.669011992835,
    "p05": 22670.669011992835,
    "p95": 22670.669011992835,
    "isHistorical": true
  },
  {
    "date": "2026-03-25",
    "median": 0,
    "p50": 22743.88041779784,
    "p05": 22743.88041779784,
    "p95": 22743.88041779784,
    "isHistorical": true
  },
  {
    "date": "2026-03-26",
    "median": 0,
    "p50": 22807.594735668103,
    "p05": 22807.594735668103,
    "p95": 22807.594735668103,
    "isHistorical": true
  },
  {
    "date": "2026-03-27",
    "median": 0,
    "p50": 22814.237656311238,
    "p05": 22814.237656311238,
    "p95": 22814.237656311238,
    "isHistorical": true
  },
  {
    "date": "2026-03-28",
    "median": 0,
    "p50": 22732.901627608346,
    "p05": 22732.901627608346,
    "p95": 22732.901627608346,
    "isHistorical": true
  },
  {
    "date": "2026-03-29",
    "median": 0,
    "p50": 22788.03821469132,
    "p05": 22788.03821469132,
    "p95": 22788.03821469132,
    "isHistorical": true
  },
  {
    "date": "2026-03-30",
    "median": 0,
    "p50": 22783.75128701463,
    "p05": 22783.75128701463,
    "p95": 22783.75128701463,
    "isHistorical": true
  },
  {
    "date": "2026-03-31",
    "median": 0,
    "p50": 22757.63316070141,
    "p05": 22757.63316070141,
    "p95": 22757.63316070141,
    "isHistorical": true
  },
  {
    "date": "2026-04-01",
    "median": 0,
    "p50": 22693.034945859425,
    "p05": 22693.034945859425,
    "p95": 22693.034945859425,
    "isHistorical": true
  },
  {
    "date": "2026-04-02",
    "median": 0,
    "p50": 22611.174924986197,
    "p05": 22611.174924986197,
    "p95": 22611.174924986197,
    "isHistorical": true
  },
  {
    "date": "2026-04-03",
    "median": 0,
    "p50": 22720.689167977023,
    "p05": 22720.689167977023,
    "p95": 22720.689167977023,
    "isHistorical": true
  },
  {
    "date": "2026-04-04",
    "median": 0,
    "p50": 22757.541951767,
    "p05": 22757.541951767,
    "p95": 22757.541951767,
    "isHistorical": true
  },
  {
    "date": "2026-04-05",
    "median": 0,
    "p50": 22895.545264638662,
    "p05": 22895.545264638662,
    "p95": 22895.545264638662,
    "isHistorical": true
  },
  {
    "date": "2026-04-06",
    "median": 0,
    "p50": 22827.19277577353,
    "p05": 22827.19277577353,
    "p95": 22827.19277577353,
    "isHistorical": true
  },
  {
    "date": "2026-04-07",
    "median": 0,
    "p50": 22853.631314501446,
    "p05": 22853.631314501446,
    "p95": 22853.631314501446,
    "isHistorical": true
  },
  {
    "date": "2026-04-08",
    "median": 0,
    "p50": 22970.98129295619,
    "p05": 22970.98129295619,
    "p95": 22970.98129295619,
    "isHistorical": true
  },
  {
    "date": "2026-04-09",
    "median": 0,
    "p50": 23031.48106406851,
    "p05": 23031.48106406851,
    "p95": 23031.48106406851,
    "isHistorical": true
  },
  {
    "date": "2026-04-10",
    "median": 0,
    "p50": 23052.90425788605,
    "p05": 23052.90425788605,
    "p95": 23052.90425788605,
    "isHistorical": true
  },
  {
    "date": "2026-04-11",
    "median": 0,
    "p50": 23173.644038398077,
    "p05": 23173.644038398077,
    "p95": 23173.644038398077,
    "isHistorical": true
  },
  {
    "date": "2026-04-12",
    "median": 0,
    "p50": 23196.688580736987,
    "p05": 23196.688580736987,
    "p95": 23196.688580736987,
    "isHistorical": true
  },
  {
    "date": "2026-04-13",
    "median": 0,
    "p50": 23310.60180703078,
    "p05": 23310.60180703078,
    "p95": 23310.60180703078,
    "isHistorical": true
  },
  {
    "date": "2026-04-14",
    "median": 0,
    "p50": 23436.480030426825,
    "p05": 23436.480030426825,
    "p95": 23436.480030426825,
    "isHistorical": true
  },
  {
    "date": "2026-04-15",
    "median": 0,
    "p50": 23539.486937547314,
    "p05": 23539.486937547314,
    "p95": 23539.486937547314,
    "isHistorical": true
  },
  {
    "date": "2026-04-16",
    "median": 0,
    "p50": 23495.37665620077,
    "p05": 23495.37665620077,
    "p95": 23495.37665620077,
    "isHistorical": true
  },
  {
    "date": "2026-04-17",
    "median": 0,
    "p50": 23522.99630718583,
    "p05": 23522.99630718583,
    "p95": 23522.99630718583,
    "isHistorical": true
  },
  {
    "date": "2026-04-18",
    "median": 0,
    "p50": 23601.682557779986,
    "p05": 23601.682557779986,
    "p95": 23601.682557779986,
    "isHistorical": true
  },
  {
    "date": "2026-04-19",
    "median": 0,
    "p50": 23728.82032571993,
    "p05": 23728.82032571993,
    "p95": 23728.82032571993,
    "isHistorical": true
  },
  {
    "date": "2026-04-20",
    "median": 0,
    "p50": 23707.320079856727,
    "p05": 23707.320079856727,
    "p95": 23707.320079856727,
    "isHistorical": true
  },
  {
    "date": "2026-04-21",
    "median": 0,
    "p50": 23618.567010014936,
    "p05": 23618.567010014936,
    "p95": 23618.567010014936,
    "isHistorical": true
  },
  {
    "date": "2026-04-22",
    "median": 0,
    "p50": 23591.019010965294,
    "p05": 23591.019010965294,
    "p95": 23591.019010965294,
    "isHistorical": true
  },
  {
    "date": "2026-04-23",
    "median": 0,
    "p50": 23509.961574283967,
    "p05": 23509.961574283967,
    "p95": 23509.961574283967,
    "isHistorical": true
  },
  {
    "date": "2026-04-24",
    "median": 0,
    "p50": 23615.43436758372,
    "p05": 23615.43436758372,
    "p95": 23615.43436758372,
    "isHistorical": true
  },
  {
    "date": "2026-04-25",
    "median": 0,
    "p50": 23623.27402852272,
    "p05": 23623.27402852272,
    "p95": 23623.27402852272,
    "isHistorical": true
  },
  {
    "date": "2026-04-26",
    "median": 0,
    "p50": 23566.395237583605,
    "p05": 23566.395237583605,
    "p95": 23566.395237583605,
    "isHistorical": true
  },
  {
    "date": "2026-04-27",
    "median": 0,
    "p50": 23504.41740895457,
    "p05": 23504.41740895457,
    "p95": 23504.41740895457,
    "isHistorical": true
  },
  {
    "date": "2026-04-28",
    "median": 0,
    "p50": 23523.092377541263,
    "p05": 23523.092377541263,
    "p95": 23523.092377541263,
    "isHistorical": true
  },
  {
    "date": "2026-04-29",
    "median": 0,
    "p50": 23664.436885343905,
    "p05": 23664.436885343905,
    "p95": 23664.436885343905,
    "isHistorical": true
  },
  {
    "date": "2026-04-30",
    "median": 0,
    "p50": 23610.254942250547,
    "p05": 23610.254942250547,
    "p95": 23610.254942250547,
    "isHistorical": true
  },
  {
    "date": "2026-05-01",
    "median": 0,
    "p50": 23759.28278514833,
    "p05": 23759.28278514833,
    "p95": 23759.28278514833,
    "isHistorical": true
  },
  {
    "date": "2026-05-02",
    "median": 0,
    "p50": 23735.755988736182,
    "p05": 23735.755988736182,
    "p95": 23735.755988736182,
    "isHistorical": true
  },
  {
    "date": "2026-05-03",
    "median": 0,
    "p50": 23754.12324764404,
    "p05": 23754.12324764404,
    "p95": 23754.12324764404,
    "isHistorical": true
  },
  {
    "date": "2026-05-04",
    "median": 0,
    "p50": 23772.659445295674,
    "p05": 23772.659445295674,
    "p95": 23772.659445295674,
    "isHistorical": true
  },
  {
    "date": "2026-05-05",
    "median": 0,
    "p50": 23839.499697910956,
    "p05": 23839.499697910956,
    "p95": 23839.499697910956,
    "isHistorical": true
  },
  {
    "date": "2026-05-06",
    "median": 0,
    "p50": 23970.134831787487,
    "p05": 23970.134831787487,
    "p95": 23970.134831787487,
    "isHistorical": true
  },
  {
    "date": "2026-05-07",
    "median": 0,
    "p50": 24106.956110347917,
    "p05": 24106.956110347917,
    "p95": 24106.956110347917,
    "isHistorical": true
  },
  {
    "date": "2026-05-08",
    "median": 0,
    "p50": 24234.668424124226,
    "p05": 24234.668424124226,
    "p95": 24234.668424124226,
    "isHistorical": true
  },
  {
    "date": "2026-05-09",
    "median": 0,
    "p50": 24382.50210871854,
    "p05": 24382.50210871854,
    "p95": 24382.50210871854,
    "isHistorical": true
  },
  {
    "date": "2026-05-10",
    "median": 0,
    "p50": 24466.296916485,
    "p05": 24466.296916485,
    "p95": 24466.296916485,
    "isHistorical": true
  },
  {
    "date": "2026-05-11",
    "median": 0,
    "p50": 24390.720961789506,
    "p05": 24390.720961789506,
    "p95": 24390.720961789506,
    "isHistorical": true
  },
  {
    "date": "2026-05-12",
    "median": 0,
    "p50": 24309.494635196625,
    "p05": 24309.494635196625,
    "p95": 24309.494635196625,
    "isHistorical": true
  },
  {
    "date": "2026-05-13",
    "median": 0,
    "p50": 24349.647687424556,
    "p05": 24349.647687424556,
    "p95": 24349.647687424556,
    "isHistorical": true
  },
  {
    "date": "2026-05-14",
    "median": 0,
    "p50": 24387.470784512836,
    "p05": 24387.470784512836,
    "p95": 24387.470784512836,
    "isHistorical": true
  },
  {
    "date": "2026-05-15",
    "median": 0,
    "p50": 24373.96528884911,
    "p05": 24373.96528884911,
    "p95": 24373.96528884911,
    "isHistorical": true
  },
  {
    "date": "2026-05-16",
    "median": 0,
    "p50": 24295.262299036574,
    "p05": 24295.262299036574,
    "p95": 24295.262299036574,
    "isHistorical": true
  },
  {
    "date": "2026-05-17",
    "median": 0,
    "p50": 24326.205483172518,
    "p05": 24326.205483172518,
    "p95": 24326.205483172518,
    "isHistorical": true
  },
  {
    "date": "2026-05-18",
    "median": 0,
    "p50": 24445.06470876813,
    "p05": 24445.06470876813,
    "p95": 24445.06470876813,
    "isHistorical": true
  },
  {
    "date": "2026-05-19",
    "median": 0,
    "p50": 24573.622306655714,
    "p05": 24573.622306655714,
    "p95": 24573.622306655714,
    "isHistorical": true
  },
  {
    "date": "2026-05-20",
    "median": 0,
    "p50": 24530.7850319969,
    "p05": 24530.7850319969,
    "p95": 24530.7850319969,
    "isHistorical": true
  },
  {
    "date": "2026-05-21",
    "median": 0,
    "p50": 24448.842804064403,
    "p05": 24448.842804064403,
    "p95": 24448.842804064403,
    "isHistorical": true
  },
  {
    "date": "2026-05-22",
    "median": 0,
    "p50": 24519.11895716169,
    "p05": 24519.11895716169,
    "p95": 24519.11895716169,
    "isHistorical": true
  },
  {
    "date": "2026-05-23",
    "median": 0,
    "p50": 24454.98127535638,
    "p05": 24454.98127535638,
    "p95": 24454.98127535638,
    "isHistorical": true
  },
  {
    "date": "2026-05-24",
    "median": 0,
    "p50": 24403.149896762166,
    "p05": 24403.149896762166,
    "p95": 24403.149896762166,
    "isHistorical": true
  },
  {
    "date": "2026-05-25",
    "median": 0,
    "p50": 24510.87182254818,
    "p05": 24510.87182254818,
    "p95": 24510.87182254818,
    "isHistorical": true
  },
  {
    "date": "2026-05-26",
    "median": 0,
    "p50": 24551.427620725543,
    "p05": 24551.427620725543,
    "p95": 24551.427620725543,
    "isHistorical": true
  },
  {
    "date": "2026-05-27",
    "median": 0,
    "p50": 24461.485706458818,
    "p05": 24461.485706458818,
    "p95": 24461.485706458818,
    "isHistorical": true
  },
  {
    "date": "2026-05-28",
    "median": 0,
    "p50": 24544.801431493364,
    "p05": 24544.801431493364,
    "p95": 24544.801431493364,
    "isHistorical": true
  },
  {
    "date": "2026-05-29",
    "median": 0,
    "p50": 24485.87559794061,
    "p05": 24485.87559794061,
    "p95": 24485.87559794061,
    "isHistorical": true
  },
  {
    "date": "2026-05-30",
    "median": 0,
    "p50": 24442.101981556876,
    "p05": 24442.101981556876,
    "p95": 24442.101981556876,
    "isHistorical": true
  },
  {
    "date": "2026-05-31",
    "median": 0,
    "p50": 24466.57356500976,
    "p05": 24466.57356500976,
    "p95": 24466.57356500976,
    "isHistorical": true
  },
  {
    "date": "2026-06-01",
    "median": 0,
    "p50": 24562.425644770698,
    "p05": 24562.425644770698,
    "p95": 24562.425644770698,
    "isHistorical": true
  },
  {
    "date": "2026-06-02",
    "median": 0,
    "p50": 24589.934178910506,
    "p05": 24589.934178910506,
    "p95": 24589.934178910506,
    "isHistorical": true
  },
  {
    "date": "2026-06-03",
    "median": 0,
    "p50": 24725.293361503096,
    "p05": 24725.293361503096,
    "p95": 24725.293361503096,
    "isHistorical": true
  },
  {
    "date": "2026-06-04",
    "median": 0,
    "p50": 24718.101633523107,
    "p05": 24718.101633523107,
    "p95": 24718.101633523107,
    "isHistorical": true
  },
  {
    "date": "2026-06-05",
    "median": 0,
    "p50": 24639.309076321417,
    "p05": 24639.309076321417,
    "p95": 24639.309076321417,
    "isHistorical": true
  },
  {
    "date": "2026-06-06",
    "median": 0,
    "p50": 24782.387117173497,
    "p05": 24782.387117173497,
    "p95": 24782.387117173497,
    "isHistorical": true
  },
  {
    "date": "2026-06-07",
    "median": 0,
    "p50": 24853.7751897446,
    "p05": 24853.7751897446,
    "p95": 24853.7751897446,
    "isHistorical": true
  },
  {
    "date": "2026-06-08",
    "median": 0,
    "p50": 24827.266364142262,
    "p05": 24827.266364142262,
    "p95": 24827.266364142262,
    "isHistorical": true
  },
  {
    "date": "2026-06-09",
    "median": 0,
    "p50": 24921.229602582363,
    "p05": 24921.229602582363,
    "p95": 24921.229602582363,
    "isHistorical": true
  },
  {
    "date": "2026-06-10",
    "median": 0,
    "p50": 24952.140566189533,
    "p05": 24952.140566189533,
    "p95": 24952.140566189533,
    "isHistorical": true
  },
  {
    "date": "2026-06-11",
    "median": 25035.18753178434,
    "p50": 25035.18753178434,
    "p05": 22531.66877860591,
    "p95": 27538.706284962776,
    "isHistorical": false
  },
  {
    "date": "2026-06-12",
    "median": 25145.701737465544,
    "p50": 25145.701737465544,
    "p05": 22631.13156371899,
    "p95": 27660.2719112121,
    "isHistorical": false
  },
  {
    "date": "2026-06-13",
    "median": 25154.566245386406,
    "p50": 25154.566245386406,
    "p05": 22639.109620847765,
    "p95": 27670.022869925047,
    "isHistorical": false
  },
  {
    "date": "2026-06-14",
    "median": 25168.43313699285,
    "p50": 25168.43313699285,
    "p05": 22651.589823293565,
    "p95": 27685.276450692138,
    "isHistorical": false
  },
  {
    "date": "2026-06-15",
    "median": 25317.566521783785,
    "p50": 25317.566521783785,
    "p05": 22785.809869605408,
    "p95": 27849.323173962166,
    "isHistorical": false
  },
  {
    "date": "2026-06-16",
    "median": 25304.07228631423,
    "p50": 25304.07228631423,
    "p05": 22773.665057682807,
    "p95": 27834.479514945655,
    "isHistorical": false
  },
  {
    "date": "2026-06-17",
    "median": 25305.31688766188,
    "p50": 25305.31688766188,
    "p05": 22774.785198895694,
    "p95": 27835.84857642807,
    "isHistorical": false
  },
  {
    "date": "2026-06-18",
    "median": 25271.91747073338,
    "p50": 25271.91747073338,
    "p05": 22744.72572366004,
    "p95": 27799.10921780672,
    "isHistorical": false
  },
  {
    "date": "2026-06-19",
    "median": 25371.789015493192,
    "p50": 25371.789015493192,
    "p05": 22834.610113943872,
    "p95": 27908.967917042515,
    "isHistorical": false
  },
  {
    "date": "2026-06-20",
    "median": 25344.074942895313,
    "p50": 25344.074942895313,
    "p05": 22809.667448605782,
    "p95": 27878.482437184848,
    "isHistorical": false
  },
  {
    "date": "2026-06-21",
    "median": 25466.70955619407,
    "p50": 25466.70955619407,
    "p05": 22920.038600574662,
    "p95": 28013.38051181348,
    "isHistorical": false
  },
  {
    "date": "2026-06-22",
    "median": 25514.014466803652,
    "p50": 25514.014466803652,
    "p05": 22962.613020123288,
    "p95": 28065.41591348402,
    "isHistorical": false
  },
  {
    "date": "2026-06-23",
    "median": 25506.454439257628,
    "p50": 25506.454439257628,
    "p05": 22955.808995331867,
    "p95": 28057.099883183393,
    "isHistorical": false
  },
  {
    "date": "2026-06-24",
    "median": 25486.216514687687,
    "p50": 25486.216514687687,
    "p05": 22937.594863218917,
    "p95": 28034.838166156456,
    "isHistorical": false
  },
  {
    "date": "2026-06-25",
    "median": 25387.83911399666,
    "p50": 25387.83911399666,
    "p05": 22849.055202596992,
    "p95": 27926.623025396326,
    "isHistorical": false
  },
  {
    "date": "2026-06-26",
    "median": 25360.565149266447,
    "p50": 25360.565149266447,
    "p05": 22824.508634339803,
    "p95": 27896.621664193095,
    "isHistorical": false
  },
  {
    "date": "2026-06-27",
    "median": 25470.930681669197,
    "p50": 25470.930681669197,
    "p05": 22923.837613502277,
    "p95": 28018.02374983612,
    "isHistorical": false
  },
  {
    "date": "2026-06-28",
    "median": 25611.521228039182,
    "p50": 25611.521228039182,
    "p05": 23050.369105235266,
    "p95": 28172.673350843103,
    "isHistorical": false
  },
  {
    "date": "2026-06-29",
    "median": 25565.900512587083,
    "p50": 25565.900512587083,
    "p05": 23009.310461328376,
    "p95": 28122.490563845793,
    "isHistorical": false
  },
  {
    "date": "2026-06-30",
    "median": 25677.910287922663,
    "p50": 25677.910287922663,
    "p05": 23110.1192591304,
    "p95": 28245.70131671493,
    "isHistorical": false
  },
  {
    "date": "2026-07-01",
    "median": 25819.248057992434,
    "p50": 25819.248057992434,
    "p05": 23237.32325219319,
    "p95": 28401.17286379168,
    "isHistorical": false
  },
  {
    "date": "2026-07-02",
    "median": 25829.26224356189,
    "p50": 25829.26224356189,
    "p05": 23246.3360192057,
    "p95": 28412.18846791808,
    "isHistorical": false
  },
  {
    "date": "2026-07-03",
    "median": 25825.64633175365,
    "p50": 25825.64633175365,
    "p05": 23243.081698578288,
    "p95": 28408.210964929018,
    "isHistorical": false
  },
  {
    "date": "2026-07-04",
    "median": 25952.78176842797,
    "p50": 25952.78176842797,
    "p05": 23357.503591585173,
    "p95": 28548.05994527077,
    "isHistorical": false
  },
  {
    "date": "2026-07-05",
    "median": 26078.541664355143,
    "p50": 26078.541664355143,
    "p05": 23470.68749791963,
    "p95": 28686.39583079066,
    "isHistorical": false
  },
  {
    "date": "2026-07-06",
    "median": 26019.431065210287,
    "p50": 26019.431065210287,
    "p05": 23417.48795868926,
    "p95": 28621.374171731317,
    "isHistorical": false
  },
  {
    "date": "2026-07-07",
    "median": 26145.510021856404,
    "p50": 26145.510021856404,
    "p05": 23530.959019670765,
    "p95": 28760.061024042046,
    "isHistorical": false
  },
  {
    "date": "2026-07-08",
    "median": 26283.415195266214,
    "p50": 26283.415195266214,
    "p05": 23655.073675739593,
    "p95": 28911.75671479284,
    "isHistorical": false
  },
  {
    "date": "2026-07-09",
    "median": 26316.891057337805,
    "p50": 26316.891057337805,
    "p05": 23685.201951604024,
    "p95": 28948.580163071587,
    "isHistorical": false
  },
  {
    "date": "2026-07-10",
    "median": 26421.59635936704,
    "p50": 26421.59635936704,
    "p05": 23779.436723430335,
    "p95": 29063.755995303745,
    "isHistorical": false
  }
];

export const MOCK_MONTE_CARLO: MonteCarloResult[] = [
  {
    scenarioId: 'S01',
    nSimulations: 1000,
    uncertaintyPct: 0.20,
    results: [
      {
        kpiId: 'FIN01', kpiName: 'Service Revenue', unit: 'GHSm',
        baseValue: 24400, p05: 19250, p25: 21900, p50: 24400, p75: 26900, p95: 29550,
        mean: 24400, std: 3150, worstCase: 17500, bestCase: 32000,
      },
      {
        kpiId: 'FIN02', kpiName: 'EBITDA', unit: 'GHSm',
        baseValue: 14664, p05: 11550, p25: 13100, p50: 14664, p75: 16200, p95: 17800,
        mean: 14664, std: 1900, worstCase: 10500, bestCase: 19200,
      },
    ],
  },
];

export const MOCK_BRIEFS: BoardBrief[] = [
  {
    "id": "B01",
    "title": "Cedi Devaluation Impact",
    "scenarioIds": [
      "S01"
    ],
    "status": "Ready",
    "generatedAt": "2026-06-05T10:00:00Z",
    "severityScore": 4.2,
    "estimatedImpact": {
      "currency": "GHS",
      "magnitude": 450,
      "unit": "M"
    },
    "executiveSummary": "A 25% devaluation of the cedi significantly increases opex and capex costs.",
    "keyKpiImpacts": [
      {
        "kpiId": "FIN02",
        "narrative": "EBITDA drops 20%"
      }
    ],
    "calibrationNotes": "Calibrated against FY22 crisis",
    "recommendedActions": [
      "Hedge USD exposure"
    ],
    "keyEntities": [
      "BoG",
      "Ministry of Finance"
    ]
  },
  {
    "id": "B02",
    "title": "Regulatory E-Levy Hike",
    "scenarioIds": [
      "S03"
    ],
    "status": "Ready",
    "generatedAt": "2026-06-06T11:00:00Z",
    "severityScore": 3.8,
    "estimatedImpact": {
      "currency": "GHS",
      "magnitude": 250,
      "unit": "M"
    },
    "executiveSummary": "E-levy increase suppresses MoMo velocity.",
    "keyKpiImpacts": [
      {
        "kpiId": "SEG03",
        "narrative": "MoMo revenue drops 25%"
      }
    ],
    "calibrationNotes": "Calibrated against 2022 implementation",
    "recommendedActions": [
      "Launch merchant incentives"
    ],
    "keyEntities": [
      "GRA"
    ]
  },
  {
    "id": "B03",
    "title": "Major Cyber Breach",
    "scenarioIds": [
      "S06"
    ],
    "status": "Generating",
    "generatedAt": "2026-06-10T08:00:00Z",
    "severityScore": 4.8,
    "estimatedImpact": {
      "currency": "GHS",
      "magnitude": 1.2,
      "unit": "Bn"
    },
    "executiveSummary": "",
    "keyKpiImpacts": [],
    "calibrationNotes": "",
    "recommendedActions": [],
    "keyEntities": []
  },
  {
    "id": "B04",
    "title": "Inflation Spike 25%",
    "scenarioIds": [
      "S02"
    ],
    "status": "Ready",
    "generatedAt": "2026-06-09T09:00:00Z",
    "severityScore": 3.5,
    "estimatedImpact": {
      "currency": "GHS",
      "magnitude": 150,
      "unit": "M"
    },
    "executiveSummary": "Inflation reduces real ARPU.",
    "keyKpiImpacts": [
      {
        "kpiId": "OPS04",
        "narrative": "ARPU drops"
      }
    ],
    "calibrationNotes": "",
    "recommendedActions": [
      "Adjust tariffs"
    ],
    "keyEntities": [
      "NCA"
    ]
  },
  {
    "id": "B05",
    "title": "Data Privacy Fine",
    "scenarioIds": [
      "S31"
    ],
    "status": "Failed",
    "generatedAt": "2026-06-10T07:00:00Z",
    "severityScore": 0,
    "estimatedImpact": {
      "currency": "GHS",
      "magnitude": 0,
      "unit": "M"
    },
    "executiveSummary": "Failed to generate.",
    "keyKpiImpacts": [],
    "calibrationNotes": "",
    "recommendedActions": [],
    "keyEntities": []
  }
];

export const MOCK_PIPELINE_HEALTH: PipelineHealth = {
  "status": "Healthy",
  "lastBeatAt": "2026-06-10T09:09:59.407479",
  "sources": [
    {
      "name": "MTN Investor Relations",
      "status": "Healthy",
      "latencyMs": 150,
      "lastSyncAt": "2026-06-10T09:09:59.407479"
    },
    {
      "name": "BoG",
      "status": "Healthy",
      "latencyMs": 220,
      "lastSyncAt": "2026-06-10T09:09:59.407479"
    },
    {
      "name": "NCA",
      "status": "Healthy",
      "latencyMs": 180,
      "lastSyncAt": "2026-06-10T09:09:59.407479"
    },
    {
      "name": "GSE",
      "status": "Degraded",
      "latencyMs": 850,
      "lastSyncAt": "2026-06-10T09:09:59.407479"
    },
    {
      "name": "Anthropic API",
      "status": "Healthy",
      "latencyMs": 400,
      "lastSyncAt": "2026-06-10T09:09:59.407479"
    }
  ]
};

export const MOCK_QUARTERLY: Record<KpiId, Array<{quarter: string; value: number}>> = {
  "FIN01": [
    {
      "quarter": "FY20Q1",
      "value": 11952.945454051707
    },
    {
      "quarter": "FY20Q2",
      "value": 12068.25878898079
    },
    {
      "quarter": "FY20Q3",
      "value": 13061.027242297818
    },
    {
      "quarter": "FY20Q4",
      "value": 12860.944041144638
    },
    {
      "quarter": "FY21Q1",
      "value": 12253.755925086698
    },
    {
      "quarter": "FY21Q2",
      "value": 13095.395111887257
    },
    {
      "quarter": "FY21Q3",
      "value": 14204.644849822063
    },
    {
      "quarter": "FY21Q4",
      "value": 15355.849732418068
    },
    {
      "quarter": "FY22Q1",
      "value": 16020.628744421654
    },
    {
      "quarter": "FY22Q2",
      "value": 15536.290054753677
    },
    {
      "quarter": "FY22Q3",
      "value": 13429.96252496312
    },
    {
      "quarter": "FY22Q4",
      "value": 10250.691752244176
    },
    {
      "quarter": "FY23Q1",
      "value": 11233.790572969794
    },
    {
      "quarter": "FY23Q2",
      "value": 11892.531451397292
    },
    {
      "quarter": "FY23Q3",
      "value": 12636.196390436175
    },
    {
      "quarter": "FY23Q4",
      "value": 12316.463326094505
    },
    {
      "quarter": "FY24Q1",
      "value": 12145.158731471773
    },
    {
      "quarter": "FY24Q2",
      "value": 11926.915895600065
    },
    {
      "quarter": "FY24Q3",
      "value": 12216.130139908897
    },
    {
      "quarter": "FY24Q4",
      "value": 12533.28952698352
    },
    {
      "quarter": "FY25Q1",
      "value": 12587.12083492195
    },
    {
      "quarter": "FY25Q2",
      "value": 13181.810226152898
    },
    {
      "quarter": "FY25Q3",
      "value": 14296.340705394174
    },
    {
      "quarter": "FY25Q4",
      "value": 15057.945888573988
    }
  ],
  "FIN02": [
    {
      "quarter": "FY20Q1",
      "value": 7745.939981830601
    },
    {
      "quarter": "FY20Q2",
      "value": 7399.270770371401
    },
    {
      "quarter": "FY20Q3",
      "value": 7674.152361078532
    },
    {
      "quarter": "FY20Q4",
      "value": 8373.860409855155
    },
    {
      "quarter": "FY21Q1",
      "value": 8948.099148438916
    },
    {
      "quarter": "FY21Q2",
      "value": 9155.802338813952
    },
    {
      "quarter": "FY21Q3",
      "value": 8820.013706288066
    },
    {
      "quarter": "FY21Q4",
      "value": 9112.354320940094
    },
    {
      "quarter": "FY22Q1",
      "value": 8663.945491445935
    },
    {
      "quarter": "FY22Q2",
      "value": 9324.592659252045
    },
    {
      "quarter": "FY22Q3",
      "value": 7116.872574090459
    },
    {
      "quarter": "FY22Q4",
      "value": 5773.031885291723
    },
    {
      "quarter": "FY23Q1",
      "value": 5682.293688402448
    },
    {
      "quarter": "FY23Q2",
      "value": 5959.2637661934
    },
    {
      "quarter": "FY23Q3",
      "value": 6458.184395796314
    },
    {
      "quarter": "FY23Q4",
      "value": 6763.291396789461
    },
    {
      "quarter": "FY24Q1",
      "value": 6551.4614904572945
    },
    {
      "quarter": "FY24Q2",
      "value": 6784.683902405761
    },
    {
      "quarter": "FY24Q3",
      "value": 7242.679664148457
    },
    {
      "quarter": "FY24Q4",
      "value": 7424.749393090009
    },
    {
      "quarter": "FY25Q1",
      "value": 7419.903180568766
    },
    {
      "quarter": "FY25Q2",
      "value": 7410.226301518538
    },
    {
      "quarter": "FY25Q3",
      "value": 8087.653276468052
    },
    {
      "quarter": "FY25Q4",
      "value": 8836.275092761227
    }
  ],
  "FIN03": [
    {
      "quarter": "FY20Q1",
      "value": 28.56410197924952
    },
    {
      "quarter": "FY20Q2",
      "value": 27.84197843844672
    },
    {
      "quarter": "FY20Q3",
      "value": 29.866022562213274
    },
    {
      "quarter": "FY20Q4",
      "value": 32.30467549953096
    },
    {
      "quarter": "FY21Q1",
      "value": 35.178828395820965
    },
    {
      "quarter": "FY21Q2",
      "value": 35.00465858022298
    },
    {
      "quarter": "FY21Q3",
      "value": 38.12590408910318
    },
    {
      "quarter": "FY21Q4",
      "value": 39.0186016744448
    },
    {
      "quarter": "FY22Q1",
      "value": 41.81755331959316
    },
    {
      "quarter": "FY22Q2",
      "value": 44.031189790438745
    },
    {
      "quarter": "FY22Q3",
      "value": 45.00808890536121
    },
    {
      "quarter": "FY22Q4",
      "value": 45.286175710071355
    },
    {
      "quarter": "FY23Q1",
      "value": 43.90063179847003
    },
    {
      "quarter": "FY23Q2",
      "value": 48.09123826844028
    },
    {
      "quarter": "FY23Q3",
      "value": 46.84978515871973
    },
    {
      "quarter": "FY23Q4",
      "value": 49.86544913087273
    },
    {
      "quarter": "FY24Q1",
      "value": 48.6895384310845
    },
    {
      "quarter": "FY24Q2",
      "value": 50.79196826937158
    },
    {
      "quarter": "FY24Q3",
      "value": 50.13012289780878
    },
    {
      "quarter": "FY24Q4",
      "value": 49.24098976129894
    },
    {
      "quarter": "FY25Q1",
      "value": 48.22790699381056
    },
    {
      "quarter": "FY25Q2",
      "value": 50.38399351240154
    },
    {
      "quarter": "FY25Q3",
      "value": 49.83441905276509
    },
    {
      "quarter": "FY25Q4",
      "value": 54.26221681648137
    }
  ],
  "FIN04": [
    {
      "quarter": "FY20Q1",
      "value": 4034.5129787989767
    },
    {
      "quarter": "FY20Q2",
      "value": 4215.076222802686
    },
    {
      "quarter": "FY20Q3",
      "value": 4116.092681441358
    },
    {
      "quarter": "FY20Q4",
      "value": 4370.499984627306
    },
    {
      "quarter": "FY21Q1",
      "value": 4297.3725114409235
    },
    {
      "quarter": "FY21Q2",
      "value": 4114.329885672447
    },
    {
      "quarter": "FY21Q3",
      "value": 4490.015024440016
    },
    {
      "quarter": "FY21Q4",
      "value": 4472.865403778778
    },
    {
      "quarter": "FY22Q1",
      "value": 4382.112461657422
    },
    {
      "quarter": "FY22Q2",
      "value": 4230.980643796639
    },
    {
      "quarter": "FY22Q3",
      "value": 4595.214091124237
    },
    {
      "quarter": "FY22Q4",
      "value": 4686.311693045655
    },
    {
      "quarter": "FY23Q1",
      "value": 4867.756429205051
    },
    {
      "quarter": "FY23Q2",
      "value": 5211.227490609887
    },
    {
      "quarter": "FY23Q3",
      "value": 5690.225850116373
    },
    {
      "quarter": "FY23Q4",
      "value": 5876.492014967269
    },
    {
      "quarter": "FY24Q1",
      "value": 5664.196419110204
    },
    {
      "quarter": "FY24Q2",
      "value": 5560.843907992998
    },
    {
      "quarter": "FY24Q3",
      "value": 5498.738822185235
    },
    {
      "quarter": "FY24Q4",
      "value": 5527.279607534662
    },
    {
      "quarter": "FY25Q1",
      "value": 5526.5378416877875
    },
    {
      "quarter": "FY25Q2",
      "value": 5914.595324894294
    },
    {
      "quarter": "FY25Q3",
      "value": 6139.318137154976
    },
    {
      "quarter": "FY25Q4",
      "value": 6725.07648943876
    }
  ],
  "FIN05": [
    {
      "quarter": "FY20Q1",
      "value": 16.46393664005018
    },
    {
      "quarter": "FY20Q2",
      "value": 18.047891415821926
    },
    {
      "quarter": "FY20Q3",
      "value": 18.821668062375114
    },
    {
      "quarter": "FY20Q4",
      "value": 20.045424226362087
    },
    {
      "quarter": "FY21Q1",
      "value": 20.777708005662245
    },
    {
      "quarter": "FY21Q2",
      "value": 19.95394080092191
    },
    {
      "quarter": "FY21Q3",
      "value": 19.580991468466664
    },
    {
      "quarter": "FY21Q4",
      "value": 19.609363498471897
    },
    {
      "quarter": "FY22Q1",
      "value": 19.421133992705016
    },
    {
      "quarter": "FY22Q2",
      "value": 18.468843404324122
    },
    {
      "quarter": "FY22Q3",
      "value": 18.8939943576309
    },
    {
      "quarter": "FY22Q4",
      "value": 18.78994374926763
    },
    {
      "quarter": "FY23Q1",
      "value": 20.101923179425434
    },
    {
      "quarter": "FY23Q2",
      "value": 19.664667632489447
    },
    {
      "quarter": "FY23Q3",
      "value": 20.818932341732324
    },
    {
      "quarter": "FY23Q4",
      "value": 20.301804879034353
    },
    {
      "quarter": "FY24Q1",
      "value": 20.142939705200856
    },
    {
      "quarter": "FY24Q2",
      "value": 21.982904666878294
    },
    {
      "quarter": "FY24Q3",
      "value": 21.515572114749656
    },
    {
      "quarter": "FY24Q4",
      "value": 22.39460424977361
    },
    {
      "quarter": "FY25Q1",
      "value": 23.041713933488307
    },
    {
      "quarter": "FY25Q2",
      "value": 23.412216387283994
    },
    {
      "quarter": "FY25Q3",
      "value": 25.552377546582388
    },
    {
      "quarter": "FY25Q4",
      "value": 26.194106552933405
    }
  ],
  "FIN06": [
    {
      "quarter": "FY20Q1",
      "value": 19.548918064014845
    },
    {
      "quarter": "FY20Q2",
      "value": 19.051563911610376
    },
    {
      "quarter": "FY20Q3",
      "value": 20.165297509150346
    },
    {
      "quarter": "FY20Q4",
      "value": 21.540824077631147
    },
    {
      "quarter": "FY21Q1",
      "value": 21.99686117972389
    },
    {
      "quarter": "FY21Q2",
      "value": 23.133680804540784
    },
    {
      "quarter": "FY21Q3",
      "value": 22.21109799912981
    },
    {
      "quarter": "FY21Q4",
      "value": 22.092263057112703
    },
    {
      "quarter": "FY22Q1",
      "value": 23.96632527316283
    },
    {
      "quarter": "FY22Q2",
      "value": 25.829912367451744
    },
    {
      "quarter": "FY22Q3",
      "value": 25.31993877965995
    },
    {
      "quarter": "FY22Q4",
      "value": 27.100791973776385
    },
    {
      "quarter": "FY23Q1",
      "value": 27.169878229263407
    },
    {
      "quarter": "FY23Q2",
      "value": 27.58971785852751
    },
    {
      "quarter": "FY23Q3",
      "value": 27.789871290388
    },
    {
      "quarter": "FY23Q4",
      "value": 26.450974026842346
    },
    {
      "quarter": "FY24Q1",
      "value": 26.838561231050885
    },
    {
      "quarter": "FY24Q2",
      "value": 26.216192682607115
    },
    {
      "quarter": "FY24Q3",
      "value": 26.02520020100382
    },
    {
      "quarter": "FY24Q4",
      "value": 27.850375469954113
    },
    {
      "quarter": "FY25Q1",
      "value": 27.899903562523075
    },
    {
      "quarter": "FY25Q2",
      "value": 26.80526968681583
    },
    {
      "quarter": "FY25Q3",
      "value": 27.748946412215417
    },
    {
      "quarter": "FY25Q4",
      "value": 29.981915880181266
    }
  ],
  "SEG01": [
    {
      "quarter": "FY20Q1",
      "value": 4558.754882218482
    },
    {
      "quarter": "FY20Q2",
      "value": 4797.704561638228
    },
    {
      "quarter": "FY20Q3",
      "value": 5218.943317752875
    },
    {
      "quarter": "FY20Q4",
      "value": 5717.441623745714
    },
    {
      "quarter": "FY21Q1",
      "value": 5699.885192562887
    },
    {
      "quarter": "FY21Q2",
      "value": 5453.209255223016
    },
    {
      "quarter": "FY21Q3",
      "value": 5360.216224735182
    },
    {
      "quarter": "FY21Q4",
      "value": 5747.636335338982
    },
    {
      "quarter": "FY22Q1",
      "value": 5665.298539141606
    },
    {
      "quarter": "FY22Q2",
      "value": 5955.664348909865
    },
    {
      "quarter": "FY22Q3",
      "value": 6410.915433597907
    },
    {
      "quarter": "FY22Q4",
      "value": 7022.371557480094
    },
    {
      "quarter": "FY23Q1",
      "value": 7329.056311922615
    },
    {
      "quarter": "FY23Q2",
      "value": 7169.948586590958
    },
    {
      "quarter": "FY23Q3",
      "value": 7424.690155610603
    },
    {
      "quarter": "FY23Q4",
      "value": 7769.690314215649
    },
    {
      "quarter": "FY24Q1",
      "value": 7961.372005756663
    },
    {
      "quarter": "FY24Q2",
      "value": 8675.00150177954
    },
    {
      "quarter": "FY24Q3",
      "value": 9247.524866685446
    },
    {
      "quarter": "FY24Q4",
      "value": 9048.956466987805
    },
    {
      "quarter": "FY25Q1",
      "value": 8958.704453079012
    },
    {
      "quarter": "FY25Q2",
      "value": 8768.142418935757
    },
    {
      "quarter": "FY25Q3",
      "value": 8476.789883531015
    },
    {
      "quarter": "FY25Q4",
      "value": 8584.327227660544
    }
  ],
  "SEG03": [
    {
      "quarter": "FY20Q1",
      "value": 2983.7436303165146
    },
    {
      "quarter": "FY20Q2",
      "value": 3116.2260126409838
    },
    {
      "quarter": "FY20Q3",
      "value": 3380.3524517283013
    },
    {
      "quarter": "FY20Q4",
      "value": 3647.747455471024
    },
    {
      "quarter": "FY21Q1",
      "value": 3649.272096618173
    },
    {
      "quarter": "FY21Q2",
      "value": 3631.5579373843907
    },
    {
      "quarter": "FY21Q3",
      "value": 3921.359173930559
    },
    {
      "quarter": "FY21Q4",
      "value": 4036.734540881888
    },
    {
      "quarter": "FY22Q1",
      "value": 4153.4530927916
    },
    {
      "quarter": "FY22Q2",
      "value": 4235.9160940738275
    },
    {
      "quarter": "FY22Q3",
      "value": 4054.8618583004204
    },
    {
      "quarter": "FY22Q4",
      "value": 3908.1413546780655
    },
    {
      "quarter": "FY23Q1",
      "value": 3962.694573660869
    },
    {
      "quarter": "FY23Q2",
      "value": 4319.808765546598
    },
    {
      "quarter": "FY23Q3",
      "value": 4668.941519474054
    },
    {
      "quarter": "FY23Q4",
      "value": 4575.794245843655
    },
    {
      "quarter": "FY24Q1",
      "value": 4783.467108656269
    },
    {
      "quarter": "FY24Q2",
      "value": 4613.389787110503
    },
    {
      "quarter": "FY24Q3",
      "value": 4585.87415205003
    },
    {
      "quarter": "FY24Q4",
      "value": 4470.069918548764
    },
    {
      "quarter": "FY25Q1",
      "value": 4767.75552674181
    },
    {
      "quarter": "FY25Q2",
      "value": 5023.301775687231
    },
    {
      "quarter": "FY25Q3",
      "value": 5388.363273497176
    },
    {
      "quarter": "FY25Q4",
      "value": 5751.173927607885
    }
  ],
  "OPS01": [
    {
      "quarter": "FY20Q1",
      "value": 15.214249411465802
    },
    {
      "quarter": "FY20Q2",
      "value": 16.367818124751977
    },
    {
      "quarter": "FY20Q3",
      "value": 16.099366153560126
    },
    {
      "quarter": "FY20Q4",
      "value": 16.158347692866055
    },
    {
      "quarter": "FY21Q1",
      "value": 16.830132143177227
    },
    {
      "quarter": "FY21Q2",
      "value": 17.11787267175476
    },
    {
      "quarter": "FY21Q3",
      "value": 16.90722652895695
    },
    {
      "quarter": "FY21Q4",
      "value": 18.313471141214812
    },
    {
      "quarter": "FY22Q1",
      "value": 17.840506281527976
    },
    {
      "quarter": "FY22Q2",
      "value": 16.98413317308086
    },
    {
      "quarter": "FY22Q3",
      "value": 17.417014823434744
    },
    {
      "quarter": "FY22Q4",
      "value": 18.360649974393116
    },
    {
      "quarter": "FY23Q1",
      "value": 18.91073587684223
    },
    {
      "quarter": "FY23Q2",
      "value": 18.37139826709542
    },
    {
      "quarter": "FY23Q3",
      "value": 19.57681214115626
    },
    {
      "quarter": "FY23Q4",
      "value": 19.149049238230923
    },
    {
      "quarter": "FY24Q1",
      "value": 18.263158794297244
    },
    {
      "quarter": "FY24Q2",
      "value": 19.288148640754027
    },
    {
      "quarter": "FY24Q3",
      "value": 18.514485295551733
    },
    {
      "quarter": "FY24Q4",
      "value": 18.27176360578019
    },
    {
      "quarter": "FY25Q1",
      "value": 19.69274272770431
    },
    {
      "quarter": "FY25Q2",
      "value": 19.710956672144015
    },
    {
      "quarter": "FY25Q3",
      "value": 19.540245498578322
    },
    {
      "quarter": "FY25Q4",
      "value": 18.871684115133675
    }
  ],
  "OPS04": [
    {
      "quarter": "FY20Q1",
      "value": 34.93755933487176
    },
    {
      "quarter": "FY20Q2",
      "value": 37.85032226804678
    },
    {
      "quarter": "FY20Q3",
      "value": 36.68932092751314
    },
    {
      "quarter": "FY20Q4",
      "value": 39.480918223247315
    },
    {
      "quarter": "FY21Q1",
      "value": 37.82103592336123
    },
    {
      "quarter": "FY21Q2",
      "value": 38.14801063535563
    },
    {
      "quarter": "FY21Q3",
      "value": 37.058948633261636
    },
    {
      "quarter": "FY21Q4",
      "value": 35.72071830174833
    },
    {
      "quarter": "FY22Q1",
      "value": 35.497298847884345
    },
    {
      "quarter": "FY22Q2",
      "value": 36.48858910339797
    },
    {
      "quarter": "FY22Q3",
      "value": 38.227516014592204
    },
    {
      "quarter": "FY22Q4",
      "value": 41.51437443008487
    },
    {
      "quarter": "FY23Q1",
      "value": 42.366257460469555
    },
    {
      "quarter": "FY23Q2",
      "value": 44.62105222004192
    },
    {
      "quarter": "FY23Q3",
      "value": 43.02857321445267
    },
    {
      "quarter": "FY23Q4",
      "value": 46.906819582708124
    },
    {
      "quarter": "FY24Q1",
      "value": 45.68343794787578
    },
    {
      "quarter": "FY24Q2",
      "value": 48.704892233226275
    },
    {
      "quarter": "FY24Q3",
      "value": 47.71386368223213
    },
    {
      "quarter": "FY24Q4",
      "value": 48.309989103236205
    },
    {
      "quarter": "FY25Q1",
      "value": 50.61437137748695
    },
    {
      "quarter": "FY25Q2",
      "value": 51.397449156759194
    },
    {
      "quarter": "FY25Q3",
      "value": 54.56564121952234
    },
    {
      "quarter": "FY25Q4",
      "value": 56.08487490734293
    }
  ],
  "OPS07": [
    {
      "quarter": "FY20Q1",
      "value": 53.77392717960032
    },
    {
      "quarter": "FY20Q2",
      "value": 56.701050545215715
    },
    {
      "quarter": "FY20Q3",
      "value": 57.4652912184978
    },
    {
      "quarter": "FY20Q4",
      "value": 57.26094587069739
    },
    {
      "quarter": "FY21Q1",
      "value": 56.82860284186801
    },
    {
      "quarter": "FY21Q2",
      "value": 60.70568163501312
    },
    {
      "quarter": "FY21Q3",
      "value": 64.90131580878669
    },
    {
      "quarter": "FY21Q4",
      "value": 67.0004785398376
    },
    {
      "quarter": "FY22Q1",
      "value": 65.80270627367052
    },
    {
      "quarter": "FY22Q2",
      "value": 64.21732641644977
    },
    {
      "quarter": "FY22Q3",
      "value": 66.78362126669612
    },
    {
      "quarter": "FY22Q4",
      "value": 70.6801568830705
    },
    {
      "quarter": "FY23Q1",
      "value": 76.44221858270816
    },
    {
      "quarter": "FY23Q2",
      "value": 72.86976244029506
    },
    {
      "quarter": "FY23Q3",
      "value": 75.0826765707818
    },
    {
      "quarter": "FY23Q4",
      "value": 81.06347853764241
    },
    {
      "quarter": "FY24Q1",
      "value": 81.99977068190682
    },
    {
      "quarter": "FY24Q2",
      "value": 83.46995134756078
    },
    {
      "quarter": "FY24Q3",
      "value": 79.40079652085184
    },
    {
      "quarter": "FY24Q4",
      "value": 78.51854514981645
    },
    {
      "quarter": "FY25Q1",
      "value": 75.67467694044814
    },
    {
      "quarter": "FY25Q2",
      "value": 76.27119489698106
    },
    {
      "quarter": "FY25Q3",
      "value": 79.22370293779558
    },
    {
      "quarter": "FY25Q4",
      "value": 81.48690948050738
    }
  ],
  "EXT01": [
    {
      "quarter": "FY20Q1",
      "value": 2.7027283570823606
    },
    {
      "quarter": "FY20Q2",
      "value": 2.8154540141100726
    },
    {
      "quarter": "FY20Q3",
      "value": 2.792998108763964
    },
    {
      "quarter": "FY20Q4",
      "value": 3.020484861642025
    },
    {
      "quarter": "FY21Q1",
      "value": 3.091706967157899
    },
    {
      "quarter": "FY21Q2",
      "value": 2.9466831495585626
    },
    {
      "quarter": "FY21Q3",
      "value": 3.2047666124860537
    },
    {
      "quarter": "FY21Q4",
      "value": 3.399466101504427
    },
    {
      "quarter": "FY22Q1",
      "value": 3.457252914325359
    },
    {
      "quarter": "FY22Q2",
      "value": 3.6437420247994043
    },
    {
      "quarter": "FY22Q3",
      "value": 5.461341409933249
    },
    {
      "quarter": "FY22Q4",
      "value": 8.111584219021916
    },
    {
      "quarter": "FY23Q1",
      "value": 8.876935516087192
    },
    {
      "quarter": "FY23Q2",
      "value": 8.506607264917443
    },
    {
      "quarter": "FY23Q3",
      "value": 9.006992033230361
    },
    {
      "quarter": "FY23Q4",
      "value": 9.697627657917343
    },
    {
      "quarter": "FY24Q1",
      "value": 10.086583795855516
    },
    {
      "quarter": "FY24Q2",
      "value": 10.808260471440528
    },
    {
      "quarter": "FY24Q3",
      "value": 10.597243689371162
    },
    {
      "quarter": "FY24Q4",
      "value": 10.559412887403932
    },
    {
      "quarter": "FY25Q1",
      "value": 10.495384339676404
    },
    {
      "quarter": "FY25Q2",
      "value": 10.047728593077464
    },
    {
      "quarter": "FY25Q3",
      "value": 10.57659414532102
    },
    {
      "quarter": "FY25Q4",
      "value": 10.52047009299019
    }
  ],
  "EXT02": [
    {
      "quarter": "FY20Q1",
      "value": 15.258434647739618
    },
    {
      "quarter": "FY20Q2",
      "value": 15.602524651601824
    },
    {
      "quarter": "FY20Q3",
      "value": 16.991705264932502
    },
    {
      "quarter": "FY20Q4",
      "value": 17.809126416459733
    },
    {
      "quarter": "FY21Q1",
      "value": 18.843263856254712
    },
    {
      "quarter": "FY21Q2",
      "value": 18.306149288613998
    },
    {
      "quarter": "FY21Q3",
      "value": 19.43715375834805
    },
    {
      "quarter": "FY21Q4",
      "value": 19.635818222938422
    },
    {
      "quarter": "FY22Q1",
      "value": 19.95014911933228
    },
    {
      "quarter": "FY22Q2",
      "value": 21.20096737709574
    },
    {
      "quarter": "FY22Q3",
      "value": 20.663067292024596
    },
    {
      "quarter": "FY22Q4",
      "value": 22.351566691518485
    },
    {
      "quarter": "FY23Q1",
      "value": 22.47884615408941
    },
    {
      "quarter": "FY23Q2",
      "value": 24.17788833020141
    },
    {
      "quarter": "FY23Q3",
      "value": 26.06966127366966
    },
    {
      "quarter": "FY23Q4",
      "value": 27.793627466126935
    },
    {
      "quarter": "FY24Q1",
      "value": 26.810544628491897
    },
    {
      "quarter": "FY24Q2",
      "value": 28.369219820607295
    },
    {
      "quarter": "FY24Q3",
      "value": 28.4883386595696
    },
    {
      "quarter": "FY24Q4",
      "value": 31.247305810592465
    },
    {
      "quarter": "FY25Q1",
      "value": 30.658574525041047
    },
    {
      "quarter": "FY25Q2",
      "value": 31.36077138619978
    },
    {
      "quarter": "FY25Q3",
      "value": 29.925884597392237
    },
    {
      "quarter": "FY25Q4",
      "value": 30.01872838961289
    }
  ],
  "EXT03": [
    {
      "quarter": "FY20Q1",
      "value": 6.176139215962865
    },
    {
      "quarter": "FY20Q2",
      "value": 5.894557371979545
    },
    {
      "quarter": "FY20Q3",
      "value": 5.989512286783434
    },
    {
      "quarter": "FY20Q4",
      "value": 5.9111978956223785
    },
    {
      "quarter": "FY21Q1",
      "value": 5.645892428841534
    },
    {
      "quarter": "FY21Q2",
      "value": 5.676869332058349
    },
    {
      "quarter": "FY21Q3",
      "value": 5.677238877764298
    },
    {
      "quarter": "FY21Q4",
      "value": 6.069285689971937
    },
    {
      "quarter": "FY22Q1",
      "value": 6.5683219422274
    },
    {
      "quarter": "FY22Q2",
      "value": 7.153047666372954
    },
    {
      "quarter": "FY22Q3",
      "value": 10.557449211888827
    },
    {
      "quarter": "FY22Q4",
      "value": 15.56976956484434
    },
    {
      "quarter": "FY23Q1",
      "value": 16.764866972121705
    },
    {
      "quarter": "FY23Q2",
      "value": 17.824402916838952
    },
    {
      "quarter": "FY23Q3",
      "value": 18.60115419924038
    },
    {
      "quarter": "FY23Q4",
      "value": 19.791411997972393
    },
    {
      "quarter": "FY24Q1",
      "value": 20.597863343761222
    },
    {
      "quarter": "FY24Q2",
      "value": 20.256817346390285
    },
    {
      "quarter": "FY24Q3",
      "value": 20.943760205273936
    },
    {
      "quarter": "FY24Q4",
      "value": 22.08217820666549
    },
    {
      "quarter": "FY25Q1",
      "value": 21.811958953511436
    },
    {
      "quarter": "FY25Q2",
      "value": 21.431694125799915
    },
    {
      "quarter": "FY25Q3",
      "value": 21.862443320112515
    },
    {
      "quarter": "FY25Q4",
      "value": 21.486147131372604
    }
  ]
};

export const MOCK_MONTHLY: Partial<Record<KpiId, Array<{month: string; value: number}>>> = {
  "OPS01": [
    {
      "month": "Jul 2023",
      "value": 25.222243268331052
    },
    {
      "month": "Aug 2023",
      "value": 25.52691646445097
    },
    {
      "month": "Sep 2023",
      "value": 25.33631479985288
    },
    {
      "month": "Oct 2023",
      "value": 26.092567816295848
    },
    {
      "month": "Nov 2023",
      "value": 25.621195008452787
    },
    {
      "month": "Dec 2023",
      "value": 25.119564423387313
    },
    {
      "month": "Jan 2024",
      "value": 25.70526766945174
    },
    {
      "month": "Feb 2024",
      "value": 25.71583475859648
    },
    {
      "month": "Mar 2024",
      "value": 26.31151319821885
    },
    {
      "month": "Apr 2024",
      "value": 27.592665067484713
    },
    {
      "month": "May 2024",
      "value": 27.108185773520315
    },
    {
      "month": "Jun 2024",
      "value": 27.665786778669535
    },
    {
      "month": "Jul 2024",
      "value": 27.556837678279148
    },
    {
      "month": "Aug 2024",
      "value": 28.473563106687845
    },
    {
      "month": "Sep 2024",
      "value": 29.50613416795151
    },
    {
      "month": "Oct 2024",
      "value": 29.83669247758481
    },
    {
      "month": "Nov 2024",
      "value": 30.06878160439108
    },
    {
      "month": "Dec 2024",
      "value": 30.887319717419516
    },
    {
      "month": "Jan 2025",
      "value": 32.34695337350179
    },
    {
      "month": "Feb 2025",
      "value": 32.966930589898205
    },
    {
      "month": "Mar 2025",
      "value": 34.450486484818256
    },
    {
      "month": "Apr 2025",
      "value": 34.91889110591137
    },
    {
      "month": "May 2025",
      "value": 35.10916961075467
    },
    {
      "month": "Jun 2025",
      "value": 36.50472725792536
    },
    {
      "month": "Jul 2025",
      "value": 36.42892936011527
    },
    {
      "month": "Aug 2025",
      "value": 35.98439365681763
    },
    {
      "month": "Sep 2025",
      "value": 36.002676088400705
    },
    {
      "month": "Oct 2025",
      "value": 35.7866322572785
    },
    {
      "month": "Nov 2025",
      "value": 36.34980566875028
    },
    {
      "month": "Dec 2025",
      "value": 35.81159954490925
    },
    {
      "month": "Jan 2026",
      "value": 36.99137144709943
    },
    {
      "month": "Feb 2026",
      "value": 37.876840016454786
    },
    {
      "month": "Mar 2026",
      "value": 37.18381932669453
    },
    {
      "month": "Apr 2026",
      "value": 38.12552369531358
    },
    {
      "month": "May 2026",
      "value": 38.798223618542714
    },
    {
      "month": "Jun 2026",
      "value": 40.524201672369436
    }
  ],
  "OPS04": [
    {
      "month": "Jul 2023",
      "value": 54.463118866532675
    },
    {
      "month": "Aug 2023",
      "value": 56.12317156980483
    },
    {
      "month": "Sep 2023",
      "value": 58.347901170161656
    },
    {
      "month": "Oct 2023",
      "value": 58.72219303235509
    },
    {
      "month": "Nov 2023",
      "value": 60.71755353388652
    },
    {
      "month": "Dec 2023",
      "value": 63.40673898035792
    },
    {
      "month": "Jan 2024",
      "value": 66.14430132067903
    },
    {
      "month": "Feb 2024",
      "value": 69.29473365369978
    },
    {
      "month": "Mar 2024",
      "value": 68.47446762560968
    },
    {
      "month": "Apr 2024",
      "value": 71.3758064146033
    },
    {
      "month": "May 2024",
      "value": 74.18838388313554
    },
    {
      "month": "Jun 2024",
      "value": 72.95995990703045
    },
    {
      "month": "Jul 2024",
      "value": 73.31379753907561
    },
    {
      "month": "Aug 2024",
      "value": 74.17638937874308
    },
    {
      "month": "Sep 2024",
      "value": 75.97770572570738
    },
    {
      "month": "Oct 2024",
      "value": 79.38072959188325
    },
    {
      "month": "Nov 2024",
      "value": 81.59515017858547
    },
    {
      "month": "Dec 2024",
      "value": 83.01389523267233
    },
    {
      "month": "Jan 2025",
      "value": 81.42304580004344
    },
    {
      "month": "Feb 2025",
      "value": 79.9815334268912
    },
    {
      "month": "Mar 2025",
      "value": 83.38405574121556
    },
    {
      "month": "Apr 2025",
      "value": 85.28815898040635
    },
    {
      "month": "May 2025",
      "value": 86.21041885461337
    },
    {
      "month": "Jun 2025",
      "value": 87.4522785913083
    },
    {
      "month": "Jul 2025",
      "value": 88.39320030471626
    },
    {
      "month": "Aug 2025",
      "value": 91.111529275433
    },
    {
      "month": "Sep 2025",
      "value": 91.19032584067644
    },
    {
      "month": "Oct 2025",
      "value": 89.71166027082768
    },
    {
      "month": "Nov 2025",
      "value": 89.1691071156616
    },
    {
      "month": "Dec 2025",
      "value": 92.34937501828756
    },
    {
      "month": "Jan 2026",
      "value": 95.97827721070865
    },
    {
      "month": "Feb 2026",
      "value": 97.58687491761312
    },
    {
      "month": "Mar 2026",
      "value": 97.41352950185976
    },
    {
      "month": "Apr 2026",
      "value": 97.76983789480384
    },
    {
      "month": "May 2026",
      "value": 96.28484005266915
    },
    {
      "month": "Jun 2026",
      "value": 95.8359657115436
    }
  ],
  "EXT01": [
    {
      "month": "Jul 2023",
      "value": 4.516403897922144
    },
    {
      "month": "Aug 2023",
      "value": 4.589591758702528
    },
    {
      "month": "Sep 2023",
      "value": 4.639070018472571
    },
    {
      "month": "Oct 2023",
      "value": 4.568714169882173
    },
    {
      "month": "Nov 2023",
      "value": 4.754854422361135
    },
    {
      "month": "Dec 2023",
      "value": 4.972359638810939
    },
    {
      "month": "Jan 2024",
      "value": 5.068057492112327
    },
    {
      "month": "Feb 2024",
      "value": 5.304871071042675
    },
    {
      "month": "Mar 2024",
      "value": 5.3453485898456625
    },
    {
      "month": "Apr 2024",
      "value": 5.352767318491203
    },
    {
      "month": "May 2024",
      "value": 5.457611009737809
    },
    {
      "month": "Jun 2024",
      "value": 5.400422217777266
    },
    {
      "month": "Jul 2024",
      "value": 5.62294864826608
    },
    {
      "month": "Aug 2024",
      "value": 5.60711203641858
    },
    {
      "month": "Sep 2024",
      "value": 5.606443105096639
    },
    {
      "month": "Oct 2024",
      "value": 5.552174228482352
    },
    {
      "month": "Nov 2024",
      "value": 5.815221846765621
    },
    {
      "month": "Dec 2024",
      "value": 5.843013464138483
    },
    {
      "month": "Jan 2025",
      "value": 6.032088003234573
    },
    {
      "month": "Feb 2025",
      "value": 6.198567547065803
    },
    {
      "month": "Mar 2025",
      "value": 6.099467303134857
    },
    {
      "month": "Apr 2025",
      "value": 6.3600124039455
    },
    {
      "month": "May 2025",
      "value": 6.317309031712169
    },
    {
      "month": "Jun 2025",
      "value": 6.202082707575722
    },
    {
      "month": "Jul 2025",
      "value": 6.399735432550797
    },
    {
      "month": "Aug 2025",
      "value": 6.536113533673392
    },
    {
      "month": "Sep 2025",
      "value": 6.648261405247967
    },
    {
      "month": "Oct 2025",
      "value": 6.605380487524933
    },
    {
      "month": "Nov 2025",
      "value": 6.537581667772238
    },
    {
      "month": "Dec 2025",
      "value": 6.447480511860369
    },
    {
      "month": "Jan 2026",
      "value": 6.695382829672027
    },
    {
      "month": "Feb 2026",
      "value": 6.925482568213877
    },
    {
      "month": "Mar 2026",
      "value": 7.179342351313861
    },
    {
      "month": "Apr 2026",
      "value": 7.213848236703334
    },
    {
      "month": "May 2026",
      "value": 7.261958237209279
    },
    {
      "month": "Jun 2026",
      "value": 7.425532121681387
    }
  ],
  "EXT03": [
    {
      "month": "Jul 2023",
      "value": 9.308369036437421
    },
    {
      "month": "Aug 2023",
      "value": 9.766166177666422
    },
    {
      "month": "Sep 2023",
      "value": 9.670679138824694
    },
    {
      "month": "Oct 2023",
      "value": 9.687728403211292
    },
    {
      "month": "Nov 2023",
      "value": 9.518260008187394
    },
    {
      "month": "Dec 2023",
      "value": 9.618942244279408
    },
    {
      "month": "Jan 2024",
      "value": 9.464152448987138
    },
    {
      "month": "Feb 2024",
      "value": 9.493389034266162
    },
    {
      "month": "Mar 2024",
      "value": 9.961019521812432
    },
    {
      "month": "Apr 2024",
      "value": 10.313988958932207
    },
    {
      "month": "May 2024",
      "value": 10.675821953784691
    },
    {
      "month": "Jun 2024",
      "value": 10.534205871562165
    },
    {
      "month": "Jul 2024",
      "value": 10.416155586328752
    },
    {
      "month": "Aug 2024",
      "value": 10.637166730761868
    },
    {
      "month": "Sep 2024",
      "value": 11.13033987051821
    },
    {
      "month": "Oct 2024",
      "value": 11.128684530120756
    },
    {
      "month": "Nov 2024",
      "value": 11.345790363713721
    },
    {
      "month": "Dec 2024",
      "value": 11.27336128003479
    },
    {
      "month": "Jan 2025",
      "value": 11.341307039515204
    },
    {
      "month": "Feb 2025",
      "value": 11.743008291668056
    },
    {
      "month": "Mar 2025",
      "value": 11.83756276865232
    },
    {
      "month": "Apr 2025",
      "value": 12.38812884895598
    },
    {
      "month": "May 2025",
      "value": 12.309879408583475
    },
    {
      "month": "Jun 2025",
      "value": 12.388885867510831
    },
    {
      "month": "Jul 2025",
      "value": 12.257102949967521
    },
    {
      "month": "Aug 2025",
      "value": 12.582587860039402
    },
    {
      "month": "Sep 2025",
      "value": 12.580941411629784
    },
    {
      "month": "Oct 2025",
      "value": 12.431654010422989
    },
    {
      "month": "Nov 2025",
      "value": 12.21140209934129
    },
    {
      "month": "Dec 2025",
      "value": 12.708083556503663
    },
    {
      "month": "Jan 2026",
      "value": 12.918372982415129
    },
    {
      "month": "Feb 2026",
      "value": 12.793641734396507
    },
    {
      "month": "Mar 2026",
      "value": 13.132781854922188
    },
    {
      "month": "Apr 2026",
      "value": 13.702341514971224
    },
    {
      "month": "May 2026",
      "value": 14.308836111422844
    },
    {
      "month": "Jun 2026",
      "value": 14.0373132956321
    }
  ]
};

