/* data_ecology.js — Living Beast & Craft Expansion v1.10.12
 * 80 Beast Species, 160 Materials, 80 Recipes (48 Pills + 32 Equipment).
 * Self-contained extension registered into JD.BEASTS and JD.ITEMS. */
(function(g) {
  'use strict';
  g.JD = g.JD || {};
  const JD = g.JD;

  const species = [
  {
    "id": "ECO2_BEAST_CANINE_1",
    "nameTh": "หมาป่าหมอกคราม",
    "tier": 1,
    "cp": 95,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_CANINE_A_1",
      "ECO2_MAT_CANINE_B_1"
    ],
    "terrain": "forest",
    "family": "CANINE",
    "archetype": "CANINE",
    "element": "WIND",
    "visual": {
      "body": "#718fa7",
      "accent": "#c8e9f1",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CANINE_2",
    "nameTh": "หมาป่าเงาจันทร์",
    "tier": 2,
    "cp": 215,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_CANINE_A_2",
      "ECO2_MAT_CANINE_B_2"
    ],
    "terrain": "forest",
    "family": "CANINE",
    "archetype": "CANINE",
    "element": "YIN_SHADOW",
    "visual": {
      "body": "#4a5b6d",
      "accent": "#8ba4b8",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CANINE_3",
    "nameTh": "สุนัขป่าลมกรดทักษิณ",
    "tier": 3,
    "cp": 460,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_CANINE_A_3",
      "ECO2_MAT_CANINE_B_3"
    ],
    "terrain": "plains",
    "family": "CANINE",
    "archetype": "CANINE",
    "element": "WIND",
    "visual": {
      "body": "#7d8a6e",
      "accent": "#c2d4a6",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CANINE_4",
    "nameTh": "หมาป่าโลหิตกระหายศึก",
    "tier": 4,
    "cp": 980,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_CANINE_A_4",
      "ECO2_MAT_CANINE_B_4"
    ],
    "terrain": "mountain",
    "family": "CANINE",
    "archetype": "CANINE",
    "element": "BLOOD_DEMON",
    "visual": {
      "body": "#8a3a3a",
      "accent": "#d86262",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CANINE_5",
    "nameTh": "จิ้งจอกเงินเก้าหางค้ำดึก",
    "tier": 5,
    "cp": 2500,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_CANINE_A_5",
      "ECO2_MAT_CANINE_B_5"
    ],
    "terrain": "mountain",
    "family": "CANINE",
    "archetype": "CANINE",
    "element": "ASTRAL",
    "visual": {
      "body": "#b8c4d1",
      "accent": "#f0f4f8",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CANINE_6",
    "nameTh": "ราชันย์หมาป่ากลืนตะวัน",
    "tier": 6,
    "cp": 6500,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_CANINE_A_6",
      "ECO2_MAT_CANINE_B_6"
    ],
    "terrain": "mountain",
    "family": "CANINE",
    "archetype": "CANINE",
    "element": "FIRE",
    "visual": {
      "body": "#c26127",
      "accent": "#f5b042",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_FELINE_1",
    "nameTh": "แมวป่าลายเสือหินผา",
    "tier": 1,
    "cp": 100,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_FELINE_A_1",
      "ECO2_MAT_FELINE_B_1"
    ],
    "terrain": "mountain",
    "family": "FELINE",
    "archetype": "FELINE",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#968165",
      "accent": "#d4c0a5",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_FELINE_2",
    "nameTh": "เสือดาววายุไพร",
    "tier": 2,
    "cp": 220,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_FELINE_A_2",
      "ECO2_MAT_FELINE_B_2"
    ],
    "terrain": "forest",
    "family": "FELINE",
    "archetype": "FELINE",
    "element": "WIND",
    "visual": {
      "body": "#8c9c72",
      "accent": "#c8deb0",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_FELINE_3",
    "nameTh": "พยัคฆ์เขี้ยวดาบเกราะศิลา",
    "tier": 3,
    "cp": 470,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_FELINE_A_3",
      "ECO2_MAT_FELINE_B_3"
    ],
    "terrain": "mountain",
    "family": "FELINE",
    "archetype": "FELINE",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#736d5e",
      "accent": "#a89f8b",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_FELINE_4",
    "nameTh": "เสือดาวเพลิงอสูร",
    "tier": 4,
    "cp": 1020,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_FELINE_A_4",
      "ECO2_MAT_FELINE_B_4"
    ],
    "terrain": "desert",
    "family": "FELINE",
    "archetype": "FELINE",
    "element": "FIRE",
    "visual": {
      "body": "#b5582f",
      "accent": "#fab066",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_FELINE_5",
    "nameTh": "พยัคฆ์ขาวเหมันต์ทะลวงเมฆ",
    "tier": 5,
    "cp": 2600,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_FELINE_A_5",
      "ECO2_MAT_FELINE_B_5"
    ],
    "terrain": "mountain",
    "family": "FELINE",
    "archetype": "FELINE",
    "element": "WATER_ICE",
    "visual": {
      "body": "#abbdd1",
      "accent": "#eef6fc",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_FELINE_6",
    "nameTh": "พยัคฆ์สายฟ้าทมิฬเก้าสวรรค์",
    "tier": 6,
    "cp": 7200,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_FELINE_A_6",
      "ECO2_MAT_FELINE_B_6"
    ],
    "terrain": "mountain",
    "family": "FELINE",
    "archetype": "FELINE",
    "element": "LIGHTNING",
    "visual": {
      "body": "#4a3b69",
      "accent": "#b28df7",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_URSINE_1",
    "nameTh": "หมีดำดงไผ่",
    "tier": 1,
    "cp": 110,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_URSINE_A_1",
      "ECO2_MAT_URSINE_B_1"
    ],
    "terrain": "forest",
    "family": "URSINE",
    "archetype": "URSINE",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#3c3a38",
      "accent": "#706b67",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_URSINE_2",
    "nameTh": "หมีหินผาทะลวงหุบเขา",
    "tier": 2,
    "cp": 235,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_URSINE_A_2",
      "ECO2_MAT_URSINE_B_2"
    ],
    "terrain": "mountain",
    "family": "URSINE",
    "archetype": "URSINE",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#61584c",
      "accent": "#998c7b",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_URSINE_3",
    "nameTh": "หมีเพลิงพิโรธถ้ำลาวา",
    "tier": 3,
    "cp": 485,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_URSINE_A_3",
      "ECO2_MAT_URSINE_B_3"
    ],
    "terrain": "mountain",
    "family": "URSINE",
    "archetype": "URSINE",
    "element": "FIRE",
    "visual": {
      "body": "#853e28",
      "accent": "#d66e4b",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_URSINE_4",
    "nameTh": "หมีเกราะเหล็กไหลหลังทอง",
    "tier": 4,
    "cp": 1080,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_URSINE_A_4",
      "ECO2_MAT_URSINE_B_4"
    ],
    "terrain": "mountain",
    "family": "URSINE",
    "archetype": "URSINE",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#575b63",
      "accent": "#e6be43",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_URSINE_5",
    "nameTh": "หมีพายุหิมะโบราณ",
    "tier": 5,
    "cp": 2650,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_URSINE_A_5",
      "ECO2_MAT_URSINE_B_5"
    ],
    "terrain": "mountain",
    "family": "URSINE",
    "archetype": "URSINE",
    "element": "WATER_ICE",
    "visual": {
      "body": "#a6becc",
      "accent": "#e8f3f7",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_URSINE_6",
    "nameTh": "ราชันย์หมีปฐพีสะเทือนฟ้า",
    "tier": 6,
    "cp": 7500,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_URSINE_A_6",
      "ECO2_MAT_URSINE_B_6"
    ],
    "terrain": "mountain",
    "family": "URSINE",
    "archetype": "URSINE",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#57422f",
      "accent": "#cfa878",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_BOAR_1",
    "nameTh": "หมูป่าเขี้ยวสั้นหน้าผา",
    "tier": 1,
    "cp": 105,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_BOAR_A_1",
      "ECO2_MAT_BOAR_B_1"
    ],
    "terrain": "plains",
    "family": "BOAR",
    "archetype": "BOAR",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#736151",
      "accent": "#b59e89",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_BOAR_2",
    "nameTh": "หมูป่าเกราะหนามโลหะ",
    "tier": 2,
    "cp": 225,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_BOAR_A_2",
      "ECO2_MAT_BOAR_B_2"
    ],
    "terrain": "plains",
    "family": "BOAR",
    "archetype": "BOAR",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#5c5c5c",
      "accent": "#a6a6a6",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_BOAR_3",
    "nameTh": "หมูป่าดินโป่งปราณคราม",
    "tier": 3,
    "cp": 450,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_BOAR_A_3",
      "ECO2_MAT_BOAR_B_3"
    ],
    "terrain": "forest",
    "family": "BOAR",
    "archetype": "BOAR",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#4a6b57",
      "accent": "#8fbaa0",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_BOAR_4",
    "nameTh": "หมูป่าเขาศิลาอัคนี",
    "tier": 4,
    "cp": 1000,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_BOAR_A_4",
      "ECO2_MAT_BOAR_B_4"
    ],
    "terrain": "mountain",
    "family": "BOAR",
    "archetype": "BOAR",
    "element": "FIRE",
    "visual": {
      "body": "#8c4837",
      "accent": "#e87c64",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_BOAR_5",
    "nameTh": "หมูป่าเกราะเพชรโบราณ",
    "tier": 5,
    "cp": 2550,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_BOAR_A_5",
      "ECO2_MAT_BOAR_B_5"
    ],
    "terrain": "mountain",
    "family": "BOAR",
    "archetype": "BOAR",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#6a7885",
      "accent": "#cbe4fa",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_BOAR_6",
    "nameTh": "พญาหมูป่าเก้าภูผาทลายทวีป",
    "tier": 6,
    "cp": 6800,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_BOAR_A_6",
      "ECO2_MAT_BOAR_B_6"
    ],
    "terrain": "mountain",
    "family": "BOAR",
    "archetype": "BOAR",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#634938",
      "accent": "#dba881",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SERPENT_1",
    "nameTh": "งูดงไผ่เขียวมรกต",
    "tier": 1,
    "cp": 98,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_SERPENT_A_1",
      "ECO2_MAT_SERPENT_B_1"
    ],
    "terrain": "forest",
    "family": "SERPENT",
    "archetype": "SERPENT",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#4b7549",
      "accent": "#86c282",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SERPENT_2",
    "nameTh": "งูพิษทรายแดง",
    "tier": 2,
    "cp": 215,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_SERPENT_A_2",
      "ECO2_MAT_SERPENT_B_2"
    ],
    "terrain": "desert",
    "family": "SERPENT",
    "archetype": "SERPENT",
    "element": "FIRE",
    "visual": {
      "body": "#945b46",
      "accent": "#d69780",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SERPENT_3",
    "nameTh": "เหลือมศิลาหุบเขาลึก",
    "tier": 3,
    "cp": 460,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_SERPENT_A_3",
      "ECO2_MAT_SERPENT_B_3"
    ],
    "terrain": "mountain",
    "family": "SERPENT",
    "archetype": "SERPENT",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#5e5a52",
      "accent": "#999285",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SERPENT_4",
    "nameTh": "งูเห่าหมอกเหมันต์",
    "tier": 4,
    "cp": 990,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_SERPENT_A_4",
      "ECO2_MAT_SERPENT_B_4"
    ],
    "terrain": "mountain",
    "family": "SERPENT",
    "archetype": "SERPENT",
    "element": "WATER_ICE",
    "visual": {
      "body": "#6e899c",
      "accent": "#b8daf0",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SERPENT_5",
    "nameTh": "พญางูเหลือมเพลิงเก้าชีพจร",
    "tier": 5,
    "cp": 2500,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_SERPENT_A_5",
      "ECO2_MAT_SERPENT_B_5"
    ],
    "terrain": "mountain",
    "family": "SERPENT",
    "archetype": "SERPENT",
    "element": "FIRE",
    "visual": {
      "body": "#ad4931",
      "accent": "#f79f65",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SERPENT_6",
    "nameTh": "ราชันย์อสรพิษดำใต้พิภพบรรพกาล",
    "tier": 6,
    "cp": 7400,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_SERPENT_A_6",
      "ECO2_MAT_SERPENT_B_6"
    ],
    "terrain": "mountain",
    "family": "SERPENT",
    "archetype": "SERPENT",
    "element": "YIN_SHADOW",
    "visual": {
      "body": "#322c38",
      "accent": "#7a668f",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AVIAN_1",
    "nameTh": "เหยี่ยวลมกรดทุ่งหญ้า",
    "tier": 1,
    "cp": 96,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_AVIAN_A_1",
      "ECO2_MAT_AVIAN_B_1"
    ],
    "terrain": "plains",
    "family": "AVIAN",
    "archetype": "AVIAN",
    "element": "WIND",
    "visual": {
      "body": "#80776b",
      "accent": "#c9bfb1",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AVIAN_2",
    "nameTh": "นกกระเรียนหยกธารน้ำ",
    "tier": 2,
    "cp": 210,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_AVIAN_A_2",
      "ECO2_MAT_AVIAN_B_2"
    ],
    "terrain": "forest",
    "family": "AVIAN",
    "archetype": "AVIAN",
    "element": "WATER_ICE",
    "visual": {
      "body": "#5b827e",
      "accent": "#aae0d9",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AVIAN_3",
    "nameTh": "อินทรีศิลาหน้าผาสูง",
    "tier": 3,
    "cp": 470,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_AVIAN_A_3",
      "ECO2_MAT_AVIAN_B_3"
    ],
    "terrain": "mountain",
    "family": "AVIAN",
    "archetype": "AVIAN",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#66615b",
      "accent": "#ada79e",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AVIAN_4",
    "nameTh": "เหยี่ยวเพลิงเมฆาสารท",
    "tier": 4,
    "cp": 1040,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_AVIAN_A_4",
      "ECO2_MAT_AVIAN_B_4"
    ],
    "terrain": "mountain",
    "family": "AVIAN",
    "archetype": "AVIAN",
    "element": "FIRE",
    "visual": {
      "body": "#a6543b",
      "accent": "#fab082",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AVIAN_5",
    "nameTh": "พญาอินทรีวายุสายฟ้า",
    "tier": 5,
    "cp": 2600,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_AVIAN_A_5",
      "ECO2_MAT_AVIAN_B_5"
    ],
    "terrain": "mountain",
    "family": "AVIAN",
    "archetype": "AVIAN",
    "element": "LIGHTNING",
    "visual": {
      "body": "#4b5780",
      "accent": "#9bb2fc",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AVIAN_6",
    "nameTh": "ราชันย์วิหคเพลิงอมฤตเก้าภพ",
    "tier": 6,
    "cp": 8200,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_AVIAN_A_6",
      "ECO2_MAT_AVIAN_B_6"
    ],
    "terrain": "mountain",
    "family": "AVIAN",
    "archetype": "AVIAN",
    "element": "LIGHT_YANG",
    "visual": {
      "body": "#bd4024",
      "accent": "#ffd56b",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_ARTHROPOD_1",
    "nameTh": "ตั๊กแตนใบไม้คมกริบ",
    "tier": 1,
    "cp": 95,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_ARTHROPOD_A_1",
      "ECO2_MAT_ARTHROPOD_B_1"
    ],
    "terrain": "forest",
    "family": "ARTHROPOD",
    "archetype": "ARTHROPOD",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#5d824d",
      "accent": "#a1d48c",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_ARTHROPOD_2",
    "nameTh": "ตะขาบแดงร้อยขา",
    "tier": 2,
    "cp": 220,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_ARTHROPOD_A_2",
      "ECO2_MAT_ARTHROPOD_B_2"
    ],
    "terrain": "mountain",
    "family": "ARTHROPOD",
    "archetype": "ARTHROPOD",
    "element": "FIRE",
    "visual": {
      "body": "#9c4038",
      "accent": "#e3847b",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_ARTHROPOD_3",
    "nameTh": "ด้วงเกราะเหล็กดำดิน",
    "tier": 3,
    "cp": 460,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_ARTHROPOD_A_3",
      "ECO2_MAT_ARTHROPOD_B_3"
    ],
    "terrain": "plains",
    "family": "ARTHROPOD",
    "archetype": "ARTHROPOD",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#3b3b3b",
      "accent": "#828282",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_ARTHROPOD_4",
    "nameTh": "แมงมุมพิษเร้นเงารัตติกาล",
    "tier": 4,
    "cp": 970,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_ARTHROPOD_A_4",
      "ECO2_MAT_ARTHROPOD_B_4"
    ],
    "terrain": "forest",
    "family": "ARTHROPOD",
    "archetype": "ARTHROPOD",
    "element": "YIN_SHADOW",
    "visual": {
      "body": "#41354d",
      "accent": "#8a72a3",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_ARTHROPOD_5",
    "nameTh": "พญาแมงป่องผลึกอสนีบาต",
    "tier": 5,
    "cp": 2480,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_ARTHROPOD_A_5",
      "ECO2_MAT_ARTHROPOD_B_5"
    ],
    "terrain": "desert",
    "family": "ARTHROPOD",
    "archetype": "ARTHROPOD",
    "element": "LIGHTNING",
    "visual": {
      "body": "#674d80",
      "accent": "#bda6de",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_ARTHROPOD_6",
    "nameTh": "จักรพรรดิแมลงทองคำกลืนปราณ",
    "tier": 6,
    "cp": 6600,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_ARTHROPOD_A_6",
      "ECO2_MAT_ARTHROPOD_B_6"
    ],
    "terrain": "desert",
    "family": "ARTHROPOD",
    "archetype": "ARTHROPOD",
    "element": "LIGHT_YANG",
    "visual": {
      "body": "#b09435",
      "accent": "#ffea80",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SHELL_1",
    "nameTh": "ตะพาบน้ำลำธารหิน",
    "tier": 1,
    "cp": 102,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_SHELL_A_1",
      "ECO2_MAT_SHELL_B_1"
    ],
    "terrain": "water",
    "family": "SHELL",
    "archetype": "SHELL",
    "element": "WATER_ICE",
    "visual": {
      "body": "#5a6e69",
      "accent": "#98b8af",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SHELL_2",
    "nameTh": "เต่าหญ้าเขียวร้อยปี",
    "tier": 2,
    "cp": 225,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_SHELL_A_2",
      "ECO2_MAT_SHELL_B_2"
    ],
    "terrain": "plains",
    "family": "SHELL",
    "archetype": "SHELL",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#496645",
      "accent": "#8eb888",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SHELL_3",
    "nameTh": "เต่าศิลาดำหนามคม",
    "tier": 3,
    "cp": 475,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_SHELL_A_3",
      "ECO2_MAT_SHELL_B_3"
    ],
    "terrain": "mountain",
    "family": "SHELL",
    "archetype": "SHELL",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#474747",
      "accent": "#878787",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SHELL_4",
    "nameTh": "เต่าเพลิงลาวาใต้ธาร",
    "tier": 4,
    "cp": 1050,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_SHELL_A_4",
      "ECO2_MAT_SHELL_B_4"
    ],
    "terrain": "mountain",
    "family": "SHELL",
    "archetype": "SHELL",
    "element": "FIRE",
    "visual": {
      "body": "#87402d",
      "accent": "#e0765c",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SHELL_5",
    "nameTh": "พญาเต่ามังกรครามค้ำสมุทร",
    "tier": 5,
    "cp": 2620,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_SHELL_A_5",
      "ECO2_MAT_SHELL_B_5"
    ],
    "terrain": "water",
    "family": "SHELL",
    "archetype": "SHELL",
    "element": "WATER_ICE",
    "visual": {
      "body": "#3b586e",
      "accent": "#78afd6",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_SHELL_6",
    "nameTh": "ราชันย์เต่าปฐพีบรรพกาลห้าทวีป",
    "tier": 6,
    "cp": 7800,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_SHELL_A_6",
      "ECO2_MAT_SHELL_B_6"
    ],
    "terrain": "mountain",
    "family": "SHELL",
    "archetype": "SHELL",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#5c5443",
      "accent": "#bfb095",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_UNGULATE_1",
    "nameTh": "กวางดาวทุ่งสารท",
    "tier": 1,
    "cp": 95,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_UNGULATE_A_1",
      "ECO2_MAT_UNGULATE_B_1"
    ],
    "terrain": "plains",
    "family": "UNGULATE",
    "archetype": "UNGULATE",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#8a6a4d",
      "accent": "#d9b38f",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_UNGULATE_2",
    "nameTh": "แพะผาสูงปราณวายุ",
    "tier": 2,
    "cp": 215,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_UNGULATE_A_2",
      "ECO2_MAT_UNGULATE_B_2"
    ],
    "terrain": "mountain",
    "family": "UNGULATE",
    "archetype": "UNGULATE",
    "element": "WIND",
    "visual": {
      "body": "#7d7a72",
      "accent": "#c2beb4",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_UNGULATE_3",
    "nameTh": "กระทิงศิลาเขาเหล็ก",
    "tier": 3,
    "cp": 470,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_UNGULATE_A_3",
      "ECO2_MAT_UNGULATE_B_3"
    ],
    "terrain": "mountain",
    "family": "UNGULATE",
    "archetype": "UNGULATE",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#575249",
      "accent": "#999081",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_UNGULATE_4",
    "nameTh": "กวางขาวหิมะเก้ามังกร",
    "tier": 4,
    "cp": 1010,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_UNGULATE_A_4",
      "ECO2_MAT_UNGULATE_B_4"
    ],
    "terrain": "mountain",
    "family": "UNGULATE",
    "archetype": "UNGULATE",
    "element": "WATER_ICE",
    "visual": {
      "body": "#9bb0bd",
      "accent": "#f0f7fc",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_UNGULATE_5",
    "nameTh": "พญากระทิงเพลิงพิโรธเก้าอัคคี",
    "tier": 5,
    "cp": 2550,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_UNGULATE_A_5",
      "ECO2_MAT_UNGULATE_B_5"
    ],
    "terrain": "mountain",
    "family": "UNGULATE",
    "archetype": "UNGULATE",
    "element": "FIRE",
    "visual": {
      "body": "#96442b",
      "accent": "#f2815e",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_UNGULATE_6",
    "nameTh": "ราชันย์กวางดาราสวรรค์เก้าภพ",
    "tier": 6,
    "cp": 7100,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_UNGULATE_A_6",
      "ECO2_MAT_UNGULATE_B_6"
    ],
    "terrain": "mountain",
    "family": "UNGULATE",
    "archetype": "UNGULATE",
    "element": "ASTRAL",
    "visual": {
      "body": "#4a5b78",
      "accent": "#a3beeb",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AQUATIC_1",
    "nameTh": "ปลากระบอกเกล็ดเงินธารา",
    "tier": 1,
    "cp": 95,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_AQUATIC_A_1",
      "ECO2_MAT_AQUATIC_B_1"
    ],
    "terrain": "water",
    "family": "AQUATIC",
    "archetype": "AQUATIC",
    "element": "WATER_ICE",
    "visual": {
      "body": "#718c94",
      "accent": "#c7e2eb",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AQUATIC_2",
    "nameTh": "ปลาคาร์ปหยกกระโดดมังกร",
    "tier": 2,
    "cp": 210,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_AQUATIC_A_2",
      "ECO2_MAT_AQUATIC_B_2"
    ],
    "terrain": "water",
    "family": "AQUATIC",
    "archetype": "AQUATIC",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#4f7a69",
      "accent": "#95dbbe",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AQUATIC_3",
    "nameTh": "ชะโดเกราะหนามหนองบึง",
    "tier": 3,
    "cp": 450,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_AQUATIC_A_3",
      "ECO2_MAT_AQUATIC_B_3"
    ],
    "terrain": "water",
    "family": "AQUATIC",
    "archetype": "AQUATIC",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#526154",
      "accent": "#96ad99",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AQUATIC_4",
    "nameTh": "ฉลามครีบเพลิงทะเลเดือด",
    "tier": 4,
    "cp": 990,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_AQUATIC_A_4",
      "ECO2_MAT_AQUATIC_B_4"
    ],
    "terrain": "water",
    "family": "AQUATIC",
    "archetype": "AQUATIC",
    "element": "FIRE",
    "visual": {
      "body": "#8f4e3c",
      "accent": "#eb8d75",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AQUATIC_5",
    "nameTh": "วาฬมุกวิญญาณเมฆาคราม",
    "tier": 5,
    "cp": 2500,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_AQUATIC_A_5",
      "ECO2_MAT_AQUATIC_B_5"
    ],
    "terrain": "water",
    "family": "AQUATIC",
    "archetype": "AQUATIC",
    "element": "ASTRAL",
    "visual": {
      "body": "#455f7d",
      "accent": "#9ac4f5",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_AQUATIC_6",
    "nameTh": "มังกรมัจฉาสมุทรดึกดำบรรพ์",
    "tier": 6,
    "cp": 7300,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_AQUATIC_A_6",
      "ECO2_MAT_AQUATIC_B_6"
    ],
    "terrain": "water",
    "family": "AQUATIC",
    "archetype": "AQUATIC",
    "element": "WATER_ICE",
    "visual": {
      "body": "#2e4961",
      "accent": "#68b1e8",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_PLANT_SPIRIT_1",
    "nameTh": "ภูตเห็ดหมอกเรืองแสง",
    "tier": 1,
    "cp": 95,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_PLANT_SPIRIT_A_1",
      "ECO2_MAT_PLANT_SPIRIT_B_1"
    ],
    "terrain": "forest",
    "family": "PLANT_SPIRIT",
    "archetype": "PLANT",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#4d755c",
      "accent": "#9ee0b5",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_PLANT_SPIRIT_2",
    "nameTh": "เถาวัลย์หนามโลหิตดงไผ่",
    "tier": 2,
    "cp": 220,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_PLANT_SPIRIT_A_2",
      "ECO2_MAT_PLANT_SPIRIT_B_2"
    ],
    "terrain": "forest",
    "family": "PLANT_SPIRIT",
    "archetype": "PLANT",
    "element": "BLOOD_DEMON",
    "visual": {
      "body": "#733737",
      "accent": "#c76969",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_PLANT_SPIRIT_3",
    "nameTh": "โสมปีศาจรากพันปี",
    "tier": 3,
    "cp": 460,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_PLANT_SPIRIT_A_3",
      "ECO2_MAT_PLANT_SPIRIT_B_3"
    ],
    "terrain": "forest",
    "family": "PLANT_SPIRIT",
    "archetype": "PLANT",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#6e5e44",
      "accent": "#c2ab84",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_PLANT_SPIRIT_4",
    "nameTh": "บัวเพลิงอัคนีธารลาวา",
    "tier": 4,
    "cp": 1010,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_PLANT_SPIRIT_A_4",
      "ECO2_MAT_PLANT_SPIRIT_B_4"
    ],
    "terrain": "mountain",
    "family": "PLANT_SPIRIT",
    "archetype": "PLANT",
    "element": "FIRE",
    "visual": {
      "body": "#964438",
      "accent": "#f0897a",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_PLANT_SPIRIT_5",
    "nameTh": "พญาพฤกษาหมื่นพิษลวงวิญญาณ",
    "tier": 5,
    "cp": 2550,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_PLANT_SPIRIT_A_5",
      "ECO2_MAT_PLANT_SPIRIT_B_5"
    ],
    "terrain": "forest",
    "family": "PLANT_SPIRIT",
    "archetype": "PLANT",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#3b5443",
      "accent": "#86ba95",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_PLANT_SPIRIT_6",
    "nameTh": "มหาพฤกษาโลกบรรพกาลค้ำสวรรค์",
    "tier": 6,
    "cp": 7600,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_PLANT_SPIRIT_A_6",
      "ECO2_MAT_PLANT_SPIRIT_B_6"
    ],
    "terrain": "forest",
    "family": "PLANT_SPIRIT",
    "archetype": "PLANT",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#473d31",
      "accent": "#b59d80",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CHIMERA_1",
    "nameTh": "จิ้งจอกวายุติดปีก",
    "tier": 1,
    "cp": 100,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_CHIMERA_A_1",
      "ECO2_MAT_CHIMERA_B_1"
    ],
    "terrain": "forest",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "WIND",
    "visual": {
      "body": "#657e87",
      "accent": "#b0d5e3",
      "mark": "crest",
      "scale": 0.92
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CHIMERA_2",
    "nameTh": "เสือโคร่งปีกค้างคาว",
    "tier": 2,
    "cp": 225,
    "flee": 30,
    "aggro": 45,
    "drops": [
      "ECO2_MAT_CHIMERA_A_2",
      "ECO2_MAT_CHIMERA_B_2"
    ],
    "terrain": "forest",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "YIN_SHADOW",
    "visual": {
      "body": "#4d4757",
      "accent": "#9086a1",
      "mark": "crest",
      "scale": 1.04
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CHIMERA_3",
    "nameTh": "กิเลนศิลาพิทักษ์ถ้ำ",
    "tier": 3,
    "cp": 475,
    "flee": 30,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_CHIMERA_A_3",
      "ECO2_MAT_CHIMERA_B_3"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#5c574b",
      "accent": "#a39c89",
      "mark": "crest",
      "scale": 1.1600000000000001
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CHIMERA_4",
    "nameTh": "อินทรีหัวพยัคฆ์เหินนภา",
    "tier": 4,
    "cp": 1060,
    "flee": 20,
    "aggro": 65,
    "drops": [
      "ECO2_MAT_CHIMERA_A_4",
      "ECO2_MAT_CHIMERA_B_4"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "WIND",
    "visual": {
      "body": "#785b41",
      "accent": "#cca583",
      "mark": "crest",
      "scale": 1.28
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CHIMERA_5",
    "nameTh": "กิเลนเพลิงม่วงเก้าวัฏจักร",
    "tier": 5,
    "cp": 2650,
    "flee": 20,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_CHIMERA_A_5",
      "ECO2_MAT_CHIMERA_B_5"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "FIRE",
    "visual": {
      "body": "#6e3869",
      "accent": "#c977c0",
      "mark": "crest",
      "scale": 1.4
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_CHIMERA_6",
    "nameTh": "อสูรกลืนมิติบารมีอนันต์",
    "tier": 6,
    "cp": 8000,
    "flee": 10,
    "aggro": 85,
    "drops": [
      "ECO2_MAT_CHIMERA_A_6",
      "ECO2_MAT_CHIMERA_B_6"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "ASTRAL",
    "visual": {
      "body": "#352d47",
      "accent": "#7c68ad",
      "mark": "crest",
      "scale": 1.52
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_1",
    "nameTh": "ราชันย์มังกรทองเก้าสุริยัน",
    "tier": 7,
    "cp": 24500,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_SCALE_1",
      "ECO2_MAT_MYTHIC_HEART_1"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "LIGHT_YANG",
    "visual": {
      "body": "#b89228",
      "accent": "#fae36b",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_2",
    "nameTh": "หงส์เพลิงสวรรค์เก้าชีวา",
    "tier": 7,
    "cp": 22000,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_FEATHER_2",
      "ECO2_MAT_MYTHIC_PEARL_2"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "FIRE",
    "visual": {
      "body": "#ba3c25",
      "accent": "#ffaa54",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_3",
    "nameTh": "เต่าดำเสวียนอู่ค้ำจักรวาล",
    "tier": 7,
    "cp": 24000,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_SHELL_3",
      "ECO2_MAT_MYTHIC_CORE_3"
    ],
    "terrain": "water",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "WATER_ICE",
    "visual": {
      "body": "#263b4a",
      "accent": "#649dbd",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_4",
    "nameTh": "พยัคฆ์ขาวไป๋หู่พิฆาตดารา",
    "tier": 7,
    "cp": 23500,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_FANG_4",
      "ECO2_MAT_MYTHIC_PELT_4"
    ],
    "terrain": "mountain",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "EARTH_METAL",
    "visual": {
      "body": "#8fa5b8",
      "accent": "#eef5fa",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_5",
    "nameTh": "กิเลนทองคำจักรพรรดิฟ้า",
    "tier": 7,
    "cp": 23000,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_HORN_5",
      "ECO2_MAT_MYTHIC_CRYSTAL_5"
    ],
    "terrain": "forest",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "LIGHT_YANG",
    "visual": {
      "body": "#ad8728",
      "accent": "#fade64",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_6",
    "nameTh": "ปลาวาฬคุนเผิงกลืนดวงดารา",
    "tier": 7,
    "cp": 24500,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_WING_6",
      "ECO2_MAT_MYTHIC_OCEAN_6"
    ],
    "terrain": "water",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "ASTRAL",
    "visual": {
      "body": "#334466",
      "accent": "#88a3db",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "SPECIAL_ELEMENT",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_7",
    "nameTh": "อสูรเทาเที่ยกลืนหมื่นวิญญาณ",
    "tier": 7,
    "cp": 25000,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_HORN_7",
      "ECO2_MAT_MYTHIC_STOMACH_7"
    ],
    "terrain": "desert",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "YIN_SHADOW",
    "visual": {
      "body": "#3b2f42",
      "accent": "#866b96",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_BEAST_MYTHIC_8",
    "nameTh": "พญาพฤกษาโพธิ์สวรรค์หมื่นวัฏจักร",
    "tier": 7,
    "cp": 24000,
    "flee": 5,
    "aggro": 95,
    "drops": [
      "ECO2_MAT_MYTHIC_ROOT_8",
      "ECO2_MAT_MYTHIC_FRUIT_8"
    ],
    "terrain": "forest",
    "family": "CHIMERA",
    "archetype": "CHIMERA",
    "element": "WOOD_LIFE",
    "visual": {
      "body": "#45382b",
      "accent": "#b0946d",
      "mark": "crown",
      "scale": 1.8
    },
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  }
];

  const materials = [
  {
    "id": "ECO2_MAT_CANINE_A_1",
    "nameTh": "เขี้ยวหมาป่าหมอกคราม",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 13,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_1"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_B_1",
    "nameTh": "หนังหมาป่าหมอกคราม",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 9,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_1"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_A_2",
    "nameTh": "เขี้ยวหมาป่าเงาจันทร์",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 32,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_2"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_B_2",
    "nameTh": "หนังหมาป่าเงาจันทร์",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 24,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_2"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_A_3",
    "nameTh": "เขี้ยวสุนัขป่าลมกรดทักษิณ",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 71,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_3"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_B_3",
    "nameTh": "หนังสุนัขป่าลมกรดทักษิณ",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 59,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_3"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_A_4",
    "nameTh": "เขี้ยวหมาป่าโลหิตกระหายศึก",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_4"
    ],
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_B_4",
    "nameTh": "หนังหมาป่าโลหิตกระหายศึก",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_4"
    ],
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_A_5",
    "nameTh": "เขี้ยวจิ้งจอกเงินเก้าหางค้ำดึก",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_5"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_B_5",
    "nameTh": "หนังจิ้งจอกเงินเก้าหางค้ำดึก",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_5"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_A_6",
    "nameTh": "เขี้ยวราชันย์หมาป่ากลืนตะวัน",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_6"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CANINE_B_6",
    "nameTh": "หนังราชันย์หมาป่ากลืนตะวัน",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "CANINE",
    "sourceBeastIds": [
      "ECO2_BEAST_CANINE_6"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_A_1",
    "nameTh": "กรงเล็บแมวป่าลายเสือหินผา",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 13,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_1"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_B_1",
    "nameTh": "โลหิตแมวป่าลายเสือหินผา",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 9,
    "anatomy": "BLOOD",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_1"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_A_2",
    "nameTh": "กรงเล็บเสือดาววายุไพร",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 32,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_2"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_B_2",
    "nameTh": "โลหิตเสือดาววายุไพร",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 24,
    "anatomy": "BLOOD",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_2"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_A_3",
    "nameTh": "กรงเล็บพยัคฆ์เขี้ยวดาบเกราะศิลา",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_B_3",
    "nameTh": "โลหิตพยัคฆ์เขี้ยวดาบเกราะศิลา",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "BLOOD",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_A_4",
    "nameTh": "กรงเล็บเสือดาวเพลิงอสูร",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 157,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_B_4",
    "nameTh": "โลหิตเสือดาวเพลิงอสูร",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ALCHEMY",
    "terrain": "desert",
    "value": 141,
    "anatomy": "BLOOD",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_A_5",
    "nameTh": "กรงเล็บพยัคฆ์ขาวเหมันต์ทะลวงเมฆ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_5"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_B_5",
    "nameTh": "โลหิตพยัคฆ์ขาวเหมันต์ทะลวงเมฆ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "BLOOD",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_5"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_A_6",
    "nameTh": "กรงเล็บพยัคฆ์สายฟ้าทมิฬเก้าสวรรค์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_6"
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_FELINE_B_6",
    "nameTh": "โลหิตพยัคฆ์สายฟ้าทมิฬเก้าสวรรค์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "BLOOD",
    "relic": false,
    "family": "FELINE",
    "sourceBeastIds": [
      "ECO2_BEAST_FELINE_6"
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_A_1",
    "nameTh": "กระดูกหมีดำดงไผ่",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 13,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_B_1",
    "nameTh": "ถุงน้ำดีหมีดำดงไผ่",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 9,
    "anatomy": "HEART_GALL",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_A_2",
    "nameTh": "กระดูกหมีหินผาทะลวงหุบเขา",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 32,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_2"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_B_2",
    "nameTh": "ถุงน้ำดีหมีหินผาทะลวงหุบเขา",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 24,
    "anatomy": "HEART_GALL",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_2"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_A_3",
    "nameTh": "กระดูกหมีเพลิงพิโรธถ้ำลาวา",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_3"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_B_3",
    "nameTh": "ถุงน้ำดีหมีเพลิงพิโรธถ้ำลาวา",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "HEART_GALL",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_3"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_A_4",
    "nameTh": "กระดูกหมีเกราะเหล็กไหลหลังทอง",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_4"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_B_4",
    "nameTh": "ถุงน้ำดีหมีเกราะเหล็กไหลหลังทอง",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "HEART_GALL",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_4"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_A_5",
    "nameTh": "กระดูกหมีพายุหิมะโบราณ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_5"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_B_5",
    "nameTh": "ถุงน้ำดีหมีพายุหิมะโบราณ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "HEART_GALL",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_5"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_A_6",
    "nameTh": "กระดูกราชันย์หมีปฐพีสะเทือนฟ้า",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_URSINE_B_6",
    "nameTh": "ถุงน้ำดีราชันย์หมีปฐพีสะเทือนฟ้า",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "HEART_GALL",
    "relic": false,
    "family": "URSINE",
    "sourceBeastIds": [
      "ECO2_BEAST_URSINE_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_A_1",
    "nameTh": "งาหมูป่าเขี้ยวสั้นหน้าผา",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 13,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_1"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_B_1",
    "nameTh": "หนังหนาหมูป่าเขี้ยวสั้นหน้าผา",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 9,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_1"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_A_2",
    "nameTh": "งาหมูป่าเกราะหนามโลหะ",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 32,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_2"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_B_2",
    "nameTh": "หนังหนาหมูป่าเกราะหนามโลหะ",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 24,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_2"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_A_3",
    "nameTh": "งาหมูป่าดินโป่งปราณคราม",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 71,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_3"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_B_3",
    "nameTh": "หนังหนาหมูป่าดินโป่งปราณคราม",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 59,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_3"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_A_4",
    "nameTh": "งาหมูป่าเขาศิลาอัคนี",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_B_4",
    "nameTh": "หนังหนาหมูป่าเขาศิลาอัคนี",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_A_5",
    "nameTh": "งาหมูป่าเกราะเพชรโบราณ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_5"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_B_5",
    "nameTh": "หนังหนาหมูป่าเกราะเพชรโบราณ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_5"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_A_6",
    "nameTh": "งาพญาหมูป่าเก้าภูผาทลายทวีป",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_BOAR_B_6",
    "nameTh": "หนังหนาพญาหมูป่าเก้าภูผาทลายทวีป",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "HIDE_PELT",
    "relic": false,
    "family": "BOAR",
    "sourceBeastIds": [
      "ECO2_BEAST_BOAR_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_A_1",
    "nameTh": "ต่อมพิษงูดงไผ่เขียวมรกต",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 13,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_B_1",
    "nameTh": "เกล็ดงูดงไผ่เขียวมรกต",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 9,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_A_2",
    "nameTh": "ต่อมพิษงูพิษทรายแดง",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ALCHEMY",
    "terrain": "desert",
    "value": 32,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_2"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_B_2",
    "nameTh": "เกล็ดงูพิษทรายแดง",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 24,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_2"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_A_3",
    "nameTh": "ต่อมพิษเหลือมศิลาหุบเขาลึก",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_B_3",
    "nameTh": "เกล็ดเหลือมศิลาหุบเขาลึก",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_A_4",
    "nameTh": "ต่อมพิษงูเห่าหมอกเหมันต์",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_4"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_B_4",
    "nameTh": "เกล็ดงูเห่าหมอกเหมันต์",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_4"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_A_5",
    "nameTh": "ต่อมพิษพญางูเหลือมเพลิงเก้าชีพจร",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_5"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_B_5",
    "nameTh": "เกล็ดพญางูเหลือมเพลิงเก้าชีพจร",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_5"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_A_6",
    "nameTh": "ต่อมพิษราชันย์อสรพิษดำใต้พิภพบรรพกาล",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_6"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SERPENT_B_6",
    "nameTh": "เกล็ดราชันย์อสรพิษดำใต้พิภพบรรพกาล",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SERPENT",
    "sourceBeastIds": [
      "ECO2_BEAST_SERPENT_6"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_A_1",
    "nameTh": "ขนปีกเหยี่ยวลมกรดทุ่งหญ้า",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "TALISMAN",
    "terrain": "plains",
    "value": 13,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_1"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_B_1",
    "nameTh": "กรงเล็บเหยี่ยวลมกรดทุ่งหญ้า",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 9,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_1"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_A_2",
    "nameTh": "ขนปีกนกกระเรียนหยกธารน้ำ",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "TALISMAN",
    "terrain": "forest",
    "value": 32,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_2"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_B_2",
    "nameTh": "กรงเล็บนกกระเรียนหยกธารน้ำ",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 24,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_2"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_A_3",
    "nameTh": "ขนปีกอินทรีศิลาหน้าผาสูง",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "TALISMAN",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_B_3",
    "nameTh": "กรงเล็บอินทรีศิลาหน้าผาสูง",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_A_4",
    "nameTh": "ขนปีกเหยี่ยวเพลิงเมฆาสารท",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "TALISMAN",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_B_4",
    "nameTh": "กรงเล็บเหยี่ยวเพลิงเมฆาสารท",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_A_5",
    "nameTh": "ขนปีกพญาอินทรีวายุสายฟ้า",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "TALISMAN",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_5"
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_B_5",
    "nameTh": "กรงเล็บพญาอินทรีวายุสายฟ้า",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_5"
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_A_6",
    "nameTh": "ขนปีกราชันย์วิหคเพลิงอมฤตเก้าภพ",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "TALISMAN",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_6"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AVIAN_B_6",
    "nameTh": "กรงเล็บราชันย์วิหคเพลิงอมฤตเก้าภพ",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "FANG_CLAW",
    "relic": false,
    "family": "AVIAN",
    "sourceBeastIds": [
      "ECO2_BEAST_AVIAN_6"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_A_1",
    "nameTh": "เหล็กในตั๊กแตนใบไม้คมกริบ",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 13,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_B_1",
    "nameTh": "กระดองตั๊กแตนใบไม้คมกริบ",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 9,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_A_2",
    "nameTh": "เหล็กในตะขาบแดงร้อยขา",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 32,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_2"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_B_2",
    "nameTh": "กระดองตะขาบแดงร้อยขา",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 24,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_2"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_A_3",
    "nameTh": "เหล็กในด้วงเกราะเหล็กดำดิน",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 71,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_B_3",
    "nameTh": "กระดองด้วงเกราะเหล็กดำดิน",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 59,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_A_4",
    "nameTh": "เหล็กในแมงมุมพิษเร้นเงารัตติกาล",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 157,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_4"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_B_4",
    "nameTh": "กระดองแมงมุมพิษเร้นเงารัตติกาล",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 141,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_4"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_A_5",
    "nameTh": "เหล็กในพญาแมงป่องผลึกอสนีบาต",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 355,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_5"
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_B_5",
    "nameTh": "กระดองพญาแมงป่องผลึกอสนีบาต",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 335,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_5"
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_A_6",
    "nameTh": "เหล็กในจักรพรรดิแมลงทองคำกลืนปราณ",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 818,
    "anatomy": "VENOM_GLAND",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_6"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_ARTHROPOD_B_6",
    "nameTh": "กระดองจักรพรรดิแมลงทองคำกลืนปราณ",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 794,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "ARTHROPOD",
    "sourceBeastIds": [
      "ECO2_BEAST_ARTHROPOD_6"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_A_1",
    "nameTh": "กระดองตะพาบน้ำลำธารหิน",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "water",
    "value": 13,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_1"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_B_1",
    "nameTh": "แก่นศิลาตะพาบน้ำลำธารหิน",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 9,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_1"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_A_2",
    "nameTh": "กระดองเต่าหญ้าเขียวร้อยปี",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 32,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_2"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_B_2",
    "nameTh": "แก่นศิลาเต่าหญ้าเขียวร้อยปี",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ARRAY",
    "terrain": "plains",
    "value": 24,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_2"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_A_3",
    "nameTh": "กระดองเต่าศิลาดำหนามคม",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_B_3",
    "nameTh": "แก่นศิลาเต่าศิลาดำหนามคม",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_A_4",
    "nameTh": "กระดองเต่าเพลิงลาวาใต้ธาร",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_B_4",
    "nameTh": "แก่นศิลาเต่าเพลิงลาวาใต้ธาร",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_A_5",
    "nameTh": "กระดองพญาเต่ามังกรครามค้ำสมุทร",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "water",
    "value": 355,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_5"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_B_5",
    "nameTh": "แก่นศิลาพญาเต่ามังกรครามค้ำสมุทร",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 335,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_5"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_A_6",
    "nameTh": "กระดองราชันย์เต่าปฐพีบรรพกาลห้าทวีป",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_SHELL_B_6",
    "nameTh": "แก่นศิลาราชันย์เต่าปฐพีบรรพกาลห้าทวีป",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "SHELL",
    "sourceBeastIds": [
      "ECO2_BEAST_SHELL_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_A_1",
    "nameTh": "เขากวางดาวทุ่งสารท",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "plains",
    "value": 13,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_B_1",
    "nameTh": "เอ็นแก่นกวางดาวทุ่งสารท",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ALCHEMY",
    "terrain": "plains",
    "value": 9,
    "anatomy": "TENDON_TAIL",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_A_2",
    "nameTh": "เขาแพะผาสูงปราณวายุ",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 32,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_2"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_B_2",
    "nameTh": "เอ็นแก่นแพะผาสูงปราณวายุ",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 24,
    "anatomy": "TENDON_TAIL",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_2"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_A_3",
    "nameTh": "เขากระทิงศิลาเขาเหล็ก",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_B_3",
    "nameTh": "เอ็นแก่นกระทิงศิลาเขาเหล็ก",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "TENDON_TAIL",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_A_4",
    "nameTh": "เขากวางขาวหิมะเก้ามังกร",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_4"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_B_4",
    "nameTh": "เอ็นแก่นกวางขาวหิมะเก้ามังกร",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "TENDON_TAIL",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_4"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_A_5",
    "nameTh": "เขาพญากระทิงเพลิงพิโรธเก้าอัคคี",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_5"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_B_5",
    "nameTh": "เอ็นแก่นพญากระทิงเพลิงพิโรธเก้าอัคคี",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "TENDON_TAIL",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_5"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_A_6",
    "nameTh": "เขาราชันย์กวางดาราสวรรค์เก้าภพ",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_6"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_UNGULATE_B_6",
    "nameTh": "เอ็นแก่นราชันย์กวางดาราสวรรค์เก้าภพ",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "TENDON_TAIL",
    "relic": false,
    "family": "UNGULATE",
    "sourceBeastIds": [
      "ECO2_BEAST_UNGULATE_6"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_A_1",
    "nameTh": "เกล็ดครีบปลากระบอกเกล็ดเงินธารา",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "water",
    "value": 13,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_1"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_B_1",
    "nameTh": "ไข่มุกปลากระบอกเกล็ดเงินธารา",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 9,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_1"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_A_2",
    "nameTh": "เกล็ดครีบปลาคาร์ปหยกกระโดดมังกร",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "water",
    "value": 32,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_2"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_B_2",
    "nameTh": "ไข่มุกปลาคาร์ปหยกกระโดดมังกร",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 24,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_2"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_A_3",
    "nameTh": "เกล็ดครีบชะโดเกราะหนามหนองบึง",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "water",
    "value": 71,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_B_3",
    "nameTh": "ไข่มุกชะโดเกราะหนามหนองบึง",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 59,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_A_4",
    "nameTh": "เกล็ดครีบฉลามครีบเพลิงทะเลเดือด",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "water",
    "value": 157,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_B_4",
    "nameTh": "ไข่มุกฉลามครีบเพลิงทะเลเดือด",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 141,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_A_5",
    "nameTh": "เกล็ดครีบวาฬมุกวิญญาณเมฆาคราม",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "water",
    "value": 355,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_5"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_B_5",
    "nameTh": "ไข่มุกวาฬมุกวิญญาณเมฆาคราม",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 335,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_5"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_A_6",
    "nameTh": "เกล็ดครีบมังกรมัจฉาสมุทรดึกดำบรรพ์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "water",
    "value": 818,
    "anatomy": "SCALE_CARAPACE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_6"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_AQUATIC_B_6",
    "nameTh": "ไข่มุกมังกรมัจฉาสมุทรดึกดำบรรพ์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 794,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "AQUATIC",
    "sourceBeastIds": [
      "ECO2_BEAST_AQUATIC_6"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_A_1",
    "nameTh": "สปอร์ยางไม้ภูตเห็ดหมอกเรืองแสง",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 13,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_B_1",
    "nameTh": "แก่นรากภูตเห็ดหมอกเรืองแสง",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 9,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_1"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_A_2",
    "nameTh": "สปอร์ยางไม้เถาวัลย์หนามโลหิตดงไผ่",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 32,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_2"
    ],
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_B_2",
    "nameTh": "แก่นรากเถาวัลย์หนามโลหิตดงไผ่",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 24,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_2"
    ],
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_A_3",
    "nameTh": "สปอร์ยางไม้โสมปีศาจรากพันปี",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 71,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_3"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_B_3",
    "nameTh": "แก่นรากโสมปีศาจรากพันปี",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 59,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_3"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_A_4",
    "nameTh": "สปอร์ยางไม้บัวเพลิงอัคนีธารลาวา",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_B_4",
    "nameTh": "แก่นรากบัวเพลิงอัคนีธารลาวา",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_4"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_A_5",
    "nameTh": "สปอร์ยางไม้พญาพฤกษาหมื่นพิษลวงวิญญาณ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 355,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_5"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_B_5",
    "nameTh": "แก่นรากพญาพฤกษาหมื่นพิษลวงวิญญาณ",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 335,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_5"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_A_6",
    "nameTh": "สปอร์ยางไม้มหาพฤกษาโลกบรรพกาลค้ำสวรรค์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 818,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_PLANT_SPIRIT_B_6",
    "nameTh": "แก่นรากมหาพฤกษาโลกบรรพกาลค้ำสวรรค์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 794,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "PLANT_SPIRIT",
    "sourceBeastIds": [
      "ECO2_BEAST_PLANT_SPIRIT_6"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_A_1",
    "nameTh": "เขาอสูรจิ้งจอกวายุติดปีก",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 13,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_1"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_B_1",
    "nameTh": "ผลึกแก่นจิ้งจอกวายุติดปีก",
    "category": "BEAST_PART",
    "tier": 1,
    "craft": "ARRAY",
    "terrain": "forest",
    "value": 9,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_1"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_A_2",
    "nameTh": "เขาอสูรเสือโคร่งปีกค้างคาว",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 32,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_2"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_B_2",
    "nameTh": "ผลึกแก่นเสือโคร่งปีกค้างคาว",
    "category": "BEAST_PART",
    "tier": 2,
    "craft": "ARRAY",
    "terrain": "forest",
    "value": 24,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_2"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_A_3",
    "nameTh": "เขาอสูรกิเลนศิลาพิทักษ์ถ้ำ",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 71,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_B_3",
    "nameTh": "ผลึกแก่นกิเลนศิลาพิทักษ์ถ้ำ",
    "category": "BEAST_PART",
    "tier": 3,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 59,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_3"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_A_4",
    "nameTh": "เขาอสูรอินทรีหัวพยัคฆ์เหินนภา",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 157,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_4"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_B_4",
    "nameTh": "ผลึกแก่นอินทรีหัวพยัคฆ์เหินนภา",
    "category": "BEAST_PART",
    "tier": 4,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 141,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_4"
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_A_5",
    "nameTh": "เขาอสูรกิเลนเพลิงม่วงเก้าวัฏจักร",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 355,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_5"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_B_5",
    "nameTh": "ผลึกแก่นกิเลนเพลิงม่วงเก้าวัฏจักร",
    "category": "BEAST_PART",
    "tier": 5,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 335,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_5"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_A_6",
    "nameTh": "เขาอสูรอสูรกลืนมิติบารมีอนันต์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 818,
    "anatomy": "BONE_HORN",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_6"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_CHIMERA_B_6",
    "nameTh": "ผลึกแก่นอสูรกลืนมิติบารมีอนันต์",
    "category": "BEAST_PART",
    "tier": 6,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 794,
    "anatomy": "BEAST_CORE",
    "relic": false,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_CHIMERA_6"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_SCALE_1",
    "nameTh": "เกล็ดมังกรทองเก้าสุริยัน",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 2200,
    "anatomy": "SCALE_CARAPACE",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_1"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_HEART_1",
    "nameTh": "หัวใจมังกรสุริยะบรรพกาล",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ALCHEMY",
    "terrain": "mountain",
    "value": 2350,
    "anatomy": "HEART_GALL",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_1"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_FEATHER_2",
    "nameTh": "ขนหางหงส์เพลิงเก้าชีวา",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "TALISMAN",
    "terrain": "mountain",
    "value": 2150,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_2"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_PEARL_2",
    "nameTh": "มุกหยาดน้ำตาหงสาอมตะ",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ARRAY",
    "terrain": "mountain",
    "value": 2300,
    "anatomy": "BEAST_CORE",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_2"
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_SHELL_3",
    "nameTh": "กระดองเสวียนอู่ค้ำฟ้า",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "water",
    "value": 2250,
    "anatomy": "SCALE_CARAPACE",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_3"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_CORE_3",
    "nameTh": "ศิลากำเนิดธาตุน้ำบรรพกาล",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 2400,
    "anatomy": "BEAST_CORE",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_3"
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_FANG_4",
    "nameTh": "เขี้ยวไป๋หู่พิฆาตดารา",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 2200,
    "anatomy": "FANG_CLAW",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_4"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_PELT_4",
    "nameTh": "หนังพยัคฆ์ขาวเจ็ดดาวเหนือ",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "mountain",
    "value": 2100,
    "anatomy": "HIDE_PELT",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_4"
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_HORN_5",
    "nameTh": "มหาเขากิเลนจักรพรรดิฟ้า",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "forest",
    "value": 2250,
    "anatomy": "BONE_HORN",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_5"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_CRYSTAL_5",
    "nameTh": "ผลึกบุญญาบารมีสวรรค์",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ARRAY",
    "terrain": "forest",
    "value": 2350,
    "anatomy": "BEAST_CORE",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_5"
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_WING_6",
    "nameTh": "ขนปีกคุนเผิงข้ามสมุทร",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "TALISMAN",
    "terrain": "water",
    "value": 2280,
    "anatomy": "SPIRIT_HAIR_FEATHER",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_6"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_OCEAN_6",
    "nameTh": "แก่นมหาสมุทรดารากลืนภพ",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ARRAY",
    "terrain": "water",
    "value": 2450,
    "anatomy": "BEAST_CORE",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_6"
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_HORN_7",
    "nameTh": "เขาคู่เทาเที่ยกลืนวิญญาณ",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 2300,
    "anatomy": "BONE_HORN",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_7"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_STOMACH_7",
    "nameTh": "กระเพาะมิติกลืนหมื่นภพ",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "FORGING",
    "terrain": "desert",
    "value": 2500,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_7"
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_ROOT_8",
    "nameTh": "แก่นรากโพธิ์สวรรค์",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 2350,
    "anatomy": "BONE_HORN",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_8"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_MAT_MYTHIC_FRUIT_8",
    "nameTh": "ผลโพธิ์ตรัสรู้หมื่นวัฏจักร",
    "category": "BEAST_PART",
    "tier": 7,
    "craft": "ALCHEMY",
    "terrain": "forest",
    "value": 2600,
    "anatomy": "MEAT_EGG_MUSK",
    "relic": true,
    "family": "CHIMERA",
    "sourceBeastIds": [
      "ECO2_BEAST_MYTHIC_8"
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  }
];

  const recipes = [
  {
    "id": "ECO2_REC_PILL_HEAL_1",
    "nameTh": "ตำรับโอสถสมานแผลดงไผ่",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 12,
    "days": 5,
    "inputs": [
      {
        "matId": "ECO2_MAT_SERPENT_A_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_B_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DEW_GRASS_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถสมานแผลดงไผ่",
    "effect": {
      "healHealth": 15,
      "healInjury": 10,
      "toxicity": 1
    },
    "descTh": "ใช้พิษงูไผ่สกัดร่วมหญ้าน้ำค้าง สมานแผลภายนอกอย่างรวดเร็ว",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_PURGE_1",
    "nameTh": "ตำรับโอสถชะล้างพิษสปอร์",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 14,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_A_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_B_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_CINDER_LEAF_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถชะล้างพิษสปอร์",
    "effect": {
      "clearPoison": 20,
      "clearToxic": 15,
      "toxicity": 1
    },
    "descTh": "สกัดจากสปอร์เห็ดหมอก ขับพิษตกค้างออกจากชีพจร",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_ENERGY_1",
    "nameTh": "ตำรับโอสถฟื้นกำลังกวางดาว",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 10,
    "days": 5,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_B_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_B_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DEW_GRASS_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถฟื้นกำลังกวางดาว",
    "effect": {
      "energyRestore": 30,
      "healHealth": 8,
      "toxicity": 1
    },
    "descTh": "บำรุงกล้ามเนื้อ คืนความกระปรี้กระเปร่า",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ATK_1",
    "nameTh": "ตำรับโอสถเขี้ยวหมอกฮึกเหิม",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 15,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_CANINE_A_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_A_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_CINDER_LEAF_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเขี้ยวหมอกฮึกเหิม",
    "effect": {
      "cbBuff": {
        "name": "เขี้ยวหมอกฮึกเหิม",
        "dur": 120,
        "p": {
          "atk": 0.12
        },
        "f": {
          "acc": 8
        }
      },
      "toxicity": 2
    },
    "descTh": "เพิ่มพลังโจมตีกายภาพและความแม่นยำยามปะทะศัตรู",
    "starter": true,
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_DEF_1",
    "nameTh": "ตำรับโอสถเกราะตะพาบธารา",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 15,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_A_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_URSINE_A_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DEW_GRASS_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเกราะตะพาบธารา",
    "effect": {
      "cbBuff": {
        "name": "เกราะตะพาบธารา",
        "dur": 120,
        "p": {
          "def": 0.14
        },
        "f": {}
      },
      "toxicity": 2
    },
    "descTh": "เสริมความทนทานของผิวหนัง ป้องกันแรงกระแทก",
    "starter": true,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_SPEED_1",
    "nameTh": "ตำรับโอสถปีกจิ้งจอกวายุ",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 16,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_A_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AVIAN_A_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DEW_GRASS_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถปีกจิ้งจอกวายุ",
    "effect": {
      "cbBuff": {
        "name": "ปีกจิ้งจอกวายุ",
        "dur": 120,
        "p": {
          "move": 0.12,
          "eva": 0.08
        },
        "f": {}
      },
      "toxicity": 2
    },
    "descTh": "เพิ่มความคล่องตัวในการหลบหลีกและเคลื่อนที่",
    "starter": true,
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_CULT_QI_1",
    "nameTh": "ตำรับโอสถรวบรวมปราณวารี",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 15,
    "days": 8,
    "inputs": [
      {
        "matId": "ECO2_MAT_AQUATIC_B_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_B_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DEW_GRASS_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถรวบรวมปราณวารี",
    "effect": {
      "cultivationProgress": 14,
      "toxicity": 2
    },
    "descTh": "ช่วยกักเก็บปราณฟ้าดิน เร่งการบำเพ็ญในขั้นต้น",
    "starter": true,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_MIND_CALM_1",
    "nameTh": "ตำรับโอสถสงบจิตใบไม้คราม",
    "craft": "ALCHEMY",
    "tier": 1,
    "minMastery": 14,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_ARTHROPOD_A_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_B_1",
        "count": 2
      },
      {
        "matId": "MAT_HERB_CINDER_LEAF_1",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถสงบจิตใบไม้คราม",
    "effect": {
      "clearHeartDemon": 16,
      "toxicity": 1
    },
    "descTh": "ดับอารมณ์พลุ่งพล่าน ลดการก่อตัวของจิตมาร",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_HEAL_2",
    "nameTh": "ตำรับโอสถชะล้างชีพจรกระเรียนหยก",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 26,
    "days": 10,
    "inputs": [
      {
        "matId": "ECO2_MAT_AVIAN_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_B_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_JADE_LOTUS_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถชะล้างชีพจรกระเรียนหยก",
    "effect": {
      "healHealth": 28,
      "healInjury": 24,
      "toxicity": 2
    },
    "descTh": "สมานแผลลึกในเส้นลมปราณด้วยพลังบริสุทธิ์ของวิหคธารา",
    "starter": true,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_PURGE_2",
    "nameTh": "ตำรับโอสถถอนพิษทรายแดง",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 28,
    "days": 10,
    "inputs": [
      {
        "matId": "ECO2_MAT_SERPENT_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_A_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_MIST_ORCHID_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถถอนพิษทรายแดง",
    "effect": {
      "clearPoison": 40,
      "clearToxic": 30,
      "toxicity": 2
    },
    "descTh": "ใช้พิษต้านพิษ ชะล้างสารพิษรุนแรงและลมปราณอุดตัน",
    "starter": true,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_REGEN_2",
    "nameTh": "ตำรับโอสถเลือดอสูรคืนพลัง",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 25,
    "days": 8,
    "inputs": [
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_B_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_JADE_LOTUS_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเลือดอสูรคืนพลัง",
    "effect": {
      "healHealth": 35,
      "energyRestore": 45,
      "toxicity": 3
    },
    "descTh": "ยางเถาวัลย์โลหิตช่วยกระตุ้นการไหลเวียนโลหิตและเร่งฟื้นตัว",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ATK_2",
    "nameTh": "ตำรับโอสถกรงเล็บวายุไพร",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 30,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_A_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_MIST_ORCHID_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถกรงเล็บวายุไพร",
    "effect": {
      "cbBuff": {
        "name": "กรงเล็บวายุไพร",
        "dur": 180,
        "p": {
          "atk": 0.16
        },
        "f": {
          "crit": 6
        }
      },
      "toxicity": 3
    },
    "descTh": "คมเขี้ยวเสือดาววายุ เพิ่มพลังเจาะทะลวงและโอกาสคริติคอล",
    "starter": true,
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_DEF_2",
    "nameTh": "ตำรับโอสถเกราะหินผาทะลวง",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 30,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_URSINE_B_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_A_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_JADE_LOTUS_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเกราะหินผาทะลวง",
    "effect": {
      "cbBuff": {
        "name": "เกราะหินผาทะลวง",
        "dur": 180,
        "p": {
          "def": 0.18,
          "mdef": 0.12
        },
        "f": {}
      },
      "toxicity": 3
    },
    "descTh": "ถุงน้ำดีหมีผาหินสร้างชั้นคุ้มกายหนาดั่งศิลา",
    "starter": true,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_CAST_2",
    "nameTh": "ตำรับโอสถเนตรเงาจันทร์กระจ่าง",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 32,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AQUATIC_A_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_MIST_ORCHID_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเนตรเงาจันทร์กระจ่าง",
    "effect": {
      "cbBuff": {
        "name": "เนตรเงาจันทร์",
        "dur": 180,
        "p": {},
        "f": {
          "cast": 14,
          "acc": 12
        }
      },
      "toxicity": 3
    },
    "descTh": "เปิดประสาทสัมผัส ร่ายวิชาได้รวดเร็วและแม่นยำยิ่งขึ้น",
    "starter": true,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_CULT_QI_2",
    "nameTh": "ตำรับโอสถบัวหยกแก่นเต่าร้อยปี",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 28,
    "days": 14,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_B_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_UNGULATE_B_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_JADE_LOTUS_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถบัวหยกแก่นเต่าร้อยปี",
    "effect": {
      "cultivationProgress": 22,
      "toxicity": 3
    },
    "descTh": "แก่นเต่าร้อยปีผสมบัวหยก หล่อเลี้ยงฐานปราณให้หนักแน่น",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_INSIGHT_2",
    "nameTh": "ตำรับโอสถเบิกปัญญาคาร์ปมังกร",
    "craft": "ALCHEMY",
    "tier": 2,
    "minMastery": 30,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_AQUATIC_B_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_B_2",
        "count": 2
      },
      {
        "matId": "MAT_HERB_MIST_ORCHID_2",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเบิกปัญญาคาร์ปมังกร",
    "effect": {
      "insight": 1,
      "clearHeartDemon": 20,
      "toxicity": 2
    },
    "descTh": "เพิ่มความเข้าใจคัมภีร์และวิชา ลดความฟุ้งซ่าน",
    "starter": true,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_HEAL_3",
    "nameTh": "ตำรับโอสถบำรุงชีพจรโสมปีศาจ",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 42,
    "days": 16,
    "inputs": [
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_B_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_B_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_BLOOD_GINSENG_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถบำรุงชีพจรโสมปีศาจ",
    "effect": {
      "healHealth": 50,
      "healInjury": 40,
      "toxicity": 4
    },
    "descTh": "รากโสมปีศาจและโสมโลหิตสมานอาการบาดเจ็บสาหัสอย่างชะงัด",
    "starter": false,
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_PURGE_3",
    "nameTh": "ตำรับโอสถดีงูเหลือมศิลาถอนหมื่นพิษ",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 44,
    "days": 16,
    "inputs": [
      {
        "matId": "ECO2_MAT_SERPENT_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_B_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_VENOM_VINE_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถดีงูเหลือมศิลาถอนหมื่นพิษ",
    "effect": {
      "clearPoison": 60,
      "clearToxic": 45,
      "toxicity": 3
    },
    "descTh": "ดีงูเหลือมเข้มข้น ล้างพิษสะสมในไขกระดูกและเส้นเอ็น",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_LIFE_3",
    "nameTh": "ตำรับโอสถต่ออายุขัยกวางดาวสารท",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 46,
    "days": 20,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_B_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AQUATIC_B_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_BLOOD_GINSENG_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถต่ออายุขัยกวางดาวสารท",
    "effect": {
      "lifespanBonus": 15,
      "healHealth": 30,
      "toxicity": 3
    },
    "descTh": "ฟื้นฟูปราณชีวิต บำรุงธาตุแท้ให้อายุขัยยืนยาวขึ้น",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ATK_3",
    "nameTh": "ตำรับโอสถพยัคฆ์ศิลาทะลวงค่าย",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 45,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_B_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_A_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_BLOOD_GINSENG_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถพยัคฆ์ศิลาทะลวงค่าย",
    "effect": {
      "cbBuff": {
        "name": "พยัคฆ์ศิลาทะลวงค่าย",
        "dur": 240,
        "p": {
          "atk": 0.2
        },
        "f": {
          "pen": 14
        }
      },
      "toxicity": 4
    },
    "descTh": "โลหิตพยัคฆ์ศิลา เสริมพลังทำลายล้างทะลวงเกราะศัตรู",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_DEF_3",
    "nameTh": "ตำรับโอสถเกราะเต่าหนามทมิฬ",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 45,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_URSINE_A_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_VENOM_VINE_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเกราะเต่าหนามทมิฬ",
    "effect": {
      "cbBuff": {
        "name": "เกราะเต่าหนามทมิฬ",
        "dur": 240,
        "p": {
          "def": 0.22,
          "mdef": 0.16
        },
        "f": {}
      },
      "toxicity": 4
    },
    "descTh": "แก่นศิลาหนามทมิฬ คุ้มกายต้านทานอาวุธและวิชาคาถา",
    "starter": false,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_CRIT_3",
    "nameTh": "ตำรับโอสถคมเขี้ยวสุนัขป่าลมกรด",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 46,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_CANINE_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AVIAN_B_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_VENOM_VINE_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถคมเขี้ยวสุนัขป่าลมกรด",
    "effect": {
      "cbBuff": {
        "name": "คมเขี้ยวลมกรด",
        "dur": 240,
        "p": {},
        "f": {
          "crit": 12,
          "critDmg": 25
        }
      },
      "toxicity": 4
    },
    "descTh": "กระตุ้นสัญชาตญาณสัตว์ป่า เพิ่มความเสียหายคริติคอลอย่างรุนแรง",
    "starter": false,
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_CULT_QI_3",
    "nameTh": "ตำรับโอสถรากฐานกิเลนศิลา",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 44,
    "days": 22,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_A_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_BLOOD_GINSENG_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถรากฐานกิเลนศิลา",
    "effect": {
      "cultivationProgress": 32,
      "breakthroughBonus": 0.12,
      "toxicity": 5
    },
    "descTh": "พลังกิเลนศิลา เสริมความมั่นคงช่วงเตรียมทะลวงขั้น",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_MIND_CALM_3",
    "nameTh": "ตำรับโอสถดับจิตมารเพลิงลาวา",
    "craft": "ALCHEMY",
    "tier": 3,
    "minMastery": 45,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_URSINE_B_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_B_3",
        "count": 2
      },
      {
        "matId": "MAT_HERB_VENOM_VINE_3",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถดับจิตมารเพลิงลาวา",
    "effect": {
      "clearHeartDemon": 35,
      "toxicity": 3
    },
    "descTh": "สยบไฟมารในจิตวิญญาณ ป้องกันอาการธาตุไฟแทรก",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_HEAL_4",
    "nameTh": "ตำรับโอสถโลหิตกวางขาวคืนชีพ",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 58,
    "days": 24,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_B_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถโลหิตกวางขาวคืนชีพ",
    "effect": {
      "healHealth": 80,
      "healInjury": 60,
      "toxicity": 5
    },
    "descTh": "โลหิตวิญญาณกวางหิมะขาว สมานกระดูกที่แตกหักและชีพจรที่ฉีกขาด",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_PURGE_4",
    "nameTh": "ตำรับโอสถถอนพิษงูเห่าเหมันต์",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 60,
    "days": 24,
    "inputs": [
      {
        "matId": "ECO2_MAT_SERPENT_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_B_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถถอนพิษงูเห่าเหมันต์",
    "effect": {
      "clearPoison": 80,
      "clearToxic": 60,
      "toxicity": 4
    },
    "descTh": "สกัดความเย็นเยือกแข็ง ขับพิษร้ายแรงและหนอนกู่",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_LIFE_4",
    "nameTh": "ตำรับโอสถเสริมปราณบัวเพลิงอัคนี",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 62,
    "days": 28,
    "inputs": [
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_B_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเสริมปราณบัวเพลิงอัคนี",
    "effect": {
      "lifespanBonus": 30,
      "healHealth": 50,
      "toxicity": 5
    },
    "descTh": "เมล็ดบัวลาวาหลอมปราณ ต่อเติมอายุขัยและฟื้นฟูรากฐาน",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ATK_4",
    "nameTh": "ตำรับโอสถหมาป่าโลหิตคลั่ง",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 60,
    "days": 25,
    "inputs": [
      {
        "matId": "ECO2_MAT_CANINE_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_A_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถหมาป่าโลหิตคลั่ง",
    "effect": {
      "cbBuff": {
        "name": "หมาป่าโลหิตคลั่ง",
        "dur": 300,
        "p": {
          "atk": 0.26
        },
        "f": {
          "crit": 8,
          "pen": 16
        }
      },
      "toxicity": 6
    },
    "descTh": "ปลุกสัญชาตญาณสังหาร เพิ่มพลังโจมตีและอัตราคริติคอลสูงสุด",
    "starter": false,
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "BLOOD_DEMON",
      "weights": {
        "BLOOD_DEMON": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_DEF_4",
    "nameTh": "ตำรับโอสถแก่นเพลิงลาวาคุ้มร่าง",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 60,
    "days": 25,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_URSINE_B_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถแก่นเพลิงลาวาคุ้มร่าง",
    "effect": {
      "cbBuff": {
        "name": "แก่นเพลิงลาวาคุ้มร่าง",
        "dur": 300,
        "p": {
          "def": 0.28,
          "mdef": 0.22
        },
        "f": {}
      },
      "toxicity": 6
    },
    "descTh": "ห่อหุ้มร่างด้วยเกราะเพลิงลาวา ลดทอนดาเมจกายภาพและเวทมนตร์",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_SPEED_4",
    "nameTh": "ตำรับโอสถเหินนภาอินทรีพยัคฆ์",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 62,
    "days": 25,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AVIAN_B_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเหินนภาอินทรีพยัคฆ์",
    "effect": {
      "cbBuff": {
        "name": "เหินนภาอินทรีพยัคฆ์",
        "dur": 300,
        "p": {
          "move": 0.22,
          "eva": 0.16
        },
        "f": {
          "cast": 18
        }
      },
      "toxicity": 5
    },
    "descTh": "ตัวเบาดุจขนนก เคลื่อนไหวรวดเร็วดั่งอินทรีทะยานลม",
    "starter": false,
    "element": "WIND",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_CULT_QI_4",
    "nameTh": "ตำรับโอสถแก่นทองคำฉลามเพลิง",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 60,
    "days": 30,
    "inputs": [
      {
        "matId": "ECO2_MAT_AQUATIC_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_A_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถแก่นทองคำฉลามเพลิง",
    "effect": {
      "cultivationProgress": 45,
      "breakthroughBonus": 0.2,
      "toxicity": 6
    },
    "descTh": "ช่วยหลอมรวมปราณแก่นทองคำให้บริสุทธิ์และมั่นคง",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_MIND_CALM_4",
    "nameTh": "ตำรับโอสถสยบมารใยไหมเงารัตติกาล",
    "craft": "ALCHEMY",
    "tier": 4,
    "minMastery": 62,
    "days": 26,
    "inputs": [
      {
        "matId": "ECO2_MAT_ARTHROPOD_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CHIMERA_B_4",
        "count": 2
      },
      {
        "matId": "MAT_HERB_DRAGON_GRASS_4",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถสยบมารใยไหมเงารัตติกาล",
    "effect": {
      "clearHeartDemon": 50,
      "toxicity": 4
    },
    "descTh": "พันธนาการจิตมารที่ปั่นป่วน ให้สงบนิ่งดั่งบ่อน้ำลึก",
    "starter": false,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_HEAL_5",
    "nameTh": "ตำรับโอสถเอ็นพยัคฆ์ขาวต่อกระดูก",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 72,
    "days": 36,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_A_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถเอ็นพยัคฆ์ขาวต่อกระดูก",
    "effect": {
      "healHealth": 120,
      "healInjury": 100,
      "toxicity": 6
    },
    "descTh": "ฟื้นฟูกระดูกและกล้ามเนื้อที่แหลกเหลวให้คืนสภาพสมบูรณ์",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_PURGE_5",
    "nameTh": "ตำรับโอสถถอนพิษพญาพฤกษาหมื่นพิษ",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 74,
    "days": 36,
    "inputs": [
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_A_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถถอนพิษพญาพฤกษาหมื่นพิษ",
    "effect": {
      "clearPoison": 100,
      "clearToxic": 80,
      "toxicity": 5
    },
    "descTh": "ขับล้างสารพิษระดับมรณะและคำสาปกัดกร่อนวิญญาณ",
    "starter": false,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_LIFE_5",
    "nameTh": "ตำรับโอสถไข่มุกวาฬครามต่ออายุ",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 76,
    "days": 45,
    "inputs": [
      {
        "matId": "ECO2_MAT_AQUATIC_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_A_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถไข่มุกวาฬครามต่ออายุ",
    "effect": {
      "lifespanBonus": 60,
      "healHealth": 80,
      "toxicity": 6
    },
    "descTh": "ไข่มุกวิญญาณวาฬคราม มอบพลังชีวิตอันไพศาลดั่งมหาสมุทร",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ATK_5",
    "nameTh": "ตำรับโอสถกระทิงเพลิงเก้าอัคคีพิโรธ",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 75,
    "days": 38,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_URSINE_B_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถกระทิงเพลิงเก้าอัคคีพิโรธ",
    "effect": {
      "cbBuff": {
        "name": "กระทิงเพลิงเก้าอัคคี",
        "dur": 360,
        "p": {
          "atk": 0.32
        },
        "f": {
          "crit": 12,
          "pen": 22
        }
      },
      "toxicity": 7
    },
    "descTh": "หัวใจกระทิงเพลิง เสริมพลังทำลายล้างสูงสุดยามเผชิญหน้ายอดฝีมือ",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_DEF_5",
    "nameTh": "ตำรับโอสถกระดองเต่ามังกรค้ำฟ้า",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 75,
    "days": 38,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_B_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถกระดองเต่ามังกรค้ำฟ้า",
    "effect": {
      "cbBuff": {
        "name": "กระดองเต่ามังกรค้ำฟ้า",
        "dur": 360,
        "p": {
          "def": 0.34,
          "mdef": 0.28
        },
        "f": {}
      },
      "toxicity": 7
    },
    "descTh": "เกราะเต่ามังกรค้ำฟ้า คุ้มครองผู้ใช้ต้านทานการโจมตีหนักหน่วง",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_THUNDER_5",
    "nameTh": "ตำรับโอสถสายฟ้าพญาแมงป่องผลึก",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 76,
    "days": 38,
    "inputs": [
      {
        "matId": "ECO2_MAT_ARTHROPOD_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AVIAN_B_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถสายฟ้าพญาแมงป่องผลึก",
    "effect": {
      "cbBuff": {
        "name": "สายฟ้าผลึกอสนี",
        "dur": 360,
        "p": {},
        "f": {
          "cast": 24,
          "crit": 14,
          "acc": 20
        }
      },
      "toxicity": 7
    },
    "descTh": "กระแสไฟฟ้าในร่างเร่งการประมวลผลและการจู่โจมฉับไว",
    "starter": false,
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_CULT_QI_5",
    "nameTh": "ตำรับโอสถแก่นวิญญาณจิ้งจอกเก้าหาง",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 74,
    "days": 42,
    "inputs": [
      {
        "matId": "ECO2_MAT_CANINE_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_B_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถแก่นวิญญาณจิ้งจอกเก้าหาง",
    "effect": {
      "cultivationProgress": 60,
      "breakthroughBonus": 0.25,
      "toxicity": 7
    },
    "descTh": "เร่งการสะสมพลังตบะในขั้นสูง และช่วยเปิดจุดชีพจรสำคัญ",
    "starter": false,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_MIND_CALM_5",
    "nameTh": "ตำรับโอสถสงบวิญญาณกิเลนเพลิงม่วง",
    "craft": "ALCHEMY",
    "tier": 5,
    "minMastery": 75,
    "days": 40,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_B_5",
        "count": 2
      },
      {
        "matId": "MAT_HERB_SNOW_LOTUS_5",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถสงบวิญญาณกิเลนเพลิงม่วง",
    "effect": {
      "clearHeartDemon": 70,
      "toxicity": 5
    },
    "descTh": "ชำระล้างจิตใจให้ผ่องแผ้ว สยบภาพหลอนและมารในใจ",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_HEAL_6",
    "nameTh": "ตำรับโอสถหงส์เพลิงเก้าชีวาอมฤต",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 86,
    "days": 60,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_FEATHER_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_URSINE_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_SERPENT_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_AVIAN_A_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_AVIAN_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_SHELL_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_UNGULATE_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_AQUATIC_A_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_AQUATIC_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_CHIMERA_B_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_MYTHIC_WING_6",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_MYTHIC_HORN_7",
        "count": 1
      },
      {
        "matId": "ECO2_MAT_MYTHIC_STOMACH_7",
        "count": 1
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถหงส์เพลิงเก้าชีวาอมฤต",
    "effect": {
      "healHealth": 200,
      "healInjury": 150,
      "clearPoison": 120,
      "toxicity": 5
    },
    "descTh": "พลังคืนชีพของหงส์เพลิงสวรรค์ ชุบชีวิตและซ่อมแซมร่างกายทุกส่วน",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_LIFE_6",
    "nameTh": "ตำรับโอสถผลโพธิ์ตรัสรู้หมื่นปี",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 88,
    "days": 70,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_FRUIT_8",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถผลโพธิ์ตรัสรู้หมื่นปี",
    "effect": {
      "lifespanBonus": 150,
      "healHealth": 150,
      "toxicity": 5
    },
    "descTh": "ผลโพธิ์ตรัสรู้ ยืดอายุขัยและชำระล้างรากฐานชีวิตสู่ความบริสุทธิ์",
    "starter": false,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_PURGE_6",
    "nameTh": "ตำรับโอสถมุกน้ำตาหงสาสลายพิษสวรรค์",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 85,
    "days": 55,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_PEARL_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถมุกน้ำตาหงสาสลายพิษสวรรค์",
    "effect": {
      "clearPoison": 150,
      "clearToxic": 100,
      "clearHeartDemon": 80,
      "toxicity": 4
    },
    "descTh": "หยาดน้ำตาหงสาอมตะ ละลายพิษทุกชนิดในใต้หล้า",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ATK_6",
    "nameTh": "ตำรับโอสถหัวใจมังกรสุริยะบรรพกาล",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 88,
    "days": 60,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_HEART_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถหัวใจมังกรสุริยะบรรพกาล",
    "effect": {
      "cbBuff": {
        "name": "มังกรสุริยะบรรพกาล",
        "dur": 480,
        "p": {
          "atk": 0.4,
          "matk": 0.35
        },
        "f": {
          "crit": 16,
          "pen": 30
        }
      },
      "toxicity": 8
    },
    "descTh": "หัวใจมังกรทองสุริยัน มอบพลังโจมตีสะเทือนสวรรค์และปฐพี",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_DEF_6",
    "nameTh": "ตำรับโอสถกระดองเสวียนอู่ค้ำจักรวาล",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 88,
    "days": 60,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_CORE_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถกระดองเสวียนอู่ค้ำจักรวาล",
    "effect": {
      "cbBuff": {
        "name": "เสวียนอู่ค้ำจักรวาล",
        "dur": 480,
        "p": {
          "def": 0.42,
          "mdef": 0.38
        },
        "f": {}
      },
      "toxicity": 8
    },
    "descTh": "แผ่นกระดองเสวียนอู่ ก่อกำแพงปราณไร้พ่ายต้านทานทุกสิ่ง",
    "starter": false,
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_BUFF_ASTRAL_6",
    "nameTh": "ตำรับโอสถมหาสมุทรดารากลืนภพ",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 87,
    "days": 60,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_OCEAN_6",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CHIMERA_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถมหาสมุทรดารากลืนภพ",
    "effect": {
      "cbBuff": {
        "name": "มหาสมุทรดารากลืนภพ",
        "dur": 480,
        "p": {
          "move": 0.3,
          "eva": 0.25
        },
        "f": {
          "cast": 30,
          "acc": 25
        }
      },
      "toxicity": 8
    },
    "descTh": "พลังกลืนมิติของคุนเผิง เคลื่อนที่ข้ามห้วงอวกาศและร่ายวิชาฉับไว",
    "starter": false,
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_CULT_QI_6",
    "nameTh": "ตำรับโอสถแก่นรากโพธิ์สวรรค์รวมเต๋า",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 88,
    "days": 65,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_HORN_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_UNGULATE_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถแก่นรากโพธิ์สวรรค์รวมเต๋า",
    "effect": {
      "cultivationProgress": 90,
      "breakthroughBonus": 0.3,
      "toxicity": 8
    },
    "descTh": "เร่งตบะสู่จุดสูงสุดของขั้นเซียน เสริมโอกาสผ่านทัณฑ์สวรรค์",
    "starter": false,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 1
      }
    }
  },
  {
    "id": "ECO2_REC_PILL_MIND_CALM_6",
    "nameTh": "ตำรับโอสถสยบมารบุญญาบารมีฟ้า",
    "craft": "ALCHEMY",
    "tier": 6,
    "minMastery": 86,
    "days": 55,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_CRYSTAL_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_A_6",
        "count": 2
      },
      {
        "matId": "MAT_HERB_IMMORTAL_PEACH_6",
        "count": 2
      }
    ],
    "outType": "PILL",
    "outNameTh": "โอสถสยบมารบุญญาบารมีฟ้า",
    "effect": {
      "clearHeartDemon": 100,
      "toxicity": 5
    },
    "descTh": "พลังกิเลนทองคำจักรพรรดิฟ้า กำจัดจิตมารจนสิ้นเชิง",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "ELEMENT_LINK_ONLY",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_001_SWORD_2",
    "nameTh": "ตำรับหลอมกระบี่เขี้ยวเงาจันทร์",
    "craft": "FORGING",
    "tier": 2,
    "minMastery": 28,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_CANINE_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_B_2",
        "count": 2
      },
      {
        "matId": "MAT_ORE_COLD_STEEL_2",
        "count": 4
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_001_SWORD_2",
    "outNameTh": "กระบี่เขี้ยวเงาจันทร์",
    "yield": 1,
    "gearType": "SWORD",
    "starter": true,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_002_SWORD_4",
    "nameTh": "ตำรับหลอมกระบี่เกล็ดงูเห่าเหมันต์",
    "craft": "FORGING",
    "tier": 4,
    "minMastery": 56,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_SERPENT_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_A_4",
        "count": 2
      },
      {
        "matId": "MAT_ORE_MITHRIL_JADE_4",
        "count": 6
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_002_SWORD_4",
    "outNameTh": "กระบี่เกล็ดงูเห่าเหมันต์",
    "yield": 1,
    "gearType": "SWORD",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_003_SWORD_6",
    "nameTh": "ตำรับหลอมกระบี่มังกรทองเก้าสุริยัน",
    "craft": "FORGING",
    "tier": 6,
    "minMastery": 84,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_SCALE_1",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_A_6",
        "count": 2
      },
      {
        "matId": "MAT_ORE_DIVINE_GOLD_6",
        "count": 8
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_003_SWORD_6",
    "outNameTh": "กระบี่มังกรทองเก้าสุริยัน",
    "yield": 1,
    "gearType": "SWORD",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.6,
        "LIGHT_YANG": 0.4
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_004_BLADE_2",
    "nameTh": "ตำรับหลอมดาบกรงเล็บวายุไพร",
    "craft": "FORGING",
    "tier": 2,
    "minMastery": 28,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_B_1",
        "count": 2
      },
      {
        "matId": "MAT_ORE_COLD_STEEL_2",
        "count": 4
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_004_BLADE_2",
    "outNameTh": "ดาบกรงเล็บวายุไพร",
    "yield": 1,
    "gearType": "BLADE",
    "starter": true,
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WIND",
      "weights": {
        "WIND": 0.65,
        "WOOD_LIFE": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_005_BLADE_4",
    "nameTh": "ตำรับหลอมดาบเขี้ยวหมูป่าหินหลอม",
    "craft": "FORGING",
    "tier": 4,
    "minMastery": 56,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_BOAR_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_URSINE_A_4",
        "count": 2
      },
      {
        "matId": "MAT_ORE_MITHRIL_JADE_4",
        "count": 6
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_005_BLADE_4",
    "outNameTh": "ดาบเขี้ยวหมูป่าหินหลอม",
    "yield": 1,
    "gearType": "BLADE",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.65,
        "EARTH_METAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_006_BLADE_6",
    "nameTh": "ตำรับหลอมดาบเขี้ยวไป๋หู่พิฆาตดารา",
    "craft": "FORGING",
    "tier": 6,
    "minMastery": 84,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_FANG_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_URSINE_A_6",
        "count": 2
      },
      {
        "matId": "MAT_ORE_DIVINE_GOLD_6",
        "count": 8
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_006_BLADE_6",
    "outNameTh": "ดาบเขี้ยวไป๋หู่พิฆาตดารา",
    "yield": 1,
    "gearType": "BLADE",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 0.6,
        "ASTRAL": 0.4
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_007_BOW_3",
    "nameTh": "ตำรับหลอมธนูปีกอินทรีศิลา",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_AVIAN_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_UNGULATE_A_3",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_007_BOW_3",
    "outNameTh": "ธนูปีกอินทรีศิลา",
    "yield": 1,
    "gearType": "BOW",
    "starter": false,
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WIND",
      "weights": {
        "WIND": 0.6,
        "EARTH_METAL": 0.4
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_008_BOW_5",
    "nameTh": "ตำรับหลอมธนูขนนกอัสนีคำรณ",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_AVIAN_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_UNGULATE_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_008_BOW_5",
    "outNameTh": "ธนูขนนกอัสนีคำรณ",
    "yield": 1,
    "gearType": "BOW",
    "starter": false,
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 0.7,
        "WIND": 0.3
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_009_SPEAR_3",
    "nameTh": "ตำรับหลอมหอกเขาเหล็กกระทิงศิลา",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_B_3",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_009_SPEAR_3",
    "outNameTh": "หอกเขาเหล็กกระทิงศิลา",
    "yield": 1,
    "gearType": "SPEAR",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_010_SPEAR_5",
    "nameTh": "ตำรับหลอมทวนมหาเขากระทิงเพลิง",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_FELINE_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_010_SPEAR_5",
    "outNameTh": "ทวนมหาเขากระทิงเพลิง",
    "yield": 1,
    "gearType": "SPEAR",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.7,
        "EARTH_METAL": 0.3
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_011_STAFF_2",
    "nameTh": "ตำรับหลอมพลองกระดูกหมีหินผา",
    "craft": "FORGING",
    "tier": 2,
    "minMastery": 28,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_URSINE_A_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_UNGULATE_A_2",
        "count": 2
      },
      {
        "matId": "MAT_ORE_COLD_STEEL_2",
        "count": 4
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_011_STAFF_2",
    "outNameTh": "พลองกระดูกหมีหินผา",
    "yield": 1,
    "gearType": "STAFF",
    "starter": true,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_012_STAFF_5",
    "nameTh": "ตำรับหลอมกระบองกระดูกหมีหิมะโบราณ",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_URSINE_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CHIMERA_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_012_STAFF_5",
    "outNameTh": "กระบองกระดูกหมีหิมะโบราณ",
    "yield": 1,
    "gearType": "STAFF",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 0.65,
        "EARTH_METAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_013_FIST_3",
    "nameTh": "ตำรับหลอมสนับกรงเล็บเสือดาบศิลา",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CHIMERA_B_3",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_013_FIST_3",
    "outNameTh": "สนับกรงเล็บเสือดาบศิลา",
    "yield": 1,
    "gearType": "FIST",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_014_FIST_5",
    "nameTh": "ตำรับหลอมสนับเขี้ยวพยัคฆ์ขาวเหมันต์",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_014_FIST_5",
    "outNameTh": "สนับเขี้ยวพยัคฆ์ขาวเหมันต์",
    "yield": 1,
    "gearType": "FIST",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 0.65,
        "EARTH_METAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_015_FOCUS_3",
    "nameTh": "ตำรับหลอมตราดวงจิตกิเลนศิลา",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_B_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_B_3",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_015_FOCUS_3",
    "outNameTh": "ตราดวงจิตกิเลนศิลา",
    "yield": 1,
    "gearType": "FOCUS",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_016_FOCUS_5",
    "nameTh": "ตำรับหลอมตราเพลิงกิเลนม่วงเก้าวัฏจักร",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AQUATIC_B_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_016_FOCUS_5",
    "outNameTh": "ตราเพลิงกิเลนม่วงเก้าวัฏจักร",
    "yield": 1,
    "gearType": "FOCUS",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.65,
        "ASTRAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_017_HEAVY_2",
    "nameTh": "ตำรับหลอมเกราะหนักหนามเหล็กหมูป่า",
    "craft": "FORGING",
    "tier": 2,
    "minMastery": 28,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_BOAR_B_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_B_2",
        "count": 2
      },
      {
        "matId": "MAT_ORE_COLD_STEEL_2",
        "count": 4
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_017_HEAVY_2",
    "outNameTh": "เกราะหนักหนามเหล็กหมูป่า",
    "yield": 1,
    "gearType": "HEAVY",
    "starter": true,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_018_HEAVY_4",
    "nameTh": "ตำรับหลอมเกราะหนักหมีเหล็กไหลหลังทอง",
    "craft": "FORGING",
    "tier": 4,
    "minMastery": 56,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_URSINE_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_A_4",
        "count": 2
      },
      {
        "matId": "MAT_ORE_MITHRIL_JADE_4",
        "count": 6
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_018_HEAVY_4",
    "outNameTh": "เกราะหนักหมีเหล็กไหลหลังทอง",
    "yield": 1,
    "gearType": "HEAVY",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_019_HEAVY_6",
    "nameTh": "ตำรับหลอมเกราะหนักกระดองเสวียนอู่ค้ำฟ้า",
    "craft": "FORGING",
    "tier": 6,
    "minMastery": 84,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_SHELL_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_B_6",
        "count": 2
      },
      {
        "matId": "MAT_ORE_DIVINE_GOLD_6",
        "count": 8
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_019_HEAVY_6",
    "outNameTh": "เกราะหนักกระดองเสวียนอู่ค้ำฟ้า",
    "yield": 1,
    "gearType": "HEAVY",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 0.55,
        "EARTH_METAL": 0.45
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_020_LIGHT_2",
    "nameTh": "ตำรับหลอมเกราะเบาหนังเสือดาววายุ",
    "craft": "FORGING",
    "tier": 2,
    "minMastery": 28,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_FELINE_B_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CHIMERA_B_2",
        "count": 2
      },
      {
        "matId": "MAT_ORE_COLD_STEEL_2",
        "count": 4
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_020_LIGHT_2",
    "outNameTh": "เกราะเบาหนังเสือดาววายุ",
    "yield": 1,
    "gearType": "LIGHT",
    "starter": true,
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_021_LIGHT_4",
    "nameTh": "ตำรับหลอมเกราะเบาหนังหมาป่าเพลิงโลหิต",
    "craft": "FORGING",
    "tier": 4,
    "minMastery": 56,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_CANINE_B_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_UNGULATE_A_4",
        "count": 2
      },
      {
        "matId": "MAT_ORE_MITHRIL_JADE_4",
        "count": 6
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_021_LIGHT_4",
    "outNameTh": "เกราะเบาหนังหมาป่าเพลิงโลหิต",
    "yield": 1,
    "gearType": "LIGHT",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.6,
        "BLOOD_DEMON": 0.4
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_022_LIGHT_6",
    "nameTh": "ตำรับหลอมเกราะเบาหนังพยัคฆ์ขาวเจ็ดดาว",
    "craft": "FORGING",
    "tier": 6,
    "minMastery": 84,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_PELT_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_CANINE_B_6",
        "count": 2
      },
      {
        "matId": "MAT_ORE_DIVINE_GOLD_6",
        "count": 8
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_022_LIGHT_6",
    "outNameTh": "เกราะเบาหนังพยัคฆ์ขาวเจ็ดดาว",
    "yield": 1,
    "gearType": "LIGHT",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 0.55,
        "ASTRAL": 0.45
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_023_ROBE_2",
    "nameTh": "ตำรับหลอมอาภรณ์แพรนกกระเรียนหยก",
    "craft": "FORGING",
    "tier": 2,
    "minMastery": 28,
    "days": 6,
    "inputs": [
      {
        "matId": "ECO2_MAT_AVIAN_B_2",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_B_1",
        "count": 2
      },
      {
        "matId": "MAT_ORE_COLD_STEEL_2",
        "count": 4
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_023_ROBE_2",
    "outNameTh": "อาภรณ์แพรนกกระเรียนหยก",
    "yield": 1,
    "gearType": "ROBE",
    "starter": true,
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WIND",
      "weights": {
        "WIND": 0.55,
        "WOOD_LIFE": 0.45
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_024_ROBE_4",
    "nameTh": "ตำรับหลอมอาภรณ์ไหมแมงมุมเงารัตติกาล",
    "craft": "FORGING",
    "tier": 4,
    "minMastery": 56,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_ARTHROPOD_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AVIAN_A_4",
        "count": 2
      },
      {
        "matId": "MAT_ORE_MITHRIL_JADE_4",
        "count": 6
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_024_ROBE_4",
    "outNameTh": "อาภรณ์ไหมแมงมุมเงารัตติกาล",
    "yield": 1,
    "gearType": "ROBE",
    "starter": false,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_025_ROBE_6",
    "nameTh": "ตำรับหลอมอาภรณ์แพรโพธิ์สวรรค์หมื่นปี",
    "craft": "FORGING",
    "tier": 6,
    "minMastery": 84,
    "days": 18,
    "inputs": [
      {
        "matId": "ECO2_MAT_MYTHIC_ROOT_8",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_PLANT_SPIRIT_B_6",
        "count": 2
      },
      {
        "matId": "MAT_ORE_DIVINE_GOLD_6",
        "count": 8
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_025_ROBE_6",
    "outNameTh": "อาภรณ์แพรโพธิ์สวรรค์หมื่นปี",
    "yield": 1,
    "gearType": "ROBE",
    "starter": false,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 0.65,
        "WOOD_LIFE": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_026_RING_3",
    "nameTh": "ตำรับหลอมแหวนแก่นเต่าศิลาดำ",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_B_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_A_3",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_026_RING_3",
    "outNameTh": "แหวนแก่นเต่าศิลาดำ",
    "yield": 1,
    "gearType": "RING",
    "starter": false,
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 0.6,
        "WATER_ICE": 0.4
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_027_RING_5",
    "nameTh": "ตำรับหลอมแหวนไข่มุกวิญญาณวาฬคราม",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_AQUATIC_B_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SHELL_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_027_RING_5",
    "outNameTh": "แหวนไข่มุกวิญญาณวาฬคราม",
    "yield": 1,
    "gearType": "RING",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_028_NECKLACE_3",
    "nameTh": "ตำรับหลอมสร้อยเขากวางดาวสารท",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_BOAR_A_1",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_028_NECKLACE_3",
    "outNameTh": "สร้อยเขากวางดาวสารท",
    "yield": 1,
    "gearType": "NECKLACE",
    "starter": false,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 0.6,
        "ASTRAL": 0.4
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_029_NECKLACE_5",
    "nameTh": "ตำรับหลอมสร้อยมงกุฎเขากวางดาราสวรรค์",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_UNGULATE_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AVIAN_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_029_NECKLACE_5",
    "outNameTh": "สร้อยมงกุฎเขากวางดาราสวรรค์",
    "yield": 1,
    "gearType": "NECKLACE",
    "starter": false,
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 0.65,
        "LIGHT_YANG": 0.35
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_030_BRACELET_3",
    "nameTh": "ตำรับหลอมกำไลเกล็ดชะโดหนองบึง",
    "craft": "FORGING",
    "tier": 3,
    "minMastery": 42,
    "days": 9,
    "inputs": [
      {
        "matId": "ECO2_MAT_AQUATIC_A_3",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_SERPENT_B_3",
        "count": 2
      },
      {
        "matId": "MAT_ORE_STAR_COPPER_3",
        "count": 5
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_030_BRACELET_3",
    "outNameTh": "กำไลเกล็ดชะโดหนองบึง",
    "yield": 1,
    "gearType": "BRACELET",
    "starter": false,
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_031_BRACELET_5",
    "nameTh": "ตำรับหลอมกำไลเกล็ดกิเลนเพลิงม่วง",
    "craft": "FORGING",
    "tier": 5,
    "minMastery": 70,
    "days": 15,
    "inputs": [
      {
        "matId": "ECO2_MAT_CHIMERA_A_5",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_ARTHROPOD_A_5",
        "count": 2
      },
      {
        "matId": "MAT_ORE_METEOR_IRON_5",
        "count": 7
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_031_BRACELET_5",
    "outNameTh": "กำไลเกล็ดกิเลนเพลิงม่วง",
    "yield": 1,
    "gearType": "BRACELET",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_REC_EQ_032_CHARM_4",
    "nameTh": "ตำรับหลอมเครื่องรางกระดองเต่าลาวาเพลิง",
    "craft": "FORGING",
    "tier": 4,
    "minMastery": 56,
    "days": 12,
    "inputs": [
      {
        "matId": "ECO2_MAT_SHELL_A_4",
        "count": 2
      },
      {
        "matId": "ECO2_MAT_AQUATIC_A_4",
        "count": 2
      },
      {
        "matId": "MAT_ORE_MITHRIL_JADE_4",
        "count": 6
      }
    ],
    "outType": "EQUIPMENT",
    "outItemId": "ECO2_EQ_032_CHARM_4",
    "outNameTh": "เครื่องรางกระดองเต่าลาวาเพลิง",
    "yield": 1,
    "gearType": "CHARM",
    "starter": false,
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.6,
        "EARTH_METAL": 0.4
      }
    }
  }
];

  const items = [
  {
    "id": "ECO2_EQ_001_SWORD_2",
    "recipeId": "ECO2_REC_EQ_001_SWORD_2",
    "nameTh": "กระบี่เขี้ยวเงาจันทร์",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "SWORD",
    "tier": 2,
    "minStage": 1,
    "value": 140,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_ARMOR_FRACTURE",
        "params": {
          "armorReductionRatio": 0.15
        }
      }
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_002_SWORD_4",
    "recipeId": "ECO2_REC_EQ_002_SWORD_4",
    "nameTh": "กระบี่เกล็ดงูเห่าเหมันต์",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "SWORD",
    "tier": 4,
    "minStage": 3,
    "value": 280,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_CHILL_FREEZE",
        "params": {
          "chillStacks": 1,
          "slowRatio": 0.25
        }
      }
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_003_SWORD_6",
    "recipeId": "ECO2_REC_EQ_003_SWORD_6",
    "nameTh": "กระบี่มังกรทองเก้าสุริยัน",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "SWORD",
    "tier": 6,
    "minStage": 5,
    "value": 880,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_SWORD_STORM_STRIKE",
        "params": {
          "slashPower": 600,
          "maxTargets": 5,
          "armorPenRatio": 0.4
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.6,
        "LIGHT_YANG": 0.4
      }
    }
  },
  {
    "id": "ECO2_EQ_004_BLADE_2",
    "recipeId": "ECO2_REC_EQ_004_BLADE_2",
    "nameTh": "ดาบกรงเล็บวายุไพร",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "BLADE",
    "tier": 2,
    "minStage": 1,
    "value": 140,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BLEEDING",
        "params": {
          "bleedDamagePerTurn": 32
        }
      }
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WIND",
      "weights": {
        "WIND": 0.65,
        "WOOD_LIFE": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_005_BLADE_4",
    "recipeId": "ECO2_REC_EQ_005_BLADE_4",
    "nameTh": "ดาบเขี้ยวหมูป่าหินหลอม",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "BLADE",
    "tier": 4,
    "minStage": 3,
    "value": 280,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BURNING",
        "params": {
          "burnDamagePerTurn": 48
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.65,
        "EARTH_METAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_006_BLADE_6",
    "recipeId": "ECO2_REC_EQ_006_BLADE_6",
    "nameTh": "ดาบเขี้ยวไป๋หู่พิฆาตดารา",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "BLADE",
    "tier": 6,
    "minStage": 5,
    "value": 880,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_ARMOR_FRACTURE",
        "params": {
          "armorReductionRatio": 0.35
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 0.6,
        "ASTRAL": 0.4
      }
    }
  },
  {
    "id": "ECO2_EQ_007_BOW_3",
    "recipeId": "ECO2_REC_EQ_007_BOW_3",
    "nameTh": "ธนูปีกอินทรีศิลา",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "BOW",
    "tier": 3,
    "minStage": 2,
    "value": 210,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_INTENT_SENSE",
        "params": {
          "intentSensitivity": 60,
          "firstTurnEvasionBonus": 0.25
        }
      }
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WIND",
      "weights": {
        "WIND": 0.6,
        "EARTH_METAL": 0.4
      }
    }
  },
  {
    "id": "ECO2_EQ_008_BOW_5",
    "recipeId": "ECO2_REC_EQ_008_BOW_5",
    "nameTh": "ธนูขนนกอัสนีคำรณ",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "BOW",
    "tier": 5,
    "minStage": 3,
    "value": 560,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_SHOCK_CONDUCTION",
        "params": {
          "shockDamage": 85,
          "maxChainTargets": 3
        }
      }
    ],
    "element": "LIGHTNING",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "LIGHTNING",
      "weights": {
        "LIGHTNING": 0.7,
        "WIND": 0.3
      }
    }
  },
  {
    "id": "ECO2_EQ_009_SPEAR_3",
    "recipeId": "ECO2_REC_EQ_009_SPEAR_3",
    "nameTh": "หอกเขาเหล็กกระทิงศิลา",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "SPEAR",
    "tier": 3,
    "minStage": 2,
    "value": 210,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_ARMOR_FRACTURE",
        "params": {
          "armorReductionRatio": 0.22
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_010_SPEAR_5",
    "recipeId": "ECO2_REC_EQ_010_SPEAR_5",
    "nameTh": "ทวนมหาเขากระทิงเพลิง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "SPEAR",
    "tier": 5,
    "minStage": 3,
    "value": 560,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BURNING",
        "params": {
          "burnDamagePerTurn": 55
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.7,
        "EARTH_METAL": 0.3
      }
    }
  },
  {
    "id": "ECO2_EQ_011_STAFF_2",
    "recipeId": "ECO2_REC_EQ_011_STAFF_2",
    "nameTh": "พลองกระดูกหมีหินผา",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "STAFF",
    "tier": 2,
    "minStage": 1,
    "value": 140,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BARRIER_SHIELD",
        "params": {
          "barrierCapacity": 450
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_012_STAFF_5",
    "recipeId": "ECO2_REC_EQ_012_STAFF_5",
    "nameTh": "กระบองกระดูกหมีหิมะโบราณ",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "STAFF",
    "tier": 5,
    "minStage": 3,
    "value": 560,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_DAMAGE_REFLECT",
        "params": {
          "reflectRatio": 0.3,
          "maxReflectCap": 650
        }
      }
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 0.65,
        "EARTH_METAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_013_FIST_3",
    "recipeId": "ECO2_REC_EQ_013_FIST_3",
    "nameTh": "สนับกรงเล็บเสือดาบศิลา",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "FIST",
    "tier": 3,
    "minStage": 2,
    "value": 210,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BLEEDING",
        "params": {
          "bleedDamagePerTurn": 38
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_014_FIST_5",
    "recipeId": "ECO2_REC_EQ_014_FIST_5",
    "nameTh": "สนับเขี้ยวพยัคฆ์ขาวเหมันต์",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "FIST",
    "tier": 5,
    "minStage": 3,
    "value": 560,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_CHILL_FREEZE",
        "params": {
          "chillStacks": 2,
          "slowRatio": 0.35
        }
      }
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 0.65,
        "EARTH_METAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_015_FOCUS_3",
    "recipeId": "ECO2_REC_EQ_015_FOCUS_3",
    "nameTh": "ตราดวงจิตกิเลนศิลา",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "FOCUS",
    "tier": 3,
    "minStage": 2,
    "value": 210,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_QI_RESERVOIR",
        "params": {
          "reservoirCapacity": 420,
          "leakagePerDay": 2
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_016_FOCUS_5",
    "recipeId": "ECO2_REC_EQ_016_FOCUS_5",
    "nameTh": "ตราเพลิงกิเลนม่วงเก้าวัฏจักร",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "gearType": "FOCUS",
    "tier": 5,
    "minStage": 3,
    "value": 560,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_QI_SIPHON",
        "params": {
          "siphonAmount": 90,
          "conversionEfficiency": 0.8
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.65,
        "ASTRAL": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_017_HEAVY_2",
    "recipeId": "ECO2_REC_EQ_017_HEAVY_2",
    "nameTh": "เกราะหนักหนามเหล็กหมูป่า",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "HEAVY",
    "tier": 2,
    "minStage": 1,
    "value": 150,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_DAMAGE_REFLECT",
        "params": {
          "reflectRatio": 0.2,
          "maxReflectCap": 400
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_018_HEAVY_4",
    "recipeId": "ECO2_REC_EQ_018_HEAVY_4",
    "nameTh": "เกราะหนักหมีเหล็กไหลหลังทอง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "HEAVY",
    "tier": 4,
    "minStage": 3,
    "value": 300,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_CONTROL_RESILIENCE",
        "params": {
          "controlDurationReductionRatio": 0.4,
          "resilienceScore": 55
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_019_HEAVY_6",
    "recipeId": "ECO2_REC_EQ_019_HEAVY_6",
    "nameTh": "เกราะหนักกระดองเสวียนอู่ค้ำฟ้า",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "HEAVY",
    "tier": 6,
    "minStage": 5,
    "value": 920,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_REALM_SUPPRESSION_GUARD",
        "params": {
          "maxCrossRealmDelta": 2,
          "suppressionReductionRatio": 0.45
        }
      }
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 0.55,
        "EARTH_METAL": 0.45
      }
    }
  },
  {
    "id": "ECO2_EQ_020_LIGHT_2",
    "recipeId": "ECO2_REC_EQ_020_LIGHT_2",
    "nameTh": "เกราะเบาหนังเสือดาววายุ",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "LIGHT",
    "tier": 2,
    "minStage": 1,
    "value": 140,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_SIDESTEP_EVASION",
        "params": {
          "evasionChanceBonus": 0.2,
          "movementCost": 3
        }
      }
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WIND",
      "weights": {
        "WIND": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_021_LIGHT_4",
    "recipeId": "ECO2_REC_EQ_021_LIGHT_4",
    "nameTh": "เกราะเบาหนังหมาป่าเพลิงโลหิต",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "LIGHT",
    "tier": 4,
    "minStage": 3,
    "value": 280,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_TIMED_PARRY",
        "params": {
          "parryMitigationRatio": 0.45,
          "parryCharges": 2
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.6,
        "BLOOD_DEMON": 0.4
      }
    }
  },
  {
    "id": "ECO2_EQ_022_LIGHT_6",
    "recipeId": "ECO2_REC_EQ_022_LIGHT_6",
    "nameTh": "เกราะเบาหนังพยัคฆ์ขาวเจ็ดดาว",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "LIGHT",
    "tier": 6,
    "minStage": 5,
    "value": 890,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_SIDESTEP_EVASION",
        "params": {
          "evasionChanceBonus": 0.32,
          "movementCost": 2
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 0.55,
        "ASTRAL": 0.45
      }
    }
  },
  {
    "id": "ECO2_EQ_023_ROBE_2",
    "recipeId": "ECO2_REC_EQ_023_ROBE_2",
    "nameTh": "อาภรณ์แพรนกกระเรียนหยก",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "ROBE",
    "tier": 2,
    "minStage": 1,
    "value": 140,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_QI_RESERVOIR",
        "params": {
          "reservoirCapacity": 350,
          "leakagePerDay": 2
        }
      }
    ],
    "element": "WIND",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WIND",
      "weights": {
        "WIND": 0.55,
        "WOOD_LIFE": 0.45
      }
    }
  },
  {
    "id": "ECO2_EQ_024_ROBE_4",
    "recipeId": "ECO2_REC_EQ_024_ROBE_4",
    "nameTh": "อาภรณ์ไหมแมงมุมเงารัตติกาล",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "ROBE",
    "tier": 4,
    "minStage": 3,
    "value": 280,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_STEALTH_CONCEALMENT",
        "params": {
          "concealmentScore": 55
        }
      }
    ],
    "element": "YIN_SHADOW",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "YIN_SHADOW",
      "weights": {
        "YIN_SHADOW": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_025_ROBE_6",
    "recipeId": "ECO2_REC_EQ_025_ROBE_6",
    "nameTh": "อาภรณ์แพรโพธิ์สวรรค์หมื่นปี",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "gearType": "ROBE",
    "tier": 6,
    "minStage": 5,
    "value": 900,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_CALM_MIND",
        "params": {
          "heartDemonReduction": 35,
          "soulDefenseBonus": 50
        }
      }
    ],
    "element": "LIGHT_YANG",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "LIGHT_YANG",
      "weights": {
        "LIGHT_YANG": 0.65,
        "WOOD_LIFE": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_026_RING_3",
    "recipeId": "ECO2_REC_EQ_026_RING_3",
    "nameTh": "แหวนแก่นเต่าศิลาดำ",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "RING",
    "tier": 3,
    "minStage": 2,
    "value": 200,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BARRIER_SHIELD",
        "params": {
          "barrierCapacity": 480
        }
      }
    ],
    "element": "EARTH_METAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "EARTH_METAL",
      "weights": {
        "EARTH_METAL": 0.6,
        "WATER_ICE": 0.4
      }
    }
  },
  {
    "id": "ECO2_EQ_027_RING_5",
    "recipeId": "ECO2_REC_EQ_027_RING_5",
    "nameTh": "แหวนไข่มุกวิญญาณวาฬคราม",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "RING",
    "tier": 5,
    "minStage": 3,
    "value": 540,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_QI_SIPHON",
        "params": {
          "siphonAmount": 80,
          "conversionEfficiency": 0.75
        }
      }
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_028_NECKLACE_3",
    "recipeId": "ECO2_REC_EQ_028_NECKLACE_3",
    "nameTh": "สร้อยเขากวางดาวสารท",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "NECKLACE",
    "tier": 3,
    "minStage": 2,
    "value": 200,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_CALM_MIND",
        "params": {
          "heartDemonReduction": 25,
          "soulDefenseBonus": 35
        }
      }
    ],
    "element": "WOOD_LIFE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "WOOD_LIFE",
      "weights": {
        "WOOD_LIFE": 0.6,
        "ASTRAL": 0.4
      }
    }
  },
  {
    "id": "ECO2_EQ_029_NECKLACE_5",
    "recipeId": "ECO2_REC_EQ_029_NECKLACE_5",
    "nameTh": "สร้อยมงกุฎเขากวางดาราสวรรค์",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "NECKLACE",
    "tier": 5,
    "minStage": 3,
    "value": 540,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_INTENT_SENSE",
        "params": {
          "intentSensitivity": 65,
          "firstTurnEvasionBonus": 0.28
        }
      }
    ],
    "element": "ASTRAL",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "ASTRAL",
      "weights": {
        "ASTRAL": 0.65,
        "LIGHT_YANG": 0.35
      }
    }
  },
  {
    "id": "ECO2_EQ_030_BRACELET_3",
    "recipeId": "ECO2_REC_EQ_030_BRACELET_3",
    "nameTh": "กำไลเกล็ดชะโดหนองบึง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "BRACELET",
    "tier": 3,
    "minStage": 2,
    "value": 200,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_SUPPLY_EFFICIENCY",
        "params": {
          "supplySavingRatio": 0.25
        }
      }
    ],
    "element": "WATER_ICE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "WATER_ICE",
      "weights": {
        "WATER_ICE": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_031_BRACELET_5",
    "recipeId": "ECO2_REC_EQ_031_BRACELET_5",
    "nameTh": "กำไลเกล็ดกิเลนเพลิงม่วง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "BRACELET",
    "tier": 5,
    "minStage": 3,
    "value": 540,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_BURNING",
        "params": {
          "burnDamagePerTurn": 45
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_SINGLE",
      "primary": "FIRE",
      "weights": {
        "FIRE": 1
      }
    }
  },
  {
    "id": "ECO2_EQ_032_CHARM_4",
    "recipeId": "ECO2_REC_EQ_032_CHARM_4",
    "nameTh": "เครื่องรางกระดองเต่าลาวาเพลิง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "gearType": "CHARM",
    "tier": 4,
    "minStage": 3,
    "value": 270,
    "craft": "FORGING",
    "durability": 100,
    "charges": null,
    "effects": [
      {
        "effectId": "EFX_TRIBULATION_SHIELD",
        "params": {
          "tribulationMitigationRatio": 0.3,
          "maxSupportedLayers": 6
        }
      }
    ],
    "element": "FIRE",
    "elementProfile": {
      "mode": "INTRINSIC_WEIGHTED",
      "primary": "FIRE",
      "weights": {
        "FIRE": 0.6,
        "EARTH_METAL": 0.4
      }
    }
  }
];


  /* ============================================================================
   * Patch v2.0.22: Deep Beast Anatomy System, 18 New Spirit Beasts,
   * 36 Beast Anatomy Materials (24 Active + 12 Backlog for Future Patches),
   * & 24 New Equipment Items + 24 Recipes with Rare Keyword Expansion
   * ============================================================================ */
  const epSingleV222 = el => ({ mode: 'INTRINSIC_SINGLE', primary: el, weights: { [el]: 1 } });
  const epLinkV222 = el => ({ mode: 'ELEMENT_LINK_ONLY', primary: el, weights: { [el]: 1 } });
  const epWeightedV222 = (el1, w1, el2, w2) => ({ mode: 'INTRINSIC_WEIGHTED', primary: el1, weights: { [el1]: w1, [el2]: w2 } });

  // 24 Active Beast Anatomy Materials (used directly in v2.0.22 Equipment Recipes)
  const v222ActiveBeastMats = [
    { id: 'MAT_V222_BP_01', nameTh: 'เขี้ยวหมาป่ากิเลนโลหิต', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'mountain', value: 68, anatomy: 'FANG_CLAW', relic: false, element: 'BLOOD_DEMON', elementProfile: epLinkV222('BLOOD_DEMON'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ใช้หลอมสนับมือและดาบสายโลหิต เพิ่มฤทธิ์ดูดเลือดและฉีกเกราะ' },
    { id: 'MAT_V222_BP_02', nameTh: 'โลหิตหัวใจกิเลนทมิฬ', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'mountain', value: 72, anatomy: 'ESSENCE_BLOOD', relic: false, element: 'BLOOD_DEMON', elementProfile: epLinkV222('BLOOD_DEMON'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ชุบคมศาสตราและหลอมแหวนโลหิตสังเวย เพิ่มพลังปะทุสังหาร' },
    { id: 'MAT_V222_BP_03', nameTh: 'ขนปีกเหยี่ยวเผิงอสนีสวรรค์', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'mountain', value: 125, anatomy: 'PLUME_WING', relic: false, element: 'LIGHTNING', elementProfile: epLinkV222('LIGHTNING'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ใช้สร้างพู่กันสายฟ้า เกาทัณฑ์อสนี และอาภรณ์เหินเวหา' },
    { id: 'MAT_V222_BP_04', nameTh: 'กรงเล็บทองคำเหยี่ยวเผิงสายฟ้า', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'mountain', value: 132, anatomy: 'FANG_CLAW', relic: false, element: 'LIGHTNING', elementProfile: epLinkV222('LIGHTNING'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมสนับมืออสนีและทวนสายฟ้าฟาด ทะลวงม่านปราณศัตรู' },
    { id: 'MAT_V222_BP_05', nameTh: 'เกล็ดย้อนมังกรน้ำแข็งเจ็ดสมุทร', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'water', value: 235, anatomy: 'SCALE_SHELL', relic: true, element: 'WATER_ICE', elementProfile: epLinkV222('WATER_ICE'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมเกราะเกล็ดเหมันต์และกระบี่น้ำแข็ง ผนึกความเร็วและปราณศัตรู' },
    { id: 'MAT_V222_BP_06', nameTh: 'เอ็นมังกรเกล็ดน้ำแข็งพันปี', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'water', value: 240, anatomy: 'TENDON_VEIN', relic: true, element: 'WATER_ICE', elementProfile: epLinkV222('WATER_ICE'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ขึงสายธนูและสายพิณเหมันต์เจ็ดสมุทร สะกดจิตและแช่แข็งชีพจร' },
    { id: 'MAT_V222_BP_07', nameTh: 'ขนหางจิ้งจอกเก้าหางดารา', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'forest', value: 230, anatomy: 'PELT_HIDE', relic: true, element: 'ASTRAL', elementProfile: epLinkV222('ASTRAL'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ทออาภรณ์มายาดาราและพู่กันพยากรณ์ สร้างร่างแยกมายาและหยั่งรู้วิชา' },
    { id: 'MAT_V222_BP_08', nameTh: 'เนตรดาราจิ้งจอกสวรรค์', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'forest', value: 245, anatomy: 'INNER_CORE', relic: true, element: 'ASTRAL', elementProfile: epLinkV222('ASTRAL'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ฝังในเครื่องรางและสร้อยประคำดารา เปิดเนตรส่องทะลุการพรางตัวและค่ายกล' },
    { id: 'MAT_V222_BP_09', nameTh: 'เหล็กในจักรพรรดิแมงป่องหยิน', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'desert', value: 128, anatomy: 'HORN_BONE', relic: false, element: 'YIN_SHADOW', elementProfile: epLinkV222('YIN_SHADOW'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมปลายแส้พิษและมีดสั้นเงาหยิน แพร่พิษกัดกร่อนเส้นปราณ' },
    { id: 'MAT_V222_BP_10', nameTh: 'ถุงพิษหยินเร้นวิญญาณ', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'desert', value: 135, anatomy: 'VENOM_SAC', relic: false, element: 'YIN_SHADOW', elementProfile: epLinkV222('YIN_SHADOW'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมศาสตราวุธอาบพิษและกำไลสลายพิษ กัดกร่อนสมาธิและขัดจังหวะร่าย' },
    { id: 'MAT_V222_BP_11', nameTh: 'เขี้ยวดาบพยัคฆ์วายุคลั่ง', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'forest', value: 66, anatomy: 'FANG_CLAW', relic: false, element: 'WIND', elementProfile: epLinkV222('WIND'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ตีดาบวายุคลั่งและกระบี่พายุหมุน ฟาดฟันหลายเป้าหมายพร้อมกัน' },
    { id: 'MAT_V222_BP_12', nameTh: 'หนังพยัคฆ์ลายเมฆาคลั่ง', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'forest', value: 64, anatomy: 'PELT_HIDE', relic: false, element: 'WIND', elementProfile: epLinkV222('WIND'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ตัดเย็บเกราะเบาวายุพยัคฆ์ เพิ่มความเร็วหลบหลีกและล้างกลิ่นร่องรอย' },
    { id: 'MAT_V222_BP_13', nameTh: 'กระดองเต่าทองสุริยันอัคคี', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'water', value: 138, anatomy: 'SCALE_SHELL', relic: false, element: 'LIGHT_YANG', elementProfile: epLinkV222('LIGHT_YANG'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ตีเกราะหนักสุริยันและโล่คุ้มชีพ แบ่งเบาความเสียหายและต้านฟ้าทัณฑ์' },
    { id: 'MAT_V222_BP_14', nameTh: 'แก่นปราณเต่าทองสุริยัน', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'water', value: 142, anatomy: 'INNER_CORE', relic: false, element: 'LIGHT_YANG', elementProfile: epLinkV222('LIGHT_YANG'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมลูกแก้ววิญญาณและพลองสุริยัน ชำระสถานะร้ายและเชื่อมค่ายกล' },
    { id: 'MAT_V222_BP_15', nameTh: 'อุ้งตีนหมีคลั่งโลหิตผาแดง', category: 'BEAST_PART', tier: 2, craft: 'FORGING', terrain: 'mountain', value: 36, anatomy: 'FANG_CLAW', relic: false, element: 'BLOOD_DEMON', elementProfile: epLinkV222('BLOOD_DEMON'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมสนับมือหมีคลั่งขั้นต้น เพิ่มแรงปะทะและข่มขวัญสัตว์อสูร' },
    { id: 'MAT_V222_BP_16', nameTh: 'เขากวางกิเลนอสนีคราม', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'forest', value: 70, anatomy: 'HORN_BONE', relic: false, element: 'LIGHTNING', elementProfile: epLinkV222('LIGHTNING'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'สลักปิ่นและกำไลอสนีคราม นำกระแสสายฟ้าชิ่งโจมตีและเร่งการบ่มเพาะ' },
    { id: 'MAT_V222_BP_17', nameTh: 'ก้ามปูยักษ์เหล็กเหมันต์บาดาล', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'water', value: 68, anatomy: 'FANG_CLAW', relic: false, element: 'WATER_ICE', elementProfile: epLinkV222('WATER_ICE'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมทวนและพลองหนีบศาสตรา ปลดอาวุธและผนึกการเคลื่อนไหวศัตรู' },
    { id: 'MAT_V222_BP_18', nameTh: 'เส้นไหมผีเสื้อมายาจันทร์เร้น', category: 'BEAST_PART', tier: 2, craft: 'FORGING', terrain: 'forest', value: 38, anatomy: 'TENDON_VEIN', relic: false, element: 'ASTRAL', elementProfile: epLinkV222('ASTRAL'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'ถักสายแส้มายาและผ้าคลุมพรางเงา รบกวนสัญญาณสืบข่าวและลวงตา' },
    { id: 'MAT_V222_BP_19', nameTh: 'เขี้ยวหมูป่าสิงห์เพลิงโลกันตร์', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'desert', value: 65, anatomy: 'FANG_CLAW', relic: false, element: 'FIRE', elementProfile: epLinkV222('FIRE'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมดาบใหญ่และเกราะอกเพลิงโลกันตร์ ระเบิดพลังเผาผลาญเกราะศัตรู' },
    { id: 'MAT_V222_BP_20', nameTh: 'เถาหนามอสูรพฤกษาโลหิตพันปี', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'forest', value: 126, anatomy: 'TENDON_VEIN', relic: false, element: 'WOOD_LIFE', elementProfile: epLinkV222('WOOD_LIFE'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมแส้หนามพฤกษาและกับดักรากไม้พันธนาการ ดูดพลังชีวิตและตรึงพื้นที่' },
    { id: 'MAT_V222_BP_21', nameTh: 'ขนปีกเหล็กพญาครุฑตัดเมฆา', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'mountain', value: 238, anatomy: 'PLUME_WING', relic: true, element: 'EARTH_METAL', elementProfile: epLinkV222('EARTH_METAL'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมกระบี่บินและเกาทัณฑ์ครุฑเหล็ก เจาะทะลุเกราะและดึงดูดอาวุธศัตรู' },
    { id: 'MAT_V222_BP_22', nameTh: 'เขี้ยวเงาเสือดำรัตติกาล', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'forest', value: 130, anatomy: 'FANG_CLAW', relic: false, element: 'YIN_SHADOW', elementProfile: epLinkV222('YIN_SHADOW'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมกริชและสนับมือเงารัตติกาล เปิดจุดอ่อนคริติคอลและตีตราไล่ล่า' },
    { id: 'MAT_V222_BP_23', nameTh: 'ขนหงอนกระเรียนขาวบัวสวรรค์', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'water', value: 69, anatomy: 'PLUME_WING', relic: false, element: 'LIGHT_YANG', elementProfile: epLinkV222('LIGHT_YANG'), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'สร้างพิณบัวสวรรค์และสร้อยประคำเมตตา ฟื้นฟูหมู่และเชื่อมสายสัมพันธ์สัตว์วิญญาณ' },
    { id: 'MAT_V222_BP_24', nameTh: 'แก่นอสูรราชันย์กลืนดารา', category: 'BEAST_PART', tier: 6, craft: 'FORGING', terrain: 'ruins', value: 420, anatomy: 'INNER_CORE', relic: true, element: 'BLOOD_DEMON', elementProfile: epWeightedV222('BLOOD_DEMON', 0.6, 'ASTRAL', 0.4), craftingStatus: 'ACTIVE_IN_RECIPES', usesTh: 'หลอมศาสตราและเครื่องรางระดับราชันย์ สลายบัฟศัตรูและต้านแรงกดดันข้ามขั้นตบะ' }
  ];

  // 12 Reserved Beast Anatomy Materials (Documented in JD.BEASTS.unassignedAnatomyBacklog for Future Patches!)
  const v222ReservedBeastMats = [
    { id: 'MAT_V222_BP_25', nameTh: 'ไขกระดูกหมาป่ากิเลนโลหิต', category: 'BEAST_PART', tier: 3, craft: 'ALCHEMY', terrain: 'mountain', value: 70, anatomy: 'HORN_BONE', relic: false, element: 'BLOOD_DEMON', elementProfile: epLinkV222('BLOOD_DEMON'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรโอสถชุบกระดูกโลหิตกิเลน)', plannedUsageTh: 'โอสถหลอมกระดูกสายมารโลหิต / โอสถปลุกสายเลือดอสูรขั้นกลาง' },
    { id: 'MAT_V222_BP_26', nameTh: 'ถุงลมปราณเหยี่ยวเผิงสายฟ้า', category: 'BEAST_PART', tier: 4, craft: 'TALISMAN', terrain: 'mountain', value: 120, anatomy: 'INNER_CORE', relic: false, element: 'LIGHTNING', elementProfile: epLinkV222('LIGHTNING'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรยันต์เหินเวหาและค่ายกลสายฟ้า)', plannedUsageTh: 'ยันต์เคลื่อนย้ายพริบตาอสนี / เรือเหาะปราณสำนัก' },
    { id: 'MAT_V222_BP_27', nameTh: 'มุกน้ำแข็งใต้คางมังกรสมุทร', category: 'BEAST_PART', tier: 5, craft: 'ARRAY', terrain: 'water', value: 230, anatomy: 'INNER_CORE', relic: true, element: 'WATER_ICE', elementProfile: epLinkV222('WATER_ICE'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรแกนค่ายกลเหมันต์ปิดสำนัก)', plannedUsageTh: 'แกนค่ายกลพิทักษ์สำนักระดับสูง (ค่ายกลม่านน้ำแข็งหมื่นลี้)' },
    { id: 'MAT_V222_BP_28', nameTh: 'โลหิตหัวใจจิ้งจอกเก้าหางดารา', category: 'BEAST_PART', tier: 5, craft: 'ALCHEMY', terrain: 'forest', value: 240, anatomy: 'ESSENCE_BLOOD', relic: true, element: 'ASTRAL', elementProfile: epLinkV222('ASTRAL'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรโอสถเปิดเนตรสวรรค์และหยั่งรู้อนาคต)', plannedUsageTh: 'โอสถทิพย์เนตรสวรรค์หยั่งรู้ฟ้าดิน / พิธีกรรมพยากรณ์ชะตายุทธภพ' },
    { id: 'MAT_V222_BP_29', nameTh: 'เปลือกเกราะแมงป่องหยินร้อยพิษ', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'desert', value: 118, anatomy: 'SCALE_SHELL', relic: false, element: 'YIN_SHADOW', elementProfile: epLinkV222('YIN_SHADOW'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรหุ่นเชิดแมงป่องพิษกลไก)', plannedUsageTh: 'สร้างหุ่นเชิดอสูรพิษเฝ้าด่าน / เกราะเบาซ่อนเงาขั้นสูง' },
    { id: 'MAT_V222_BP_30', nameTh: 'เอ็นขาหน้าพยัคฆ์เขี้ยวดาบวายุ', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'forest', value: 62, anatomy: 'TENDON_VEIN', relic: false, element: 'WIND', elementProfile: epLinkV222('WIND'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรรองเท้าเหยียบเมฆาและกลไกหน้าไม้)', plannedUsageTh: 'รองเท้าปราณวายุ / สายธนูกลไกยิงต่อเนื่อง' },
    { id: 'MAT_V222_BP_31', nameTh: 'โลหิตทองคำเต่าสุริยัน', category: 'BEAST_PART', tier: 4, craft: 'ALCHEMY', terrain: 'water', value: 135, anatomy: 'ESSENCE_BLOOD', relic: false, element: 'LIGHT_YANG', elementProfile: epLinkV222('LIGHT_YANG'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรโอสถอายุวัฒนะเต่าทองพันปี)', plannedUsageTh: 'โอสถต่ออายุขัยผู้อาวุโส / หมึกชาดสุริยันเขียนยันต์ระดับ 5' },
    { id: 'MAT_V222_BP_32', nameTh: 'ดีหมีคลั่งโลหิตผาแดง', category: 'BEAST_PART', tier: 2, craft: 'ALCHEMY', terrain: 'mountain', value: 38, anatomy: 'INNER_CORE', relic: false, element: 'BLOOD_DEMON', elementProfile: epLinkV222('BLOOD_DEMON'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรสุราปราณเดือดและยาคลั่งศึก)', plannedUsageTh: 'หมักสุราปราณโลหิตในโรงเตี๊ยมสำนัก / โอสถระเบิดพละกำลัง' },
    { id: 'MAT_V222_BP_33', nameTh: 'กีบเท้ากวางกิเลนอสนีคราม', category: 'BEAST_PART', tier: 3, craft: 'FORGING', terrain: 'forest', value: 66, anatomy: 'HORN_BONE', relic: false, element: 'LIGHTNING', elementProfile: epLinkV222('LIGHTNING'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรเกือกม้าศึกและอานสัตว์ขี่อสนี)', plannedUsageTh: 'อุปกรณ์สวมใส่สัตว์ขี่ (Mount Gear) เพิ่มความเร็วเดินทางในแผนที่โลก' },
    { id: 'MAT_V222_BP_34', nameTh: 'ผงปีกผีเสื้อไหมมายาจันทร์เร้น', category: 'BEAST_PART', tier: 2, craft: 'ALCHEMY', terrain: 'forest', value: 36, anatomy: 'PLUME_WING', relic: false, element: 'ASTRAL', elementProfile: epLinkV222('ASTRAL'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรผงนิทราลวงจิตสำหรับสายลับ)', plannedUsageTh: 'อุปกรณ์สายลับ (spymaster) ใช้ลอบวางยาและอำพรางตัวในสำนักศัตรู' },
    { id: 'MAT_V222_BP_35', nameTh: 'หัวใจพฤกษาอสูรหนามโลหิต', category: 'BEAST_PART', tier: 4, craft: 'ARRAY', terrain: 'forest', value: 128, anatomy: 'INNER_CORE', relic: false, element: 'WOOD_LIFE', elementProfile: epLinkV222('WOOD_LIFE'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรปุ๋ยวิญญาณเร่งโตสมุนไพรพันปี)', plannedUsageTh: 'ฝังในแปลงสมุนไพรสำนักเพื่อปลูกสมุนไพรระดับ 5–6' },
    { id: 'MAT_BP_MIST_STAG_ANTLER_3', nameTh: 'เขากวางวิญญาณหมอกมรกต', category: 'BEAST_PART', tier: 3, craft: 'ALCHEMY', terrain: 'forest', value: 78, anatomy: 'HORN_BONE', relic: false, family: 'UNGULATE', sourceBeastIds: ['BEAST_MIST_JADE_STAG', 'BEAST_THUNDER_HORN_STAG_4'], element: 'YIN_SHADOW', elementProfile: epSingleV222('YIN_SHADOW'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'เขากวางหมอกมรกต (จดบันทึกไว้สร้างตำรับโอสถบำรุงจิตและปิ่นหยกในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรโอสถสงบจิตและเครื่องรางสายหมอกในแพตช์ถัดไป' },
    { id: 'MAT_BP_THUNDER_LIZARD_SCALE_4', nameTh: 'เกล็ดกิ้งก่ามังกรสายฟ้า', category: 'BEAST_PART', tier: 4, craft: 'FORGING', terrain: 'desert', value: 165, anatomy: 'SCALE_SHELL', relic: false, family: 'SERPENT', sourceBeastIds: ['BEAST_THUNDER_DRAKE_LIZARD', 'BEAST_ABYSSAL_LEVIATHAN_TURTLE', 'BEAST_THUNDER_HORN_STAG_4'], element: 'LIGHTNING', elementProfile: epSingleV222('LIGHTNING'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'เกล็ดหุ้มสายฟ้า (จดบันทึกไว้สร้างเกราะเกล็ดมังกรสายฟ้าในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรเกราะเบาต้านทานสายฟ้าในแพตช์ถัดไป' },
    { id: 'MAT_FORM_LIFE_ESSENCE_DEW_4', nameTh: 'หยาดน้ำค้างแก่นพฤกษาพันปี', category: 'FORMATION_PART', tier: 4, craft: 'ALCHEMY', terrain: 'forest', value: 175, anatomy: 'ESSENCE_GLAND', relic: false, family: 'PLANT_SPIRIT', sourceBeastIds: ['BEAST_ANCIENT_TREANT_SERPENT_4'], element: 'WOOD_LIFE', elementProfile: epSingleV222('WOOD_LIFE'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'หยาดน้ำค้างพฤกษาพันปี (จดบันทึกไว้สร้างโอสถต่ออายุขัยและค่ายกลฟื้นฟูในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรโอสถฟื้นฟูเส้นชีพจรในแพตช์ถัดไป' },
    { id: 'MAT_BP_FROST_KIRIN_PLUME_5', nameTh: 'ขนแผงคอกิเลนเหมันต์ดาราเร้น', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'mountain', value: 360, anatomy: 'WING_PLUME', relic: false, family: 'UNGULATE', sourceBeastIds: ['BEAST_FROST_MIST_KIRIN', 'BEAST_MYTHIC_CELESTIAL_QILIN_SOVEREIGN'], element: 'ASTRAL', elementProfile: epSingleV222('ASTRAL'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'ขนแผงคอกิเลนดารา (จดบันทึกไว้สร้างพู่กันเซียนและผ้าคลุมดาราในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรพู่กันดาราและอาภรณ์เซียนเหมันต์ในแพตช์ถัดไป' },
    { id: 'MAT_FORM_VOID_COMPASS_SHARD_5', nameTh: 'เศษเข็มทิศมิติเหยี่ยวดารา', category: 'FORMATION_PART', tier: 5, craft: 'ARRAY', terrain: 'ruins', value: 375, anatomy: 'INNER_CORE', relic: false, family: 'AVIAN', sourceBeastIds: ['BEAST_ASTRAL_VOID_HAWK_5'], element: 'ASTRAL', elementProfile: epSingleV222('ASTRAL'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'เศษผลึกนำทางมิติ (จดบันทึกไว้สร้างจานค่ายกลเปิดประตูมิติในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรเครื่องรางนำทางแดนหมื่นพิภพในแพตช์ถัดไป' },
    { id: 'MAT_BP_PHOENIX_PLUME_6', nameTh: 'ขนปีกพญาอินทรีสายฟ้าม่วง', category: 'BEAST_PART', tier: 6, craft: 'FORGING', terrain: 'mountain', value: 780, anatomy: 'WING_PLUME', relic: true, family: 'AVIAN', sourceBeastIds: ['BEAST_THUNDER_ROC'], element: 'LIGHTNING', elementProfile: epSingleV222('LIGHTNING'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'ขนปีกพญาอินทรีอสนี (จดบันทึกไว้สร้างศรเทพอสนีและพัดขนนกสายฟ้าในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรเกาทัณฑ์และเครื่องรางความเร็วสูงขั้น 6 ในแพตช์ถัดไป' },
    { id: 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', nameTh: 'แก่นปราณเทพอสูรพิทักษ์บรรพกาล', category: 'BEAST_PART', tier: 6, craft: 'ALCHEMY', terrain: 'ruins', value: 850, anatomy: 'INNER_CORE', relic: true, family: 'CHIMERA', sourceBeastIds: ['BEAST_MYTHIC_TAOTIE_SHADOW', 'BEAST_MYTHIC_CELESTIAL_QILIN_SOVEREIGN'], element: 'WIND', elementProfile: epSingleV222('WIND'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'แก่นเทพอสูรบรรพกาล (จดบันทึกไว้สร้างมหาโอสถทะลวงด่านเซียนในแพตช์ถัดไป)', plannedUsageTh: 'รอสร้างสูตรโอสถราชันอสูรและค่ายกลพิทักษ์สำนักขั้น 6 ในแพตช์ถัดไป' },
    { id: 'MAT_V222_BP_36', nameTh: 'จะงอยปากเหล็กพญาครุฑตัดเมฆา', category: 'BEAST_PART', tier: 5, craft: 'FORGING', terrain: 'mountain', value: 235, anatomy: 'HORN_BONE', relic: true, element: 'EARTH_METAL', elementProfile: epLinkV222('EARTH_METAL'), craftingStatus: 'RESERVED_FOR_NEXT_PATCH', usesTh: 'วัตถุดิบสำรองสำหรับแพตช์หน้า (รอผูกสูตรหัวลูกศรทะลวงค่ายกลสำนัก)', plannedUsageTh: 'ศาสตราตีค่ายสำนัก (Siege Ballista Bolt) เจาะเกราะค่ายกลระดับแดนศักดิ์สิทธิ์' }
  ];

  // 18 New Spirit Beast Species (every beast has complete body anatomy + active & backlog drops!)
  const v222Beasts = [
    { id: 'BEAST_V222_BLOOD_KIRIN_WOLF', nameTh: 'หมาป่ากิเลนโลหิตทมิฬ', tier: 3, cp: 520, flee: 18, aggro: 78, drops: ['MAT_V222_BP_01', 'MAT_V222_BP_02', 'MAT_V222_BP_25', 'MAT_BP_BEAST_MEAT_1'], terrain: 'mountain', family: 'CANINE', archetype: 'CANINE', element: 'BLOOD_DEMON', visual: { body: '#6e1b26', accent: '#d94b5a', mark: 'crest', scale: 1.22 }, elementProfile: epSingleV222('BLOOD_DEMON') },
    { id: 'BEAST_V222_THUNDER_ROC_FALCON', nameTh: 'เหยี่ยวเผิงสายฟ้าเก้าเวหา', tier: 4, cp: 1280, flee: 15, aggro: 74, drops: ['MAT_V222_BP_03', 'MAT_V222_BP_04', 'MAT_V222_BP_26', 'MAT_BP_BEAST_MEAT_1'], terrain: 'mountain', family: 'AVIAN', archetype: 'AVIAN', element: 'LIGHTNING', visual: { body: '#2c497f', accent: '#7cd4ff', mark: 'wings', scale: 1.38 }, elementProfile: epSingleV222('LIGHTNING') },
    { id: 'BEAST_V222_FROST_GLACIER_WYRM', nameTh: 'มังกรเกล็ดน้ำแข็งเจ็ดสมุทร', tier: 5, cp: 3450, flee: 10, aggro: 82, drops: ['MAT_V222_BP_05', 'MAT_V222_BP_06', 'MAT_V222_BP_27'], terrain: 'water', family: 'SERPENT', archetype: 'SERPENT', element: 'WATER_ICE', visual: { body: '#1f5e7a', accent: '#aef0ff', mark: 'crown', scale: 1.56 }, elementProfile: epSingleV222('WATER_ICE') },
    { id: 'BEAST_V222_ASTRAL_NINE_TAIL_FOX', nameTh: 'จิ้งจอกเก้าหางดาราพยากรณ์', tier: 5, cp: 3320, flee: 22, aggro: 65, drops: ['MAT_V222_BP_07', 'MAT_V222_BP_08', 'MAT_V222_BP_28'], terrain: 'forest', family: 'CANINE', archetype: 'CANINE', element: 'ASTRAL', visual: { body: '#4b367c', accent: '#e2c4ff', mark: 'crown', scale: 1.48 }, elementProfile: epSingleV222('ASTRAL') },
    { id: 'BEAST_V222_NETHER_SCORPION_EMPEROR', nameTh: 'จักรพรรดิแมงป่องหยินร้อยพิษ', tier: 4, cp: 1340, flee: 12, aggro: 86, drops: ['MAT_V222_BP_09', 'MAT_V222_BP_10', 'MAT_V222_BP_29'], terrain: 'desert', family: 'ARTHROPOD', archetype: 'ARTHROPOD', element: 'YIN_SHADOW', visual: { body: '#2a2236', accent: '#8e6bbf', mark: 'shell', scale: 1.35 }, elementProfile: epSingleV222('YIN_SHADOW') },
    { id: 'BEAST_V222_GALE_SABERTOOTH_TIGER', nameTh: 'พยัคฆ์เขี้ยวดาบวายุคลั่ง', tier: 3, cp: 540, flee: 20, aggro: 75, drops: ['MAT_V222_BP_11', 'MAT_V222_BP_12', 'MAT_V222_BP_30', 'MAT_BP_BEAST_MEAT_1'], terrain: 'forest', family: 'FELINE', archetype: 'FELINE', element: 'WIND', visual: { body: '#3d6b58', accent: '#9df2c8', mark: 'stripes', scale: 1.24 }, elementProfile: epSingleV222('WIND') },
    { id: 'BEAST_V222_SOLAR_GOLD_TORTOISE', nameTh: 'เต่าทองสุริยันเกราะอัคคี', tier: 4, cp: 1420, flee: 8, aggro: 60, drops: ['MAT_V222_BP_13', 'MAT_V222_BP_14', 'MAT_V222_BP_31'], terrain: 'water', family: 'SHELL', archetype: 'SHELL', element: 'LIGHT_YANG', visual: { body: '#8f651e', accent: '#ffd966', mark: 'shell', scale: 1.42 }, elementProfile: epSingleV222('LIGHT_YANG') },
    { id: 'BEAST_V222_CRIMSON_CORPSE_BEAR', nameTh: 'หมีคลั่งโลหิตอสูรผาแดง', tier: 2, cp: 245, flee: 15, aggro: 80, drops: ['MAT_V222_BP_15', 'MAT_V222_BP_32', 'MAT_BP_BEAST_MEAT_1'], terrain: 'mountain', family: 'URSINE', archetype: 'URSINE', element: 'BLOOD_DEMON', visual: { body: '#5c2323', accent: '#c94c4c', mark: 'scar', scale: 1.15 }, elementProfile: epSingleV222('BLOOD_DEMON') },
    { id: 'BEAST_V222_THUNDER_HOOF_QILIN_STAG', nameTh: 'กวางกิเลนกีบอสนีคราม', tier: 3, cp: 490, flee: 28, aggro: 52, drops: ['MAT_V222_BP_16', 'MAT_V222_BP_33', 'MAT_BP_BEAST_MEAT_1'], terrain: 'forest', family: 'UNGULATE', archetype: 'UNGULATE', element: 'LIGHTNING', visual: { body: '#2b547e', accent: '#8ce0ff', mark: 'antler', scale: 1.20 }, elementProfile: epSingleV222('LIGHTNING') },
    { id: 'BEAST_V222_ABYSSAL_LEVIATHAN_CRAB', nameTh: 'ปูยักษ์เกราะเหล็กเหมันต์บาดาล', tier: 3, cp: 510, flee: 12, aggro: 68, drops: ['MAT_V222_BP_17', 'MAT_V222_BP_05', 'MAT_BP_BEAST_MEAT_1'], terrain: 'water', family: 'AQUATIC', archetype: 'AQUATIC', element: 'WATER_ICE', visual: { body: '#274c5e', accent: '#7fc8e8', mark: 'shell', scale: 1.25 }, elementProfile: epSingleV222('WATER_ICE') },
    { id: 'BEAST_V222_MIRAGE_SILK_MOTH', nameTh: 'ผีเสื้อไหมมายาจันทร์เร้น', tier: 2, cp: 215, flee: 35, aggro: 40, drops: ['MAT_V222_BP_18', 'MAT_V222_BP_34'], terrain: 'forest', family: 'ARTHROPOD', archetype: 'ARTHROPOD', element: 'ASTRAL', visual: { body: '#523b78', accent: '#d4b2ff', mark: 'wings', scale: 1.05 }, elementProfile: epSingleV222('ASTRAL') },
    { id: 'BEAST_V222_FLAME_MANE_LION_BOAR', nameTh: 'หมูป่าสิงห์แผงคอเพลิงโลกันตร์', tier: 3, cp: 530, flee: 14, aggro: 76, drops: ['MAT_V222_BP_19', 'MAT_BP_BOAR_CORE_2', 'MAT_BP_BEAST_MEAT_1'], terrain: 'desert', family: 'BOAR', archetype: 'BOAR', element: 'FIRE', visual: { body: '#8a331e', accent: '#ff944d', mark: 'tusk', scale: 1.24 }, elementProfile: epSingleV222('FIRE') },
    { id: 'BEAST_V222_VINE_THORN_TREANT_BEAST', nameTh: 'อสูรพฤกษาหนามโลหิตพันปี', tier: 4, cp: 1310, flee: 5, aggro: 72, drops: ['MAT_V222_BP_20', 'MAT_V222_BP_35'], terrain: 'forest', family: 'PLANT_SPIRIT', archetype: 'PLANT_SPIRIT', element: 'WOOD_LIFE', visual: { body: '#2d5236', accent: '#75c987', mark: 'vine', scale: 1.40 }, elementProfile: epSingleV222('WOOD_LIFE') },
    { id: 'BEAST_V222_IRON_WING_GARUDA', nameTh: 'พญาครุฑปีกเหล็กตัดเมฆา', tier: 5, cp: 3520, flee: 12, aggro: 84, drops: ['MAT_V222_BP_21', 'MAT_V222_BP_36', 'MAT_BP_BEAST_MEAT_1'], terrain: 'mountain', family: 'CHIMERA', archetype: 'CHIMERA', element: 'EARTH_METAL', visual: { body: '#5c584f', accent: '#d6c7a9', mark: 'wings', scale: 1.55 }, elementProfile: epSingleV222('EARTH_METAL') },
    { id: 'BEAST_V222_SHADOW_STALKER_PANTHER', nameTh: 'เสือดำเงาภูตเร้นรัตติกาล', tier: 4, cp: 1290, flee: 24, aggro: 78, drops: ['MAT_V222_BP_22', 'MAT_V222_BP_10', 'MAT_BP_BEAST_MEAT_1'], terrain: 'forest', family: 'FELINE', archetype: 'FELINE', element: 'YIN_SHADOW', visual: { body: '#1c1b29', accent: '#7965a8', mark: 'crest', scale: 1.32 }, elementProfile: epSingleV222('YIN_SHADOW') },
    { id: 'BEAST_V222_TEMPEST_WIND_SERPENT', nameTh: 'งูยักษ์เกล็ดวายุทะลวงเมฆ', tier: 2, cp: 230, flee: 26, aggro: 58, drops: ['MAT_V222_BP_11', 'MAT_V222_BP_30'], terrain: 'forest', family: 'SERPENT', archetype: 'SERPENT', element: 'WIND', visual: { body: '#2f6659', accent: '#8ee8d1', mark: 'stripes', scale: 1.10 }, elementProfile: epSingleV222('WIND') },
    { id: 'BEAST_V222_CELESTIAL_LOTUS_CRANE', nameTh: 'กระเรียนขาวบัวสวรรค์หกทิศ', tier: 3, cp: 485, flee: 30, aggro: 45, drops: ['MAT_V222_BP_23', 'MAT_V222_BP_14', 'MAT_BP_BEAST_MEAT_1'], terrain: 'water', family: 'AVIAN', archetype: 'AVIAN', element: 'LIGHT_YANG', visual: { body: '#d9e4ec', accent: '#ffd97d', mark: 'wings', scale: 1.20 }, elementProfile: epSingleV222('LIGHT_YANG') },
    { id: 'BEAST_V222_VOID_DEVOURING_CHIMERA', nameTh: 'ราชันย์อสูรกลืนดาราบรรพกาล', tier: 6, cp: 8900, flee: 5, aggro: 94, drops: ['MAT_V222_BP_24', 'MAT_V222_BP_08', 'MAT_V222_BP_28'], terrain: 'ruins', family: 'CHIMERA', archetype: 'CHIMERA', element: 'BLOOD_DEMON', visual: { body: '#3b1528', accent: '#ff5277', mark: 'crown', scale: 1.75 }, elementProfile: epWeightedV222('BLOOD_DEMON', 0.6, 'ASTRAL', 0.4) }
  ];

  // 24 New Authored Equipment Items + 24 Recipes distributing all Rare Effect Keywords (count 1..2 -> count 3+)
  const v222EquipmentSpecs = [
    { id: 'EQ_V222_01_FIST_3', recId: 'REC_V222_EQ_01', nameTh: 'สนับมือเขี้ยวกิเลนโลหิต', slot: 'WEAPON', gearType: 'FIST', subType: 'FIST', tier: 3, minStage: 2, value: 185, el: 'BLOOD_DEMON', mat1: 'MAT_V222_BP_01', mat2: 'MAT_V222_BP_15',
      effects: [
        { effectId: 'EFX_VITALITY_STEAL', params: { vitalityStealRatio: 0.26 } },
        { effectId: 'EFX_BLOOD_SACRIFICE_OVERDRIVE', params: { powerMultiplier: 2.15, lifespanCostYears: 2, healthCost: 14 } }
      ]
    },
    { id: 'EQ_V222_02_FIST_4', recId: 'REC_V222_EQ_02', nameTh: 'สนับมือกรงเล็บเหยี่ยวเผิงอสนี', slot: 'WEAPON', gearType: 'FIST', subType: 'FIST', tier: 4, minStage: 3, value: 320, el: 'LIGHTNING', mat1: 'MAT_V222_BP_04', mat2: 'MAT_V222_BP_16',
      effects: [
        { effectId: 'EFX_HEAVENLY_THUNDER_SMITE', params: { thunderPower: 380, antiFiendBonusRatio: 0.52 } },
        { effectId: 'EFX_SHOCK_CONDUCTION', params: { shockDamage: 72, maxChainTargets: 3 } }
      ]
    },
    { id: 'EQ_V222_03_BLADE_3', recId: 'REC_V222_EQ_03', nameTh: 'ดาบเขี้ยวพยัคฆ์วายุคลั่ง', slot: 'WEAPON', gearType: 'BLADE', subType: 'BLADE', tier: 3, minStage: 2, value: 190, el: 'WIND', mat1: 'MAT_V222_BP_11', mat2: 'MAT_V222_BP_12',
      effects: [
        { effectId: 'EFX_WEAKNESS_EXPOSURE', params: { critVulnerabilityBonus: 0.26, counterParryBonus: 0.22 } },
        { effectId: 'EFX_SWORD_STORM_STRIKE', params: { slashPower: 420, maxTargets: 3, armorPenRatio: 0.28 } }
      ]
    },
    { id: 'EQ_V222_04_BLADE_4', recId: 'REC_V222_EQ_04', nameTh: 'ดาบใหญ่แผงคอเพลิงโลกันตร์', slot: 'WEAPON', gearType: 'BLADE', subType: 'BLADE', tier: 4, minStage: 3, value: 330, el: 'FIRE', mat1: 'MAT_V222_BP_19', mat2: 'MAT_V222_BP_02',
      effects: [
        { effectId: 'EFX_ELEMENTAL_ANNIHILATION', params: { elementalPower: 490, durabilityWear: 6 } },
        { effectId: 'EFX_FORMATION_DISRUPTION', params: { disruptionPotency: 45, integrityDamage: 20 } }
      ]
    },
    { id: 'EQ_V222_05_SWORD_5', recId: 'REC_V222_EQ_05', nameTh: 'กระบี่เกล็ดมังกรเหมันต์เจ็ดสมุทร', slot: 'WEAPON', gearType: 'SWORD', subType: 'SWORD', tier: 5, minStage: 4, value: 540, el: 'WATER_ICE', mat1: 'MAT_V222_BP_05', mat2: 'MAT_V222_BP_17',
      effects: [
        { effectId: 'EFX_GRAVITY_QI_SEAL', params: { speedReductionRatio: 0.44, qiThroughputPenalty: 0.32 } },
        { effectId: 'EFX_SPATIAL_LOCK', params: { lockStrength: 70, blockedMovementTags: ['BLINK', 'FLIGHT_ESCAPE'] } }
      ]
    },
    { id: 'EQ_V222_06_SWORD_5', recId: 'REC_V222_EQ_06', nameTh: 'กระบี่ปีกเหล็กพญาครุฑตัดเมฆา', slot: 'WEAPON', gearType: 'SWORD', subType: 'SWORD', tier: 5, minStage: 4, value: 555, el: 'EARTH_METAL', mat1: 'MAT_V222_BP_21', mat2: 'MAT_V222_BP_11',
      effects: [
        { effectId: 'EFX_WEAPON_MAGNET_DISARM', params: { weaponPenaltyRatio: 0.56, disarmChance: 0.66 } },
        { effectId: 'EFX_TIMED_PARRY', params: { parryMitigationRatio: 0.42, parryCharges: 2 } }
      ]
    },
    { id: 'EQ_V222_07_BOW_4', recId: 'REC_V222_EQ_07', nameTh: 'เกาทัณฑ์ขนปีกเหยี่ยวเผิงสายฟ้า', slot: 'WEAPON', gearType: 'BOW', subType: 'BOW', tier: 4, minStage: 3, value: 335, el: 'LIGHTNING', mat1: 'MAT_V222_BP_03', mat2: 'MAT_V222_BP_06',
      effects: [
        { effectId: 'EFX_TRACE_MARK', params: { trackingAccuracy: 0.88, durationDays: 14 } },
        { effectId: 'EFX_INTERRUPT_CHANNEL', params: { interruptForce: 66 } }
      ]
    },
    { id: 'EQ_V222_08_SPEAR_3', recId: 'REC_V222_EQ_08', nameTh: 'ทวนก้ามปูยักษ์เหล็กเหมันต์', slot: 'WEAPON', gearType: 'SPEAR', subType: 'SPEAR', tier: 3, minStage: 2, value: 195, el: 'WATER_ICE', mat1: 'MAT_V222_BP_17', mat2: 'MAT_V222_BP_15',
      effects: [
        { effectId: 'EFX_WEAPON_MAGNET_DISARM', params: { weaponPenaltyRatio: 0.50, disarmChance: 0.58 } },
        { effectId: 'EFX_GUARDED_DAMAGE_SHARE', params: { shareRatio: 0.36 } }
      ]
    },
    { id: 'EQ_V222_09_STAFF_4', recId: 'REC_V222_EQ_09', nameTh: 'พลองแก่นเต่าทองสุริยัน', slot: 'WEAPON', gearType: 'STAFF', subType: 'STAFF', tier: 4, minStage: 3, value: 340, el: 'LIGHT_YANG', mat1: 'MAT_V222_BP_14', mat2: 'MAT_V222_BP_13',
      effects: [
        { effectId: 'EFX_PURIFY_HOSTILE_STATUS', params: { maxDispelTier: 5, maxStatusesRemoved: 2 } },
        { effectId: 'EFX_STRUCTURAL_IMMUNITY_FLOOR', params: { floorTier: 5, minIntegrityRequired: 65 } }
      ]
    },
    { id: 'EQ_V222_10_ZITHER_5', recId: 'REC_V222_EQ_10', nameTh: 'พิณเอ็นมังกรน้ำแข็งเจ็ดสมุทร', slot: 'WEAPON', gearType: 'ZITHER', subType: 'ZITHER', tier: 5, minStage: 4, value: 560, el: 'WATER_ICE', mat1: 'MAT_V222_BP_06', mat2: 'MAT_V222_BP_23',
      effects: [
        { effectId: 'EFX_SILENCE_CAST', params: { silenceTurns: 2, blockedCastTags: ['MANTRA', 'CHANT'] } },
        { effectId: 'EFX_SOUL_MENTAL_ATTACK', params: { soulDamage: 195, heartDemonDelta: 18, armorBypassRatio: 0.52 } }
      ]
    },
    { id: 'EQ_V222_11_BRUSH_5', recId: 'REC_V222_EQ_11', nameTh: 'พู่กันขนจิ้งจอกเก้าหางดารา', slot: 'WEAPON', gearType: 'BRUSH', subType: 'BRUSH', tier: 5, minStage: 4, value: 550, el: 'ASTRAL', mat1: 'MAT_V222_BP_07', mat2: 'MAT_V222_BP_18',
      effects: [
        { effectId: 'EFX_ILLUSION_DECOY', params: { decoyCharges: 2, deceptionScore: 62 } },
        { effectId: 'EFX_SUPPRESS_POSITIVE_BUFF', params: { suppressStrength: 65, maxBuffsSuppressed: 2 } }
      ]
    },
    { id: 'EQ_V222_12_WHIP_4', recId: 'REC_V222_EQ_12', nameTh: 'แส้เหล็กในจักรพรรดิแมงป่องหยิน', slot: 'WEAPON', gearType: 'WHIP', subType: 'WHIP', tier: 4, minStage: 3, value: 330, el: 'YIN_SHADOW', mat1: 'MAT_V222_BP_09', mat2: 'MAT_V222_BP_20',
      effects: [
        { effectId: 'EFX_TOXIN_INFECTION', params: { toxinPotency: 42, toxinKind: 'NEUROTOXIN' } },
        { effectId: 'EFX_TERRAIN_BIND_TRAP', params: { trapDamage: 260, rootTurns: 2, charges: 2 } }
      ]
    },
    { id: 'EQ_V222_13_FOCUS_6', recId: 'REC_V222_EQ_13', nameTh: 'ลูกแก้วราชันย์อสูรกลืนดารา', slot: 'WEAPON', gearType: 'FOCUS', subType: 'FOCUS', tier: 6, minStage: 5, value: 880, el: 'BLOOD_DEMON', mat1: 'MAT_V222_BP_24', mat2: 'MAT_V222_BP_08',
      effects: [
        { effectId: 'EFX_ELEMENTAL_ANNIHILATION', params: { elementalPower: 580, durabilityWear: 6 } },
        { effectId: 'EFX_MIND_CORROSION', params: { mentalDecayPerTurn: 16, focusPenalty: 0.08 } }
      ]
    },
    { id: 'EQ_V222_14_LIGHT_3', recId: 'REC_V222_EQ_14', nameTh: 'เกราะเบาหนังพยัคฆ์ลายเมฆาคลั่ง', slot: 'ARMOR', gearType: 'LIGHT', tier: 3, minStage: 2, value: 185, el: 'WIND', mat1: 'MAT_V222_BP_12', mat2: 'MAT_V222_BP_18',
      effects: [
        { effectId: 'EFX_STEALTH_CONCEALMENT', params: { concealmentScore: 54 } },
        { effectId: 'EFX_SCENT_TRACE_BREAK', params: { traceBreakPower: 58, falseTrailDays: 2 } }
      ]
    },
    { id: 'EQ_V222_15_LIGHT_4', recId: 'REC_V222_EQ_15', nameTh: 'เกราะเบาเงาเสือดำรัตติกาล', slot: 'ARMOR', gearType: 'LIGHT', tier: 4, minStage: 3, value: 325, el: 'YIN_SHADOW', mat1: 'MAT_V222_BP_22', mat2: 'MAT_V222_BP_10',
      effects: [
        { effectId: 'EFX_ILLUSION_MIST_MAZE', params: { accuracyPenalty: 0.32, travelDelayDays: 2 } },
        { effectId: 'EFX_RECON_SIGNAL_JAM', params: { jammingStrength: 62, intelNoiseBonusPct: 38 } }
      ]
    },
    { id: 'EQ_V222_16_ROBE_5', recId: 'REC_V222_EQ_16', nameTh: 'อาภรณ์ขนจิ้งจอกเก้าหางดารา', slot: 'ARMOR', gearType: 'ROBE', tier: 5, minStage: 4, value: 545, el: 'ASTRAL', mat1: 'MAT_V222_BP_07', mat2: 'MAT_V222_BP_23',
      effects: [
        { effectId: 'EFX_SKY_LEVITATION_DRIVE', params: { liftScale: 0.24, speedMultiplier: 1.15 } },
        { effectId: 'EFX_CULTIVATION_ACCELERATOR', params: { cultivationBoostRatio: 0.30, dailyProgressCap: 10 } }
      ]
    },
    { id: 'EQ_V222_17_ROBE_4', recId: 'REC_V222_EQ_17', nameTh: 'อาภรณ์ไหมผีเสื้อมายาจันทร์เร้น', slot: 'ARMOR', gearType: 'ROBE', tier: 4, minStage: 3, value: 315, el: 'ASTRAL', mat1: 'MAT_V222_BP_18', mat2: 'MAT_V222_BP_20',
      effects: [
        { effectId: 'EFX_ILLUSION_DECOY', params: { decoyCharges: 2, deceptionScore: 58 } },
        { effectId: 'EFX_MERIDIAN_TOXIN_PURGE', params: { purgePotency: 50, supportedToxinTags: ['HEMOTUXIN', 'PILL_TOXICITY'] } }
      ]
    },
    { id: 'EQ_V222_18_HEAVY_4', recId: 'REC_V222_EQ_18', nameTh: 'เกราะหนักกระดองเต่าทองสุริยัน', slot: 'ARMOR', gearType: 'HEAVY', tier: 4, minStage: 3, value: 350, el: 'LIGHT_YANG', mat1: 'MAT_V222_BP_13', mat2: 'MAT_V222_BP_19',
      effects: [
        { effectId: 'EFX_GUARDED_DAMAGE_SHARE', params: { shareRatio: 0.38 } },
        { effectId: 'EFX_REALM_SUPPRESSION_GUARD', params: { maxCrossRealmDelta: 1.5, suppressionReductionRatio: 0.38 } }
      ]
    },
    { id: 'EQ_V222_19_BRACELET_3', recId: 'REC_V222_EQ_19', nameTh: 'กำไลเขากวางกิเลนอสนีคราม', slot: 'ACCESSORY', gearType: 'BRACELET', tier: 3, minStage: 2, value: 180, el: 'LIGHTNING', mat1: 'MAT_V222_BP_16', mat2: 'MAT_V222_BP_04',
      effects: [
        { effectId: 'EFX_HEAVENLY_THUNDER_SMITE', params: { thunderPower: 340, antiFiendBonusRatio: 0.48 } },
        { effectId: 'EFX_FORGING_STABILIZATION', params: { craftSuccessBonus: 0.18, qualityBonusChance: 0.22 } }
      ]
    },
    { id: 'EQ_V222_20_BRACELET_4', recId: 'REC_V222_EQ_20', nameTh: 'กำไลเถาหนามพฤกษาโลหิตพันปี', slot: 'ACCESSORY', gearType: 'BRACELET', tier: 4, minStage: 3, value: 310, el: 'WOOD_LIFE', mat1: 'MAT_V222_BP_20', mat2: 'MAT_V222_BP_23',
      effects: [
        { effectId: 'EFX_ECOLOGY_HERB_NURTURE', params: { growthRateMultiplier: 1.38, aromaBeastLureRisk: 0.12 } },
        { effectId: 'EFX_HERB_POLLINATION', params: { pollinationYieldBonus: 2, qualityUpgradeChance: 0.28 } }
      ]
    },
    { id: 'EQ_V222_21_RING_3', recId: 'REC_V222_EQ_21', nameTh: 'แหวนโลหิตหัวใจกิเลนทมิฬ', slot: 'ACCESSORY', gearType: 'RING', tier: 3, minStage: 2, value: 188, el: 'BLOOD_DEMON', mat1: 'MAT_V222_BP_02', mat2: 'MAT_V222_BP_01',
      effects: [
        { effectId: 'EFX_VITALITY_STEAL', params: { vitalityStealRatio: 0.25 } },
        { effectId: 'EFX_BEAST_INTIMIDATION', params: { beastPowerSuppressionRatio: 0.30, maxBeastTierAffected: 5 } }
      ]
    },
    { id: 'EQ_V222_22_RING_5', recId: 'REC_V222_EQ_22', nameTh: 'แหวนเนตรดาราจิ้งจอกสวรรค์', slot: 'ACCESSORY', gearType: 'RING', tier: 5, minStage: 4, value: 530, el: 'ASTRAL', mat1: 'MAT_V222_BP_08', mat2: 'MAT_V222_BP_07',
      effects: [
        { effectId: 'EFX_DETECTION_REVEAL', params: { revealPower: 65, scanRadius: 36 } },
        { effectId: 'EFX_LEARNING_INSIGHT', params: { masteryGainMultiplier: 1.48, comprehensionBonus: 14 } }
      ]
    },
    { id: 'EQ_V222_23_NECKLACE_4', recId: 'REC_V222_EQ_23', nameTh: 'สร้อยขนหงอนกระเรียนขาวบัวสวรรค์', slot: 'ACCESSORY', gearType: 'NECKLACE', tier: 4, minStage: 3, value: 328, el: 'LIGHT_YANG', mat1: 'MAT_V222_BP_23', mat2: 'MAT_V222_BP_14',
      effects: [
        { effectId: 'EFX_MASS_VITAL_HEAL', params: { healAmount: 48, maxRecipients: 2, curesMeridianWound: true } },
        { effectId: 'EFX_BEAST_BOND_CHANNEL', params: { bondPowerBonusRatio: 0.28, beastFatigueCost: 0, restoresBeastFatigue: 40 } }
      ]
    },
    { id: 'EQ_V222_24_CHARM_6', recId: 'REC_V222_EQ_24', nameTh: 'ตราประทับราชันย์อสูรกลืนดารา', slot: 'ACCESSORY', gearType: 'CHARM', tier: 6, minStage: 5, value: 860, el: 'BLOOD_DEMON', mat1: 'MAT_V222_BP_24', mat2: 'MAT_V222_BP_21',
      effects: [
        { effectId: 'EFX_FORMATION_HARMONIZATION', params: { syncBonus: 18, stabilityBonus: 16 } },
        { effectId: 'EFX_VEIN_ANCHORED', params: { veinThroughputMult: 1.28, peacetimeZeroUpkeep: true } }
      ]
    }
  ];

  const v222SourceByElement = {
    BLOOD_DEMON: {
      zones: ["west_grove", "ridge", "legend"],
      fortuneSpots: ["f1_blood_thorn_hollow", "f3_crimson_slaughter_altar", "f4_abyssal_chimera_maw"],
      myriadWorlds: ["bloodmoon", "prison"],
      gateTypes: ["GATE_BLOOD_ECLIPSE", "GATE_PRIMORDIAL_RIFT"],
      secretRealms: ["REALM_NINE_NETHER_BLOOD_SEA", "REALM_FROST_BLOOD_BEAST_ABYSS"],
      sanctums: ["SANCTUM_BLOOD_VAJRA", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าอสูรป่ารัตติกาล/แดนอสูรบรรพกาล · จุดวาสนาโพรงหนามโลหิต & แท่นบูชาโลหิต · แดนหมื่นพิภพจันทร์โลหิตหมื่นอสูร (ประตูมิติสุริยุปราคาโลหิต) · แดนลับห้วงเหวราชันอสูรเหมันต์โลหิต"
    },
    LIGHTNING: {
      zones: ["ridge", "east_crag", "north_peak"],
      fortuneSpots: ["f2_thunder_echo_cliff", "f3_glacier_phoenix_roost", "f4_astral_starfall_observatory"],
      myriadWorlds: ["thunderpeak", "godwar"],
      gateTypes: ["GATE_ASTRAL_CONJUNCTION", "GATE_PRIMORDIAL_RIFT"],
      secretRealms: ["REALM_THUNDER_ZITHER_SANCTUARY", "REALM_EMPEROR_SWORD_TOMB"],
      sanctums: ["SANCTUM_ASTRAL_DIVINE", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าสันผาอสูรอัสนี/ผาบูรพา · จุดวาสนาผาอสนีสะท้อนพิณ · แดนหมื่นพิภพสายฟ้าเก้าสวรรค์ (ประตูมิติดาราจักรบรรจบ) · แดนลับตำหนักพิณอสนีเก้าสวรรค์"
    },
    WATER_ICE: {
      zones: ["north_peak", "east_crag", "legend"],
      fortuneSpots: ["f1_frost_echo_gully", "f3_glacier_phoenix_roost", "f4_primordial_fountain"],
      myriadWorlds: ["frostabyss", "snow", "skysea"],
      gateTypes: ["GATE_HARMONY_PASSAGE", "GATE_ASTRAL_CONJUNCTION"],
      secretRealms: ["REALM_FROST_BLOOD_BEAST_ABYSS", "REALM_NINE_NETHER_BLOOD_SEA"],
      sanctums: ["SANCTUM_SWORD_ABYSS", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่ายอดเขาเหมันต์อุดร/แอ่งสมุทรบูรพา · จุดวาสนาหุบเสียงสะท้อนเหมันต์ & รังหงส์น้ำแข็ง · แดนหมื่นพิภพห้วงลึกเหมันต์นิรันดร์ · แดนลับห้วงเหวราชันอสูรเหมันต์โลหิต"
    },
    WIND: {
      zones: ["meadow", "west_grove", "east_crag"],
      fortuneSpots: ["f1_frost_echo_gully", "f2_thunder_echo_cliff", "f2_mist_valley"],
      myriadWorlds: ["thunderpeak", "skysea"],
      gateTypes: ["GATE_HARMONY_PASSAGE", "GATE_STANDARD"],
      secretRealms: ["REALM_THUNDER_ZITHER_SANCTUARY", "REALM_EMPEROR_SWORD_TOMB"],
      sanctums: ["SANCTUM_SWORD_ABYSS", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าทุ่งหญ้า/ผาบูรพา · จุดวาสนาผาอสนีสะท้อนพิณ & หุบเขาเมฆา · แดนหมื่นพิภพสายฟ้าเก้าสวรรค์ · แดนลับตำหนักพิณอสนีเก้าสวรรค์"
    },
    WOOD_LIFE: {
      zones: ["meadow", "west_grove", "ridge"],
      fortuneSpots: ["f1_bamboo_grotto", "f2_venom_lotus_marsh", "f4_primordial_fountain"],
      myriadWorlds: ["eden", "fungi", "bloodmoon"],
      gateTypes: ["GATE_HARMONY_PASSAGE", "GATE_BLOOD_ECLIPSE"],
      secretRealms: ["REALM_PRIMORDIAL_ALCHEMIST_PALACE", "REALM_THUNDER_ZITHER_SANCTUARY"],
      sanctums: ["SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าป่าไผ่หมอกครามประจิม · จุดวาสนาบึงบัวพิษหมื่นบุปผา · แดนหมื่นพิภพสวนสวรรค์ล่มสลาย & จันทร์โลหิต · แดนลับตำหนักโอสถเทวะหมื่นกัลป์"
    },
    EARTH_METAL: {
      zones: ["ridge", "east_crag", "legend"],
      fortuneSpots: ["f2_abandoned_mine", "f3_crimson_slaughter_altar", "f4_astral_starfall_observatory"],
      myriadWorlds: ["swordyard", "clock", "astralvoid"],
      gateTypes: ["GATE_STANDARD", "GATE_PRIMORDIAL_RIFT"],
      secretRealms: ["REALM_EMPEROR_SWORD_TOMB", "REALM_ASTRAL_GOD_RUINS"],
      sanctums: ["SANCTUM_BLOOD_VAJRA", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าแนวผาหินใต้สำนัก/หน้าผาบูรพา · จุดวาสนาแท่นบูชาโลหิต & หอดูดาวดาราจักร · แดนหมื่นพิภพดาราจักรสุญตา & ทะเลสุสานกระบี่ · สุสานกระบี่จักรพรรดิบรรพกาล"
    },
    LIGHT_YANG: {
      zones: ["east_crag", "north_peak", "legend"],
      fortuneSpots: ["f3_flame_crater", "f3_crimson_slaughter_altar", "f4_astral_starfall_observatory"],
      myriadWorlds: ["astralvoid", "godwar", "hourglass"],
      gateTypes: ["GATE_ASTRAL_CONJUNCTION", "GATE_PRIMORDIAL_RIFT"],
      secretRealms: ["REALM_ASTRAL_GOD_RUINS", "REALM_PRIMORDIAL_ALCHEMIST_PALACE"],
      sanctums: ["SANCTUM_ASTRAL_DIVINE", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าผาบูรพา/แดนอสูรบรรพกาล · จุดวาสนาหอดูดาวดาราจักรล่มสลาย · แดนหมื่นพิภพดาราจักรสุญตา · แดนลับซากวิหารดาราจักรเทพโบราณ"
    },
    YIN_SHADOW: {
      zones: ["west_grove", "ridge", "legend"],
      fortuneSpots: ["f1_blood_thorn_hollow", "f2_venom_lotus_marsh", "f4_abyssal_chimera_maw"],
      myriadWorlds: ["bloodmoon", "nightmare", "prison"],
      gateTypes: ["GATE_BLOOD_ECLIPSE", "GATE_PRIMORDIAL_RIFT"],
      secretRealms: ["REALM_NINE_NETHER_BLOOD_SEA", "REALM_FROST_BLOOD_BEAST_ABYSS"],
      sanctums: ["SANCTUM_BLOOD_VAJRA", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่าถ้ำเงารัตติกาลประจิม/แดนอสูรบรรพกาล · จุดวาสนาบึงบัวพิษ & หุบเหวอสูรกลืนสวรรค์ · แดนหมื่นพิภพจันทร์โลหิต & ดินแดนฝันร้าย · วังบาดาลสมุทรโลหิตเก้ายมโลก"
    },
    ASTRAL: {
      zones: ["east_crag", "north_peak", "legend"],
      fortuneSpots: ["f4_void_rift", "f4_astral_starfall_observatory", "f4_abyssal_chimera_maw"],
      myriadWorlds: ["astralvoid", "mirror", "godwar"],
      gateTypes: ["GATE_ASTRAL_CONJUNCTION", "GATE_PRIMORDIAL_RIFT"],
      secretRealms: ["REALM_ASTRAL_GOD_RUINS", "REALM_THUNDER_ZITHER_SANCTUARY"],
      sanctums: ["SANCTUM_ASTRAL_DIVINE", "SANCTUM_MYRIAD_BEAST_TOTEM"],
      sourceInfoTh: "เขตล่ายอดเขาเหมันต์อุดร/แดนอสูรบรรพกาล · จุดวาสนาหอดูดาวดาราจักร & รอยแยกห้วงมิติ · แดนหมื่นพิภพดาราจักรสุญตา (ประตูมิติดาราจักรบรรจบ) · ซากวิหารดาราจักรเทพโบราณ"
    }
  };

  v222Beasts.forEach(b => {
    const srcInfo = v222SourceByElement[b.element] || v222SourceByElement.ASTRAL;
    b.habitatZones = srcInfo.zones.slice();
    b.fortuneSpots = srcInfo.fortuneSpots.slice();
    b.myriadWorlds = srcInfo.myriadWorlds.slice();
    b.gateTypes = srcInfo.gateTypes.slice();
    b.secretRealms = srcInfo.secretRealms.slice();
    b.obtainSources = [
      ...srcInfo.zones.map(z => "WILD_ZONE:" + z),
      ...srcInfo.fortuneSpots.map(f => "FORTUNE:" + f),
      ...srcInfo.myriadWorlds.map(w => "MYRIAD_WORLD:" + w),
      ...srcInfo.secretRealms.map(r => "SECRET_REALM:" + r)
    ];
    b.sourceInfoTh = srcInfo.sourceInfoTh;
    species.push(b);
  });
  v222ActiveBeastMats.concat(v222ReservedBeastMats).forEach(m => {
    m.sourceBeastIds = v222Beasts.filter(b => Array.isArray(b.drops) && b.drops.includes(m.id)).map(b => b.id);
    const srcInfo = v222SourceByElement[m.element] || v222SourceByElement.ASTRAL;
    m.fortuneSpots = srcInfo.fortuneSpots.slice();
    m.myriadWorlds = srcInfo.myriadWorlds.slice();
    m.gateTypes = srcInfo.gateTypes.slice();
    m.secretRealms = srcInfo.secretRealms.slice();
    m.obtainSources = [
      ...(m.sourceBeastIds || []).map(id => "BEAST_DROP:" + id),
      ...srcInfo.fortuneSpots.map(f => "FORTUNE:" + f),
      ...srcInfo.myriadWorlds.map(w => "MYRIAD_WORLD:" + w),
      ...srcInfo.secretRealms.map(r => "SECRET_REALM:" + r)
    ];
    m.sourceInfoTh = srcInfo.sourceInfoTh;
    materials.push(m);
  });

  v222EquipmentSpecs.forEach(es => {
    const it = {
      id: es.id,
      recipeId: es.recId,
      nameTh: es.nameTh,
      cat: 'EQUIPMENT',
      out: 'EQUIPMENT',
      slot: es.slot,
      gearType: es.gearType,
      subType: es.subType || undefined,
      tier: es.tier,
      minStage: es.minStage,
      value: es.value,
      craft: 'FORGING',
      durability: 100,
      charges: null,
      effects: es.effects,
      element: es.el,
      elementProfile: epSingleV222(es.el),
      obtainSources: [
        "CRAFT:" + es.recId,
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).fortuneSpots.map(f => "FORTUNE:" + f)),
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).myriadWorlds.map(w => "MYRIAD_WORLD:" + w)),
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).secretRealms.map(r => "SECRET_REALM:" + r)),
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).sanctums.map(s => "SANCTUM:" + s))
      ],
      sourceInfoTh: "หลอมจากตำรับ「" + es.nameTh + "」หรือค้นพบจาก " + (v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).sourceInfoTh,
      v222: true
    };
    items.push(it);
    const rec = {
      id: es.recId,
      nameTh: 'ตำรับหลอม' + es.nameTh,
      outNameTh: es.nameTh,
      outItemId: es.id,
      outType: 'EQUIPMENT',
      craft: 'FORGING',
      slot: es.slot,
      gearType: es.gearType,
      tier: es.tier,
      minStage: es.minStage,
      minMastery: Math.max(10, es.tier * 12),
      facilityLevel: Math.min(5, Math.max(1, es.tier - 1)),
      compatiblePath: 'ANY',
      inputs: [
        { matId: es.mat1, count: 2 },
        { matId: es.mat2, count: 1 }
      ],
      element: es.el,
      elementProfile: epSingleV222(es.el),
      obtainSources: [
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).fortuneSpots.map(f => "FORTUNE:" + f)),
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).myriadWorlds.map(w => "MYRIAD_WORLD:" + w)),
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).secretRealms.map(r => "SECRET_REALM:" + r)),
        ...((v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).sanctums.map(s => "SANCTUM:" + s))
      ],
      sourceInfoTh: (v222SourceByElement[es.el] || v222SourceByElement.ASTRAL).sourceInfoTh,
      v222: true
    };
    recipes.push(rec);
  });


  /* ============================================================================
   * PATCH v2.4.0 CONTENT & ECOSYSTEM COMPLETION:
   * - 6 New Spirit & Abyssal Beasts across URSINE, BOAR, SHELL, UNGULATE, AQUATIC, PLANT_SPIRIT
   * - 24 New Specialized Equipment & Elixir Items (3 each for ROSARY, CLAW, NEEDLE, FAN, ASTROLABE, ABACUS + 6 Boss/Relic Armors & Accessories)
   * - 31 New Crafting & Alchemy Recipes consuming all 31 previously unassigned beast/boss/relic materials (0 Orphan Materials)
   * ============================================================================ */
  const v240NewBeasts = [
    {
      id: 'BEAST_V240_ABYSSAL_IRON_BEAR',
      nameTh: 'หมีเกราะเหล็กนิลโลหิตผาแดง',
      family: 'URSINE',
      tier: 5,
      cp: 1850,
      flee: 10,
      aggro: 84,
      element: 'EARTH_METAL',
      terrain: ['mountain', 'ruin'],
      biome: 'ABYSSAL_CLIFF',
      role: 'TANK_BRUISER',
      tameable: true,
      captureRule: 'WEAKEN_BELOW_25_PCT_OR_BEAST_TAMING_65',
      specialAbility: { id: 'ABIL_IRON_MARROW_GUARD', nameTh: 'เกราะหมีเหล็กนิลสะท้อนผา', combatKeywords: ['KW_GUARD_COUNTER', 'KW_POISE_SHIELD'] },
      drops: ['MAT_V222_BP_32', 'ECO2_MAT_URSINE_B_1', 'MAT_BOSS_CORE_SHELL'],
      v240: true
    },
    {
      id: 'BEAST_V240_THUNDER_TUSK_BOAR_KING',
      nameTh: 'พญาหมูป่าเขี้ยวอสนีคลั่ง',
      family: 'BOAR',
      tier: 5,
      cp: 1780,
      flee: 12,
      aggro: 88,
      element: 'LIGHTNING',
      terrain: ['forest', 'mountain'],
      biome: 'THUNDER_RIDGE',
      role: 'VANGUARD_CHARGER',
      tameable: true,
      captureRule: 'WEAKEN_BELOW_25_PCT_OR_BEAST_TAMING_60',
      specialAbility: { id: 'ABIL_THUNDER_TUSK_STAMPEDE', nameTh: 'เขี้ยวอสนีทะลวงทัพ', combatKeywords: ['KW_SHATTER_ARMOR', 'KW_GAP_CLOSE_STRIKE'] },
      drops: ['MAT_BP_THUNDER_LIZARD_SCALE_4', 'MAT_V222_BP_25', 'MAT_BOSS_HORN_CROWN'],
      v240: true
    },
    {
      id: 'BEAST_V240_STARLIGHT_VOID_TORTOISE',
      nameTh: 'เต่าดาราเร้นมิติสุริยัน',
      family: 'SHELL',
      tier: 6,
      cp: 3100,
      flee: 8,
      aggro: 62,
      element: 'ASTRAL',
      terrain: ['river', 'ruin'],
      biome: 'STARLIGHT_SANCTUM',
      role: 'FORTRESS_BASTION',
      tameable: true,
      captureRule: 'SPIRIT_PACT_OR_BEAST_TAMING_75',
      specialAbility: { id: 'ABIL_SOLAR_STAR_AEGIS', nameTh: 'กระดองสุริยันดาราพิทักษ์', combatKeywords: ['KW_ABSORB_RELEASE', 'KW_ADAPTIVE_RESIST'] },
      drops: ['MAT_V222_BP_31', 'MAT_FORM_VOID_COMPASS_SHARD_5', 'MAT_BOSS_CORE_SHELL'],
      v240: true
    },
    {
      id: 'BEAST_V240_CELESTIAL_JADE_QILIN_STAG',
      nameTh: 'กวางกิเลนหยกหมอกสวรรค์',
      family: 'UNGULATE',
      tier: 6,
      cp: 2950,
      flee: 28,
      aggro: 45,
      element: 'WOOD_LIFE',
      terrain: ['forest', 'mountain'],
      biome: 'MISTY_IMMORTAL_VALLEY',
      role: 'SAGE_SUPPORT_MOUNT',
      tameable: true,
      captureRule: 'OFFER_SPIRIT_HERB_OR_BEAST_TAMING_70',
      specialAbility: { id: 'ABIL_MIST_QILIN_BLESSING', nameTh: 'รัศมีกวางกิเลนชุบชีพจร', combatKeywords: ['KW_OVERHEAL_BARRIER', 'KW_AURA_PULSE'] },
      drops: ['MAT_BP_MIST_STAG_ANTLER_3', 'MAT_V222_BP_33', 'MAT_BP_FROST_KIRIN_PLUME_5'],
      v240: true
    },
    {
      id: 'BEAST_V240_MAELSTROM_LEVIATHAN_SERPENT',
      nameTh: 'มังกรสมุทรเกล็ดเหมันต์กลืนคลื่น',
      family: 'AQUATIC',
      archetype: 'AQUATIC',
      tier: 6,
      cp: 3350,
      flee: 14,
      aggro: 86,
      element: 'WATER_ICE',
      terrain: 'water',
      biome: 'ABYSSAL_TRENCH',
      role: 'FROST_DOMAIN_CONTROLLER',
      tameable: true,
      captureRule: 'WEAKEN_BELOW_20_PCT_OR_BEAST_TAMING_78',
      specialAbility: { id: 'ABIL_FROST_PEARL_MAELSTROM', nameTh: 'มุกสมุทรเยือกแข็งพันธนาการ', combatKeywords: ['KW_PULL_VORTEX', 'KW_DELAYED_DETONATION'] },
      drops: ['MAT_V222_BP_27', 'ECO2_MAT_AQUATIC_A_1', 'MAT_BOSS_VENOM_SAC'],
      v240: true
    },
    {
      id: 'BEAST_V240_IMMORTAL_BODHI_TREANT',
      nameTh: 'พฤกษาเทวะโพธิ์หนามโลหิตบรรพกาล',
      family: 'PLANT_SPIRIT',
      tier: 6,
      cp: 5200,
      flee: 5,
      aggro: 74,
      element: 'WOOD_LIFE',
      terrain: ['forest', 'ruin'],
      biome: 'ANCIENT_BODHI_GROVE',
      role: 'MYTHIC_GUARDIAN',
      tameable: true,
      captureRule: 'ANCESTRAL_PACT_OR_BEAST_TAMING_85',
      specialAbility: { id: 'ABIL_BODHI_THORN_SANCTUARY', nameTh: 'เขตแดนพฤกษาเทวะร้อยหนาม', combatKeywords: ['KW_TETHER_LINK', 'KW_OVERHEAL_BARRIER', 'KW_REFLECT_CONSOLIDATE'] },
      drops: ['MAT_V222_BP_35', 'MAT_FORM_LIFE_ESSENCE_DEW_4', 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', 'MAT_TR_IMMORTAL_BEAST_MARROW'],
      v240: true
    }
  ];
  species.push(...v240NewBeasts);

  const v240NewGearSpecs = [
    // ROSARY (3 items: T4, T5, T6)
    { id: 'EQ_V240_ROSARY_T4', nameTh: 'ประคำหยกน้ำค้างพฤกษาพันปี', slot: 'WEAPON', gearType: 'ROSARY', tier: 4, el: 'WOOD_LIFE', kw: ['KW_OVERHEAL_BARRIER', 'KW_AURA_PULSE'], mat1: 'MAT_FORM_LIFE_ESSENCE_DEW_4', mat2: 'MAT_BP_MIST_STAG_ANTLER_3', stats: { atk: 68, matk: 96, def: 48, mdef: 72, hp: 220, cast: 8 } },
    { id: 'EQ_V240_ROSARY_T5', nameTh: 'ประคำทองคำเต่าสุริยันพิทักษ์ธรรม', slot: 'WEAPON', gearType: 'ROSARY', tier: 5, el: 'LIGHT_YANG', kw: ['KW_ABSORB_RELEASE', 'KW_OVERHEAL_BARRIER'], mat1: 'MAT_V222_BP_31', mat2: 'MAT_BP_FROST_KIRIN_PLUME_5', stats: { atk: 105, matk: 148, def: 78, mdef: 112, hp: 340, cast: 10 } },
    { id: 'EQ_V240_ROSARY_T6', nameTh: 'มหาประคำแก่นเทพอสูรพิทักษ์บรรพกาล', slot: 'WEAPON', gearType: 'ROSARY', tier: 6, el: 'LIGHT_YANG', kw: ['KW_OVERHEAL_BARRIER', 'KW_TETHER_LINK', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', mat2: 'MAT_V222_BP_35', stats: { atk: 162, matk: 228, def: 124, mdef: 175, hp: 520, cast: 14 } },
    // CLAW (3 items: T4, T5, T6)
    { id: 'EQ_V240_CLAW_T4', nameTh: 'กรงเล็บเขี้ยวดาบพยัคฆ์วายุโลหิต', slot: 'WEAPON', gearType: 'CLAW', tier: 4, el: 'WIND', kw: ['KW_SHATTER_ARMOR', 'KW_EXECUTE_CULL'], mat1: 'MAT_V222_BP_30', mat2: 'MAT_V222_BP_25', stats: { atk: 108, matk: 62, def: 44, mdef: 38, crit: 9, pen: 12, move: 8 } },
    { id: 'EQ_V240_CLAW_T5', nameTh: 'กรงเล็บแมงป่องหยินร้อยพิษกลืนวิญญาณ', slot: 'WEAPON', gearType: 'CLAW', tier: 5, el: 'POISON', kw: ['KW_EXECUTE_CULL', 'KW_STATUS_TRANSFER'], mat1: 'MAT_V222_BP_29', mat2: 'MAT_BOSS_VENOM_SAC', stats: { atk: 164, matk: 112, def: 64, mdef: 58, crit: 12, pen: 16, move: 10 } },
    { id: 'EQ_V240_CLAW_T6', nameTh: 'กรงเล็บจะงอยครุฑทองคำฉีกเมฆา', slot: 'WEAPON', gearType: 'CLAW', tier: 6, el: 'EARTH_METAL', kw: ['KW_SHATTER_ARMOR', 'KW_CRIT_BREAK', 'KW_LAST_BREATH'], mat1: 'MAT_V222_BP_36', mat2: 'MAT_BOSS_HORN_CROWN', stats: { atk: 248, matk: 145, def: 96, mdef: 84, crit: 15, pen: 22, move: 12 } },
    // NEEDLE (3 items: T4, T5, T6)
    { id: 'EQ_V240_NEEDLE_T4', nameTh: 'เข็มไหมมายาผีเสื้อจันทร์เร้น', slot: 'WEAPON', gearType: 'NEEDLE', tier: 4, el: 'YIN_SHADOW', kw: ['KW_MARKSMAN_FOCUS', 'KW_TEMPO_STEAL'], mat1: 'MAT_V222_BP_34', mat2: 'ECO2_MAT_ARTHROPOD_B_2', stats: { atk: 82, matk: 94, acc: 16, crit: 10, pen: 14, cast: 10 } },
    { id: 'EQ_V240_NEEDLE_T5', nameTh: 'เข็มพิษหนามโลหิตพฤกษาอสูร', slot: 'WEAPON', gearType: 'NEEDLE', tier: 5, el: 'WOOD_LIFE', kw: ['KW_STATUS_TRANSFER', 'KW_DELAYED_DETONATION'], mat1: 'MAT_V222_BP_35', mat2: 'MAT_BOSS_VENOM_SAC', stats: { atk: 126, matk: 146, acc: 20, crit: 12, pen: 18, cast: 12 } },
    { id: 'EQ_V240_NEEDLE_T6', nameTh: 'เข็มเทวะขนหงส์สายฟ้าม่วงทะลวงชีพจร', slot: 'WEAPON', gearType: 'NEEDLE', tier: 6, el: 'LIGHTNING', kw: ['KW_MARKSMAN_FOCUS', 'KW_CRIT_OVERFLOW', 'KW_ARMOR_READ'], mat1: 'MAT_BP_PHOENIX_PLUME_6', mat2: 'MAT_V222_BP_26', stats: { atk: 192, matk: 224, acc: 26, crit: 16, pen: 24, cast: 16 } },
    // FAN (3 items: T4, T5, T6)
    { id: 'EQ_V240_FAN_T4', nameTh: 'พัดขนนกเหยี่ยวเผิงสายฟ้าคำราม', slot: 'WEAPON', gearType: 'FAN', tier: 4, el: 'WIND', kw: ['KW_PULL_VORTEX', 'KW_TEMPO_STEAL'], mat1: 'MAT_V222_BP_26', mat2: 'ECO2_MAT_AVIAN_B_1', stats: { atk: 64, matk: 102, mdef: 58, eva: 10, cast: 12, move: 8 } },
    { id: 'EQ_V240_FAN_T5', nameTh: 'พัดขนแผงคอกิเลนเหมันต์ดาราเร้น', slot: 'WEAPON', gearType: 'FAN', tier: 5, el: 'WATER_ICE', kw: ['KW_PULL_VORTEX', 'KW_AURA_PULSE'], mat1: 'MAT_BP_FROST_KIRIN_PLUME_5', mat2: 'MAT_BOSS_WING', stats: { atk: 98, matk: 156, mdef: 88, eva: 14, cast: 15, move: 10 } },
    { id: 'EQ_V240_FAN_T6', nameTh: 'พัดเทวะปีกพญาอินทรีสายฟ้าม่วงเก้าชั้นฟ้า', slot: 'WEAPON', gearType: 'FAN', tier: 6, el: 'LIGHTNING', kw: ['KW_PULL_VORTEX', 'KW_TEMPO_STEAL', 'KW_DELAYED_DETONATION'], mat1: 'MAT_BP_PHOENIX_PLUME_6', mat2: 'MAT_BOSS_WING', stats: { atk: 148, matk: 238, mdef: 136, eva: 18, cast: 18, move: 14 } },
    // ASTROLABE (3 items: T4, T5, T6)
    { id: 'EQ_V240_ASTROLABE_T4', nameTh: 'จานดารากีบเท้ากิเลนอสนีคราม', slot: 'WEAPON', gearType: 'ASTROLABE', tier: 4, el: 'ASTRAL', kw: ['KW_FOCUS_WINDOW', 'KW_AURA_PULSE'], mat1: 'MAT_V222_BP_33', mat2: 'MAT_BP_THUNDER_LIZARD_SCALE_4', stats: { atk: 58, matk: 106, def: 52, mdef: 68, acc: 14, cast: 10 } },
    { id: 'EQ_V240_ASTROLABE_T5', nameTh: 'จานสวรรค์เข็มทิศมิติจิ้งจอกเก้าหางดารา', slot: 'WEAPON', gearType: 'ASTROLABE', tier: 5, el: 'ASTRAL', kw: ['KW_FOCUS_WINDOW', 'KW_TEMPO_STEAL'], mat1: 'MAT_FORM_VOID_COMPASS_SHARD_5', mat2: 'MAT_V222_BP_28', stats: { atk: 92, matk: 162, def: 82, mdef: 108, acc: 18, cast: 14 } },
    { id: 'EQ_V240_ASTROLABE_T6', nameTh: 'มหาจานดาราแก่นเทพอสูรพิทักษ์จักรวาล', slot: 'WEAPON', gearType: 'ASTROLABE', tier: 6, el: 'ASTRAL', kw: ['KW_FOCUS_WINDOW', 'KW_TETHER_LINK', 'KW_ABSORB_RELEASE'], mat1: 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', mat2: 'MAT_FORM_VOID_COMPASS_SHARD_5', stats: { atk: 142, matk: 246, def: 128, mdef: 168, acc: 24, cast: 18 } },
    // ABACUS (3 items: T4, T5, T6)
    { id: 'EQ_V240_ABACUS_T4', nameTh: 'ลูกคิดเกล็ดมังกรสายฟ้าคำนวณศึก', slot: 'WEAPON', gearType: 'ABACUS', tier: 4, el: 'EARTH_METAL', kw: ['KW_ARMOR_READ', 'KW_CRIT_BREAK'], mat1: 'MAT_BP_THUNDER_LIZARD_SCALE_4', mat2: 'MAT_V222_BP_30', stats: { atk: 88, matk: 88, def: 58, mdef: 58, acc: 15, pen: 14 } },
    { id: 'EQ_V240_ABACUS_T5', nameTh: 'ลูกคิดมุกน้ำแข็งมังกรสมุทรชั่งชะตา', slot: 'WEAPON', gearType: 'ABACUS', tier: 5, el: 'WATER_ICE', kw: ['KW_ARMOR_READ', 'KW_TEMPO_STEAL'], mat1: 'MAT_V222_BP_27', mat2: 'MAT_V222_BP_31', stats: { atk: 136, matk: 136, def: 90, mdef: 90, acc: 20, pen: 18 } },
    { id: 'EQ_V240_ABACUS_T6', nameTh: 'มหาลูกคิดทองคำจะงอยครุฑพิพากษาคลังสวรรค์', slot: 'WEAPON', gearType: 'ABACUS', tier: 6, el: 'EARTH_METAL', kw: ['KW_ARMOR_READ', 'KW_CRIT_OVERFLOW', 'KW_SHATTER_ARMOR'], mat1: 'MAT_V222_BP_36', mat2: 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', stats: { atk: 206, matk: 206, def: 138, mdef: 138, acc: 26, pen: 24 } },
    // 6 Boss-Organ & Immortal Beast-Marrow Armors/Accessories (T5-T7)
    { id: 'EQ_V240_ARMOR_BOSS_SHELL_T5', nameTh: 'เกราะเกล็ดอกราชันอสูรบรรพกาล', slot: 'ARMOR', gearType: 'HEAVY_ARMOR', subType: 'HEAVY_ARMOR', tier: 5, el: 'EARTH_METAL', kw: ['KW_GUARD_COUNTER', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_BOSS_CORE_SHELL', mat2: 'MAT_V222_BP_29', stats: { def: 168, mdef: 124, hp: 460, atk: 38 } },
    { id: 'EQ_V240_ARMOR_BOSS_WING_T6', nameTh: 'ภูษาปีกวายุราชันอสูรท่องนภา', slot: 'ARMOR', gearType: 'LIGHT_ARMOR', subType: 'LIGHT_ARMOR', tier: 6, el: 'WIND', kw: ['KW_TEMPO_STEAL', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_BOSS_WING', mat2: 'MAT_BP_PHOENIX_PLUME_6', stats: { def: 182, mdef: 210, hp: 540, eva: 16, move: 14, cast: 12 } },
    { id: 'EQ_V240_ARMOR_IMMORTAL_MARROW_T7', nameTh: 'เกราะเทวะไขกระดูกอสูรเบื้องบนอมตะ', slot: 'ARMOR', gearType: 'HEAVY_ARMOR', subType: 'HEAVY_ARMOR', tier: 6, el: 'LIGHT_YANG', kw: ['KW_ABSORB_RELEASE', 'KW_LAST_BREATH', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_TR_IMMORTAL_BEAST_MARROW', mat2: 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', stats: { def: 295, mdef: 275, hp: 820, atk: 85, matk: 85 } },
    { id: 'EQ_V240_ACC_BOSS_CROWN_T5', nameTh: 'รัดเกล้าเขาราชันอสูรสะท้านภพ', slot: 'ACCESSORY', gearType: 'PENDANT', subType: 'PENDANT', tier: 5, el: 'FIRE', kw: ['KW_SHATTER_ARMOR', 'KW_CRIT_BREAK'], mat1: 'MAT_BOSS_HORN_CROWN', mat2: 'MAT_V222_BP_28', stats: { atk: 96, matk: 96, crit: 10, critDmg: 22, pen: 14, hp: 240 } },
    { id: 'EQ_V240_ACC_BOSS_VENOM_T5', nameTh: 'ถุงหอมพิษอสูรพันปีกลืนชีพจร', slot: 'ACCESSORY', gearType: 'CHARM', subType: 'CHARM', tier: 5, el: 'POISON', kw: ['KW_STATUS_TRANSFER', 'KW_DELAYED_DETONATION'], mat1: 'MAT_BOSS_VENOM_SAC', mat2: 'MAT_V222_BP_27', stats: { atk: 78, matk: 118, acc: 16, pen: 16, hp: 260, cast: 10 } },
    { id: 'EQ_V240_ACC_IMMORTAL_MARROW_T7', nameTh: 'ตราหยกไขกระดูกเทพอสูรเบื้องบนนิรันดร์', slot: 'ACCESSORY', gearType: 'RING', subType: 'RING', tier: 6, el: 'ASTRAL', kw: ['KW_OVERHEAL_BARRIER', 'KW_CRIT_OVERFLOW', 'KW_FOCUS_WINDOW'], mat1: 'MAT_TR_IMMORTAL_BEAST_MARROW', mat2: 'MAT_FORM_VOID_COMPASS_SHARD_5', stats: { atk: 185, matk: 195, def: 145, mdef: 155, hp: 480, crit: 12, pen: 16 } }
  ];

  v240NewGearSpecs.forEach(gs => {
    const it = {
      id: gs.id,
      nameTh: gs.nameTh,
      cat: 'EQUIPMENT',
      out: 'EQUIPMENT',
      slot: gs.slot,
      gearType: gs.gearType,
      subType: gs.subType || gs.gearType,
      visualSubtype: gs.gearType,
      tier: gs.tier,
      minStage: Math.max(1, gs.tier - 1),
      rarity: gs.tier >= 7 ? 'Mythic' : gs.tier >= 5 ? 'Epic' : 'Rare',
      grade: gs.tier >= 7 ? 'Mythic' : gs.tier >= 5 ? 'Epic' : 'Rare',
      q: gs.tier >= 6 ? 1.25 : 1.15,
      value: Math.round(65 * Math.pow(1.95, gs.tier - 1)),
      craft: 'FORGING',
      durability: 100,
      element: gs.el,
      elementProfile: epSingleV222(gs.el),
      combatKeywords: gs.kw,
      fixedStats: gs.stats,
      effects: [
        {
          effectId: ({
            ROSARY: 'EFX_V200_BODHI_MERIT_PULSE',
            CLAW: 'EFX_V200_ATAVISM_CLAW_REND',
            NEEDLE: 'EFX_V200_MERIDIAN_VENOM_NEEDLE',
            FAN: 'EFX_V200_TEMPEST_FAN_GALE',
            ASTROLABE: 'EFX_V200_ASTROLABE_STAR_LOCK',
            ABACUS: 'EFX_V200_ABACUS_LEDGER_SETTLE'
          }[gs.gearType] || (gs.slot === 'ARMOR' ? 'EFX_TRIBULATION_SHIELD' : 'EFX_QI_RESERVOIR')),
          nameTh: 'ปราณศาสตรา ' + gs.nameTh,
          descTh: 'เสริมคีย์เวิร์ดยุทธวิธี ' + gs.kw.join(' + ') + ' ตามระดับศาสตรา',
          params: { bonusDmgMult: 0.08 + gs.tier * 0.015, dur: 60 }
        }
      ],
      obtainSources: ['CRAFTING', 'SECRET_REALM', 'SECT_TREASURY'],
      v240: true
    };
    items.push(it);
    const rec = {
      id: 'REC_' + gs.id,
      nameTh: 'ตำราหลอม ' + gs.nameTh,
      craft: 'FORGING',
      station: 'FORGE',
      tier: gs.tier,
      out: 'EQUIPMENT',
      outType: 'EQUIPMENT',
      outItemId: gs.id,
      outNameTh: gs.nameTh,
      minMastery: Math.max(10, (gs.tier - 1) * 14),
      inputs: [
        { matId: gs.mat1, count: 2 },
        { matId: gs.mat2, count: 1 }
      ],
      element: gs.el,
      obtainSources: ['SECT_TREASURY', 'SECRET_REALM', 'MARKET'],
      v240: true
    };
    recipes.push(rec);
  });

  // 7 Spirit Beast Anatomy Alchemy Recipes consuming all remaining unassigned ECO2_MAT_* & MAT_V222_BP_* materials
  const v240AlchemySpecs = [
    { id: 'REC_V240_PILL_FELINE_AGILITY_1', nameTh: 'โอสถโลหิตเสือผาว่องไว', tier: 1, el: 'WIND', mat1: 'ECO2_MAT_FELINE_B_1', mat2: 'ECO2_MAT_AVIAN_B_1', effect: { healHealth: 35, buff: 'windStep', dur: 180 } },
    { id: 'REC_V240_PILL_URSINE_VITALITY_1', nameTh: 'โอสถดีหมีดงไผ่ชูกำลัง', tier: 1, el: 'EARTH_METAL', mat1: 'ECO2_MAT_URSINE_B_1', mat2: 'ECO2_MAT_UNGULATE_A_1', effect: { healHealth: 45, healInjury: 1, buff: 'ironSkin', dur: 180 } },
    { id: 'REC_V240_PILL_AQUATIC_CHIMERA_1', nameTh: 'โอสถเกล็ดเงินจิ้งจอกวายุปลอดโปร่ง', tier: 1, el: 'WATER_ICE', mat1: 'ECO2_MAT_AQUATIC_A_1', mat2: 'ECO2_MAT_CHIMERA_B_1', effect: { clearToxic: 25, clearHeartDemon: 15, buff: 'clarityLotus', dur: 180 } },
    { id: 'REC_V240_PILL_CENTIPEDE_BEAR_2', nameTh: 'โอสถดีหมีผาแดงตะขาบร้อยขา', tier: 2, el: 'FIRE', mat1: 'MAT_V222_BP_32', mat2: 'ECO2_MAT_ARTHROPOD_B_2', effect: { healHealth: 75, breakthroughBonus: 0.05, dur: 240 } },
    { id: 'REC_V240_PILL_KIRIN_MARROW_3', nameTh: 'โอสถไขกระดูกหมาป่ากิเลนทะลวงด่าน', tier: 3, el: 'BLOOD_DEMON', mat1: 'MAT_V222_BP_25', mat2: 'MAT_BP_MIST_STAG_ANTLER_3', effect: { healHealth: 120, breakthroughBonus: 0.08, dur: 300 } },
    { id: 'REC_V240_PILL_NINE_TAIL_STAR_5', nameTh: 'โอสถหัวใจจิ้งจอกเก้าหางดาราสวรรค์', tier: 5, el: 'ASTRAL', mat1: 'MAT_V222_BP_28', mat2: 'MAT_FORM_LIFE_ESSENCE_DEW_4', effect: { healHealth: 260, clearHeartDemon: 40, breakthroughBonus: 0.12, dur: 360 } },
    { id: 'REC_V240_PILL_IMMORTAL_MARROW_7', nameTh: 'มหาโอสถไขกระดูกเทพอสูรเบื้องบนนิรันดร์', tier: 6, el: 'LIGHT_YANG', mat1: 'MAT_TR_IMMORTAL_BEAST_MARROW', mat2: 'MAT_BP_PHOENIX_PLUME_6', effect: { healHealth: 500, healInjury: 3, clearToxic: 80, breakthroughBonus: 0.18, dur: 480 } }
  ];
  v240AlchemySpecs.forEach(ps => {
    recipes.push({
      id: ps.id,
      nameTh: 'ตำรับปรุง' + ps.nameTh,
      outNameTh: ps.nameTh,
      craft: 'ALCHEMY',
      station: 'ALCHEMY',
      tier: ps.tier,
      out: 'PILL',
      outType: 'PILL',
      minMastery: Math.max(0, (ps.tier - 1) * 14),
      inputs: [
        { matId: ps.mat1, count: 1 },
        { matId: ps.mat2, count: 1 }
      ],
      effect: ps.effect,
      element: ps.el,
      obtainSources: ['SECT_TREASURY', 'SECRET_REALM', 'MARKET'],
      v240: true
    });
  });

  const ECOLOGY = {
    VERSION: '1.10.12',
    species,
    materials,
    recipes,
    items,
    speciesById: Object.fromEntries(species.map(s => [s.id, s])),
    materialById: Object.fromEntries(materials.map(m => [m.id, m])),
    recipeById: Object.fromEntries(recipes.map(r => [r.id, r])),
    itemById: Object.fromEntries(items.map(i => [i.id, i]))
  };

  JD.ECOLOGY = ECOLOGY;

  // Register into global catalogs before consumers build lookup maps
  JD.BEASTS = JD.BEASTS || { species: [], kings: [] };
  JD.BEASTS.species = JD.BEASTS.species || [];
  JD.BEASTS.species.push(...species);

  JD.ITEMS = JD.ITEMS || { materials: [], recipes: [], items: [] };
  JD.ITEMS.materials = JD.ITEMS.materials || [];
  JD.ITEMS.recipes = JD.ITEMS.recipes || [];
  JD.ITEMS.items = JD.ITEMS.items || [];

  JD.ITEMS.materials.push(...materials);
  JD.ITEMS.recipes.push(...recipes);
  JD.ITEMS.items.push(...items);

  // Enrich every Spirit Beast in JD.BEASTS.species with complete Anatomy Breakdown & Material Usage Guide
  const matLookup = {};
  (JD.ITEMS.materials || []).forEach(m => { if (m && m.id) matLookup[m.id] = m; });
  const recByInputMat = {};
  (JD.ITEMS.recipes || []).forEach(r => {
    (r.inputs || []).forEach(inp => {
      if (!recByInputMat[inp.matId]) recByInputMat[inp.matId] = [];
      recByInputMat[inp.matId].push(r.id);
    });
  });

  JD.BEASTS.unassignedAnatomyBacklog = v222ReservedBeastMats.map(m => ({
    matId: m.id,
    nameTh: m.nameTh,
    tier: m.tier,
    anatomy: m.anatomy,
    element: m.element,
    craft: m.craft,
    usedInRecipeIds: recByInputMat[m.id] || [],
    status: (recByInputMat[m.id] && recByInputMat[m.id].length > 0) ? 'ACTIVE_IN_V240_RECIPES' : 'RESERVED_FOR_NEXT_PATCH',
    usesTh: m.usesTh,
    plannedUsageTh: m.plannedUsageTh
  }));

  (JD.BEASTS.species || []).forEach(sp => {
    if (!sp) return;
    if (Array.isArray(sp.drops) && sp.drops.length === 1) {
      const extraDrop = (sp.tier || 1) >= 2 ? "MAT_BP_BOAR_CORE_2" : "MAT_BP_BEAST_MEAT_1";
      if (!sp.drops.includes(extraDrop)) sp.drops.push(extraDrop);
    }
    const dropDetails = (sp.drops || []).map(dId => {
      const m = matLookup[dId] || {};
      const usedIn = recByInputMat[dId] || [];
      return {
        matId: dId,
        nameTh: m.nameTh || dId,
        anatomy: m.anatomy || (dId.includes('MEAT') ? 'SPIRIT_MEAT' : dId.includes('CORE') ? 'INNER_CORE' : dId.includes('PELT') || dId.includes('SHELL') ? 'SCALE_SHELL' : 'FANG_CLAW'),
        tier: m.tier || sp.tier || 1,
        craft: m.craft || 'FORGING',
        usedInRecipeIds: usedIn,
        craftingStatus: usedIn.length > 0 ? 'ACTIVE_IN_RECIPES' : (m.craftingStatus || 'GENERAL_CRAFT_POOL'),
        usesTh: m.usesTh || (usedIn.length > 0 ? ('ใช้ในตำรับหลอม/ปรุงยา ' + usedIn.length + ' สูตร') : 'วัตถุดิบชิ้นส่วนอสูรสำรองสำหรับหลอมศาสตรา/ปรุงโอสถในแพตช์ถัดไป')
      };
    });
    sp.anatomyProfile = {
      complete: true,
      coreOrgan: 'แก่นปราณอสูรธาตุ ' + (sp.element || 'NEUTRAL') + ' (ระดับ ' + (sp.tier || 1) + ')',
      offensivePart: dropDetails[0] ? dropDetails[0].nameTh : 'เขี้ยว/กรงเล็บอสูร',
      defensiveHide: dropDetails[1] ? dropDetails[1].nameTh : 'หนัง/เกล็ดหุ้มปราณ',
      spiritMeat: 'เนื้อปราณอสูรสำหรับโรงครัวและโอสถบำรุงกายา',
      dropDetails
    };
  });


})(typeof globalThis !== 'undefined' ? globalThis : this);
