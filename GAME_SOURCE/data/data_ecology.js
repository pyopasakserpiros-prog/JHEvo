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
    "nameTh": "เขาอสูรกลืนมิติบารมีอนันต์",
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
      facilityLevel: Math.min(3, Math.max(1, es.tier - 1)), // Forge progression ends at level 3.
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
    { id: 'EQ_V240_ARMOR_BOSS_SHELL_T5', nameTh: 'เกราะเกล็ดอกราชันอสูรบรรพกาล', slot: 'ARMOR', gearType: 'HEAVY_ARMOR', subType: 'HEAVY_ARMOR', visualSubtype: 'HEAVY_ARMOR', tier: 5, el: 'EARTH_METAL', kw: ['KW_GUARD_COUNTER', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_BOSS_CORE_SHELL', mat2: 'MAT_V222_BP_29', stats: { def: 168, mdef: 124, hp: 460, atk: 38 } },
    { id: 'EQ_V240_ARMOR_BOSS_WING_T6', nameTh: 'ภูษาปีกวายุราชันอสูรท่องนภา', slot: 'ARMOR', gearType: 'LIGHT_ARMOR', subType: 'LIGHT_ARMOR', visualSubtype: 'LIGHT_ARMOR', tier: 6, el: 'WIND', kw: ['KW_TEMPO_STEAL', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_BOSS_WING', mat2: 'MAT_BP_PHOENIX_PLUME_6', stats: { def: 182, mdef: 210, hp: 540, eva: 16, move: 14, cast: 12 } },
    { id: 'EQ_V240_ARMOR_IMMORTAL_MARROW_T7', nameTh: 'เกราะเทวะไขกระดูกอสูรเบื้องบนอมตะ', slot: 'ARMOR', gearType: 'HEAVY_ARMOR', subType: 'HEAVY_ARMOR', visualSubtype: 'HEAVY_ARMOR', tier: 6, el: 'LIGHT_YANG', kw: ['KW_ABSORB_RELEASE', 'KW_LAST_BREATH', 'KW_ADAPTIVE_RESIST'], mat1: 'MAT_TR_IMMORTAL_BEAST_MARROW', mat2: 'MAT_BP_MYTHIC_GUARDIAN_CORE_6', stats: { def: 295, mdef: 275, hp: 820, atk: 85, matk: 85 } },
    { id: 'EQ_V240_ACC_BOSS_CROWN_T5', nameTh: 'รัดเกล้าเขาราชันอสูรสะท้านภพ', slot: 'ACCESSORY', gearType: 'PENDANT', subType: 'PENDANT', visualSubtype: 'PENDANT', tier: 5, el: 'FIRE', kw: ['KW_SHATTER_ARMOR', 'KW_CRIT_BREAK'], mat1: 'MAT_BOSS_HORN_CROWN', mat2: 'MAT_V222_BP_28', stats: { atk: 96, matk: 96, crit: 10, critDmg: 22, pen: 14, hp: 240 } },
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

/* =========================================================================
 * CARBON COMPENDIA INTEGRATED DATA LAYER (31 PDFs: 881fecf & 6670b49)
 * Preserves all legacy JD.TECH.techniques (1726) & JD.TECH.mantras (122) counts.
 * ========================================================================= */
(function initCarbonCompendiaData(g) {
  const JD = g.JD || (g.JD = {});
  JD.CORE = JD.CORE || {};
  JD.TECH = JD.TECH || {};
  JD.ITEMS = JD.ITEMS || {};
  JD.EXPANSION = JD.EXPANSION || {};
  JD.MARTIAL = JD.MARTIAL || {};

  // 1. Unified Rarity & Progression Taxonomy: Grade 6 Transcendent (เหนือตำนาน · 6★)
  JD.MARTIAL.GRADES = JD.MARTIAL.GRADES || {};
  JD.MARTIAL.GRADES.Transcendent = {
    id: 'Transcendent',
    rank: 6,
    stars: 6,
    nameTh: 'เหนือตำนาน',
    badgeTh: '✦ เหนือตำนาน · 6★',
    color: '#ff9ef5',
    border: '#ffd740',
    glow: 'rgba(255, 158, 245, 0.55)'
  };
  JD.MARTIAL.GRADES.TRANSCENDENT = JD.MARTIAL.GRADES.Transcendent;

  // 2. Gen-7 Sect Master Pre-History Ancestral Plaques (Gen 1-6, Zero Upper-World Spoilers)
  JD.CORE.patriarchPreHistoryTemplates = [
  {
    "generation": 1,
    "id": "PATRIARCH_GEN_1",
    "titleTh": "ปรมาจารย์ผู้ก่อตั้งรุ่นที่ 1 · ผู้เฒ่านิรนามแห่งหุบเขาเมฆาเร้น",
    "eraTh": "ปลายยุคโบราณหลังม่านฟ้าปิดกั้น",
    "relicLeftTh": "ตราหินเทาไร้ลักษณ์ (REGALIA_ORIGIN_FORMLESS_STONE)",
    "inscriptionTh": "มรรคาไร้ชื่อ ศาสตราไร้รูป ผู้เฝ้ามองสายน้ำและขุนเขาย่อมเห็นความจริงเอง",
    "deedSummaryTh": "เดินทางมาพำนักในหุบเขาเมฆาเร้นเพียงลำพัง วางค่ายกลกลมกลืนธรรมชาติคุ้มครองสัตว์วิญญาณและทิ้งตราหินเทาไร้ลักษณ์ไว้บนแท่นศิลาบรรพชนก่อนหายสาบสูญไปในม่านหมอก",
    "causeOfPassingTh": "เดินหายเข้าไปในทะเลหมอกลึกท้ายหุบเขาโดยไม่ทิ้งร่องรอยสังขาร",
    "mortalPerspectiveOnly": true
  },
  {
    "generation": 2,
    "id": "PATRIARCH_GEN_2",
    "titleTh": "เจ้าสำนักรุ่นที่ 2 · ปรมาจารย์หลินชิงเสวียน (ผู้บุกเบิกแปดยอดเขา)",
    "eraTh": "ยุคก่อร่างสำนักโบราณ",
    "relicLeftTh": "หลักศิลาแบ่งเขตแปดยอดเขาและบันทึกเส้นชีพจรปฐพี",
    "inscriptionTh": "แปดยอดเขาพึ่งพาอาศัย รากฐานมั่นคงจึงรับพายุใหญ่ได้",
    "deedSummaryTh": "ศิษย์เอกผู้รับช่วงดูแลหุบเขา เปิดเส้นทางเชื่อมยอดเขาทั้งแปดและวางระเบียบหอคัมภีร์รุ่นแรก",
    "causeOfPassingTh": "ละสังขารอย่างสงบหลังปิดด่านรักษาเส้นชีพจรปฐพีของสำนัก",
    "mortalPerspectiveOnly": true
  },
  {
    "generation": 3,
    "id": "PATRIARCH_GEN_3",
    "titleTh": "เจ้าสำนักรุ่นที่ 3 · แม่ทัพทวนหัก เสิ่นเจิ้นเทียน",
    "eraTh": "ยุคศึกจลาจลชายแดนโบราณ",
    "relicLeftTh": "รอยทวนพิทักษ์ซุ้มประตูเขา",
    "inscriptionTh": "ยอมให้ทวนหักหน้าประตูเขา ดีกว่าให้ไฟสงครามลามถึงหอคัมภีร์",
    "deedSummaryTh": "นำศิษย์รุ่นที่สามยืนหยัดต้านกองทัพโจรคลั่งและอสูรคลื่นพายุเจ็ดวันเจ็ดคืนจนสำนักรอดพ้นภัยล่มสลาย",
    "causeOfPassingTh": "พิษบาดแผลเก่ากำเริบหลังศึกป้องกันประตูสำนัก",
    "mortalPerspectiveOnly": true
  },
  {
    "generation": 4,
    "id": "PATRIARCH_GEN_4",
    "titleTh": "เจ้าสำนักรุ่นที่ 4 · หมอเทวะหญิง ซูรั่วหลาน",
    "eraTh": "ยุคฟื้นฟูสวนสมุนไพรและเตาโอสถ",
    "relicLeftTh": "ตำรับโอสถต้มสมุนไพรพื้นฐานและร่องน้ำเลี้ยงสวนยา",
    "inscriptionTh": "เมตตาต่อผู้ยากไร้และสรรพสัตว์ คือปราณคุ้มครองสำนักที่ยั่งยืนที่สุด",
    "deedSummaryTh": "เปิดโรงทานโอสถช่วยเหลือชาวบ้านรอบหุบเขาและริเริ่มพันธสัญญาอยู่ร่วมกับสัตว์วิญญาณในหุบเขาอย่างสันติ",
    "causeOfPassingTh": "สิ้นอายุขัยตามธรรมชาติท่ามกลางสวนสมุนไพรวิญญาณ",
    "mortalPerspectiveOnly": true
  },
  {
    "generation": 5,
    "id": "PATRIARCH_GEN_5",
    "titleTh": "เจ้าสำนักรุ่นที่ 5 · นักพรตพู่กันเหมันต์ กู้เหยียนจือ",
    "eraTh": "ยุค쇠ถอยของตระกูลยุทธภพรอบนอก",
    "relicLeftTh": "สมุดคัดลอกคัมภีร์โบราณที่ชำรุด",
    "inscriptionTh": "ยามรุ่งเรืองอย่าลืมตน ยามตกต่ำอย่าทิ้งรากเหง้า",
    "deedSummaryTh": "รวบรวมตำราชาวบ้านและเคล็ดวิชาที่กระจัดกระจายมาเก็บรักษาไว้ในหอคัมภีร์ แม้สำนักจะเริ่มขาดแคลนศิลาวิญญาณ",
    "causeOfPassingTh": "ธาตุไฟเข้าแทรกขณะฝืนซ่อมค่ายกลคุ้มสำนักในคืนพายุหิมะ",
    "mortalPerspectiveOnly": true
  },
  {
    "generation": 6,
    "id": "PATRIARCH_GEN_6",
    "titleTh": "เจ้าสำนักรุ่นที่ 6 · ผู้อาวุโสตะเกียงริบหรี่ โม่ชางไห่ (อาจารย์ของเจ้าสำนักองค์ปัจจุบัน)",
    "eraTh": "ยุคก่อนส่งมอบตำแหน่งสู่รุ่นที่ 7",
    "relicLeftTh": "ตราหินเทาไร้ลักษณ์ที่ส่งมอบให้เจ้าสำนักรุ่นที่ 7 และคำสั่งเสียฟื้นฟูสำนัก",
    "inscriptionTh": "ประคองไฟดวงสุดท้ายไว้ในมือเจ้า จงนำพาสำนักรุ่นที่เจ็ดกลับมายืนหยัดอีกครั้ง",
    "deedSummaryTh": "ประคับประคองสำนักที่เหลือศิษย์เพียงไม่กี่คนผ่านพ้นวิกฤตหนี้สินและการคุกคามของสำนักคู่แข่ง ก่อนมอบตราหินเทาไร้ลักษณ์ให้ศิษย์รุ่นที่ 7 สืบทอดตำแหน่ง",
    "causeOfPassingTh": "ละสังขารอย่างสงบหลังมอบตราประจำตำแหน่งให้เจ้าสำนักรุ่นที่ 7",
    "mortalPerspectiveOnly": true
  }
];

  // 3. Patriarch Origin Regalia Specifications (TRANSCENDENT_01A-01C & LORE_05B)
  JD.CORE.PATRIARCH_REGALIA_SPECS = {
    id: 'REGALIA_ORIGIN_FORMLESS_STONE',
    nameTh: 'ตราหินเทาไร้ลักษณ์',
    awakeningStages: [
      { stage: 0, nameTh: 'ขั้นที่ 0 · หินเทาไร้ลักษณ์', minMasterStage: 1, combatMult: 0.38, defenseMult: 0.38, breakthroughBonus: 0.12, maxImprints: 1, dualElement: false },
      { stage: 1, nameTh: 'ขั้นที่ 1 · หยกบรรพชนตื่นรู้', minMasterStage: 2, combatMult: 0.48, defenseMult: 0.48, breakthroughBonus: 0.15, maxImprints: 2, dualElement: false },
      { stage: 2, nameTh: 'ขั้นที่ 2 · ศาสตราจำแลงพันลักษณ์', minMasterStage: 4, combatMult: 0.62, defenseMult: 0.58, breakthroughBonus: 0.18, maxImprints: 3, dualElement: false },
      { stage: 3, nameTh: 'ขั้นที่ 3 · ตราบัญชาธาตุประสาน', minMasterStage: 5, combatMult: 0.76, defenseMult: 0.72, breakthroughBonus: 0.22, maxImprints: 4, dualElement: false },
      { stage: 4, nameTh: 'ขั้นที่ 4 · จักรพรรดิเทวะทวิธาตุ', minMasterStage: 6, combatMult: 0.90, defenseMult: 0.85, breakthroughBonus: 0.26, maxImprints: 5, dualElement: true },
      { stage: 5, nameTh: 'ขั้นที่ 5 · มหาศาสตราต้นกำเนิดไร้ขอบเขต', minMasterStage: 7, combatMult: 1.08, defenseMult: 1.02, breakthroughBonus: 0.32, maxImprints: 6, dualElement: true }
    ],
    forms: {
      ORIGIN_STONE: { id: 'ORIGIN_STONE', nameTh: 'ตราหินเทาไร้ลักษณ์', slot: 'ACCESSORY', subType: 'CHARM', gearType: 'CHARM', role: 'BALANCED' },
      SWORD: { id: 'SWORD', nameTh: 'กระบี่ไร้ลักษณ์บรรพกาล', slot: 'WEAPON', subType: 'SWORD', gearType: 'SWORD', role: 'OFFENSE' },
      GREAT_SWORD: { id: 'GREAT_SWORD', nameTh: 'กระบี่ใหญ่ไร้คมผ่าขุนเขา', slot: 'WEAPON', subType: 'SWORD', gearType: 'SWORD', role: 'VANGUARD' },
      TWIN_SWORD: { id: 'TWIN_SWORD', nameTh: 'กระบี่คู่หยินหยางไร้ลักษณ์', slot: 'WEAPON', subType: 'SWORD', gearType: 'SWORD', role: 'FLURRY' },
      BLADE: { id: 'BLADE', nameTh: 'ดาบปฐมกาลสะบั้นชะตา', slot: 'WEAPON', subType: 'BLADE', gearType: 'BLADE', role: 'OFFENSE' },
      SPEAR: { id: 'SPEAR', nameTh: 'ทวนมังกรศิลาทะลวงฟ้า', slot: 'WEAPON', subType: 'SPEAR', gearType: 'SPEAR', role: 'PIERCE' },
      HALBERD: { id: 'HALBERD', nameTh: 'ง้าวราชันย์ศิลาพิทักษ์ด่าน', slot: 'WEAPON', subType: 'SPEAR', gearType: 'SPEAR', role: 'VANGUARD' },
      FIST: { id: 'FIST', nameTh: 'สนับมือวัชระไร้ลักษณ์', slot: 'WEAPON', subType: 'FIST', gearType: 'FIST', role: 'BRAWLER' },
      BOW: { id: 'BOW', nameTh: 'คันศรสายลมดาราไร้ลักษณ์', slot: 'WEAPON', subType: 'BOW', gearType: 'BOW', role: 'RANGED' },
      STAFF: { id: 'STAFF', nameTh: 'พลองค้ำหุบเขาเมฆาเร้น', slot: 'WEAPON', subType: 'STAFF', gearType: 'STAFF', role: 'CONTROL' },
      FOCUS: { id: 'FOCUS', nameTh: 'ศาสตราเวทลูกแก้วปฐมกาล', slot: 'WEAPON', subType: 'FOCUS', gearType: 'FOCUS', role: 'CASTER' },
      FAN: { id: 'FAN', nameTh: 'พัดศิลาโบกเมฆาแปดทิศ', slot: 'WEAPON', subType: 'FAN', gearType: 'FAN', role: 'SUPPORT' },
      ZITHER: { id: 'ZITHER', nameTh: 'พิณศิลาเจ็ดสายสะท้อนธรรม', slot: 'WEAPON', subType: 'ZITHER', gearType: 'ZITHER', role: 'HARMONY' },
      BRUSH: { id: 'BRUSH', nameTh: 'พู่กันศิลาจารึกชะตา', slot: 'WEAPON', subType: 'BRUSH', gearType: 'BRUSH', role: 'SCHOLAR' },
      WHIP: { id: 'WHIP', nameTh: 'แส้ศิลาพันธนาการอสูร', slot: 'WEAPON', subType: 'WHIP', gearType: 'WHIP', role: 'CONTROL' },
      ROSARY: { id: 'ROSARY', nameTh: 'ประคำหินเทาหนึ่งร้อยแปดเม็ด', slot: 'WEAPON', subType: 'ROSARY', gearType: 'ROSARY', role: 'GUARDIAN' },
      CLAW: { id: 'CLAW', nameTh: 'กรงเล็บศิลาฉีกม่านหมอก', slot: 'WEAPON', subType: 'CLAW', gearType: 'CLAW', role: 'ASSASSIN' },
      NEEDLE: { id: 'NEEDLE', nameTh: 'เข็มศิลาไร้เงาช่วยชีวิต', slot: 'WEAPON', subType: 'NEEDLE', gearType: 'NEEDLE', role: 'MEDIC' },
      ASTROLABE: { id: 'ASTROLABE', nameTh: 'จานดาราศิลาคำนวณฟ้า', slot: 'WEAPON', subType: 'ASTROLABE', gearType: 'ASTROLABE', role: 'DIVINER' },
      ABACUS: { id: 'ABACUS', nameTh: 'ลูกคิดศิลาชั่งตวงบุญคุณ', slot: 'WEAPON', subType: 'ABACUS', gearType: 'ABACUS', role: 'MERCHANT' },
      SACRED_ARMOR: { id: 'SACRED_ARMOR', nameTh: 'เกราะศิลาไร้ลักษณ์คุ้มกาย', slot: 'ARMOR', subType: 'HEAVY', gearType: 'HEAVY', role: 'AEGIS' },
      CELESTIAL_ROBE: { id: 'CELESTIAL_ROBE', nameTh: 'อาภรณ์เมฆาหินเทาไร้รอยตะเข็บ', slot: 'ARMOR', subType: 'ROBE', gearType: 'ROBE', role: 'ROBE' },
      ORIGIN_RING: { id: 'ORIGIN_RING', nameTh: 'แหวนศิลาบรรพชนครองสำนัก', slot: 'ACCESSORY', subType: 'RING', gearType: 'RING', role: 'CULTIVATION' },
      OMNI_REGALIA: { id: 'OMNI_REGALIA', nameTh: 'มหาศาสตราจำแลงไร้ขอบเขต', slot: 'WEAPON', subType: 'SWORD', gearType: 'SWORD', role: 'SOVEREIGN_OMNI' }
    },
    elements: ['NEUTRAL','FIRE','WATER_ICE','LIGHTNING','WOOD_LIFE','EARTH_METAL','WIND','YIN_SHADOW','LIGHT_YANG','BLOOD_DEMON','ASTRAL_VOID'],
    imprints: {
      IMP_BLADE_VANGUARD: { id: 'IMP_BLADE_VANGUARD', nameTh: 'ตราประทับคมศาสตราทะลวงทัพ', atkBonus: 0.14, penAdd: 12 },
      IMP_IRON_COLOSSUS: { id: 'IMP_IRON_COLOSSUS', nameTh: 'ตราประทับปราการศิลาแปดยอดเขา', defBonus: 0.16, dmgRedPct: 0.08 },
      IMP_LOTUS_SAINT: { id: 'IMP_LOTUS_SAINT', nameTh: 'ตราประทับบงกชหมอเทวะรุ่นที่สี่', healBonus: 0.20, cleanToxic: true },
      IMP_STAR_ARCANIST: { id: 'IMP_STAR_ARCANIST', nameTh: 'ตราประทับดาราพยากรณ์หมื่นกัลป์', matkBonus: 0.16, critAdd: 8 },
      IMP_SHADOW_PHANTOM: { id: 'IMP_SHADOW_PHANTOM', nameTh: 'ตราประทับเงาเมฆาไร้ร่องรอย', evaAdd: 14, spdBonus: 0.12 },
      IMP_DIVINE_ARTIFICER: { id: 'IMP_DIVINE_ARTIFICER', nameTh: 'ตราประทับเตาหลอมและหม้อยาบรรพชน', craftSuccessAdd: 0.15, qualityAdd: 0.12 },
      IMP_GRAND_FORMATION: { id: 'IMP_GRAND_FORMATION', nameTh: 'ตราประทับค่ายกลพิทักษ์ประตูเขา', squadMitBonus: 0.10, arrayPower: 0.18 },
      IMP_BEAST_PUPPET_LORD: { id: 'IMP_BEAST_PUPPET_LORD', nameTh: 'ตราประทับพันธสัญญาอสูรหุบเขา', petPowerBonus: 0.22, beastQiBonus: 0.25 },
      IMP_KARMIC_JUDGE: { id: 'IMP_KARMIC_JUDGE', nameTh: 'ตราประทับตราชั่งเหตุผลและกรรม', reflectPct: 0.12, statusTransfer: true },
      IMP_ABYSSAL_OVERLORD: { id: 'IMP_ABYSSAL_OVERLORD', nameTh: 'ตราประทับปณิธานฝ่าวิกฤตมรณะ', lowHpBurstBonus: 0.24, lifestealAdd: 0.10 },
      IMP_HARMONIC_VIRTUOSO: { id: 'IMP_HARMONIC_VIRTUOSO', nameTh: 'ตราประทับคีตธรรมกล่อมเกลาจิต', qiRegenBonus: 0.20, clearHeartDemon: 2.5 },
      IMP_GOLDEN_MAGNATE: { id: 'IMP_GOLDEN_MAGNATE', nameTh: 'ตราประทับคลังสมบัติฟื้นฟูสำนัก', fameGainBonus: 0.20, tradeBonus: 0.15 }
    },
    sovereignKeywords: [
      'KW_SOV_ROLE_TRANSMUTE', 'KW_SOV_MOMENTUM_EQUALIZE', 'KW_SOV_ORIGIN_SIPHON',
      'KW_SOV_DUAL_LAW_CONVERGE', 'KW_SOV_MORPH_MASTERY', 'KW_SOV_LINEAGE_CHORD',
      'KW_SOV_SPATIAL_TETHER', 'KW_SOV_VEIL_BLINDSPOT', 'KW_SOV_AURA_CONCEALMENT',
      'KW_SOV_ZERO_EQUILIBRIUM'
    ]
  };

  // 4. World-Singleton & World-Roaming Candidate Matrices (TRANSCENDENT_02A-04B)
  JD.CORE.TRANSCENDENT_ARMOR_CANDIDATES = {
    CANDIDATE_A: { id: 'ARM_TRANSCENDENT_LOOM_OF_SCARS', nameTh: 'ภูษาทอรอยแผลหมื่นชะตา', selectedCanonical: true, role: 'CAUSAL_WOUND_LEDGER_AND_CHRYSALIS' },
    CANDIDATE_B: { id: 'ARM_TRANSCENDENT_NINE_CAULDRON_HEART_FORGE', nameTh: 'เกราะเตาหลอมเก้า鼎หัวใจปฐพี', selectedCanonical: false, role: 'THERMAL_FORGE_BASTION' },
    CANDIDATE_C: { id: 'ARM_TRANSCENDENT_EVENT_HORIZON_MANTLE', nameTh: 'เสื้อคลุมขอบฟ้าเหตุการณ์กลืนมิติ', selectedCanonical: false, role: 'VOID_PHASE_MANTLE' }
  };
  JD.CORE.TRANSCENDENT_ACCESSORY_CANDIDATES = {
    CANDIDATE_A: { id: 'ACC_TRANSCENDENT_OUROBOROS_SUNDIAL', nameTh: 'นาฬิกาแดดอูโรโบรอสย้อนกัลป์', selectedCanonical: true, role: 'CHRONO_BOOKMARK_AND_TWIN_ECHO' },
    CANDIDATE_B: { id: 'ACC_TRANSCENDENT_MYRIAD_KNOT_LOOM', nameTh: 'กระสวยด้ายแดงหมื่นบุพเพ', selectedCanonical: false, role: 'KARMIC_BOND_WEAVER' },
    CANDIDATE_C: { id: 'ACC_TRANSCENDENT_BABEL_MIND_PEARL', nameTh: 'มุกจิตวิญญาณสัพพัญญู', selectedCanonical: false, role: 'OMNISCIENT_STUDY_PEARL' }
  };
  JD.CORE.TRANSCENDENT_WEAPON_CANDIDATES = {
    CANDIDATE_A: { id: 'WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN', nameTh: 'หีบศาสตราหมื่นสำนักกลืนสวรรค์', selectedCanonical: true, role: 'OMNI_ARSENAL_DIGESTION_AND_FLYING_SWORDS' },
    CANDIDATE_B: { id: 'WPN_TRANSCENDENT_SEVERED_LAW_EDGE', nameTh: 'คมดาบสะบั้นกฎเกณฑ์ไร้ชื่อ', selectedCanonical: false, role: 'LAW_SEVERING_EXECUTIONER' },
    CANDIDATE_C: { id: 'WPN_TRANSCENDENT_EQUILIBRIUM_GAVEL', nameTh: 'ค้อนตราชั่งสมดุลสวรรค์', selectedCanonical: false, role: 'REALM_EQUILIBRIUM_BREAKER' }
  };

  // 5. Register Transcendent Materials, Pure Elixirs, Pure Forged Genesis Artifacts & World Artifacts
  JD.CORE.transcendentMaterials = [
  {
    "id": "MAT_TR_ALC_01_NINE_APERTURES_CHAOS_LOTUS",
    "shortId": "MAT_TR_ALC_01",
    "nameTh": "เกสรบัวโกลาหลเปิดเก้าทวารสวรรค์",
    "descTh": "เปิดทวารสมองและรากวิญญาณแฝง เพิ่มความเร็วบำเพ็ญและโอกาสทะลวงคอขวดถาวร",
    "cat": "HERB",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "ASTRAL_VOID",
    "elementProfile": {
      "primary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "HERB",
    "elixirMarkId": "MARK_NINE_APERTURES_CROWN",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_02_UNDYING_PHOENIX_BLOOD_MARROW",
    "shortId": "MAT_TR_ALC_02",
    "nameTh": "หยดไขกระดูกหงส์นิรันดร์ผลัดสังขาร",
    "descTh": "สลักไขกระดูกหงส์อมตะ ฟื้นฟูบาดแผลสาหัสและกันความตาย 1 ครั้งต่อศึก",
    "cat": "BEAST",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "FIRE",
    "elementProfile": {
      "primary": "FIRE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "BEAST_PART",
    "elixirMarkId": "MARK_PHOENIX_NIRVANA_MARROW",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_03_DUAL_DANTIAN_ORIGIN_PEARL",
    "shortId": "MAT_TR_ALC_03",
    "nameTh": "มุกครรภ์สวรรค์เบิกตันเถียนที่สอง",
    "descTh": "เบิกทะเลปราณตันเถียนที่สอง เพิ่มเพดานปราณสูงสุด +35% ถาวร",
    "cat": "MINERAL",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "WATER_ICE",
    "elementProfile": {
      "primary": "WATER_ICE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "MINERAL_WATER",
    "elixirMarkId": "MARK_SECOND_ORIGIN_DANTIAN",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_04_MYRIAD_VENOMS_SOVEREIGN_GALL",
    "shortId": "MAT_TR_ALC_04",
    "nameTh": "ดีราชันย์หมื่นพิษกลืนคำสาปถาวร",
    "descTh": "เปลี่ยนพิษโอสถและพิษศัตรูให้กลายเป็นปราณบำรุงกายา 100%",
    "cat": "BEAST",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "primary": "WOOD_LIFE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "BEAST_PART",
    "elixirMarkId": "MARK_OMNI_TOXIN_FURNACE",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_05_AKASHIC_DREAM_FRUIT_NECTAR",
    "shortId": "MAT_TR_ALC_05",
    "nameTh": "น้ำหวานผลไม้ฝันหมื่นชาติเปิดสมองเทวะ",
    "descTh": "ยกระดับความเข้าใจคัมภีร์และความเชี่ยวชาญวิชา +40% ถาวร",
    "cat": "HERB",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "primary": "LIGHT_YANG",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "HERB",
    "elixirMarkId": "MARK_AKASHIC_COMPREHENSION_EYE",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_06_THUNDER_EMPEROR_HEART_DEW",
    "shortId": "MAT_TR_ALC_06",
    "nameTh": "น้ำค้างหัวใจจักรพรรดิอสนีท้าทัณฑ์",
    "descTh": "ดูดซับสายฟ้าทัณฑ์สวรรค์มาหล่อเลี้ยงชีพจร เพิ่มต้านทานทัณฑ์สวรรค์ถาวร",
    "cat": "MINERAL",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "LIGHTNING",
    "elementProfile": {
      "primary": "LIGHTNING",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "MINERAL_WATER",
    "elixirMarkId": "MARK_TRIBULATION_LIGHTNING_HEART",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_07_VAJRA_DRAGON_GOD_BONE_ASH",
    "shortId": "MAT_TR_ALC_07",
    "nameTh": "ผงกระดูกมังกรวัชระหลอมกายาเพชร",
    "descTh": "โครงกระดูกทองคำวัชระ ลดความเสียหายกายภาพและป้องกันกระดูกหักถาวร",
    "cat": "BEAST",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "EARTH_METAL",
    "elementProfile": {
      "primary": "EARTH_METAL",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "BEAST_PART",
    "elixirMarkId": "MARK_VAJRA_DRAGON_SKELETON",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_08_VOID_MIRAGE_SOUL_AMBERGRIS",
    "shortId": "MAT_TR_ALC_08",
    "nameTh": "อำพันทะเลวิญญาณไร้ลักษณ์ซ่อนชะตา",
    "descTh": "ซ่อนกลิ่นอายชะตาจากศัตรูและป้องกันการโจมตีทางจิตวิญญาณ",
    "cat": "MINERAL",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "primary": "YIN_SHADOW",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "MINERAL_WATER",
    "elixirMarkId": "MARK_VOID_MIRAGE_SOUL",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_09_PRIMORDIAL_YIN_YANG_KOI_TEAR",
    "shortId": "MAT_TR_ALC_09",
    "nameTh": "น้ำตาปลามังกรหยินหยางหมุนกงล้อชะตา",
    "descTh": "หนุนโชคชะตาและเปลี่ยนเคราะห์ร้ายในดันเจี้ยนเป็นวาสนา",
    "cat": "BEAST",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "WATER_ICE",
    "elementProfile": {
      "primary": "WATER_ICE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "BEAST_PART",
    "elixirMarkId": "MARK_YIN_YANG_FATE_WHEEL",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_ALC_10_SOVEREIGN_EMPEROR_DRAGON_QI_BLOOD",
    "shortId": "MAT_TR_ALC_10",
    "nameTh": "โลหิตมังกรจักรพรรดิบรรพกาลสืบทอดสายเลือด",
    "descTh": "ยกระดับสายเลือดบรรพชนและส่งต่อตราโอสถสู่ทายาท 50%–75%",
    "cat": "BEAST",
    "craft": "ALCHEMY",
    "tier": 8,
    "transcendentRank": 8,
    "price": 18000,
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "primary": "BLOOD_DEMON",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": true,
    "equipmentOnlyWildcard": false,
    "wildcardDomain": "ALCHEMY_ONLY",
    "wildcardTag": "BEAST_PART",
    "elixirMarkId": "MARK_EMPEROR_DRAGON_BLOODLINE",
    "batchYieldBonus": [
      2,
      3
    ],
    "pillCloudDays": 7,
    "hereditaryChance": 0.65,
    "unsellable": true,
    "obtainSources": [
      "CALAMITY_HERB_SOVEREIGN",
      "METEOR_CRATER_HARVEST",
      "ANCIENT_ALCHEMIST_TOMB"
    ]
  },
  {
    "id": "MAT_TR_SOV_01_VOID_QUICKSILVER_HEART",
    "shortId": "MAT_TR_SOV_01",
    "nameTh": "หัวใจปรอทสุญตาจำแลงหมื่นธาตุ",
    "descTh": "หัวใจปรอทสุญตาจำแลงหมื่นธาตุ · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "ASTRAL_VOID",
    "elementProfile": {
      "primary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "ORE_METAL",
    "isGenesisBridgeKeystone": true,
    "infusionKeyword": "KW_MAT_OMNI_SET_AND_ELEMENT_CHAMELEON",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_OMNI_SET_AND_ELEMENT_CHAMELEON"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_OMNI_SET_AND_ELEMENT_CHAMELEON"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_OMNI_SET_AND_ELEMENT_CHAMELEON"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_02_IMMORTAL_AMBER_CHRONO_SAP",
    "shortId": "MAT_TR_SOV_02",
    "nameTh": "ยางอำพันกาลเวลาหมื่นกัลป์",
    "descTh": "ยางอำพันกาลเวลาหมื่นกัลป์ · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "primary": "WOOD_LIFE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "HERB_WOOD",
    "isGenesisBridgeKeystone": true,
    "infusionKeyword": "KW_MAT_TEMPORAL_ECHO_SEAL",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_TEMPORAL_ECHO_SEAL"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_TEMPORAL_ECHO_SEAL"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_TEMPORAL_ECHO_SEAL"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_03_NIRVANA_HEARTWOOD_MARROW",
    "shortId": "MAT_TR_SOV_03",
    "nameTh": "แก่นพฤกษานิพพานชุบวิญญาณมีชีวิต",
    "descTh": "แก่นพฤกษานิพพานชุบวิญญาณมีชีวิต · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "primary": "WOOD_LIFE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "HERB_WOOD",
    "isGenesisBridgeKeystone": true,
    "infusionKeyword": "KW_MAT_REALM_GROWTH_SYMBIOSIS",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_REALM_GROWTH_SYMBIOSIS"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_REALM_GROWTH_SYMBIOSIS"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_REALM_GROWTH_SYMBIOSIS"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_04_TRIBULATION_THUNDER_FULGURITE",
    "shortId": "MAT_TR_SOV_04",
    "nameTh": "ผลึกสายฟ้าทัณฑ์สวรรค์เก้าชั้นฟ้า",
    "descTh": "ผลึกสายฟ้าทัณฑ์สวรรค์เก้าชั้นฟ้า · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "LIGHTNING",
    "elementProfile": {
      "primary": "LIGHTNING",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "CRYSTAL_GEM",
    "isGenesisBridgeKeystone": false,
    "infusionKeyword": "KW_MAT_HEAVEN_PUNISHMENT_DETONATOR",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_HEAVEN_PUNISHMENT_DETONATOR"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_HEAVEN_PUNISHMENT_DETONATOR"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_HEAVEN_PUNISHMENT_DETONATOR"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_05_MYRIAD_SOUL_MIRROR_PRISM",
    "shortId": "MAT_TR_SOV_05",
    "nameTh": "ผลึกกระจกหมื่นจิตสั่นพ้องจักรวาล",
    "descTh": "ผลึกกระจกหมื่นจิตสั่นพ้องจักรวาล · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "ASTRAL_VOID",
    "elementProfile": {
      "primary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "CRYSTAL_GEM",
    "isGenesisBridgeKeystone": false,
    "infusionKeyword": "KW_MAT_PHASE_BYPASS",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_PHASE_BYPASS"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_PHASE_BYPASS"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_PHASE_BYPASS"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_06_COLLAPSED_STAR_NEUTRON_SAND",
    "shortId": "MAT_TR_SOV_06",
    "nameTh": "ทรายเหล็กดารายุบตัวหนักหมื่นชั่ง",
    "descTh": "ทรายเหล็กดารายุบตัวหนักหมื่นชั่ง · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "EARTH_METAL",
    "elementProfile": {
      "primary": "EARTH_METAL",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "ORE_METAL",
    "isGenesisBridgeKeystone": true,
    "infusionKeyword": "KW_MAT_SINGULARITY_MASS",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_SINGULARITY_MASS"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_SINGULARITY_MASS"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_SINGULARITY_MASS"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_07_SAMSARA_KARMA_SILK_COCOON",
    "shortId": "MAT_TR_SOV_07",
    "nameTh": "รังไหมสังสารวัฏถักทอสายใยกรรม",
    "descTh": "รังไหมสังสารวัฏถักทอสายใยกรรม · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "YIN_SHADOW",
    "elementProfile": {
      "primary": "YIN_SHADOW",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "SILK_FIBER",
    "isGenesisBridgeKeystone": false,
    "infusionKeyword": "KW_MAT_KARMIC_SILK_LINK",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_KARMIC_SILK_LINK"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_KARMIC_SILK_LINK"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_KARMIC_SILK_LINK"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_08_ABYSSAL_DRAGON_REVERSE_SCALE",
    "shortId": "MAT_TR_SOV_08",
    "nameTh": "เกล็ดย้อนมังกรเหวลึกกลืนศาสตรา",
    "descTh": "เกล็ดย้อนมังกรเหวลึกกลืนศาสตรา · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "primary": "BLOOD_DEMON",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "BEAST_SCALE",
    "isGenesisBridgeKeystone": false,
    "infusionKeyword": "KW_MAT_DRAGON_DEVOUR_SCALE",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_DRAGON_DEVOUR_SCALE"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_DRAGON_DEVOUR_SCALE"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_DRAGON_DEVOUR_SCALE"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_09_CELESTIAL_WEIGHING_JADE_TALLY",
    "shortId": "MAT_TR_SOV_09",
    "nameTh": "หยกตราชั่งสวรรค์ปรับสมดุลกฎเกณฑ์",
    "descTh": "หยกตราชั่งสวรรค์ปรับสมดุลกฎเกณฑ์ · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "primary": "LIGHT_YANG",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "JADE_STONE",
    "isGenesisBridgeKeystone": false,
    "infusionKeyword": "KW_MAT_LAW_CALIBRATION",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_LAW_CALIBRATION"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_LAW_CALIBRATION"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_LAW_CALIBRATION"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  },
  {
    "id": "MAT_TR_SOV_10_CHAOS_ORIGIN_ASH_EMBER",
    "shortId": "MAT_TR_SOV_10",
    "nameTh": "เถ้าถ่านไฟปฐมกาลหลอมละลายทุกสรรพสิ่ง",
    "descTh": "เถ้าถ่านไฟปฐมกาลหลอมละลายทุกสรรพสิ่ง · วัตถุดิบไวลด์การ์ดสำหรับหลอมศาสตรา/เกราะ/เครื่องประดับเท่านั้น",
    "cat": "ORE",
    "craft": "FORGING",
    "tier": 8,
    "transcendentRank": 8,
    "price": 19500,
    "element": "FIRE",
    "elementProfile": {
      "primary": "FIRE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentMaterial": true,
    "alchemyOnlyWildcard": false,
    "equipmentOnlyWildcard": true,
    "wildcardDomain": "EQUIPMENT_ONLY",
    "wildcardTag": "FIRE_ESSENCE",
    "isGenesisBridgeKeystone": false,
    "infusionKeyword": "KW_MAT_CHAOS_EMBER_MELT",
    "slotMutations": {
      "WEAPON": {
        "combatMultAdd": 0.16,
        "critAdd": 6,
        "penAdd": 10,
        "keyword": "KW_MAT_CHAOS_EMBER_MELT"
      },
      "ARMOR": {
        "defenseMultAdd": 0.16,
        "hpMaxPct": 0.12,
        "dmgRedPct": 0.08,
        "keyword": "KW_MAT_CHAOS_EMBER_MELT"
      },
      "ACCESSORY": {
        "cultRateAdd": 0.14,
        "qiMaxPct": 0.12,
        "breakthroughAdd": 0.06,
        "keyword": "KW_MAT_CHAOS_EMBER_MELT"
      }
    },
    "unsellable": true,
    "obtainSources": [
      "WORLD_CALAMITY_BOSS",
      "ABYSSAL_RIFT_EXPEDITION",
      "CELESTIAL_METEOR_VEIN"
    ]
  }
];
  JD.CORE.pureTranscendentElixirs = [
  {
    "id": "PILL_TR_PURE_01_HEAVEN_DEFYING_GENESIS_ELIXIR",
    "shortId": "PILL_TR_PURE_01",
    "nameTh": "มหาโอสถเก้าวิวัฒน์ปั้นชะตาเซียน",
    "descTh": "โอสถเหนือตำนานบริสุทธิ์ ยกระดับรากวิญญาณ ทะลวงคอขวดทันที และสลักตราเก้าทวารปฐมกาลถาวร",
    "cat": "PILL",
    "out": "PILL",
    "tier": 8,
    "transcendentRank": 8,
    "price": 45000,
    "element": "ASTRAL_VOID",
    "elementProfile": {
      "primary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentElixir": true,
    "isPureTranscendentElixir": true,
    "elixirMarkId": "MARK_PURE_GENESIS_IMMORTAL_BODY",
    "effect": {
      "cultivationProgress": 950,
      "breakthroughBonus": 0.35,
      "clearToxic": 100,
      "clearHeartDemon": 100,
      "lifespanAdd": 150
    }
  },
  {
    "id": "PILL_TR_PURE_02_IMMORTAL_SAMSARA_RESURRECTION_PILL",
    "shortId": "PILL_TR_PURE_02",
    "nameTh": "มหาโอสถนิพพานชุบวิญญาณคืนชีพผู้ล่วงลับ",
    "descTh": "โอสถเหนือตำนานบริสุทธิ์ ชุบชีวิตหรือรักษาอาการบาดเจ็บปางตายสมบูรณ์ พร้อมสลักตราหงส์นิพพานอมตะ",
    "cat": "PILL",
    "out": "PILL",
    "tier": 8,
    "transcendentRank": 8,
    "price": 48000,
    "element": "WOOD_LIFE",
    "elementProfile": {
      "primary": "WOOD_LIFE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentElixir": true,
    "isPureTranscendentElixir": true,
    "elixirMarkId": "MARK_PURE_SAMSARA_UNDYING_SOUL",
    "effect": {
      "hpRestore": 9999,
      "qiRestore": 9999,
      "cureAllInjuries": true,
      "resurrectFallen": true,
      "lifespanAdd": 180
    }
  },
  {
    "id": "PILL_TR_PURE_03_MYRIAD_DAOS_SOVEREIGN_BLOOD_PILL",
    "shortId": "PILL_TR_PURE_03",
    "nameTh": "มหาโอสถโลหิตจักรพรรดิรู้แจ้งหมื่นมรรคา",
    "descTh": "โอสถเหนือตำนานบริสุทธิ์ ปลุกสายเลือดจักรพรรดิบรรพกาลและยกระดับความเชี่ยวชาญทุกวิถียุทธ์",
    "cat": "PILL",
    "out": "PILL",
    "tier": 8,
    "transcendentRank": 8,
    "price": 50000,
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "primary": "BLOOD_DEMON",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentElixir": true,
    "isPureTranscendentElixir": true,
    "elixirMarkId": "MARK_PURE_SOVEREIGN_DRAGON_PHYSIQUE",
    "effect": {
      "cultivationProgress": 1200,
      "combatPowerMultAdd": 0.25,
      "allSkillsAdd": 20,
      "lifespanAdd": 160
    }
  }
];
  JD.CORE.pureForgedGenesisItems = [
  {
    "id": "EQ_TR_PURE_WPN_GENESIS",
    "nameTh": "มหาศาสตราปฐมกาลหลอมสวรรค์",
    "descTh": "มหาศาสตราที่หลอมขึ้นจากวัตถุดิบเหนือตำนานบริสุทธิ์ 5 ชนิดด้วยมือช่างยุทธภพ แปรเปลี่ยนรูปลักษณ์ตามวิชาของผู้ถือครอง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "subType": "SWORD",
    "gearType": "SWORD",
    "tier": 8,
    "transcendentRank": 8,
    "price": 68000,
    "element": "ASTRAL_VOID",
    "elementProfile": {
      "primary": "ASTRAL_VOID",
      "secondary": "FIRE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isPureTranscendentGenesis": true,
    "omniWeaponAdaptive": true,
    "setId": "RES_TR_MORTAL_FORGED_GENESIS",
    "combatMult": 0.92,
    "defenseMult": 0.28,
    "unsellable": true,
    "indestructible": true
  },
  {
    "id": "EQ_TR_PURE_ARM_GENESIS",
    "nameTh": "มหาเกราะปฐมกาลค้ำจุนพิภพ",
    "descTh": "มหาเกราะที่หลอมจากวัตถุดิบเหนือตำนานบริสุทธิ์ 5 ชนิด ปรับน้ำหนักเกราะอัตโนมัติและดูดซับแรงทัณฑ์สวรรค์",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "subType": "ROBE",
    "gearType": "ROBE",
    "tier": 8,
    "transcendentRank": 8,
    "price": 66000,
    "element": "EARTH_METAL",
    "elementProfile": {
      "primary": "EARTH_METAL",
      "secondary": "WOOD_LIFE",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isPureTranscendentGenesis": true,
    "triWeightAdaptive": true,
    "setId": "RES_TR_MORTAL_FORGED_GENESIS",
    "combatMult": 0.34,
    "defenseMult": 0.9,
    "unsellable": true,
    "indestructible": true
  },
  {
    "id": "EQ_TR_PURE_ACC_GENESIS",
    "nameTh": "มหาตราปฐมกาลหมุนกงล้อกาล",
    "descTh": "มหาเครื่องประดับที่หลอมจากวัตถุดิบเหนือตำนานบริสุทธิ์ 4 ชนิด ย่นย่อกาลเวลาบำเพ็ญและเชื่อมโยงสายใยชะตาทั้งสำนัก",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "subType": "CHARM",
    "gearType": "CHARM",
    "tier": 8,
    "transcendentRank": 8,
    "price": 65000,
    "element": "LIGHT_YANG",
    "elementProfile": {
      "primary": "LIGHT_YANG",
      "secondary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isPureTranscendentGenesis": true,
    "pentaSubtypeAdaptive": true,
    "setId": "RES_TR_MORTAL_FORGED_GENESIS",
    "combatMult": 0.45,
    "defenseMult": 0.45,
    "breakthroughBonus": 0.18,
    "unsellable": true,
    "indestructible": true
  }
];
  JD.CORE.worldTranscendentArtifacts = [
  {
    "id": "REGALIA_ORIGIN_FORMLESS_STONE",
    "nameTh": "ตราหินเทาไร้ลักษณ์",
    "descTh": "ศาสตราประจำตำแหน่งเจ้าสำนักที่สืบทอดมาแต่ปฐมบูรพาจารย์รุ่นที่ 1 ยามยังไม่ตื่นรู้เป็นเพียงตราหินสีเทาเรียบง่ายไร้คม แต่สามารถจำแลงได้ 24 รูปลักษณ์ตามวิถีของเจ้าสำนัก",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "subType": "CHARM",
    "gearType": "CHARM",
    "tier": 8,
    "transcendentRank": 8,
    "price": 99999,
    "element": "NEUTRAL",
    "elementProfile": {
      "primary": "NEUTRAL",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isPatriarchRegalia": true,
    "soulboundToMaster": true,
    "unsellable": true,
    "indestructible": true,
    "combatMult": 0.38,
    "defenseMult": 0.38,
    "breakthroughBonus": 0.12
  },
  {
    "id": "ARM_TRANSCENDENT_LOOM_OF_SCARS",
    "nameTh": "ภูษาทอรอยแผลหมื่นชะตา",
    "descTh": "มหาภูษาเหนือตำนานหนึ่งเดียวในแผ่นดิน ถักทอจากรอยแผลและปณิธานของผู้ไม่ยอมจำนน ปรับน้ำหนักเกราะได้ 3 รูปแบบ บันทึกสมุดบัญชีบาดแผล และเข้าสู่ดักแด้ชุบชีวิต 4 ลมหายใจเมื่อรับการโจมตีถึงตาย",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ARMOR",
    "subType": "ROBE",
    "gearType": "ROBE",
    "tier": 8,
    "transcendentRank": 8,
    "price": 88000,
    "element": "BLOOD_DEMON",
    "elementProfile": {
      "primary": "BLOOD_DEMON",
      "secondary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentArmor": true,
    "worldSingleton": true,
    "triWeightAdaptive": true,
    "unsellable": true,
    "indestructible": true,
    "combatMult": 0.42,
    "defenseMult": 0.95,
    "breakthroughBonus": 0.14
  },
  {
    "id": "ACC_TRANSCENDENT_OUROBOROS_SUNDIAL",
    "nameTh": "นาฬิกาแดดอูโรโบรอสย้อนกัลป์",
    "descTh": "มหาเครื่องประดับเหนือตำนานหนึ่งเดียวในแผ่นดิน บันทึกจุดคั่นเวลา 4 ลมหายใจเพื่อย้อนคืนสังขาร สะท้อนวิชาซ้ำในจังหวะที่สาม และเร่งการศึกษารู้แจ้ง",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "ACCESSORY",
    "subType": "CHARM",
    "gearType": "CHARM",
    "tier": 8,
    "transcendentRank": 8,
    "price": 88000,
    "element": "ASTRAL_VOID",
    "elementProfile": {
      "primary": "ASTRAL_VOID",
      "secondary": "LIGHT_YANG",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentAccessory": true,
    "worldSingleton": true,
    "pentaSubtypeAdaptive": true,
    "unsellable": true,
    "indestructible": true,
    "combatMult": 0.52,
    "defenseMult": 0.52,
    "breakthroughBonus": 0.18
  },
  {
    "id": "WPN_TRANSCENDENT_MYRIAD_ARSENAL_COFFIN",
    "nameTh": "หีบศาสตราหมื่นสำนักกลืนสวรรค์",
    "descTh": "มหาศาสตราพเนจรเหนือตำนานหนึ่งเดียวในแผ่นดิน กลืนกินตระกูลอาวุธทั้ง 16 สาย ปล่อยกระบี่บินคุ้มกันอัตโนมัติ และเปิดผนึกหีบหมื่นศาสตราถล่มสนามรบ",
    "cat": "EQUIPMENT",
    "out": "EQUIPMENT",
    "slot": "WEAPON",
    "subType": "SWORD",
    "gearType": "SWORD",
    "tier": 8,
    "transcendentRank": 8,
    "price": 92000,
    "element": "EARTH_METAL",
    "elementProfile": {
      "primary": "EARTH_METAL",
      "secondary": "ASTRAL_VOID",
      "affinityWeight": 1.0
    },
    "grade": "Transcendent",
    "transcendent": true,
    "isTranscendentWeapon": true,
    "worldSingleton": true,
    "omniWeaponAdaptive": true,
    "unsellable": true,
    "indestructible": true,
    "combatMult": 0.96,
    "defenseMult": 0.35,
    "breakthroughBonus": 0.12
  }
];
  JD.CORE.pureTranscendentRecipes = [
  {
    "id": "REC_TR_PILL_PURE_01",
    "nameTh": "ตำรับมหาโอสถเก้าวิวัฒน์ปั้นชะตาเซียน",
    "craft": "ALCHEMY",
    "tier": 7,
    "facilityLevel": 3,
    "minMastery": 75,
    "outType": "PILL",
    "outItemId": "PILL_TR_PURE_01_HEAVEN_DEFYING_GENESIS_ELIXIR",
    "outNameTh": "มหาโอสถเก้าวิวัฒน์ปั้นชะตาเซียน",
    "discoverable": true,
    "isPureTranscendentRecipe": true,
    "inputs": [
      {
        "matId": "MAT_TR_ALC_01_NINE_APERTURES_CHAOS_LOTUS",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_03_DUAL_DANTIAN_ORIGIN_PEARL",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_05_AKASHIC_DREAM_FRUIT_NECTAR",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_06_THUNDER_EMPEROR_HEART_DEW",
        "count": 1
      }
    ]
  },
  {
    "id": "REC_TR_PILL_PURE_02",
    "nameTh": "ตำรับมหาโอสถนิพพานชุบวิญญาณคืนชีพผู้ล่วงลับ",
    "craft": "ALCHEMY",
    "tier": 7,
    "facilityLevel": 3,
    "minMastery": 75,
    "outType": "PILL",
    "outItemId": "PILL_TR_PURE_02_IMMORTAL_SAMSARA_RESURRECTION_PILL",
    "outNameTh": "มหาโอสถนิพพานชุบวิญญาณคืนชีพผู้ล่วงลับ",
    "discoverable": true,
    "isPureTranscendentRecipe": true,
    "inputs": [
      {
        "matId": "MAT_TR_ALC_02_UNDYING_PHOENIX_BLOOD_MARROW",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_04_MYRIAD_VENOMS_SOVEREIGN_GALL",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_08_VOID_MIRAGE_SOUL_AMBERGRIS",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_09_PRIMORDIAL_YIN_YANG_KOI_TEAR",
        "count": 1
      }
    ]
  },
  {
    "id": "REC_TR_PILL_PURE_03",
    "nameTh": "ตำรับมหาโอสถโลหิตจักรพรรดิรู้แจ้งหมื่นมรรคา",
    "craft": "ALCHEMY",
    "tier": 7,
    "facilityLevel": 3,
    "minMastery": 78,
    "outType": "PILL",
    "outItemId": "PILL_TR_PURE_03_MYRIAD_DAOS_SOVEREIGN_BLOOD_PILL",
    "outNameTh": "มหาโอสถโลหิตจักรพรรดิรู้แจ้งหมื่นมรรคา",
    "discoverable": true,
    "isPureTranscendentRecipe": true,
    "inputs": [
      {
        "matId": "MAT_TR_ALC_01_NINE_APERTURES_CHAOS_LOTUS",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_07_VAJRA_DRAGON_GOD_BONE_ASH",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_10_SOVEREIGN_EMPEROR_DRAGON_QI_BLOOD",
        "count": 1
      },
      {
        "matId": "MAT_TR_ALC_05_AKASHIC_DREAM_FRUIT_NECTAR",
        "count": 1
      }
    ]
  },
  {
    "id": "REC_TR_PURE_WPN_GENESIS",
    "nameTh": "ตำรับหลอมมหาศาสตราปฐมกาลหลอมสวรรค์",
    "craft": "FORGING",
    "tier": 7,
    "facilityLevel": 3,
    "minMastery": 78,
    "outType": "EQUIPMENT",
    "outItemId": "EQ_TR_PURE_WPN_GENESIS",
    "outNameTh": "มหาศาสตราปฐมกาลหลอมสวรรค์",
    "discoverable": true,
    "isPureTranscendentRecipe": true,
    "triggersForgeTribulation": true,
    "inputs": [
      {
        "matId": "MAT_TR_SOV_01_VOID_QUICKSILVER_HEART",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_04_TRIBULATION_THUNDER_FULGURITE",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_06_COLLAPSED_STAR_NEUTRON_SAND",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_08_ABYSSAL_DRAGON_REVERSE_SCALE",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_10_CHAOS_ORIGIN_ASH_EMBER",
        "count": 1
      }
    ]
  },
  {
    "id": "REC_TR_PURE_ARM_GENESIS",
    "nameTh": "ตำรับหลอมมหาเกราะปฐมกาลค้ำจุนพิภพ",
    "craft": "FORGING",
    "tier": 7,
    "facilityLevel": 3,
    "minMastery": 78,
    "outType": "EQUIPMENT",
    "outItemId": "EQ_TR_PURE_ARM_GENESIS",
    "outNameTh": "มหาเกราะปฐมกาลค้ำจุนพิภพ",
    "discoverable": true,
    "isPureTranscendentRecipe": true,
    "triggersForgeTribulation": true,
    "inputs": [
      {
        "matId": "MAT_TR_SOV_02_IMMORTAL_AMBER_CHRONO_SAP",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_03_NIRVANA_HEARTWOOD_MARROW",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_06_COLLAPSED_STAR_NEUTRON_SAND",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_07_SAMSARA_KARMA_SILK_COCOON",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_09_CELESTIAL_WEIGHING_JADE_TALLY",
        "count": 1
      }
    ]
  },
  {
    "id": "REC_TR_PURE_ACC_GENESIS",
    "nameTh": "ตำรับหลอมมหาตราปฐมกาลหมุนกงล้อกาล",
    "craft": "FORGING",
    "tier": 7,
    "facilityLevel": 3,
    "minMastery": 76,
    "outType": "EQUIPMENT",
    "outItemId": "EQ_TR_PURE_ACC_GENESIS",
    "outNameTh": "มหาตราปฐมกาลหมุนกงล้อกาล",
    "discoverable": true,
    "isPureTranscendentRecipe": true,
    "triggersForgeTribulation": true,
    "inputs": [
      {
        "matId": "MAT_TR_SOV_01_VOID_QUICKSILVER_HEART",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_02_IMMORTAL_AMBER_CHRONO_SAP",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_03_NIRVANA_HEARTWOOD_MARROW",
        "count": 1
      },
      {
        "matId": "MAT_TR_SOV_05_MYRIAD_SOUL_MIRROR_PRISM",
        "count": 1
      }
    ]
  }
];

  // Stored in JD.CORE.* and indexed via non-enumerable descriptors on ECO.itemById / ECO.matById / ECO.recipeById
  // so legacy array-length assertions (1177 items, 1402 recipes, JD.EXPANSION regional validation) remain 100% intact.

  // 6. Dedicated Scripture & Codex Catalogs (Preserving JD.TECH.mantras === 122 & JD.TECH.techniques === 1726)
  JD.TECH.lowTierMantras = [{"id":"MNT_LOW_001","nameTh":"เคล็ดสูดไอหมอกไก่ขันยามรุ่งสาง","descTh":"เคล็ดสูดไอหมอกไก่ขันยามรุ่งสาง","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_EARLY_BIRD_DAWN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_002","nameTh":"เคล็ดนับลมหายใจแบกนํ้าขึ้นบันไดหิน","descTh":"เคล็ดนับลมหายใจแบกนํ้าขึ้นบันไดหิน","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHORE_BREATHING","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_003","nameTh":"เคล็ดอุ่นท้องย่อยข้าวต้มธัญพืช","descTh":"เคล็ดอุ่นท้องย่อยข้าวต้มธัญพืช","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_FULL_BELLY_VIGOR","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_004","nameTh":"เคล็ดงีบหลับพิงเสาฟื้นกำลังไว","descTh":"เคล็ดงีบหลับพิงเสาฟื้นกำลังไว","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_NAP_RECHARGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_005","nameTh":"เคล็ดกางเสื้อฟางเดินฝ่าฝนหนาว","descTh":"เคล็ดกางเสื้อฟางเดินฝ่าฝนหนาว","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WEATHER_HARDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_006","nameTh":"เคล็ดเก็บออมลมปราณคนเบี้ยน้อย","descTh":"เคล็ดเก็บออมลมปราณคนเบี้ยน้อย","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_007","nameTh":"เคล็ดนั่งล้อมวงท่องมนต์หอนอก","descTh":"เคล็ดนั่งล้อมวงท่องมนต์หอนอก","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CROWD_WARMTH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_008","nameTh":"เคล็ดฟังเสียงจิ้งหรีดสงบใจยามดึก","descTh":"เคล็ดฟังเสียงจิ้งหรีดสงบใจยามดึก","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_009","nameTh":"เคล็ดกำหมัดเกร็งท้องรับไม้พลองครูฝึก","descTh":"เคล็ดกำหมัดเกร็งท้องรับไม้พลองครูฝึก","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TEA_SOUP_DIGEST","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_010","nameTh":"เคล็ดเพ่งเปลวตะเกียงนํ้ามันสน","descTh":"เคล็ดเพ่งเปลวตะเกียงนํ้ามันสน","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_011","nameTh":"เคล็ดสูดกลิ่นดินหลังฝนตกบำรุงม้าม","descTh":"เคล็ดสูดกลิ่นดินหลังฝนตกบำรุงม้าม","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_012","nameTh":"เคล็ดกลั้นใจฟังเสียงสายธนูตึง","descTh":"เคล็ดกลั้นใจฟังเสียงสายธนูตึง","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"SHADOW_SAMURAI","sub":"NONE","power":17,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_013","nameTh":"เคล็ดเงาไม้ไผ่ซ่อนลมหายใจยามคํ่า","descTh":"เคล็ดเงาไม้ไผ่ซ่อนลมหายใจยามคํ่า","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_014","nameTh":"เคล็ดซึมซับโอสถลูกกลอนราคาถูก","descTh":"เคล็ดซึมซับโอสถลูกกลอนราคาถูก","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":15,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_LOW_015","nameTh":"เคล็ดจิบชาดอกเก๊กฮวยระบายพิษร้อน","descTh":"เคล็ดจิบชาดอกเก๊กฮวยระบายพิษร้อน","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":31,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TEA_SOUP_DIGEST","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_016","nameTh":"เคล็ดลมหายใจช่างตีเหล็กสูบลมคู่","descTh":"เคล็ดลมหายใจช่างตีเหล็กสูบลมคู่","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":33,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHORE_BREATHING","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_017","nameTh":"เคล็ดเดินลมปราณอุ่นฝ่าเท้าเดินทางไกล","descTh":"เคล็ดเดินลมปราณอุ่นฝ่าเท้าเดินทางไกล","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":30,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_018","nameTh":"เคล็ดตั้งสติอ่านตำราไม่สัปหงก","descTh":"เคล็ดตั้งสติอ่านตำราไม่สัปหงก","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":31,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_019","nameTh":"เคล็ดปราณก้อนกรวดกลิ้งตามนํ้าไม่แตกหัก","descTh":"เคล็ดปราณก้อนกรวดกลิ้งตามนํ้าไม่แตกหัก","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":32,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_020","nameTh":"เคล็ดคนเรือโต้ลมแม่นํ้าสองแคว","descTh":"เคล็ดคนเรือโต้ลมแม่นํ้าสองแคว","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":32,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_021","nameTh":"เคล็ดคลายปมเส้นเอ็นหลังซ้อมหนัก","descTh":"เคล็ดคลายปมเส้นเอ็นหลังซ้อมหนัก","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":33,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_COPPER_GONG_WAKE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_022","nameTh":"เคล็ดสวดคุ้มภัยศาลเพียงตาข้างทาง","descTh":"เคล็ดสวดคุ้มภัยศาลเพียงตาข้างทาง","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":31,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_DRAG_COLLAPSED_BUDDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_023","nameTh":"เคล็ดเลี้ยงไอเย็นก้นบ่อบาดาล","descTh":"เคล็ดเลี้ยงไอเย็นก้นบ่อบาดาล","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":32,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LEFTOVER_WOK_MAGIC","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_024","nameTh":"เคล็ดลับมีดในใจพันครั้งก่อนชัก","descTh":"เคล็ดลับมีดในใจพันครั้งก่อนชัก","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"SHADOW_SAMURAI","sub":"NONE","power":34,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"MKW_ZANSHIN_BREATHLESS","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_025","nameTh":"เคล็ดดักฟังเสียงลมลอดหน้าต่างโรงเตี๊ยม","descTh":"เคล็ดดักฟังเสียงลมลอดหน้าต่างโรงเตี๊ยม","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":31,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_RIVER_BAIT_WHISPER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_026","nameTh":"เคล็ดแบ่งลมหายใจอุ่นลูกสัตว์แรกเกิด","descTh":"เคล็ดแบ่งลมหายใจอุ่นลูกสัตว์แรกเกิด","cat":"QI_MANTRA","tier":2,"reqTier":2,"path":"BEAST_SOVEREIGN","sub":"NONE","power":32,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_STREET_HAGGLE_TONGUE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_LOW_027","nameTh":"เคล็ดเตาอั้งโล่เคี่ยวไฟอ่อนข้ามคืน","descTh":"เคล็ดเตาอั้งโล่เคี่ยวไฟอ่อนข้ามคืน","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":54,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_STIMULANT_BOIL","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_028","nameTh":"เคล็ดต้นไผ่ลู่ลมสิบพายุไม่โค่น","descTh":"เคล็ดต้นไผ่ลู่ลมสิบพายุไม่โค่น","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":55,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_RUST_BLOOD_SMEAR","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_029","nameTh":"เคล็ดเดินปราณเก้าก้าวสลับเวรยาม","descTh":"เคล็ดเดินปราณเก้าก้าวสลับเวรยาม","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":56,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHORE_BREATHING","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_030","nameTh":"เคล็ดเก็บเสียงหัวใจซ่อนเงาใต้ชายคา","descTh":"เคล็ดเก็บเสียงหัวใจซ่อนเงาใต้ชายคา","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":55,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_031","nameTh":"เคล็ดตอกเสาเข็มทองคำสร้างฐานแก่นแท้","descTh":"เคล็ดตอกเสาเข็มทองคำสร้างฐานแก่นแท้","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":56,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_032","nameTh":"เคล็ดคำนวณกำไรขาดทุนทุกลมหายใจ","descTh":"เคล็ดคำนวณกำไรขาดทุนทุกลมหายใจ","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"MERCANTILE_DAO","sub":"NONE","power":55,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_033","nameTh":"เคล็ดกลั่นหยาดเหงื่อเป็นปราณเหล็กกล้า","descTh":"เคล็ดกลั่นหยาดเหงื่อเป็นปราณเหล็กกล้า","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":58,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"MKW_ZANSHIN_BREATHLESS","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_034","nameTh":"เคล็ดโคมกระดาษส่องทางเพื่อนร่วมรบ","descTh":"เคล็ดโคมกระดาษส่องทางเพื่อนร่วมรบ","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":54,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CROWD_WARMTH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_035","nameTh":"เคล็ดกลืนหมอกพิษชายป่าแปลงเป็นเกราะ","descTh":"เคล็ดกลืนหมอกพิษชายป่าแปลงเป็นเกราะ","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":56,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_LOW_036","nameTh":"เคล็ดอ่านดาวหางกะพริบบอกลางร้าย","descTh":"เคล็ดอ่านดาวหางกะพริบบอกลางร้าย","cat":"QI_MANTRA","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":55,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_FULL_BELLY_VIGOR","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}}];
  JD.TECH.lowTierNonCombatArts = [{"id":"QGG_LOW_001","nameTh":"ก้าวซอยเท้าส่งอาหารร้อนไม่หกสักหยด","descTh":"ก้าวซอยเท้าส่งอาหารร้อนไม่หกสักหยด","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_001_M1","nameTh":"กระบวนที่ 1 · ก้าวซอยเท้าส่งอาหารร้อนไม่หก","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_002","nameTh":"วิชามุดรั้วหลบสุนัขเฝ้าบ้าน","descTh":"วิชามุดรั้วหลบสุนัขเฝ้าบ้าน","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_002_M1","nameTh":"กระบวนที่ 1 · วิชามุดรั้วหลบสุนัขเฝ้าบ้าน","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_003","nameTh":"ท่ายํ่าโคลนคันนาด้วยรองเท้าฟาง","descTh":"ท่ายํ่าโคลนคันนาด้วยรองเท้าฟาง","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_003_M1","nameTh":"กระบวนที่ 1 · ท่ายํ่าโคลนคันนาด้วยรองเท้าฟ","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_004","nameTh":"ก้าวเขย่งปลายเท้าเดินขึ้นหอพักยามดึก","descTh":"ก้าวเขย่งปลายเท้าเดินขึ้นหอพักยามดึก","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_NAP_RECHARGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_004_M1","nameTh":"กระบวนที่ 1 · ก้าวเขย่งปลายเท้าเดินขึ้นหอพ","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_005","nameTh":"วิชาโหนเถาวัลย์ข้ามลำห้วย","descTh":"วิชาโหนเถาวัลย์ข้ามลำห้วย","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_005_M1","nameTh":"กระบวนที่ 1 · วิชาโหนเถาวัลย์ข้ามลำห้วย","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_006","nameTh":"เคล็ดเหลียวหลังมองทางหนีทีไล่","descTh":"เคล็ดเหลียวหลังมองทางหนีทีไล่","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WEATHER_HARDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_006_M1","nameTh":"กระบวนที่ 1 · เคล็ดเหลียวหลังมองทางหนีทีไล","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_007","nameTh":"ก้าวสไลด์หลบไม้กวาดแม่ครัว","descTh":"ก้าวสไลด์หลบไม้กวาดแม่ครัว","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CROWD_WARMTH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_007_M1","nameTh":"กระบวนที่ 1 · ก้าวสไลด์หลบไม้กวาดแม่ครัว","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_008","nameTh":"วิชาปีนต้นไม้ส่องรังนกและผลไม้ป่า","descTh":"วิชาปีนต้นไม้ส่องรังนกและผลไม้ป่า","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_008_M1","nameTh":"กระบวนที่ 1 · วิชาปีนต้นไม้ส่องรังนกและผลไ","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_009","nameTh":"จังหวะวิ่งผลัดคนส่งสารม้าเร็ว","descTh":"จังหวะวิ่งผลัดคนส่งสารม้าเร็ว","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TEA_SOUP_DIGEST","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_009_M1","nameTh":"กระบวนที่ 1 · จังหวะวิ่งผลัดคนส่งสารม้าเร็","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_010","nameTh":"เคล็ดหมอบราบกลืนไปกับพงหญ้าสูง","descTh":"เคล็ดหมอบราบกลืนไปกับพงหญ้าสูง","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_010_M1","nameTh":"กระบวนที่ 1 · เคล็ดหมอบราบกลืนไปกับพงหญ้าส","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_LOW_011","nameTh":"ท่าร่างหาบคู่ทรงตัวบนสะพานไม้ซุง","descTh":"ท่าร่างหาบคู่ทรงตัวบนสะพานไม้ซุง","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_011_M1","nameTh":"กระบวนที่ 1 · ท่าร่างหาบคู่ทรงตัวบนสะพานไม","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_012","nameTh":"ก้าวฟันปลาหลบลูกธนูโจรภูเขา","descTh":"ก้าวฟันปลาหลบลูกธนูโจรภูเขา","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_012_M1","nameTh":"กระบวนที่ 1 · ก้าวฟันปลาหลบลูกธนูโจรภูเขา","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_013","nameTh":"วิชาดีดตัวถีบกำแพงพลิกข้ามหัว","descTh":"วิชาดีดตัวถีบกำแพงพลิกข้ามหัว","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_013_M1","nameTh":"กระบวนที่ 1 · วิชาดีดตัวถีบกำแพงพลิกข้ามหั","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_014","nameTh":"เคล็ดดมกลิ่นควันไฟรู้ที่ตั้งค่ายโจร","descTh":"เคล็ดดมกลิ่นควันไฟรู้ที่ตั้งค่ายโจร","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_014_M1","nameTh":"กระบวนที่ 1 · เคล็ดดมกลิ่นควันไฟรู้ที่ตั้ง","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_015","nameTh":"ย่างก้าวไถลนํ้าแข็งชาวเหนือ","descTh":"ย่างก้าวไถลนํ้าแข็งชาวเหนือ","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_015_M1","nameTh":"กระบวนที่ 1 · ย่างก้าวไถลนํ้าแข็งชาวเหนือ","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_016","nameTh":"วิชาผูกก้อนหินถ่วงขาฝึกวิ่งขึ้นเขา","descTh":"ปลดถุงทราย","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"BODY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WOK_PLANK_BLOCK","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_016_M1","nameTh":"กระบวนที่ 1 · วิชาผูกก้อนหินถ่วงขาฝึกวิ่งข","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_017","nameTh":"เคล็ดโปรยเมล็ดถั่วทำเครื่องหมายกันหลงถํ้า","descTh":"เคล็ดโปรยเมล็ดถั่วทำเครื่องหมายกันหลงถํ้า","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_017_M1","nameTh":"กระบวนที่ 1 · เคล็ดโปรยเมล็ดถั่วทำเครื่องห","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_018","nameTh":"ก้าวหมุนลูกข่างสลัดมือที่คว้าจับ","descTh":"ก้าวหมุนลูกข่างสลัดมือที่คว้าจับ","cat":"LIGHTNESS_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_018_M1","nameTh":"กระบวนที่ 1 · ก้าวหมุนลูกข่างสลัดมือที่คว้","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_LOW_019","nameTh":"ท่าร่างนกนางแอ่นโฉบแตะหลังคาเก๋ง","descTh":"ท่าร่างนกนางแอ่นโฉบแตะหลังคาเก๋ง","cat":"LIGHTNESS_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_019_M1","nameTh":"กระบวนที่ 1 · ท่าร่างนกนางแอ่นโฉบแตะหลังคา","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_LOW_020","nameTh":"วิชาตามรอยกิ่งไม้หักและคราบโคลน","descTh":"วิชาตามรอยกิ่งไม้หักและคราบโคลน","cat":"LIGHTNESS_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_020_M1","nameTh":"กระบวนที่ 1 · วิชาตามรอยกิ่งไม้หักและคราบโ","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_LOW_021","nameTh":"ก้าวเงาซ้อนหลอกจังหวะก้าวเท้า","descTh":"ก้าวเงาซ้อนหลอกจังหวะก้าวเท้า","cat":"LIGHTNESS_ART","tier":3,"reqTier":3,"path":"NINPO_SHADOW","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_COPPER_GONG_WAKE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_021_M1","nameTh":"กระบวนที่ 1 · ก้าวเงาซ้อนหลอกจังหวะก้าวเท้","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_LOW_022","nameTh":"เคล็ดเดินทัพเรียงเดี่ยวฝ่าหุบเขาหมอก","descTh":"เคล็ดเดินทัพเรียงเดี่ยวฝ่าหุบเขาหมอก","cat":"LIGHTNESS_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_DRAG_COLLAPSED_BUDDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_022_M1","nameTh":"กระบวนที่ 1 · เคล็ดเดินทัพเรียงเดี่ยวฝ่าหุ","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_LOW_023","nameTh":"ท่าร่างกระต่ายป่าสามโพรงสลับทิศ","descTh":"ท่าร่างกระต่ายป่าสามโพรงสลับทิศ","cat":"LIGHTNESS_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_023_M1","nameTh":"กระบวนที่ 1 · ท่าร่างกระต่ายป่าสามโพรงสลับ","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_LOW_024","nameTh":"วิชาไต่เชือกข้ามเหวขนแร่พันชั่ง","descTh":"วิชาไต่เชือกข้ามเหวขนแร่พันชั่ง","cat":"LIGHTNESS_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_LOW_024_M1","nameTh":"กระบวนที่ 1 · วิชาไต่เชือกข้ามเหวขนแร่พันช","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_LOW_001","nameTh":"ท่ายกแขนสองข้างตั้งกาดบังขมับ","descTh":"ท่ายกแขนสองข้างตั้งกาดบังขมับ","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BRACE_SHIELD_CHIN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_001_M1","nameTh":"กระบวนที่ 1 · ท่ายกแขนสองข้างตั้งกาดบังขมั","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_002","nameTh":"วิชาสะพายกระทะเหล็กใบเก่าบังธนูข้างหลัง","descTh":"วิชาสะพายกระทะเหล็กใบเก่าบังธนูข้างหลัง","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WOK_PLANK_BLOCK","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_002_M1","nameTh":"กระบวนที่ 1 · วิชาสะพายกระทะเหล็กใบเก่าบัง","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_003","nameTh":"เคล็ดทิ้งตัวกลิ้งคลุกฝุ่นผ่อนแรงถีบ","descTh":"เคล็ดทิ้งตัวกลิ้งคลุกฝุ่นผ่อนแรงถีบ","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_003_M1","nameTh":"กระบวนที่ 1 · เคล็ดทิ้งตัวกลิ้งคลุกฝุ่นผ่อ","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_004","nameTh":"ท่าสวมงอบไม้ไผ่สะบัดปัดนํ้าฝนและลูกดอก","descTh":"ท่าสวมงอบไม้ไผ่สะบัดปัดนํ้าฝนและลูกดอก","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_NAP_RECHARGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_004_M1","nameTh":"กระบวนที่ 1 · ท่าสวมงอบไม้ไผ่สะบัดปัดนํ้าฝ","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_005","nameTh":"เคล็ดเกร็งหลังรับท่อนซุงไม่หลังยอก","descTh":"เคล็ดเกร็งหลังรับท่อนซุงไม่หลังยอก","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_005_M1","nameTh":"กระบวนที่ 1 · เคล็ดเกร็งหลังรับท่อนซุงไม่ห","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_006","nameTh":"วิชาคว้าม้านั่งไม้โรงเตี๊ยมขึ้นรับคมมีด","descTh":"วิชาคว้าม้านั่งไม้โรงเตี๊ยมขึ้นรับคมมีด","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WEATHER_HARDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_006_M1","nameTh":"กระบวนที่ 1 · วิชาคว้าม้านั่งไม้โรงเตี๊ยมข","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_007","nameTh":"เคล็ดซ่อนมือในแขนเสื้อหนาปัดกรงเล็บ","descTh":"เคล็ดซ่อนมือในแขนเสื้อหนาปัดกรงเล็บ","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CROWD_WARMTH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_007_M1","nameTh":"กระบวนที่ 1 · เคล็ดซ่อนมือในแขนเสื้อหนาปัด","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_008","nameTh":"ท่าย่อเข่าตํ่าต้านลมกรรโชกหน้าด่าน","descTh":"ท่าย่อเข่าตํ่าต้านลมกรรโชกหน้าด่าน","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_008_M1","nameTh":"กระบวนที่ 1 · ท่าย่อเข่าตํ่าต้านลมกรรโชกหน","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_009","nameTh":"วิชาสะบัดขี้เถ้าก้นเตาบังตาคนไล่ฟัน","descTh":"วิชาสะบัดขี้เถ้าก้นเตาบังตาคนไล่ฟัน","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_009_M1","nameTh":"กระบวนที่ 1 · วิชาสะบัดขี้เถ้าก้นเตาบังตาค","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_010","nameTh":"เคล็ดหดคอเหมือนเต่าหลบบ่วงบาศ","descTh":"เคล็ดหดคอเหมือนเต่าหลบบ่วงบาศ","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_010_M1","nameTh":"กระบวนที่ 1 · เคล็ดหดคอเหมือนเต่าหลบบ่วงบา","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_LOW_011","nameTh":"เคล็ดผ้ากันเปื้อนหนังวัวชุบนํ้ามันกันไฟเตา","descTh":"เคล็ดผ้ากันเปื้อนหนังวัวชุบนํ้ามันกันไฟเตา","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_011_M1","nameTh":"กระบวนที่ 1 · เคล็ดผ้ากันเปื้อนหนังวัวชุบน","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_012","nameTh":"วิชาใช้ฝักดาบรับคมแทนตัวใบดาบ","descTh":"วิชาใช้ฝักดาบรับคมแทนตัวใบดาบ","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_012_M1","nameTh":"กระบวนที่ 1 · วิชาใช้ฝักดาบรับคมแทนตัวใบดา","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_013","nameTh":"ท่าชนไหล่คู่หูยืนพิงหลังต้านฝูงหมาป่า","descTh":"ท่าชนไหล่คู่หูยืนพิงหลังต้านฝูงหมาป่า","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_013_M1","nameTh":"กระบวนที่ 1 · ท่าชนไหล่คู่หูยืนพิงหลังต้าน","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_014","nameTh":"เคล็ดผิวหนังด้านชาจากการฝึกตีท่อนไม้","descTh":"เคล็ดผิวหนังด้านชาจากการฝึกตีท่อนไม้","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"BODY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_014_M1","nameTh":"กระบวนที่ 1 · เคล็ดผิวหนังด้านชาจากการฝึกต","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_015","nameTh":"ม่านปราณตะเกียงเฝ้ายามกันไอมืด","descTh":"ม่านปราณตะเกียงเฝ้ายามกันไอมืด","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BRACE_SHIELD_CHIN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_015_M1","nameTh":"กระบวนที่ 1 · ม่านปราณตะเกียงเฝ้ายามกันไอม","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_016","nameTh":"วิชาบิดข้อมือสลัดอาวุธที่ปักคาเกราะ","descTh":"วิชาบิดข้อมือสลัดอาวุธที่ปักคาเกราะ","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_016_M1","nameTh":"กระบวนที่ 1 · วิชาบิดข้อมือสลัดอาวุธที่ปัก","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_017","nameTh":"เคล็ดกางร่มกระดาษนํ้ามันหมุนปัดลูกปราย","descTh":"เคล็ดกางร่มกระดาษนํ้ามันหมุนปัดลูกปราย","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_017_M1","nameTh":"กระบวนที่ 1 · เคล็ดกางร่มกระดาษนํ้ามันหมุน","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_018","nameTh":"ท่ายืนเฝ้าหีบสินค้าคาราวานไม่ยอมขยับ","descTh":"ท่ายืนเฝ้าหีบสินค้าคาราวานไม่ยอมขยับ","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_018_M1","nameTh":"กระบวนที่ 1 · ท่ายืนเฝ้าหีบสินค้าคาราวานไม","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_LOW_019","nameTh":"เคล็ดระฆังสำริดชั้นต้นคุ้มหน้าอก","descTh":"เคล็ดระฆังสำริดชั้นต้นคุ้มหน้าอก","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_019_M1","nameTh":"กระบวนที่ 1 · เคล็ดระฆังสำริดชั้นต้นคุ้มหน","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_LOW_020","nameTh":"วิชาม้วนชายผ้าคลุมพันแขนรับคมขวาน","descTh":"วิชาม้วนชายผ้าคลุมพันแขนรับคมขวาน","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_020_M1","nameTh":"กระบวนที่ 1 · วิชาม้วนชายผ้าคลุมพันแขนรับค","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_LOW_021","nameTh":"ปราการยามเฝ้าประตูเขาเรียกตีเกราะสัญญาณ","descTh":"ปราการยามเฝ้าประตูเขาเรียกตีเกราะสัญญาณ","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_COPPER_GONG_WAKE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_021_M1","nameTh":"กระบวนที่ 1 · ปราการยามเฝ้าประตูเขาเรียกตี","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_LOW_022","nameTh":"เคล็ดเกล็ดปลาไหลลื่นหลุดจากการล็อกจับ","descTh":"เคล็ดเกล็ดปลาไหลลื่นหลุดจากการล็อกจับ","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_DRAG_COLLAPSED_BUDDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_022_M1","nameTh":"กระบวนที่ 1 · เคล็ดเกล็ดปลาไหลลื่นหลุดจากก","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_LOW_023","nameTh":"วิชาเอาโล่ไม้ไผ่รับพิษแทนเพื่อนแนวหลัง","descTh":"วิชาเอาโล่ไม้ไผ่รับพิษแทนเพื่อนแนวหลัง","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WOK_PLANK_BLOCK","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_023_M1","nameTh":"กระบวนที่ 1 · วิชาเอาโล่ไม้ไผ่รับพิษแทนเพื","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_LOW_024","nameTh":"เคล็ดหายใจเข้าซี่โครงเหล็กต้านแรงกระแทกอสูร","descTh":"เคล็ดหายใจเข้าซี่โครงเหล็กต้านแรงกระแทกอสูร","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SCRAP_SLAG_SIFTER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_LOW_024_M1","nameTh":"กระบวนที่ 1 · เคล็ดหายใจเข้าซี่โครงเหล็กต้","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_LOW_001","nameTh":"วิชาฉีกชายเสื้อพันห้ามเลือดสด","descTh":"วิชาฉีกชายเสื้อพันห้ามเลือดสด","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_EARLY_BIRD_DAWN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_001_M1","nameTh":"กระบวนที่ 1 · วิชาฉีกชายเสื้อพันห้ามเลือดส","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_002","nameTh":"เคล็ดตบหลังทุบอกเรียกสติเพื่อนมึนงง","descTh":"เคล็ดตบหลังทุบอกเรียกสติเพื่อนมึนงง","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_COPPER_GONG_WAKE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_002_M1","nameTh":"กระบวนที่ 1 · เคล็ดตบหลังทุบอกเรียกสติเพื่","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_003","nameTh":"วิชาโยนกระติกนํ้าขิงร้อนให้สหายดื่ม","descTh":"วิชาโยนกระติกนํ้าขิงร้อนให้สหายดื่ม","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_003_M1","nameTh":"กระบวนที่ 1 · วิชาโยนกระติกนํ้าขิงร้อนให้ส","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_004","nameTh":"เสียงเป่านกหวีดไม้ไผ่นัดถอยพร้อมกัน","descTh":"เสียงเป่านกหวีดไม้ไผ่นัดถอยพร้อมกัน","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_NAP_RECHARGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_004_M1","nameTh":"กระบวนที่ 1 · เสียงเป่านกหวีดไม้ไผ่นัดถอยพ","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_005","nameTh":"เคล็ดพอกโคลนสมุนไพรดูดเหล็กในแมลงพิษ","descTh":"เคล็ดพอกโคลนสมุนไพรดูดเหล็กในแมลงพิษ","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_005_M1","nameTh":"กระบวนที่ 1 · เคล็ดพอกโคลนสมุนไพรดูดเหล็กใ","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_006","nameTh":"วิชาตะโกนบอกทิศลูกธนูล่วงหน้า","descTh":"วิชาตะโกนบอกทิศลูกธนูล่วงหน้า","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WEATHER_HARDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_006_M1","nameTh":"กระบวนที่ 1 · วิชาตะโกนบอกทิศลูกธนูล่วงหน้","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_007","nameTh":"เคล็ดดามกิ่งไม้เข้าเฝือกข้อเท้าแพลง","descTh":"เคล็ดดามกิ่งไม้เข้าเฝือกข้อเท้าแพลง","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_007_M1","nameTh":"กระบวนที่ 1 · เคล็ดดามกิ่งไม้เข้าเฝือกข้อเ","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_008","nameTh":"วิชาตีเกราะไม้ไผ่ปลุกใจยามเฝ้าประตู","descTh":"วิชาตีเกราะไม้ไผ่ปลุกใจยามเฝ้าประตู","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_008_M1","nameTh":"กระบวนที่ 1 · วิชาตีเกราะไม้ไผ่ปลุกใจยามเฝ","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_LOW_009","nameTh":"วิชาหิ้วปีกพาสหายบาดเจ็บพ้นคมหอก","descTh":"วิชาหิ้วปีกพาสหายบาดเจ็บพ้นคมหอก","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_DRAG_COLLAPSED_BUDDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_009_M1","nameTh":"กระบวนที่ 1 · วิชาหิ้วปีกพาสหายบาดเจ็บพ้นค","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_010","nameTh":"เคล็ดรมควันใบอ้ายเฉ่าขับไล่ไอชื้น","descTh":"เคล็ดรมควันใบอ้ายเฉ่าขับไล่ไอชื้น","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_010_M1","nameTh":"กระบวนที่ 1 · เคล็ดรมควันใบอ้ายเฉ่าขับไล่ไ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_011","nameTh":"วิชาฝังเข็มทองแดงคลายตะคริวเพิ่มแรงกาย","descTh":"วิชาฝังเข็มทองแดงคลายตะคริวเพิ่มแรงกาย","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_011_M1","nameTh":"กระบวนที่ 1 · วิชาฝังเข็มทองแดงคลายตะคริวเ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_012","nameTh":"เสียงตีฆ้องทองเหลืองสะท้านขวัญโจรป่า","descTh":"เสียงตีฆ้องทองเหลืองสะท้านขวัญโจรป่า","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_COPPER_GONG_WAKE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_012_M1","nameTh":"กระบวนที่ 1 · เสียงตีฆ้องทองเหลืองสะท้านขว","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_013","nameTh":"เคล็ดขี้ผึ้งหมีขาวทาเคลือบแผลไฟลวก","descTh":"เคล็ดขี้ผึ้งหมีขาวทาเคลือบแผลไฟลวก","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_013_M1","nameTh":"กระบวนที่ 1 · เคล็ดขี้ผึ้งหมีขาวทาเคลือบแผ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_014","nameTh":"วิชาโบกธงสามเหลี่ยมจัดแถวแนวหอก","descTh":"วิชาโบกธงสามเหลี่ยมจัดแถวแนวหอก","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_014_M1","nameTh":"กระบวนที่ 1 · วิชาโบกธงสามเหลี่ยมจัดแถวแนว","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_015","nameTh":"เคล็ดนวดขมับคลายปวดหัวจากการอ่านตำรา","descTh":"เคล็ดนวดขมับคลายปวดหัวจากการอ่านตำรา","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BRACE_SHIELD_CHIN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_015_M1","nameTh":"กระบวนที่ 1 · เคล็ดนวดขมับคลายปวดหัวจากการ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_LOW_016","nameTh":"วิชาผ่าเอาหัวลูกศรออกกลางสนามรบ","descTh":"วิชาผ่าเอาหัวลูกศรออกกลางสนามรบ","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_016_M1","nameTh":"กระบวนที่ 1 · วิชาผ่าเอาหัวลูกศรออกกลางสนา","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_LOW_017","nameTh":"เพลงขลุ่ยบ้านเกิดปลอบขวัญคนไกลบ้าน","descTh":"เพลงขลุ่ยบ้านเกิดปลอบขวัญคนไกลบ้าน","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_017_M1","nameTh":"กระบวนที่ 1 · เพลงขลุ่ยบ้านเกิดปลอบขวัญคนไ","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_LOW_018","nameTh":"เคล็ดตั้งหม้อยาต้มด่วนหน้าค่ายพักแรม","descTh":"เคล็ดตั้งหม้อยาต้มด่วนหน้าค่ายพักแรม","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_018_M1","nameTh":"กระบวนที่ 1 · เคล็ดตั้งหม้อยาต้มด่วนหน้าค่","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_LOW_019","nameTh":"วิชาถ่ายลมปราณอุ่นช่วยศิษย์น้องฝ่าด่านแรก","descTh":"วิชาถ่ายลมปราณอุ่นช่วยศิษย์น้องฝ่าด่านแรก","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_019_M1","nameTh":"กระบวนที่ 1 · วิชาถ่ายลมปราณอุ่นช่วยศิษย์น","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_LOW_020","nameTh":"โองการนายกองลาดตระเวนประสานโล่คู่","descTh":"โองการนายกองลาดตระเวนประสานโล่คู่","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_LOW_020_M1","nameTh":"กระบวนที่ 1 · โองการนายกองลาดตระเวนประสานโ","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_LOW_001","nameTh":"เคล็ดผัดข้าวคลุกก้นกระทะหอมกรุ่นทั้งโรงครัว","descTh":"เคล็ดผัดข้าวคลุกก้นกระทะหอมกรุ่นทั้งโรงครัว","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LEFTOVER_WOK_MAGIC","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_001_M1","nameTh":"กระบวนที่ 1 · เคล็ดผัดข้าวคลุกก้นกระทะหอมก","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_002","nameTh":"วิชาขุดไส้เดือนแดงปั้นเหยื่อตกปลาริมท่านํ้า","descTh":"วิชาขุดไส้เดือนแดงปั้นเหยื่อตกปลาริมท่านํ้า","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_RIVER_BAIT_WHISPER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_002_M1","nameTh":"กระบวนที่ 1 · วิชาขุดไส้เดือนแดงปั้นเหยื่อ","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_003","nameTh":"เคล็ดผ่าฟืนตามลายไม้ไม่บิ่นคมขวาน","descTh":"เคล็ดผ่าฟืนตามลายไม้ไม่บิ่นคมขวาน","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHORE_BREATHING","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_003_M1","nameTh":"กระบวนที่ 1 · เคล็ดผ่าฟืนตามลายไม้ไม่บิ่นค","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_004","nameTh":"วิชาตากใบชาและสมุนไพรบนกระด้งไม่ให้ขึ้นรา","descTh":"วิชาตากใบชาและสมุนไพรบนกระด้งไม่ให้ขึ้นรา","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_NAP_RECHARGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_004_M1","nameTh":"กระบวนที่ 1 · วิชาตากใบชาและสมุนไพรบนกระด้","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_005","nameTh":"เคล็ดกวาดลานปัดฝุ่นหอนอนให้โปร่งโล่ง","descTh":"เคล็ดกวาดลานปัดฝุ่นหอนอนให้โปร่งโล่ง","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_005_M1","nameTh":"กระบวนที่ 1 · เคล็ดกวาดลานปัดฝุ่นหอนอนให้โ","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_006","nameTh":"วิชาดูสีเปลือกหินแยกแร่เหล็กออกจากหินกรวด","descTh":"วิชาดูสีเปลือกหินแยกแร่เหล็กออกจากหินกรวด","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WEATHER_HARDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_006_M1","nameTh":"กระบวนที่ 1 · วิชาดูสีเปลือกหินแยกแร่เหล็ก","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_007","nameTh":"เคล็ดต่อรองราคาผักปลาหน้าตลาดเช้า","descTh":"เคล็ดต่อรองราคาผักปลาหน้าตลาดเช้า","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_STREET_HAGGLE_TONGUE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_007_M1","nameTh":"กระบวนที่ 1 · เคล็ดต่อรองราคาผักปลาหน้าตลา","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_008","nameTh":"วิชาแปรงขนเกาคางให้สัตว์เลี้ยงเชื่องไว","descTh":"วิชาแปรงขนเกาคางให้สัตว์เลี้ยงเชื่องไว","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_008_M1","nameTh":"กระบวนที่ 1 · วิชาแปรงขนเกาคางให้สัตว์เลี้","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_009","nameTh":"เคล็ดพัดเตาต้มยาด้วยพัดใบตาลไม่ให้ก้นหม้อไหม้","descTh":"เคล็ดพัดเตาต้มยาด้วยพัดใบตาลไม่ให้ก้นหม้อไหม้","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TEA_SOUP_DIGEST","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_009_M1","nameTh":"กระบวนที่ 1 · เคล็ดพัดเตาต้มยาด้วยพัดใบตาล","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_010","nameTh":"วิชาซ่อมรองเท้าสานและชุนเสื้อขาดด้วยตัวเอง","descTh":"วิชาซ่อมรองเท้าสานและชุนเสื้อขาดด้วยตัวเอง","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_010_M1","nameTh":"กระบวนที่ 1 · วิชาซ่อมรองเท้าสานและชุนเสื้","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_011","nameTh":"เคล็ดทดนํ้าร่องสวนด้วยกระบอกไม้ไผ่","descTh":"เคล็ดทดนํ้าร่องสวนด้วยกระบอกไม้ไผ่","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_011_M1","nameTh":"กระบวนที่ 1 · เคล็ดทดนํ้าร่องสวนด้วยกระบอก","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_012","nameTh":"วิชาจุดธูปกันยุงและแมลงกวนสมาธิ","descTh":"วิชาจุดธูปกันยุงและแมลงกวนสมาธิ","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_012_M1","nameTh":"กระบวนที่ 1 · วิชาจุดธูปกันยุงและแมลงกวนสม","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_LOW_013","nameTh":"ศาสตร์ร่อนขี้เถ้าเตาหลอมเก็บเศษเหล็กไหลคืนคลัง","descTh":"ศาสตร์ร่อนขี้เถ้าเตาหลอมเก็บเศษเหล็กไหลคืนคลัง","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SCRAP_SLAG_SIFTER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_013_M1","nameTh":"กระบวนที่ 1 · ศาสตร์ร่อนขี้เถ้าเตาหลอมเก็บ","arch":"heal","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_014","nameTh":"วิชาหินลับมีดสองหน้าชุบคมดาบศิษย์สายนอก","descTh":"วิชาหินลับมีดสองหน้าชุบคมดาบศิษย์สายนอก","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_014_M1","nameTh":"กระบวนที่ 1 · วิชาหินลับมีดสองหน้าชุบคมดาบ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_015","nameTh":"ตำราหมักผักกาดเค็มและเนื้อตากแห้งเสบียงทัพ","descTh":"ตำราหมักผักกาดเค็มและเนื้อตากแห้งเสบียงทัพ","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BRACE_SHIELD_CHIN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_015_M1","nameTh":"กระบวนที่ 1 · ตำราหมักผักกาดเค็มและเนื้อตา","arch":"heal","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_016","nameTh":"เคล็ดจัดเรียงม้วนไม้ไผ่ติดป้ายหมวดหมู่หอตำรา","descTh":"เคล็ดจัดเรียงม้วนไม้ไผ่ติดป้ายหมวดหมู่หอตำรา","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WOK_PLANK_BLOCK","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_016_M1","nameTh":"กระบวนที่ 1 · เคล็ดจัดเรียงม้วนไม้ไผ่ติดป้","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_017","nameTh":"วิชาชำแหละหนังและเขี้ยวอสูรไม่ให้ฉีกขาด","descTh":"วิชาชำแหละหนังและเขี้ยวอสูรไม่ให้ฉีกขาด","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_017_M1","nameTh":"กระบวนที่ 1 · วิชาชำแหละหนังและเขี้ยวอสูรไ","arch":"heal","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_018","nameTh":"ศาสตร์ดูเมฆพยากรณ์ฝนล่วงหน้าครึ่งวัน","descTh":"ศาสตร์ดูเมฆพยากรณ์ฝนล่วงหน้าครึ่งวัน","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_018_M1","nameTh":"กระบวนที่ 1 · ศาสตร์ดูเมฆพยากรณ์ฝนล่วงหน้า","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_019","nameTh":"เคล็ดต้มนํ้าสมุนไพรแช่ตัวคลายฟกชํ้าห้องพยาบาล","descTh":"เคล็ดต้มนํ้าสมุนไพรแช่ตัวคลายฟกชํ้าห้องพยาบาล","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_019_M1","nameTh":"กระบวนที่ 1 · เคล็ดต้มนํ้าสมุนไพรแช่ตัวคลา","arch":"heal","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_020","nameTh":"วิชาผูกเกวียนล้อเดียวเข็นของขึ้นทางลาด","descTh":"วิชาผูกเกวียนล้อเดียวเข็นของขึ้นทางลาด","cat":"AUXILIARY_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_020_M1","nameTh":"กระบวนที่ 1 · วิชาผูกเกวียนล้อเดียวเข็นของ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_LOW_021","nameTh":"ตำราหลอมลูกกลอนโอสถพื้นฐานทีละสิบเม็ด","descTh":"ตำราหลอมลูกกลอนโอสถพื้นฐานทีละสิบเม็ด","cat":"AUXILIARY_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_COPPER_GONG_WAKE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_021_M1","nameTh":"กระบวนที่ 1 · ตำราหลอมลูกกลอนโอสถพื้นฐานที","arch":"heal","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_LOW_022","nameTh":"ศาสตร์ตีเกราะเกล็ดเหล็กซ้อนทับทนคมเขี้ยว","descTh":"ศาสตร์ตีเกราะเกล็ดเหล็กซ้อนทับทนคมเขี้ยว","cat":"AUXILIARY_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_DRAG_COLLAPSED_BUDDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_022_M1","nameTh":"กระบวนที่ 1 · ศาสตร์ตีเกราะเกล็ดเหล็กซ้อนท","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_LOW_023","nameTh":"วิชาทำบัญชีคลังสำนักตรวจของขาดล่วงหน้า","descTh":"วิชาทำบัญชีคลังสำนักตรวจของขาดล่วงหน้า","cat":"AUXILIARY_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LEFTOVER_WOK_MAGIC","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_023_M1","nameTh":"กระบวนที่ 1 · วิชาทำบัญชีคลังสำนักตรวจของข","arch":"heal","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_LOW_024","nameTh":"เคล็ดเพาะเห็ดหลินจือในถํ้าชื้นหลังเขา","descTh":"เคล็ดเพาะเห็ดหลินจือในถํ้าชื้นหลังเขา","cat":"AUXILIARY_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SCRAP_SLAG_SIFTER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_024_M1","nameTh":"กระบวนที่ 1 · เคล็ดเพาะเห็ดหลินจือในถํ้าชื","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_LOW_025","nameTh":"วิชาฝึกนกพิราบสื่อสารส่งข่าวด่วนชายแดน","descTh":"วิชาฝึกนกพิราบสื่อสารส่งข่าวด่วนชายแดน","cat":"AUXILIARY_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_RIVER_BAIT_WHISPER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_025_M1","nameTh":"กระบวนที่ 1 · วิชาฝึกนกพิราบสื่อสารส่งข่าว","arch":"heal","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_LOW_026","nameTh":"ศาสตร์รุ่นพี่คุมแถวซ้อมเช้าศิษย์สายนอก","descTh":"ศาสตร์รุ่นพี่คุมแถวซ้อมเช้าศิษย์สายนอก","cat":"AUXILIARY_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_STREET_HAGGLE_TONGUE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_LOW_026_M1","nameTh":"กระบวนที่ 1 · ศาสตร์รุ่นพี่คุมแถวซ้อมเช้าศ","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"FRB_LOW_001","nameTh":"เคล็ดกลืนผงชาดดิบเร่งไฟตันเถียน","descTh":"เคล็ดกลืนผงชาดดิบเร่งไฟตันเถียน","cat":"FORBIDDEN_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_EARLY_BIRD_DAWN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_001_M1","nameTh":"กระบวนที่ 1 · เคล็ดกลืนผงชาดดิบเร่งไฟตันเถ","arch":"burst","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"FRB_LOW_002","nameTh":"วิชาป้ายเลือดผสมสนิมเหล็กใส่คมมีด","descTh":"วิชาป้ายเลือดผสมสนิมเหล็กใส่คมมีด","cat":"FORBIDDEN_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_RUST_BLOOD_SMEAR","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_002_M1","nameTh":"กระบวนที่ 1 · วิชาป้ายเลือดผสมสนิมเหล็กใส่","arch":"burst","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"FRB_LOW_003","nameTh":"เคล็ดกัดปลายลิ้นพ่นโลหิตบังตาศัตรู","descTh":"เคล็ดกัดปลายลิ้นพ่นโลหิตบังตาศัตรู","cat":"FORBIDDEN_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHORE_BREATHING","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_003_M1","nameTh":"กระบวนที่ 1 · เคล็ดกัดปลายลิ้นพ่นโลหิตบังต","arch":"burst","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"FRB_LOW_004","nameTh":"ตำราเถื่อนต้มเหล้าดองดีงูโด๊ปกล้ามเนื้อ","descTh":"ตำราเถื่อนต้มเหล้าดองดีงูโด๊ปกล้ามเนื้อ","cat":"FORBIDDEN_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_STIMULANT_BOIL","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_004_M1","nameTh":"กระบวนที่ 1 · ตำราเถื่อนต้มเหล้าดองดีงูโด๊","arch":"burst","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"FRB_LOW_005","nameTh":"เคล็ดฝืนจุดตะเกียงอดนอนเจ็ดคืนรวด","descTh":"เคล็ดฝืนจุดตะเกียงอดนอนเจ็ดคืนรวด","cat":"FORBIDDEN_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SLEEPLESS_CANDLE_BURN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_005_M1","nameTh":"กระบวนที่ 1 · เคล็ดฝืนจุดตะเกียงอดนอนเจ็ดค","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_LOW_006","nameTh":"วิชาสูบไอเลือดอุ่นจากซากอสูรป่าสดๆ","descTh":"วิชาสูบไอเลือดอุ่นจากซากอสูรป่าสดๆ","cat":"FORBIDDEN_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BEAST_CARCASS_SIPHON","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_006_M1","nameTh":"กระบวนที่ 1 · วิชาสูบไอเลือดอุ่นจากซากอสูร","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_LOW_007","nameTh":"อาคมผูกหุ่นฟางแช่งให้คู่แข่งสะดุดขา","descTh":"อาคมผูกหุ่นฟางแช่งให้คู่แข่งสะดุดขา","cat":"FORBIDDEN_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CROWD_WARMTH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_007_M1","nameTh":"กระบวนที่ 1 · อาคมผูกหุ่นฟางแช่งให้คู่แข่ง","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_LOW_008","nameTh":"เคล็ดแทงเข็มกระตุ้นจุดตายรีดแรงเฮือกท้าย","descTh":"เคล็ดแทงเข็มกระตุ้นจุดตายรีดแรงเฮือกท้าย","cat":"FORBIDDEN_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_008_M1","nameTh":"กระบวนที่ 1 · เคล็ดแทงเข็มกระตุ้นจุดตายรีด","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_LOW_009","nameTh":"วิชาโปรยผงกระดูกผีล่ออสูรไปรุมศัตรู","descTh":"วิชาโปรยผงกระดูกผีล่ออสูรไปรุมศัตรู","cat":"FORBIDDEN_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TEA_SOUP_DIGEST","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_009_M1","nameTh":"กระบวนที่ 1 · วิชาโปรยผงกระดูกผีล่ออสูรไปร","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_LOW_010","nameTh":"เคล็ดแอบดูดไอปราณรั่วไหลของคนข้างเบาะ","descTh":"เคล็ดแอบดูดไอปราณรั่วไหลของคนข้างเบาะ","cat":"FORBIDDEN_ART","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_010_M1","nameTh":"กระบวนที่ 1 · เคล็ดแอบดูดไอปราณรั่วไหลของค","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_LOW_011","nameTh":"วิชาอัดลมปราณระเบิดด้ามอาวุธพังแลกชีวิต","descTh":"วิชาอัดลมปราณระเบิดด้ามอาวุธพังแลกชีวิต","cat":"FORBIDDEN_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_011_M1","nameTh":"กระบวนที่ 1 · วิชาอัดลมปราณระเบิดด้ามอาวุธ","arch":"burst","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"FRB_LOW_012","nameTh":"เคล็ดเลี้ยงแมงมุมพิษซ่อนในแขนเสื้อ","descTh":"เคล็ดเลี้ยงแมงมุมพิษซ่อนในแขนเสื้อ","cat":"FORBIDDEN_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ALLEY_SLIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_012_M1","nameTh":"กระบวนที่ 1 · เคล็ดเลี้ยงแมงมุมพิษซ่อนในแข","arch":"burst","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"FRB_LOW_013","nameTh":"มนต์ป้ายขี้เถ้าธูปผีพรางตัวหนีทัพ","descTh":"มนต์ป้ายขี้เถ้าธูปผีพรางตัวหนีทัพ","cat":"FORBIDDEN_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_013_M1","nameTh":"กระบวนที่ 1 · มนต์ป้ายขี้เถ้าธูปผีพรางตัวห","arch":"burst","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"FRB_LOW_014","nameTh":"เคล็ดกลืนลูกกลอนเลือดอสูรดิบฝืนทะลวงขั้น","descTh":"เคล็ดกลืนลูกกลอนเลือดอสูรดิบฝืนทะลวงขั้น","cat":"FORBIDDEN_ART","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_LOW_014_M1","nameTh":"กระบวนที่ 1 · เคล็ดกลืนลูกกลอนเลือดอสูรดิบ","arch":"burst","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"PAS_LOW_001","nameTh":"คนกินง่ายอยู่ง่ายพุ้ยข้าวสามคำอิ่ม","descTh":"คนกินง่ายอยู่ง่ายพุ้ยข้าวสามคำอิ่ม","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_FAST_EATER_BRAWLER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_002","nameTh":"ตาไวเห็นเหรียญและสมุนไพรตกข้างทาง","descTh":"ตาไวเห็นเหรียญและสมุนไพรตกข้างทาง","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SCAVENGER_POCKETS","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_003","nameTh":"มือด้านคนตัดฟืนจับด้ามดาบไม่หลุด","descTh":"มือด้านคนตัดฟืนจับด้ามดาบไม่หลุด","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_IRON_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_004","nameTh":"เด็กวัดเก่าตื่นเช้ากวาดลานไม่เคยสาย","descTh":"เด็กวัดเก่าตื่นเช้ากวาดลานไม่เคยสาย","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_NAP_RECHARGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_005","nameTh":"นิสัยขี้เหนียวเก็บออมปราณไว้ใช้ยามคับขัน","descTh":"นิสัยขี้เหนียวเก็บออมปราณไว้ใช้ยามคับขัน","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CHEAP_PILL_SPONGE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_006","nameTh":"ลูกชาวประมงกลั้นหายใจทนนํ้าเย็น","descTh":"ลูกชาวประมงกลั้นหายใจทนนํ้าเย็น","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WEATHER_HARDY","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_007","nameTh":"เด็กวิ่งส่งของชำนาญทางลัดในเมือง","descTh":"เด็กวิ่งส่งของชำนาญทางลัดในเมือง","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_CROWD_WARMTH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_008","nameTh":"คนหัวแข็งโดนเขกหัวไม่มึนง่าย","descTh":"คนหัวแข็งโดนเขกหัวไม่มึนง่าย","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HUMBLE_FOUNDATION","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_009","nameTh":"หนอนหนังสือสายตาสั้นอ่านตัวจิ๋วชัดแจ๋ว","descTh":"หนอนหนังสือสายตาสั้นอ่านตัวจิ๋วชัดแจ๋ว","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TEA_SOUP_DIGEST","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_010","nameTh":"ลูกมือหมอตำแยเห็นเลือดไม่ตกใจ","descTh":"ลูกมือหมอตำแยเห็นเลือดไม่ตกใจ","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_MERIDIAN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_011","nameTh":"คนอัธยาศัยดียิ้มรับแขกหน้าประตู","descTh":"คนอัธยาศัยดียิ้มรับแขกหน้าประตู","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_PORTER_SPRINT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_012","nameTh":"ใจสู้ลูกคนยากไม่ยอมแพ้คนรวยพรสวรรค์","descTh":"ใจสู้ลูกคนยากไม่ยอมแพ้คนรวยพรสวรรค์","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BULLIED_UNDERDOG_GRIT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_LOW_013","nameTh":"จมูกแม่ครัวดมกลิ่นพิษในอาหารออกทันที","descTh":"จมูกแม่ครัวดมกลิ่นพิษในอาหารออกทันที","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_MUD_ICE_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_014","nameTh":"ขาประจำโรงนํ้าชาจำข่าวลือแม่นยำ","descTh":"ขาประจำโรงนํ้าชาจำข่าวลือแม่นยำ","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_TREE_ROOF_PERCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_015","nameTh":"กระดูกเหนียวตกต้นไม้สิบครั้งไม่หัก","descTh":"กระดูกเหนียวตกต้นไม้สิบครั้งไม่หัก","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BRACE_SHIELD_CHIN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_016","nameTh":"คมมีดสั้นซ่อนในรองเท้าฟางจังหวะอับจน","descTh":"คมมีดสั้นซ่อนในรองเท้าฟางจังหวะอับจน","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_WOK_PLANK_BLOCK","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_017","nameTh":"ช่างซ่อมเกือกม้ารู้จุดอ่อนข้อต่อเกราะ","descTh":"ช่างซ่อมเกือกม้ารู้จุดอ่อนข้อต่อเกราะ","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_ROLL_WITH_PUNCH","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_018","nameTh":"คนเลี้ยงม้าเข้าใจภาษาสัตว์ป่า","descTh":"คนเลี้ยงม้าเข้าใจภาษาสัตว์ป่า","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LIME_DUST_SLEEVE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_019","nameTh":"นิสัยรอบคอบพกยาใส่แผลติดตัวเสมอ","descTh":"นิสัยรอบคอบพกยาใส่แผลติดตัวเสมอ","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BAMBOO_SPLINT_WRAP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_020","nameTh":"สมาธิคนตกปลาเฝ้ารอจังหวะสวนคม","descTh":"สมาธิคนตกปลาเฝ้ารอจังหวะสวนคม","cat":"PASSIVE","tier":2,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Refined","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_HOT_BROTH_CANTEEN","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_LOW_021","nameTh":"เขี้ยวเล็บศิษย์ก้นครัวล้มยักษ์บนลานประลอง","descTh":"เขี้ยวเล็บศิษย์ก้นครัวล้มยักษ์บนลานประลอง","cat":"PASSIVE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_BULLIED_UNDERDOG_GRIT","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_LOW_022","nameTh":"มือทองประหยัดฟืนไฟร้อยเตาไม่สูญเปล่า","descTh":"มือทองประหยัดฟืนไฟร้อยเตาไม่สูญเปล่า","cat":"PASSIVE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SCRAP_SLAG_SIFTER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_LOW_023","nameTh":"ทหารผ่านศึกชายแดนหลับตาข้างเดียวระวังภัย","descTh":"ทหารผ่านศึกชายแดนหลับตาข้างเดียวระวังภัย","cat":"PASSIVE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_LEFTOVER_WOK_MAGIC","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_LOW_024","nameTh":"พี่เลี้ยงหอนอกใจดีใครอยู่ใกล้ก็อุ่นใจ","descTh":"พี่เลี้ยงหอนอกใจดีใครอยู่ใกล้ก็อุ่นใจ","cat":"PASSIVE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_SCRAP_SLAG_SIFTER","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_LOW_025","nameTh":"กล้ามเนื้อเหล็กไหลคนแบกศิลาสร้างกำแพง","descTh":"กล้ามเนื้อเหล็กไหลคนแบกศิลาสร้างกำแพง","cat":"PASSIVE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_THRIFTY_IRON_GRIP","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_LOW_026","nameTh":"ปัญญาชนคนขยันจดบันทึกข้อผิดพลาดทุกศึก","descTh":"ปัญญาชนคนขยันจดบันทึกข้อผิดพลาดทุกศึก","cat":"PASSIVE","tier":3,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":true,"isExpansionNonCombatArt":false,"carbonKeyword":"LKW_STREET_HAGGLE_TONGUE","obtainSources":["SECT_LIBRARY","PEDDLER_MARKET","CHORE_EPIPHANY","ORAL_HAND_ME_DOWN"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}}];
  JD.TECH.lowTierArts = [].concat(JD.TECH.lowTierMantras, JD.TECH.lowTierNonCombatArts);

  JD.TECH.midHighMantras = [{"id":"MNT_EXP_001","nameTh":"เคล็ดจุดธูปอธิษฐานรับอรุณ","descTh":"เคล็ดจุดธูปอธิษฐานรับอรุณ","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"GOD","sub":"NONE","power":17,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_EXP_002","nameTh":"เคล็ดสมาธิฟังเสียงคมดาบในฝัก","descTh":"เคล็ดสมาธิฟังเสียงคมดาบในฝัก","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"SHADOW_SAMURAI","sub":"NONE","power":18,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ZANSHIN_BREATHLESS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_EXP_003","nameTh":"เคล็ดลมหายใจวัวไถนาไม่รู้จักเหนื่อย","descTh":"เคล็ดลมหายใจวัวไถนาไม่รู้จักเหนื่อย","cat":"QI_MANTRA","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":16,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DUAL_MIND_LABOR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.05,"cultRatePct":0.04,"mdefPct":0.03}},{"id":"MNT_EXP_004","nameTh":"เคล็ดซ่อนประกายหยกในก้อนกรวด","descTh":"เคล็ดซ่อนประกายหยกในก้อนกรวด","cat":"QI_MANTRA","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":32,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_EXP_005","nameTh":"เคล็ดสูบไอร้อนหน้าเตาหลอมบำรุงเส้นเอ็น","descTh":"เคล็ดสูบไอร้อนหน้าเตาหลอมบำรุงเส้นเอ็น","cat":"QI_MANTRA","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":34,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DUAL_MIND_LABOR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_EXP_006","nameTh":"เคล็ดสดับเสียงพิรุณล้างใจขุ่นมัว","descTh":"เคล็ดสดับเสียงพิรุณล้างใจขุ่นมัว","cat":"QI_MANTRA","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":33,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_SOLAR_WEATHER_PULSE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_EXP_007","nameTh":"เคล็ดเคี้ยวรากสมุนไพรดิบกลั่นตับม้าม","descTh":"เคล็ดเคี้ยวรากสมุนไพรดิบกลั่นตับม้าม","cat":"QI_MANTRA","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":34,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_TOXIN_FURNACE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_EXP_008","nameTh":"เคล็ดนับลูกปัดชั่งลมหายใจเที่ยงตรง","descTh":"เคล็ดนับลูกปัดชั่งลมหายใจเที่ยงตรง","cat":"QI_MANTRA","tier":2,"reqTier":1,"path":"MERCANTILE_DAO","sub":"NONE","power":35,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ANTI_THEFT_CYPHER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.1,"cultRatePct":0.08,"mdefPct":0.06}},{"id":"MNT_EXP_009","nameTh":"เคล็ดนิทราเซียนขี้เซาฝันเห็นผีเสื้อ","descTh":"เคล็ดนิทราเซียนขี้เซาฝันเห็นผีเสื้อ","cat":"QI_MANTRA","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":56,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DREAM_HIBERNATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_EXP_010","nameTh":"เคล็ดสุราเมรัยหมักปราณเก้าไห","descTh":"เคล็ดสุราเมรัยหมักปราณเก้าไห","cat":"QI_MANTRA","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":58,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DUAL_MIND_LABOR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_EXP_011","nameTh":"เคล็ดกลืนไอโลหิตสมรภูมิชุบกระดูก","descTh":"เคล็ดกลืนไอโลหิตสมรภูมิชุบกระดูก","cat":"QI_MANTRA","tier":3,"reqTier":2,"path":"DEMON","sub":"NONE","power":60,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_TOXIN_FURNACE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_EXP_012","nameTh":"เคล็ดเดินปราณย้อนชีพจรซ่อนเงื่อนสำนัก","descTh":"เคล็ดเดินปราณย้อนชีพจรซ่อนเงื่อนสำนัก","cat":"QI_MANTRA","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":57,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ANTI_THEFT_CYPHER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_EXP_013","nameTh":"เคล็ดผสานลมหายใจสัตว์คู่พันธะ","descTh":"เคล็ดผสานลมหายใจสัตว์คู่พันธะ","cat":"QI_MANTRA","tier":3,"reqTier":2,"path":"BEAST_SOVEREIGN","sub":"NONE","power":58,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DREAM_HIBERNATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.15,"cultRatePct":0.12,"mdefPct":0.09}},{"id":"MNT_EXP_014","nameTh":"เคล็ดจักรกลหัวใจไขลานไร้เหน็ดเหนื่อย","descTh":"เคล็ดจักรกลหัวใจไขลานไร้เหน็ดเหนื่อย","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"MECH_PUPPET","sub":"NONE","power":88,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_SOLAR_WEATHER_PULSE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_015","nameTh":"เคล็ดดูดแสงดาวเหนือยามเที่ยงคืน","descTh":"เคล็ดดูดแสงดาวเหนือยามเที่ยงคืน","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":90,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_SOLAR_WEATHER_PULSE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_016","nameTh":"เคล็ดชีพจรนํ้าแข็งพันปีสะกดพิษไฟ","descTh":"เคล็ดชีพจรนํ้าแข็งพันปีสะกดพิษไฟ","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":89,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ANTI_THEFT_CYPHER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_017","nameTh":"เคล็ดหลอมสายฟ้าเก็บไว้ในจุดตานจง","descTh":"เคล็ดหลอมสายฟ้าเก็บไว้ในจุดตานจง","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":92,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_018","nameTh":"เคล็ดกู่พิษร้อยสมุนไพรเลี้ยงชีพจร","descTh":"เคล็ดกู่พิษร้อยสมุนไพรเลี้ยงชีพจร","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"VENOM_GU","sub":"NONE","power":90,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_TOXIN_FURNACE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_019","nameTh":"เคล็ดนํ้านิ่งกระจกใสไร้ระลอก","descTh":"เคล็ดนํ้านิ่งกระจกใสไร้ระลอก","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"HEART_SOUL","sub":"NONE","power":88,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_TOXIN_FURNACE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_020","nameTh":"เคล็ดจิตดาบสุญตาไร้ลมหายใจ","descTh":"เคล็ดจิตดาบสุญตาไร้ลมหายใจ","cat":"QI_MANTRA","tier":4,"reqTier":3,"path":"SHADOW_SAMURAI","sub":"NONE","power":92,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ZANSHIN_BREATHLESS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.2,"cultRatePct":0.16,"mdefPct":0.12}},{"id":"MNT_EXP_021","nameTh":"มหาเคล็ดแยกจิตสองวิถี · มือตีเหล็กใจเข้าฌาน","descTh":"มหาเคล็ดแยกจิตสองวิถี · มือตีเหล็กใจเข้าฌาน","cat":"QI_MANTRA","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":142,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DUAL_MIND_LABOR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.25,"cultRatePct":0.2,"mdefPct":0.15}},{"id":"MNT_EXP_022","nameTh":"มหาเคล็ดแสร้งเป็นปุถุชนเดินดิน","descTh":"มหาเคล็ดแสร้งเป็นปุถุชนเดินดิน","cat":"QI_MANTRA","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":140,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.25,"cultRatePct":0.2,"mdefPct":0.15}},{"id":"MNT_EXP_023","nameTh":"มหาเคล็ดเต่าหยกพันปีจำศีลใต้บึง","descTh":"มหาเคล็ดเต่าหยกพันปีจำศีลใต้บึง","cat":"QI_MANTRA","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":138,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_LONGEVITY_CRANE_LOCK","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.25,"cultRatePct":0.2,"mdefPct":0.15}},{"id":"MNT_EXP_024","nameTh":"มหาเคล็ดกระถางธูปหมื่นครัวเรือนคุ้มเมือง","descTh":"มหาเคล็ดกระถางธูปหมื่นครัวเรือนคุ้มเมือง","cat":"QI_MANTRA","tier":5,"reqTier":4,"path":"GOD","sub":"NONE","power":144,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ANTI_THEFT_CYPHER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.25,"cultRatePct":0.2,"mdefPct":0.15}},{"id":"MNT_EXP_025","nameTh":"มหาเคล็ดด้ายวิญญาณชักเชิดหุ่นเงา","descTh":"มหาเคล็ดด้ายวิญญาณชักเชิดหุ่นเงา","cat":"QI_MANTRA","tier":5,"reqTier":4,"path":"SOUL_PUPPETRY","sub":"NONE","power":145,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.25,"cultRatePct":0.2,"mdefPct":0.15}},{"id":"MNT_EXP_026","nameTh":"มหาเคล็ดกลืนตะวันเที่ยงวันหลอมกายาทอง","descTh":"มหาเคล็ดกลืนตะวันเที่ยงวันหลอมกายาทอง","cat":"QI_MANTRA","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":205,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_SOLAR_WEATHER_PULSE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.3,"cultRatePct":0.24,"mdefPct":0.18}},{"id":"MNT_EXP_027","nameTh":"มหาเคล็ดวัฏจักรยี่สิบสี่ฤดูผันแปร","descTh":"มหาเคล็ดวัฏจักรยี่สิบสี่ฤดูผันแปร","cat":"QI_MANTRA","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":208,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_TOXIN_FURNACE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.3,"cultRatePct":0.24,"mdefPct":0.18}},{"id":"MNT_EXP_028","nameTh":"มหาเคล็ดย่อยสลายร้อยพิษหมื่นคำสาป","descTh":"มหาเคล็ดย่อยสลายร้อยพิษหมื่นคำสาป","cat":"QI_MANTRA","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":210,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_TOXIN_FURNACE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.3,"cultRatePct":0.24,"mdefPct":0.18}},{"id":"MNT_EXP_029","nameTh":"มหาเคล็ดคัมภีร์สลักกลไกป้องกันทรยศ","descTh":"มหาเคล็ดคัมภีร์สลักกลไกป้องกันทรยศ","cat":"QI_MANTRA","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":206,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ANTI_THEFT_CYPHER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.3,"cultRatePct":0.24,"mdefPct":0.18}},{"id":"MNT_EXP_030","nameTh":"มหาเคล็ดอสุรกายไร้ปราณผ่าเซียน","descTh":"มหาเคล็ดอสุรกายไร้ปราณผ่าเซียน","cat":"QI_MANTRA","tier":6,"reqTier":5,"path":"SHADOW_SAMURAI","sub":"NONE","power":212,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ZANSHIN_BREATHLESS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.3,"cultRatePct":0.24,"mdefPct":0.18}},{"id":"MNT_EXP_031","nameTh":"มหาคัมภีร์เต่ามังกรเก้าผลัดคราบอายุวัฒนะ","descTh":"ผลัดคราบฟ","cat":"QI_MANTRA","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":285,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_LONGEVITY_CRANE_LOCK","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.28,"mdefPct":0.21}},{"id":"MNT_EXP_032","nameTh":"มหาคัมภีร์ฝันร้อยชาติในหนึ่งคืน","descTh":"มหาคัมภีร์ฝันร้อยชาติในหนึ่งคืน","cat":"QI_MANTRA","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":290,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_DREAM_HIBERNATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.28,"mdefPct":0.21}},{"id":"MNT_EXP_033","nameTh":"มหาคัมภีร์เบ้าหลอมปฐมกาลกลืนห้าธาตุ","descTh":"มหาคัมภีร์เบ้าหลอมปฐมกาลกลืนห้าธาตุ","cat":"QI_MANTRA","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":295,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.28,"mdefPct":0.21}},{"id":"MNT_EXP_034","nameTh":"มหาคัมภีร์คนธรรมดาแบกขุนเขาไม่ก้มหัว","descTh":"มหาคัมภีร์คนธรรมดาแบกขุนเขาไม่ก้มหัว","cat":"QI_MANTRA","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":292,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_ZANSHIN_BREATHLESS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.28,"mdefPct":0.21}},{"id":"MNT_EXP_035","nameTh":"มหาคัมภีร์เงาว่างเปล่าล่องหนจากชะตาฟ้า","descTh":"หลบเลี่ยงเนตรสวรรค์ตรวจจับ","cat":"QI_MANTRA","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":288,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_CONCEALED_AURA","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.28,"mdefPct":0.21}},{"id":"MNT_EXP_036","nameTh":"มหาคัมภีร์หมื่นชีพจรร่วมใจคํ้าจุนสำนัก","descTh":"มหาคัมภีร์หมื่นชีพจรร่วมใจคํ้าจุนสำนัก","cat":"QI_MANTRA","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":290,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"MKW_LONGEVITY_CRANE_LOCK","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.28,"mdefPct":0.21}}];
  JD.TECH.midHighNonCombatOnly = [{"id":"QGG_EXP_001","nameTh":"ย่างก้าวแมวขโมยไต่ชายคาไร้เสียง","descTh":"ย่างก้าวแมวขโมยไต่ชายคาไร้เสียง","cat":"LIGHTNESS_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_SHADOW_SEW_DODGE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_001_M1","nameTh":"กระบวนที่ 1 · ย่างก้าวแมวขโมยไต่ชายคาไร้เส","arch":"evade","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"QGG_EXP_002","nameTh":"วิชาแนบหูฟังเสียงมดเดินสามสิบก้าว","descTh":"วิชาแนบหูฟังเสียงมดเดินสามสิบก้าว","cat":"LIGHTNESS_ART","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TREMORSENSE_RADAR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_002_M1","nameTh":"กระบวนที่ 1 · วิชาแนบหูฟังเสียงมดเดินสามสิ","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_EXP_003","nameTh":"ท่าร่างใบบัวลู่ลมหลบพายุ","descTh":"ท่าร่างใบบัวลู่ลมหลบพายุ","cat":"LIGHTNESS_ART","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_DRUNKEN_SLIPSTREAM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_003_M1","nameTh":"กระบวนที่ 1 · ท่าร่างใบบัวลู่ลมหลบพายุ","arch":"evade","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"QGG_EXP_004","nameTh":"เคล็ดกลั้นใจเต่าจำศีลแกล้งสิ้นลม","descTh":"เคล็ดกลั้นใจเต่าจำศีลแกล้งสิ้นลม","cat":"LIGHTNESS_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TORTOISE_FEIGN_DEATH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_004_M1","nameTh":"กระบวนที่ 1 · เคล็ดกลั้นใจเต่าจำศีลแกล้งสิ","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_EXP_005","nameTh":"ก้าวพริบตาเหยียบเงาตอกหมุด","descTh":"ก้าวพริบตาเหยียบเงาตอกหมุด","cat":"LIGHTNESS_ART","tier":3,"reqTier":2,"path":"NINPO_SHADOW","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_SHADOW_SEW_DODGE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_005_M1","nameTh":"กระบวนที่ 1 · ก้าวพริบตาเหยียบเงาตอกหมุด","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_EXP_006","nameTh":"วิชาว่าวไม้ไผ่ร่อนลมข้ามหุบเหว","descTh":"วิชาว่าวไม้ไผ่ร่อนลมข้ามหุบเหว","cat":"LIGHTNESS_ART","tier":3,"reqTier":2,"path":"MECH_PUPPET","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TORTOISE_FEIGN_DEATH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_006_M1","nameTh":"กระบวนที่ 1 · วิชาว่าวไม้ไผ่ร่อนลมข้ามหุบเ","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_EXP_007","nameTh":"เคล็ดโปรยผงกำยานลบกลิ่นโลหิต","descTh":"เคล็ดโปรยผงกำยานลบกลิ่นโลหิต","cat":"LIGHTNESS_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_SHADOW_SEW_DODGE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_007_M1","nameTh":"กระบวนที่ 1 · เคล็ดโปรยผงกำยานลบกลิ่นโลหิต","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_EXP_008","nameTh":"ท่าร่างไต่ผาชันดั่งค่างขาว","descTh":"ท่าร่างไต่ผาชันดั่งค่างขาว","cat":"LIGHTNESS_ART","tier":3,"reqTier":2,"path":"BODY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TREMORSENSE_RADAR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_008_M1","nameTh":"กระบวนที่ 1 · ท่าร่างไต่ผาชันดั่งค่างขาว","arch":"evade","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"QGG_EXP_009","nameTh":"วิชามุดดินดำพสุธาไร้ร่องรอย","descTh":"วิชามุดดินดำพสุธาไร้ร่องรอย","cat":"LIGHTNESS_ART","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_EARTH_SUBMERGE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_009_M1","nameTh":"กระบวนที่ 1 · วิชามุดดินดำพสุธาไร้ร่องรอย","arch":"evade","type":"p","M":1.77,"cd":4,"qi":28}]},{"id":"QGG_EXP_010","nameTh":"เนตรกระจกส่องมายาผ่าร่างแยก","descTh":"เนตรกระจกส่องมายาผ่าร่างแยก","cat":"LIGHTNESS_ART","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TREMORSENSE_RADAR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_010_M1","nameTh":"กระบวนที่ 1 · เนตรกระจกส่องมายาผ่าร่างแยก","arch":"evade","type":"p","M":1.77,"cd":4,"qi":28}]},{"id":"QGG_EXP_011","nameTh":"ท่าร่างเหยียบเกลียวคลื่นขี่หลังปลาหลีฮื้อ","descTh":"ท่าร่างเหยียบเกลียวคลื่นขี่หลังปลาหลีฮื้อ","cat":"LIGHTNESS_ART","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_DRUNKEN_SLIPSTREAM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_011_M1","nameTh":"กระบวนที่ 1 · ท่าร่างเหยียบเกลียวคลื่นขี่ห","arch":"evade","type":"p","M":1.77,"cd":4,"qi":28}]},{"id":"QGG_EXP_012","nameTh":"เคล็ดม่านหมอกค่ายกลพรางกำลังทัพ","descTh":"เคล็ดม่านหมอกค่ายกลพรางกำลังทัพ","cat":"LIGHTNESS_ART","tier":5,"reqTier":4,"path":"ARRAY_TALISMAN","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TORTOISE_FEIGN_DEATH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_012_M1","nameTh":"กระบวนที่ 1 · เคล็ดม่านหมอกค่ายกลพรางกำลัง","arch":"evade","type":"p","M":1.95,"cd":4,"qi":33}]},{"id":"QGG_EXP_013","nameTh":"มหาวิชากระบี่กว้างพาหมู่ศิษย์เหินเมฆา","descTh":"มหาวิชากระบี่กว้างพาหมู่ศิษย์เหินเมฆา","cat":"LIGHTNESS_ART","tier":5,"reqTier":4,"path":"XIAN","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_SWORD_TAXI_ESCORT","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_013_M1","nameTh":"กระบวนที่ 1 · มหาวิชากระบี่กว้างพาหมู่ศิษย","arch":"evade","type":"p","M":1.95,"cd":4,"qi":33}]},{"id":"QGG_EXP_014","nameTh":"ก้าวอัสนีพริบตาเดียวทิ้งเจ็ดเงาติดตา","descTh":"ก้าวอัสนีพริบตาเดียวทิ้งเจ็ดเงาติดตา","cat":"LIGHTNESS_ART","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_TREMORSENSE_RADAR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_014_M1","nameTh":"กระบวนที่ 1 · ก้าวอัสนีพริบตาเดียวทิ้งเจ็ด","arch":"evade","type":"p","M":1.95,"cd":4,"qi":33}]},{"id":"QGG_EXP_015","nameTh":"ท่าร่างราชสีห์ทองกระโจนข้ามเก้ายอดเขา","descTh":"ท่าร่างราชสีห์ทองกระโจนข้ามเก้ายอดเขา","cat":"LIGHTNESS_ART","tier":6,"reqTier":5,"path":"BODY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_SWORD_TAXI_ESCORT","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_015_M1","nameTh":"กระบวนที่ 1 · ท่าร่างราชสีห์ทองกระโจนข้ามเ","arch":"evade","type":"p","M":2.13,"cd":3,"qi":38}]},{"id":"QGG_EXP_016","nameTh":"วิชาแกะรอยด้ายชะตาตามล่าสุดขอบฟ้า","descTh":"วิชาแกะรอยด้ายชะตาตามล่าสุดขอบฟ้า","cat":"LIGHTNESS_ART","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_EARTH_SUBMERGE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_016_M1","nameTh":"กระบวนที่ 1 · วิชาแกะรอยด้ายชะตาตามล่าสุดข","arch":"evade","type":"p","M":2.13,"cd":3,"qi":38}]},{"id":"QGG_EXP_017","nameTh":"มหาท่าร่างลอกคราบจักจั่นเร้นสู่มิติว่าง","descTh":"มหาท่าร่างลอกคราบจักจั่นเร้นสู่มิติว่าง","cat":"LIGHTNESS_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_DRUNKEN_SLIPSTREAM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_017_M1","nameTh":"กระบวนที่ 1 · มหาท่าร่างลอกคราบจักจั่นเร้น","arch":"evade","type":"p","M":2.31,"cd":3,"qi":43}]},{"id":"QGG_EXP_018","nameTh":"มหาท่าร่างสำเภาเมฆาพยุหะหมื่นลี้","descTh":"มหาท่าร่างสำเภาเมฆาพยุหะหมื่นลี้","cat":"LIGHTNESS_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"QKW_SWORD_TAXI_ESCORT","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"MOVEMENT_STEALTH_RECON","moveDefs":[{"id":"QGG_EXP_018_M1","nameTh":"กระบวนที่ 1 · มหาท่าร่างสำเภาเมฆาพยุหะหมื่","arch":"evade","type":"p","M":2.31,"cd":3,"qi":43}]},{"id":"DEF_EXP_001","nameTh":"เคล็ดคลุมผ้าเปียกกันไฟและควันพิษ","descTh":"เคล็ดคลุมผ้าเปียกกันไฟและควันพิษ","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_EMPTY_HAND_BLADE_CLAMP","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_001_M1","nameTh":"กระบวนที่ 1 · เคล็ดคลุมผ้าเปียกกันไฟและควั","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_EXP_002","nameTh":"ท่ายืนเสาเข็มฝังรากไม่ล้มคลุกฝุ่น","descTh":"ท่ายืนเสาเข็มฝังรากไม่ล้มคลุกฝุ่น","cat":"DEFENSIVE_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_COTTON_BELLY_BOUNCE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_002_M1","nameTh":"กระบวนที่ 1 · ท่ายืนเสาเข็มฝังรากไม่ล้มคลุ","arch":"guard","type":"p","M":1.23,"cd":6,"qi":13}]},{"id":"DEF_EXP_003","nameTh":"วิชาพุงปุยฝ้ายยืดหยุ่นรับค้อนเหล็ก","descTh":"วิชาพุงปุยฝ้ายยืดหยุ่นรับค้อนเหล็ก","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_COTTON_BELLY_BOUNCE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_003_M1","nameTh":"กระบวนที่ 1 · วิชาพุงปุยฝ้ายยืดหยุ่นรับค้อ","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_EXP_004","nameTh":"เคล็ดเบี่ยงไหล่รับคมแทนจุดตาย","descTh":"เคล็ดเบี่ยงไหล่รับคมแทนจุดตาย","cat":"DEFENSIVE_TECHNIQUE","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ORGAN_SHIFT_GRAZE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_004_M1","nameTh":"กระบวนที่ 1 · เคล็ดเบี่ยงไหล่รับคมแทนจุดตา","arch":"guard","type":"p","M":1.41,"cd":5,"qi":18}]},{"id":"DEF_EXP_005","nameTh":"ม่านแขนเสื้อเหล็กปัดป้องเกาทัณฑ์","descTh":"ม่านแขนเสื้อเหล็กปัดป้องเกาทัณฑ์","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ORGAN_SHIFT_GRAZE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_005_M1","nameTh":"กระบวนที่ 1 · ม่านแขนเสื้อเหล็กปัดป้องเกาท","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_EXP_006","nameTh":"เคล็ดเกราะหนามกระดูกเม่นโลหิต","descTh":"เคล็ดเกราะหนามกระดูกเม่นโลหิต","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":2,"path":"BODY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_PORCUPINE_BONE_SPUR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_006_M1","nameTh":"กระบวนที่ 1 · เคล็ดเกราะหนามกระดูกเม่นโลหิ","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_EXP_007","nameTh":"วิชาสองนิ้วหนีบคมดาบมือเปล่า","descTh":"วิชาสองนิ้วหนีบคมดาบมือเปล่า","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_EMPTY_HAND_BLADE_CLAMP","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_007_M1","nameTh":"กระบวนที่ 1 · วิชาสองนิ้วหนีบคมดาบมือเปล่า","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_EXP_008","nameTh":"โล่ปราณพี่ใหญ่กางกั้นหน้าศิษย์น้อง","descTh":"โล่ปราณพี่ใหญ่กางกั้นหน้าศิษย์น้อง","cat":"DEFENSIVE_TECHNIQUE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_SHARED_PHALANX_WALL","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_008_M1","nameTh":"กระบวนที่ 1 · โล่ปราณพี่ใหญ่กางกั้นหน้าศิษ","arch":"guard","type":"p","M":1.59,"cd":5,"qi":23}]},{"id":"DEF_EXP_009","nameTh":"วิชาเคลื่อนย้ายอวัยวะภายในหลบคมสังหาร","descTh":"วิชาเคลื่อนย้ายอวัยวะภายในหลบคมสังหาร","cat":"DEFENSIVE_TECHNIQUE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ORGAN_SHIFT_GRAZE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_009_M1","nameTh":"กระบวนที่ 1 · วิชาเคลื่อนย้ายอวัยวะภายในหล","arch":"guard","type":"p","M":1.77,"cd":4,"qi":28}]},{"id":"DEF_EXP_010","nameTh":"ระฆังสุญตาปิดหกทวารสะกดเสียงมาร","descTh":"ระฆังสุญตาปิดหกทวารสะกดเสียงมาร","cat":"DEFENSIVE_TECHNIQUE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ZEN_SOUNDPROOF_BELL","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_010_M1","nameTh":"กระบวนที่ 1 · ระฆังสุญตาปิดหกทวารสะกดเสียง","arch":"guard","type":"p","M":1.77,"cd":4,"qi":28}]},{"id":"DEF_EXP_011","nameTh":"ม่านนํ้าวนเก้าชั้นดูดกลืนเพลิงคาถา","descTh":"ม่านนํ้าวนเก้าชั้นดูดกลืนเพลิงคาถา","cat":"DEFENSIVE_TECHNIQUE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ORGAN_SHIFT_GRAZE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_011_M1","nameTh":"กระบวนที่ 1 · ม่านนํ้าวนเก้าชั้นดูดกลืนเพล","arch":"guard","type":"p","M":1.77,"cd":4,"qi":28}]},{"id":"DEF_EXP_012","nameTh":"เกราะไหมทองหุ่นเชิดรับเคราะห์แทนนาย","descTh":"เกราะไหมทองหุ่นเชิดรับเคราะห์แทนนาย","cat":"DEFENSIVE_TECHNIQUE","tier":5,"reqTier":4,"path":"MECH_PUPPET","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ZEN_SOUNDPROOF_BELL","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_012_M1","nameTh":"กระบวนที่ 1 · เกราะไหมทองหุ่นเชิดรับเคราะห","arch":"guard","type":"p","M":1.95,"cd":4,"qi":33}]},{"id":"DEF_EXP_013","nameTh":"ปราการค่ายกลโล่ประสานสามทัพ","descTh":"ปราการค่ายกลโล่ประสานสามทัพ","cat":"DEFENSIVE_TECHNIQUE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_SHARED_PHALANX_WALL","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_013_M1","nameTh":"กระบวนที่ 1 · ปราการค่ายกลโล่ประสานสามทัพ","arch":"guard","type":"p","M":1.95,"cd":4,"qi":33}]},{"id":"DEF_EXP_014","nameTh":"เคล็ดกายาไหลลื่นดั่งปรอทไร้จุดจับ","descTh":"เคล็ดกายาไหลลื่นดั่งปรอทไร้จุดจับ","cat":"DEFENSIVE_TECHNIQUE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_COTTON_BELLY_BOUNCE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_014_M1","nameTh":"กระบวนที่ 1 · เคล็ดกายาไหลลื่นดั่งปรอทไร้จ","arch":"guard","type":"p","M":1.95,"cd":4,"qi":33}]},{"id":"DEF_EXP_015","nameTh":"มหาวิชากระจกแปดเหลี่ยมหักเหอาคม","descTh":"มหาวิชากระจกแปดเหลี่ยมหักเหอาคม","cat":"DEFENSIVE_TECHNIQUE","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_PORCUPINE_BONE_SPUR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_015_M1","nameTh":"กระบวนที่ 1 · มหาวิชากระจกแปดเหลี่ยมหักเหอ","arch":"guard","type":"p","M":2.13,"cd":3,"qi":38}]},{"id":"DEF_EXP_016","nameTh":"มหาปราการกระดูกเพชรไม่หวั่นสายฟ้าทัณฑ์","descTh":"มหาปราการกระดูกเพชรไม่หวั่นสายฟ้าทัณฑ์","cat":"DEFENSIVE_TECHNIQUE","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_SHARED_PHALANX_WALL","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_016_M1","nameTh":"กระบวนที่ 1 · มหาปราการกระดูกเพชรไม่หวั่นส","arch":"guard","type":"p","M":2.13,"cd":3,"qi":38}]},{"id":"DEF_EXP_017","nameTh":"มหาวิชาหมื่นศาสตราไม่อาจแตะชายเสื้อ","descTh":"มหาวิชาหมื่นศาสตราไม่อาจแตะชายเสื้อ","cat":"DEFENSIVE_TECHNIQUE","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_COTTON_BELLY_BOUNCE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_017_M1","nameTh":"กระบวนที่ 1 · มหาวิชาหมื่นศาสตราไม่อาจแตะช","arch":"guard","type":"p","M":2.31,"cd":3,"qi":43}]},{"id":"DEF_EXP_018","nameTh":"มหาปราการเสาคํ้าสวรรค์พิทักษ์อาราม","descTh":"มหาปราการเสาคํ้าสวรรค์พิทักษ์อาราม","cat":"DEFENSIVE_TECHNIQUE","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"DKW_ZEN_SOUNDPROOF_BELL","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"COMBAT_DEFENSE","moveDefs":[{"id":"DEF_EXP_018_M1","nameTh":"กระบวนที่ 1 · มหาปราการเสาคํ้าสวรรค์พิทักษ","arch":"guard","type":"p","M":2.31,"cd":3,"qi":43}]},{"id":"SUP_EXP_001","nameTh":"วิชาพ่นเหล้าขาวชะล้างแผลสด","descTh":"วิชาพ่นเหล้าขาวชะล้างแผลสด","cat":"SUPPORT_TECHNIQUE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_LIFE_LOAN_NEEDLE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_001_M1","nameTh":"กระบวนที่ 1 · วิชาพ่นเหล้าขาวชะล้างแผลสด","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"SUP_EXP_002","nameTh":"เสียงขลุ่ยไม้ไผ่เรียกสติคนตื่นตระหนก","descTh":"เสียงขลุ่ยไม้ไผ่เรียกสติคนตื่นตระหนก","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_OVERHEAL_LOTUS_SHIELD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_002_M1","nameTh":"กระบวนที่ 1 · เสียงขลุ่ยไม้ไผ่เรียกสติคนตื","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_EXP_003","nameTh":"พลุกระบี่สัญญาณขอความช่วยเหลือฉุกเฉิน","descTh":"พลุกระบี่สัญญาณขอความช่วยเหลือฉุกเฉิน","cat":"SUPPORT_TECHNIQUE","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_DISTRESS_SWORD_FLARE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_003_M1","nameTh":"กระบวนที่ 1 · พลุกระบี่สัญญาณขอความช่วยเหล","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"SUP_EXP_004","nameTh":"เคล็ดซ่อมข้อต่อหุ่นและสมานแผลอสูรคู่ใจ","descTh":"เคล็ดซ่อมข้อต่อหุ่นและสมานแผลอสูรคู่ใจ","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":2,"path":"MECH_PUPPET","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_PUPPET_PET_FIELD_PATCH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_004_M1","nameTh":"กระบวนที่ 1 · เคล็ดซ่อมข้อต่อหุ่นและสมานแผ","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_EXP_005","nameTh":"เข็มเงินยืมพลังชีวิตต่อลมหายใจ","descTh":"เข็มเงินยืมพลังชีวิตต่อลมหายใจ","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_LIFE_LOAN_NEEDLE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_005_M1","nameTh":"กระบวนที่ 1 · เข็มเงินยืมพลังชีวิตต่อลมหาย","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_EXP_006","nameTh":"เคล็ดมุกหยกเก็บกักปราณสำรองยามว่าง","descTh":"เคล็ดมุกหยกเก็บกักปราณสำรองยามว่าง","cat":"SUPPORT_TECHNIQUE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_DISTRESS_SWORD_FLARE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_006_M1","nameTh":"กระบวนที่ 1 · เคล็ดมุกหยกเก็บกักปราณสำรองย","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"SUP_EXP_007","nameTh":"ค่ายกลธงห้าสีสลับแถวถอนคนเจ็บ","descTh":"ค่ายกลธงห้าสีสลับแถวถอนคนเจ็บ","cat":"SUPPORT_TECHNIQUE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_QIMEN_FOG_EXTRACTION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_007_M1","nameTh":"กระบวนที่ 1 · ค่ายกลธงห้าสีสลับแถวถอนคนเจ็","arch":"support","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"SUP_EXP_008","nameTh":"นํ้าอมฤตบัวขาวล้นถ้วยเป็นเกราะคุ้มกาย","descTh":"นํ้าอมฤตบัวขาวล้นถ้วยเป็นเกราะคุ้มกาย","cat":"SUPPORT_TECHNIQUE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_OVERHEAL_LOTUS_SHIELD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_008_M1","nameTh":"กระบวนที่ 1 · นํ้าอมฤตบัวขาวล้นถ้วยเป็นเกร","arch":"support","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"SUP_EXP_009","nameTh":"บทสวดบังสุกุลชำระซากสลายไอมรณะ","descTh":"บทสวดบังสุกุลชำระซากสลายไอมรณะ","cat":"SUPPORT_TECHNIQUE","tier":4,"reqTier":3,"path":"BUDDHA_DHARMA","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_CORPSE_PURIFY_REQUIEM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_009_M1","nameTh":"กระบวนที่ 1 · บทสวดบังสุกุลชำระซากสลายไอมร","arch":"support","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"SUP_EXP_010","nameTh":"กำยานเจ็ดบุปผาสลายมารในใจกลางศึก","descTh":"กำยานเจ็ดบุปผาสลายมารในใจกลางศึก","cat":"SUPPORT_TECHNIQUE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_QIMEN_FOG_EXTRACTION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_010_M1","nameTh":"กระบวนที่ 1 · กำยานเจ็ดบุปผาสลายมารในใจกลา","arch":"support","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"SUP_EXP_011","nameTh":"เข็มทองกระตุ้นจุดศักยภาพแฝงชั่วคราว","descTh":"เข็มทองกระตุ้นจุดศักยภาพแฝงชั่วคราว","cat":"SUPPORT_TECHNIQUE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_CORPSE_PURIFY_REQUIEM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_011_M1","nameTh":"กระบวนที่ 1 · เข็มทองกระตุ้นจุดศักยภาพแฝงช","arch":"support","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"SUP_EXP_012","nameTh":"ทำนองพิณสายฝนชะล้างพิษร้อนทั้งกองทัพ","descTh":"ทำนองพิณสายฝนชะล้างพิษร้อนทั้งกองทัพ","cat":"SUPPORT_TECHNIQUE","tier":5,"reqTier":4,"path":"SONIC_HARMONY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_DISTRESS_SWORD_FLARE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_012_M1","nameTh":"กระบวนที่ 1 · ทำนองพิณสายฝนชะล้างพิษร้อนทั","arch":"support","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"SUP_EXP_013","nameTh":"โองการกลองศึกสามรัวไม่ถอยแม้ก้าวเดียว","descTh":"โองการกลองศึกสามรัวไม่ถอยแม้ก้าวเดียว","cat":"SUPPORT_TECHNIQUE","tier":5,"reqTier":4,"path":"STRATEGY_GOVERNANCE","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_LIFE_LOAN_NEEDLE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_013_M1","nameTh":"กระบวนที่ 1 · โองการกลองศึกสามรัวไม่ถอยแม้","arch":"support","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"SUP_EXP_014","nameTh":"ม่านดาราชี้ช่องโหว่ประสานเป้าสังหาร","descTh":"ม่านดาราชี้ช่องโหว่ประสานเป้าสังหาร","cat":"SUPPORT_TECHNIQUE","tier":5,"reqTier":4,"path":"ASTRO_DIVINATION","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_OVERHEAL_LOTUS_SHIELD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_014_M1","nameTh":"กระบวนที่ 1 · ม่านดาราชี้ช่องโหว่ประสานเป้","arch":"support","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"SUP_EXP_015","nameTh":"มหาวิชาต่อเส้นเอ็นเชื่อมกระดูกกลางสมรภูมิ","descTh":"มหาวิชาต่อเส้นเอ็นเชื่อมกระดูกกลางสมรภูมิ","cat":"SUPPORT_TECHNIQUE","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_OVERHEAL_LOTUS_SHIELD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_015_M1","nameTh":"กระบวนที่ 1 · มหาวิชาต่อเส้นเอ็นเชื่อมกระด","arch":"support","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"SUP_EXP_016","nameTh":"มหาค่ายกลผูกชีพห้าธาตุหมุนเวียนไม่สิ้นสุด","descTh":"มหาค่ายกลผูกชีพห้าธาตุหมุนเวียนไม่สิ้นสุด","cat":"SUPPORT_TECHNIQUE","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_QIMEN_FOG_EXTRACTION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_016_M1","nameTh":"กระบวนที่ 1 · มหาค่ายกลผูกชีพห้าธาตุหมุนเว","arch":"support","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"SUP_EXP_017","nameTh":"มหาโคมวิญญาณเรียกขวัญคืนจากประตูผี","descTh":"มหาโคมวิญญาณเรียกขวัญคืนจากประตูผี","cat":"SUPPORT_TECHNIQUE","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_CORPSE_PURIFY_REQUIEM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_017_M1","nameTh":"กระบวนที่ 1 · มหาโคมวิญญาณเรียกขวัญคืนจากป","arch":"support","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"SUP_EXP_018","nameTh":"มหาสังคีตฟ้าดินสงบศึกชุบชูหมื่นชีวา","descTh":"มหาสังคีตฟ้าดินสงบศึกชุบชูหมื่นชีวา","cat":"SUPPORT_TECHNIQUE","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"SKW_DISTRESS_SWORD_FLARE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"HEAL_SUPPORT_TRAINING","moveDefs":[{"id":"SUP_EXP_018_M1","nameTh":"กระบวนที่ 1 · มหาสังคีตฟ้าดินสงบศึกชุบชูหม","arch":"support","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"AUX_EXP_001","nameTh":"ตำราแยกแยะเห็ดพิษและสมุนไพรแฝด","descTh":"ตำราแยกแยะเห็ดพิษและสมุนไพรแฝด","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_PILL_CLOUD_SEALER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_001_M1","nameTh":"กระบวนที่ 1 · ตำราแยกแยะเห็ดพิษและสมุนไพรแ","arch":"heal","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_EXP_002","nameTh":"เคล็ดก่อไฟสูบลมเตาถ่านสมํ่าเสมอ","descTh":"เคล็ดก่อไฟสูบลมเตาถ่านสมํ่าเสมอ","cat":"AUXILIARY_ART","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_SPIRIT_ANVIL_RESONANCE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_002_M1","nameTh":"กระบวนที่ 1 · เคล็ดก่อไฟสูบลมเตาถ่านสมํ่าเ","arch":"support","type":"m","M":1.23,"cd":6,"qi":13}]},{"id":"AUX_EXP_003","nameTh":"วิชาดูโหงวเฮ้งคัดศิษย์หน้าประตูเขา","descTh":"วิชาดูโหงวเฮ้งคัดศิษย์หน้าประตูเขา","cat":"AUXILIARY_ART","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_GARDEN_TOTEM_POLLINATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_003_M1","nameTh":"กระบวนที่ 1 · วิชาดูโหงวเฮ้งคัดศิษย์หน้าปร","arch":"heal","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_EXP_004","nameTh":"ยันต์หุ่นฟางไล่นกและหมูป่าเฝ้าแปลงนา","descTh":"ยันต์หุ่นฟางไล่นกและหมูป่าเฝ้าแปลงนา","cat":"AUXILIARY_ART","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_GARDEN_TOTEM_POLLINATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_004_M1","nameTh":"กระบวนที่ 1 · ยันต์หุ่นฟางไล่นกและหมูป่าเฝ","arch":"support","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"AUX_EXP_005","nameTh":"ศาสตร์เคาะหินฟังโพรงแร่ศิลาปราณ","descTh":"ศาสตร์เคาะหินฟังโพรงแร่ศิลาปราณ","cat":"AUXILIARY_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CARAVAN_CRYO_STASIS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_005_M1","nameTh":"กระบวนที่ 1 · ศาสตร์เคาะหินฟังโพรงแร่ศิลาป","arch":"heal","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_EXP_006","nameTh":"ตำราดองนํ้าแข็งผนึกลังเสบียงเดินทางไกล","descTh":"ตำราดองนํ้าแข็งผนึกลังเสบียงเดินทางไกล","cat":"AUXILIARY_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CARAVAN_CRYO_STASIS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_006_M1","nameTh":"กระบวนที่ 1 · ตำราดองนํ้าแข็งผนึกลังเสบียง","arch":"support","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_EXP_007","nameTh":"เคล็ดเกลาคำสอนถ่ายทอดวิชารุ่นสู่รุ่น","descTh":"เคล็ดเกลาคำสอนถ่ายทอดวิชารุ่นสู่รุ่น","cat":"AUXILIARY_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_PILL_CLOUD_SEALER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_007_M1","nameTh":"กระบวนที่ 1 · เคล็ดเกลาคำสอนถ่ายทอดวิชารุ่","arch":"heal","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"AUX_EXP_008","nameTh":"วิชาเป่าขลุ่ยเรียกผึ้งหยกผสมเกสรสมุนไพร","descTh":"วิชาเป่าขลุ่ยเรียกผึ้งหยกผสมเกสรสมุนไพร","cat":"AUXILIARY_ART","tier":4,"reqTier":3,"path":"SPIRIT_HUSBANDRY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_GARDEN_TOTEM_POLLINATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_008_M1","nameTh":"กระบวนที่ 1 · วิชาเป่าขลุ่ยเรียกผึ้งหยกผสม","arch":"support","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"AUX_EXP_009","nameTh":"ศาสตร์ชงชาส่องใจจับพิรุธขุนนางฉ้อฉล","descTh":"ศาสตร์ชงชาส่องใจจับพิรุธขุนนางฉ้อฉล","cat":"AUXILIARY_ART","tier":4,"reqTier":3,"path":"STRATEGY_GOVERNANCE","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CENSOR_TRUTH_MIRROR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_009_M1","nameTh":"กระบวนที่ 1 · ศาสตร์ชงชาส่องใจจับพิรุธขุนน","arch":"heal","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"AUX_EXP_010","nameTh":"เคล็ดนวดเส้นลมปราณฟื้นฟูสัตว์อสูรและเพาะพันธุ์","descTh":"เคล็ดนวดเส้นลมปราณฟื้นฟูสัตว์อสูรและเพาะพันธุ์","cat":"AUXILIARY_ART","tier":4,"reqTier":3,"path":"BEAST_SOVEREIGN","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CENSOR_TRUTH_MIRROR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_010_M1","nameTh":"กระบวนที่ 1 · เคล็ดนวดเส้นลมปราณฟื้นฟูสัตว","arch":"support","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"AUX_EXP_011","nameTh":"วิชาคัดลอกซ่อมแซมตำราขาดวิ่นโบราณ","descTh":"วิชาคัดลอกซ่อมแซมตำราขาดวิ่นโบราณ","cat":"AUXILIARY_ART","tier":4,"reqTier":3,"path":"LORE_ARCHIVIST","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CARAVAN_CRYO_STASIS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_011_M1","nameTh":"กระบวนที่ 1 · วิชาคัดลอกซ่อมแซมตำราขาดวิ่น","arch":"heal","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"AUX_EXP_012","nameTh":"มหาศาสตร์กางร่มปราณรับสายฟ้าแทนศิษย์รัก","descTh":"มหาศาสตร์กางร่มปราณรับสายฟ้าแทนศิษย์รัก","cat":"AUXILIARY_ART","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_TRIBULATION_LIGHTNING_ROD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_012_M1","nameTh":"กระบวนที่ 1 · มหาศาสตร์กางร่มปราณรับสายฟ้า","arch":"support","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"AUX_EXP_013","nameTh":"มหาเคล็ดควบแน่นเมฆาโอสถสกัดเม็ดยาคู่","descTh":"มหาเคล็ดควบแน่นเมฆาโอสถสกัดเม็ดยาคู่","cat":"AUXILIARY_ART","tier":5,"reqTier":4,"path":"CRAFT_CREATION","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_PILL_CLOUD_SEALER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_013_M1","nameTh":"กระบวนที่ 1 · มหาเคล็ดควบแน่นเมฆาโอสถสกัดเ","arch":"heal","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"AUX_EXP_014","nameTh":"มหาศาสตร์ตีเหล็กพับพันทบปลุกวิญญาณศาสตรา","descTh":"มหาศาสตร์ตีเหล็กพับพันทบปลุกวิญญาณศาสตรา","cat":"AUXILIARY_ART","tier":5,"reqTier":4,"path":"CRAFT_CREATION","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_SPIRIT_ANVIL_RESONANCE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_014_M1","nameTh":"กระบวนที่ 1 · มหาศาสตร์ตีเหล็กพับพันทบปลุก","arch":"support","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"AUX_EXP_015","nameTh":"มหาวิชาปรับฮวงจุ้ยเชื่อมเส้นชีพจรมังกรแปดยอดเขา","descTh":"มหาวิชาปรับฮวงจุ้ยเชื่อมเส้นชีพจรมังกรแปดยอดเขา","cat":"AUXILIARY_ART","tier":6,"reqTier":5,"path":"DRAGON_VEIN_GEOMANCY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_GARDEN_TOTEM_POLLINATION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_015_M1","nameTh":"กระบวนที่ 1 · มหาวิชาปรับฮวงจุ้ยเชื่อมเส้น","arch":"heal","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"AUX_EXP_016","nameTh":"มหาตำราการทูตเจ็ดลิ้นผูกพันธมิตรสิบเก้าสำนัก","descTh":"มหาตำราการทูตเจ็ดลิ้นผูกพันธมิตรสิบเก้าสำนัก","cat":"AUXILIARY_ART","tier":6,"reqTier":5,"path":"STRATEGY_GOVERNANCE","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CENSOR_TRUTH_MIRROR","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_016_M1","nameTh":"กระบวนที่ 1 · มหาตำราการทูตเจ็ดลิ้นผูกพันธ","arch":"support","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"AUX_EXP_017","nameTh":"มหาศาสตร์จำศีลเต่าหิมะยืดอายุขัยผู้เฒ่าเฝ้าหอ","descTh":"มหาศาสตร์จำศีลเต่าหิมะยืดอายุขัยผู้เฒ่าเฝ้าหอ","cat":"AUXILIARY_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_CARAVAN_CRYO_STASIS","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_017_M1","nameTh":"กระบวนที่ 1 · มหาศาสตร์จำศีลเต่าหิมะยืดอาย","arch":"heal","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"AUX_EXP_018","nameTh":"มหาคัมภีร์บูรณะอารามเนรมิตวิมานเซียน","descTh":"มหาคัมภีร์บูรณะอารามเนรมิตวิมานเซียน","cat":"AUXILIARY_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"AKW_TRIBULATION_LIGHTNING_ROD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"PROFESSION_LIFESTYLE","moveDefs":[{"id":"AUX_EXP_018_M1","nameTh":"กระบวนที่ 1 · มหาคัมภีร์บูรณะอารามเนรมิตวิ","arch":"support","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"FRB_EXP_001","nameTh":"วิชาฝืนเปิดจุดชีพจรย้อนกระแส","descTh":"วิชาฝืนเปิดจุดชีพจรย้อนกระแส","cat":"FORBIDDEN_ART","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_WHITE_HAIR_LIFESPAN_TORCH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_001_M1","nameTh":"กระบวนที่ 1 · วิชาฝืนเปิดจุดชีพจรย้อนกระแส","arch":"burst","type":"m","M":1.41,"cd":5,"qi":18}]},{"id":"FRB_EXP_002","nameTh":"เคล็ดเลี้ยงหนอนกู่โลหิตในหัวใจ","descTh":"เคล็ดเลี้ยงหนอนกู่โลหิตในหัวใจ","cat":"FORBIDDEN_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_MARTYR_LOTUS_FINAL_BLOOM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_002_M1","nameTh":"กระบวนที่ 1 · เคล็ดเลี้ยงหนอนกู่โลหิตในหัว","arch":"burst","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"FRB_EXP_003","nameTh":"วิชาเผาหยดเลือดแก่นแท้เร่งความเร็วสามเท่า","descTh":"วิชาเผาหยดเลือดแก่นแท้เร่งความเร็วสามเท่า","cat":"FORBIDDEN_ART","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_CORPSE_PUPPET_ARISEN","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_003_M1","nameTh":"กระบวนที่ 1 · วิชาเผาหยดเลือดแก่นแท้เร่งคว","arch":"burst","type":"m","M":1.59,"cd":5,"qi":23}]},{"id":"FRB_EXP_004","nameTh":"มนต์ปลุกโครงกระดูกทหารเก่าขึ้นรับศึก","descTh":"มนต์ปลุกโครงกระดูกทหารเก่าขึ้นรับศึก","cat":"FORBIDDEN_ART","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_CORPSE_PUPPET_ARISEN","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_004_M1","nameTh":"กระบวนที่ 1 · มนต์ปลุกโครงกระดูกทหารเก่าขึ","arch":"burst","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"FRB_EXP_005","nameTh":"เคล็ดสูบปราณคู่ต่อสู้เข้าตันเถียนตรงๆ","descTh":"เคล็ดสูบปราณคู่ต่อสู้เข้าตันเถียนตรงๆ","cat":"FORBIDDEN_ART","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_BLOOD_ESCAPE_RIFT","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_005_M1","nameTh":"กระบวนที่ 1 · เคล็ดสูบปราณคู่ต่อสู้เข้าตัน","arch":"burst","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"FRB_EXP_006","nameTh":"วิชาบังคับอสูรคู่สัญญาคลุ้มคลั่งเผาโลหิต","descTh":"วิชาบังคับอสูรคู่สัญญาคลุ้มคลั่งเผาโลหิต","cat":"FORBIDDEN_ART","tier":4,"reqTier":3,"path":"BEAST_SOVEREIGN","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_BORROW_TOMORROW_REALM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_006_M1","nameTh":"กระบวนที่ 1 · วิชาบังคับอสูรคู่สัญญาคลุ้มค","arch":"burst","type":"m","M":1.77,"cd":4,"qi":28}]},{"id":"FRB_EXP_007","nameTh":"เคล็ดตัดสายใยรักแลกคมกระบี่ไร้ใจ","descTh":"เคล็ดตัดสายใยรักแลกคมกระบี่ไร้ใจ","cat":"FORBIDDEN_ART","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_HEARTLESS_SEVER_EMOTION","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_007_M1","nameTh":"กระบวนที่ 1 · เคล็ดตัดสายใยรักแลกคมกระบี่ไ","arch":"burst","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"FRB_EXP_008","nameTh":"วิชาโลหิตฉีกมิติพาหมู่คณะหนีตาย","descTh":"วิชาโลหิตฉีกมิติพาหมู่คณะหนีตาย","cat":"FORBIDDEN_ART","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_BLOOD_ESCAPE_RIFT","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_008_M1","nameTh":"กระบวนที่ 1 · วิชาโลหิตฉีกมิติพาหมู่คณะหนี","arch":"burst","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"FRB_EXP_009","nameTh":"มหาเวทขโมยศรัทธาปั้นเทวรูปเทียม","descTh":"มหาเวทขโมยศรัทธาปั้นเทวรูปเทียม","cat":"FORBIDDEN_ART","tier":5,"reqTier":4,"path":"GOD","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_CORPSE_PUPPET_ARISEN","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_009_M1","nameTh":"กระบวนที่ 1 · มหาเวทขโมยศรัทธาปั้นเทวรูปเท","arch":"burst","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"FRB_EXP_010","nameTh":"มหาวิชาผมขาวชั่วข้ามคืนเผาอายุขัยผ่าฟ้า","descTh":"มหาวิชาผมขาวชั่วข้ามคืนเผาอายุขัยผ่าฟ้า","cat":"FORBIDDEN_ART","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_WHITE_HAIR_LIFESPAN_TORCH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_010_M1","nameTh":"กระบวนที่ 1 · มหาวิชาผมขาวชั่วข้ามคืนเผาอา","arch":"burst","type":"m","M":1.95,"cd":4,"qi":33}]},{"id":"FRB_EXP_011","nameTh":"มหาเคล็ดยืมตบะวันพรุ่งฝืนก้าวข้ามขั้น","descTh":"มหาเคล็ดยืมตบะวันพรุ่งฝืนก้าวข้ามขั้น","cat":"FORBIDDEN_ART","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_BORROW_TOMORROW_REALM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_011_M1","nameTh":"กระบวนที่ 1 · มหาเคล็ดยืมตบะวันพรุ่งฝืนก้า","arch":"burst","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"FRB_EXP_012","nameTh":"มหาอาคมชักใยกองทัพหุ่นศพพันนาย","descTh":"มหาอาคมชักใยกองทัพหุ่นศพพันนาย","cat":"FORBIDDEN_ART","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_CORPSE_PUPPET_ARISEN","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_012_M1","nameTh":"กระบวนที่ 1 · มหาอาคมชักใยกองทัพหุ่นศพพันน","arch":"burst","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"FRB_EXP_013","nameTh":"มหาวิชาบดขยี้จุดตันเถียนรองระเบิดปราณ","descTh":"มหาวิชาบดขยี้จุดตันเถียนรองระเบิดปราณ","cat":"FORBIDDEN_ART","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_WHITE_HAIR_LIFESPAN_TORCH","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_013_M1","nameTh":"กระบวนที่ 1 · มหาวิชาบดขยี้จุดตันเถียนรองร","arch":"burst","type":"m","M":2.13,"cd":3,"qi":38}]},{"id":"FRB_EXP_014","nameTh":"มหาคัมภีร์กลืนกินสายฟ้าทัณฑ์สวรรค์ดิบ","descTh":"มหาคัมภีร์กลืนกินสายฟ้าทัณฑ์สวรรค์ดิบ","cat":"FORBIDDEN_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_MARTYR_LOTUS_FINAL_BLOOM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_014_M1","nameTh":"กระบวนที่ 1 · มหาคัมภีร์กลืนกินสายฟ้าทัณฑ์","arch":"burst","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"FRB_EXP_015","nameTh":"มหาวัฏจักรดูดกลืนวิญญาณเก้าอเวจี","descTh":"มหาวัฏจักรดูดกลืนวิญญาณเก้าอเวจี","cat":"FORBIDDEN_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_CORPSE_PUPPET_ARISEN","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_015_M1","nameTh":"กระบวนที่ 1 · มหาวัฏจักรดูดกลืนวิญญาณเก้าอ","arch":"burst","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"FRB_EXP_016","nameTh":"มหาปณิธานบัวโลหิตสละชีพคํ้าจุนอาราม","descTh":"มหาปณิธานบัวโลหิตสละชีพคํ้าจุนอาราม","cat":"FORBIDDEN_ART","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"FKW_MARTYR_LOTUS_FINAL_BLOOM","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"role":"TABOO_OVERDRIVE","moveDefs":[{"id":"FRB_EXP_016_M1","nameTh":"กระบวนที่ 1 · มหาปณิธานบัวโลหิตสละชีพคํ้าจ","arch":"burst","type":"m","M":2.31,"cd":3,"qi":43}]},{"id":"PAS_EXP_001","nameTh":"กระเพาะเหล็กทหารเลวทนอดอยาก","descTh":"กระเพาะเหล็กทหารเลวทนอดอยาก","cat":"PASSIVE","tier":1,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Common","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BROKEN_BLADE_IMPROVISER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.025,"defPct":0.03,"hpMaxPct":0.035,"qiRecPct":0.04}},{"id":"PAS_EXP_002","nameTh":"สายตาพ่อค้าเก่าประเมินค่าของแม่นยำ","descTh":"สายตาพ่อค้าเก่าประเมินค่าของแม่นยำ","cat":"PASSIVE","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_POISON_SOAKED_PHARMACIST","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_EXP_003","nameTh":"มือนิ่งช่างเจียระไนไม่ทำวัตถุดิบแตก","descTh":"มือนิ่งช่างเจียระไนไม่ทำวัตถุดิบแตก","cat":"PASSIVE","tier":2,"reqTier":1,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Refined","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_SENIOR_BROTHER_SPINE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.05,"defPct":0.06,"hpMaxPct":0.07,"qiRecPct":0.08}},{"id":"PAS_EXP_004","nameTh":"กายาหมอยาชิมพิษร้อยสมุนไพร","descTh":"กายาหมอยาชิมพิษร้อยสมุนไพร","cat":"PASSIVE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_POISON_SOAKED_PHARMACIST","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_EXP_005","nameTh":"แผ่นหลังศิษย์พี่ใหญ่คุ้มครองรุ่นน้อง","descTh":"แผ่นหลังศิษย์พี่ใหญ่คุ้มครองรุ่นน้อง","cat":"PASSIVE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_SENIOR_BROTHER_SPINE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_EXP_006","nameTh":"คมดาบหักในมือยังไร้เทียมทาน","descTh":"คมดาบหักในมือยังไร้เทียมทาน","cat":"PASSIVE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BROKEN_BLADE_IMPROVISER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_EXP_007","nameTh":"สัญชาตญาณนักล่าสมบัติเห็นทางลับ","descTh":"สัญชาตญาณนักล่าสมบัติเห็นทางลับ","cat":"PASSIVE","tier":3,"reqTier":2,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BROKEN_BLADE_IMPROVISER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.075,"defPct":0.09,"hpMaxPct":0.105,"qiRecPct":0.12}},{"id":"PAS_EXP_008","nameTh":"สองมือวาดกลมเหลี่ยมร่ายวิชามือซ้ายขวา","descTh":"สองมือวาดกลมเหลี่ยมร่ายวิชามือซ้ายขวา","cat":"PASSIVE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_LEFT_RIGHT_MUTUAL_MIND","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.1,"defPct":0.12,"hpMaxPct":0.14,"qiRecPct":0.16}},{"id":"PAS_EXP_009","nameTh":"ยิ่งดวลกับผู้สูงส่งยิ่งบรรลุเร็ว","descTh":"ยิ่งดวลกับผู้สูงส่งยิ่งบรรลุเร็ว","cat":"PASSIVE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BATTLE_EPIPHANY_MIMIC","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.1,"defPct":0.12,"hpMaxPct":0.14,"qiRecPct":0.16}},{"id":"PAS_EXP_010","nameTh":"เงาจันทร์พรางสังหารนัดแรกปลิดชีพ","descTh":"เงาจันทร์พรางสังหารนัดแรกปลิดชีพ","cat":"PASSIVE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_LEFT_RIGHT_MUTUAL_MIND","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.1,"defPct":0.12,"hpMaxPct":0.14,"qiRecPct":0.16}},{"id":"PAS_EXP_011","nameTh":"หัตถ์เทวดาฝังเข็มไม่เปลืองโอสถ","descTh":"หัตถ์เทวดาฝังเข็มไม่เปลืองโอสถ","cat":"PASSIVE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"NEUTRAL","elementProfile":{"mode":"EXPLICIT_NON_ELEMENTAL","primary":"NEUTRAL","weights":{}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_TEN_YEARS_ONE_SWORD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.1,"defPct":0.12,"hpMaxPct":0.14,"qiRecPct":0.16}},{"id":"PAS_EXP_012","nameTh":"จิตปราชญ์อ่านทะลุค่ายกลโบราณ","descTh":"จิตปราชญ์อ่านทะลุค่ายกลโบราณ","cat":"PASSIVE","tier":4,"reqTier":3,"path":"ANY","sub":"NONE","power":24,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Rare","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BATTLE_EPIPHANY_MIMIC","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.1,"defPct":0.12,"hpMaxPct":0.14,"qiRecPct":0.16}},{"id":"PAS_EXP_013","nameTh":"สิบปีลับหนึ่งกระบี่รอวันชักออกจากฝัก","descTh":"สิบปีลับหนึ่งกระบี่รอวันชักออกจากฝัก","cat":"PASSIVE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_TEN_YEARS_ONE_SWORD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.125,"defPct":0.15,"hpMaxPct":0.175,"qiRecPct":0.2}},{"id":"PAS_EXP_014","nameTh":"ชีพจรเต่ามังกรฟื้นเลือดทุกจังหวะหายใจ","descTh":"ชีพจรเต่ามังกรฟื้นเลือดทุกจังหวะหายใจ","cat":"PASSIVE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_POISON_SOAKED_PHARMACIST","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.125,"defPct":0.15,"hpMaxPct":0.175,"qiRecPct":0.2}},{"id":"PAS_EXP_015","nameTh":"จิตสังหารสะกดสัตว์อสูรไม่กล้าสบตา","descTh":"จิตสังหารสะกดสัตว์อสูรไม่กล้าสบตา","cat":"PASSIVE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_SENIOR_BROTHER_SPINE","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.125,"defPct":0.15,"hpMaxPct":0.175,"qiRecPct":0.2}},{"id":"PAS_EXP_016","nameTh":"เนตรอ่านกระแสธาตุผสานปฏิกิริยา","descTh":"เนตรอ่านกระแสธาตุผสานปฏิกิริยา","cat":"PASSIVE","tier":5,"reqTier":4,"path":"ANY","sub":"NONE","power":24,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_LEFT_RIGHT_MUTUAL_MIND","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.125,"defPct":0.15,"hpMaxPct":0.175,"qiRecPct":0.2}},{"id":"PAS_EXP_017","nameTh":"เตายุทธ์ในอกไม่กลัวไฟพิภพและเหมันต์","descTh":"เตายุทธ์ในอกไม่กลัวไฟพิภพและเหมันต์","cat":"PASSIVE","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_TEN_YEARS_ONE_SWORD","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.15,"defPct":0.18,"hpMaxPct":0.21,"qiRecPct":0.24}},{"id":"PAS_EXP_018","nameTh":"ก้าวพ้นเงาพญายมหลบคมประหาร","descTh":"ก้าวพ้นเงาพญายมหลบคมประหาร","cat":"PASSIVE","tier":6,"reqTier":5,"path":"ANY","sub":"NONE","power":24,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Exceptional","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BATTLE_EPIPHANY_MIMIC","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.15,"defPct":0.18,"hpMaxPct":0.21,"qiRecPct":0.24}},{"id":"PAS_EXP_019","nameTh":"มหากายาไม่แปดเปื้อนกรรมและคำสาป","descTh":"มหากายาไม่แปดเปื้อนกรรมและคำสาป","cat":"PASSIVE","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_BROKEN_BLADE_IMPROVISER","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.175,"defPct":0.21,"hpMaxPct":0.245,"qiRecPct":0.28}},{"id":"PAS_EXP_020","nameTh":"มหาเจตจำนงปรมาจารย์ยืนหยัดคนสุดท้าย","descTh":"มหาเจตจำนงปรมาจารย์ยืนหยัดคนสุดท้าย","cat":"PASSIVE","tier":7,"reqTier":6,"path":"ANY","sub":"NONE","power":24,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Legendary","isLowTierFolkArt":false,"isExpansionNonCombatArt":true,"carbonKeyword":"PKW_POISON_SOAKED_PHARMACIST","obtainSources":["SECT_LIBRARY","EXPEDITION_RELIC","VISITOR_EXCHANGE"],"passive":{"atkPct":0.175,"defPct":0.21,"hpMaxPct":0.245,"qiRecPct":0.28}}];
  JD.TECH.midHighNonCombatArts = [].concat(JD.TECH.midHighMantras, JD.TECH.midHighNonCombatOnly);

  JD.TECH.sovereignCombatArts = [{"id":"TCMB_SOV_01_NAMELESS_ZERO_RETURN","shortId":"TCMB_SOV_01","nameTh":"กระบวนท่าไร้ชื่อคืนสู่ศูนย์","descTh":"มหาวิชาต่อสู้เหนือตำนานแห่งบรรพชนไร้ลักษณ์ ตัดทอนทุกกระบวนท่าของศัตรูกลับสู่ความว่างเปล่าปฐมกาล รองรับศาสตราทุกตระกูลและมือเปล่า","cat":"COMBAT_TECHNIQUE","role":"SOVEREIGN_COMBAT","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":185,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_WEIGHTED","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1,"NEUTRAL":0}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"weaponTypes":["ALL","UNARMED"],"carbonKeyword":"KW_TCMB_REALM_DEFIANCE","sovereignKeywords":["KW_TCMB_REALM_DEFIANCE","KW_TCMB_UNBROKEN_FLOW","KW_TCMB_WEAPON_OMNI_FORM","KW_TCMB_AUTHORED_SOUL_VERSE","KW_TCMB_SCAR_DETONATOR"],"scarKind":"SCAR_VOID_ZERO_RIFT","awakeningGate":"GATE_ANCESTRAL_SHRINE_RESONANCE","verses":[{"verse":1,"id":"TCMB_SOV_01_V1","nameTh":"บทที่ 1 · ไร้ลักษณ์แรกเริ่ม","arch":"strike","type":"p","M":2.45,"cd":2,"qi":28,"descTh":"ตัดกระแสปราณเกราะป้องกันและเปิดจังหวะต่อเนื่อง"},{"verse":2,"id":"TCMB_SOV_01_V2","nameTh":"บทที่ 2 · สะบั้นพันธะหมื่นธรรม","arch":"pierce","type":"p","M":2.95,"cd":3,"qi":34,"descTh":"แทงทะลุจุดอ่อนปราณและฝังรอยแผลเต๋าสุญตา"},{"verse":3,"id":"TCMB_SOV_01_V3","nameTh":"บทที่ 3 · คืนสู่ความว่างเปล่าไร้จุดจบ","arch":"burst","type":"m","M":3.85,"cd":4,"qi":45,"descTh":"จุดระเบิดรอยแผลเต๋าและลบล้างบัฟศัตรูทั้งแถว"}],"moveDefs":[{"id":"TCMB_SOV_01_V1","nameTh":"บทที่ 1 · ไร้ลักษณ์แรกเริ่ม","arch":"strike","type":"p","M":2.45,"cd":2,"qi":28},{"id":"TCMB_SOV_01_V2","nameTh":"บทที่ 2 · สะบั้นพันธะหมื่นธรรม","arch":"pierce","type":"p","M":2.95,"cd":3,"qi":34},{"id":"TCMB_SOV_01_V3","nameTh":"บทที่ 3 · คืนสู่ความว่างเปล่าไร้จุดจบ","arch":"burst","type":"m","M":3.85,"cd":4,"qi":45}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TCMB_SOV_02_NINE_HEAVENS_SHATTERING_FIST","shortId":"TCMB_SOV_02","nameTh":"หมัดทลายเก้าชั้นฟ้าสะท้านม่านภพ","descTh":"มหาวิชาศึกสายกายาและปราณราชันย์ดุดัน ทุบทำลายม่านปราการและบดขยี้แรงกดดันขอบเขตของศัตรูที่อยู่ขั้นสูงกว่า","cat":"COMBAT_TECHNIQUE","role":"SOVEREIGN_COMBAT","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":190,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_WEIGHTED","primary":"EARTH_METAL","weights":{"EARTH_METAL":1,"LIGHTNING":0}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"weaponTypes":["ALL","UNARMED"],"carbonKeyword":"KW_TCMB_SCAR_DETONATOR","sovereignKeywords":["KW_TCMB_REALM_DEFIANCE","KW_TCMB_SCAR_DETONATOR","KW_TCMB_UNBROKEN_FLOW"],"scarKind":"SCAR_TECTONIC_GRAVITY_WELL","awakeningGate":"GATE_TRIBULATION_SURVIVAL","verses":[{"verse":1,"id":"TCMB_SOV_02_V1","nameTh":"บทที่ 1 · ก้าวสั่นสะเทือนขุนเขา","arch":"sweep","type":"p","M":2.5,"cd":2,"qi":30,"descTh":"กระแทกคลื่นแรงโน้มถ่วงดึงศัตรูเข้าสู่จุดศูนย์กลาง"},{"verse":2,"id":"TCMB_SOV_02_V2","nameTh":"บทที่ 2 · หมัดแยกผืนพิภพ","arch":"crush","type":"p","M":3.1,"cd":3,"qi":36,"descTh":"ทะลวงเกราะหนักและสร้างหลุมแรงดึงดูดปฐพี"},{"verse":3,"id":"TCMB_SOV_02_V3","nameTh":"บทที่ 3 · ทลายเก้าชั้นฟ้าไร้พ่าย","arch":"burst","type":"p","M":3.95,"cd":4,"qi":48,"descTh":"ระเบิดรอยแยกธรณีสร้างความเสียหายจริงตามค่าป้องกัน"}],"moveDefs":[{"id":"TCMB_SOV_02_V1","nameTh":"บทที่ 1 · ก้าวสั่นสะเทือนขุนเขา","arch":"sweep","type":"p","M":2.5,"cd":2,"qi":30},{"id":"TCMB_SOV_02_V2","nameTh":"บทที่ 2 · หมัดแยกผืนพิภพ","arch":"strike","type":"p","M":3.1,"cd":3,"qi":36},{"id":"TCMB_SOV_02_V3","nameTh":"บทที่ 3 · ทลายเก้าชั้นฟ้าไร้พ่าย","arch":"burst","type":"p","M":3.95,"cd":4,"qi":48}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","TRIBULATION_EPIPHANY"]},{"id":"TCMB_SOV_03_MYRIAD_THREADS_CAUSAL_DANCE","shortId":"TCMB_SOV_03","nameTh":"ระบำหมื่นเส้นด้ายชักใยชะตาภพ","descTh":"มหาวิชาเส้นด้ายเหตุผลและค่ายกลสังสารวัฏ ถักทอสายใยเชื่อมความเสียหายศัตรูและสะท้อนชะตากรรม","cat":"COMBAT_TECHNIQUE","role":"SOVEREIGN_COMBAT","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":182,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_WEIGHTED","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1,"ASTRAL_VOID":0}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"weaponTypes":["ALL","UNARMED"],"carbonKeyword":"KW_TCMB_UNBROKEN_FLOW","sovereignKeywords":["KW_TCMB_UNBROKEN_FLOW","KW_TCMB_WEAPON_OMNI_FORM","KW_TCMB_AUTHORED_SOUL_VERSE"],"scarKind":"SCAR_KARMIC_SILK_WEB","awakeningGate":"GATE_APEX_NEMESIS_DUEL","verses":[{"verse":1,"id":"TCMB_SOV_03_V1","nameTh":"บทที่ 1 · ร้อยด้ายผูกเงา","arch":"control","type":"m","M":2.35,"cd":2,"qi":28,"descTh":"ผูกสายใยชะตาเชื่อมศัตรูแนวหน้าและแนวหลัง"},{"verse":2,"id":"TCMB_SOV_03_V2","nameTh":"บทที่ 2 · กงล้อด้ายสังสารวัฏ","arch":"flurry","type":"m","M":2.9,"cd":3,"qi":35,"descTh":"กรีดเส้นด้ายปราณหลายจังหวะและดูดความเร็วร่าย"},{"verse":3,"id":"TCMB_SOV_03_V3","nameTh":"บทที่ 3 · ตัดขาดเส้นด้ายชะตาฟ้า","arch":"burst","type":"m","M":3.8,"cd":4,"qi":44,"descTh":"กระชากเส้นด้ายกรรมระเบิดความเสียหายประสานทั้งสนาม"}],"moveDefs":[{"id":"TCMB_SOV_03_V1","nameTh":"บทที่ 1 · ร้อยด้ายผูกเงา","arch":"control","type":"m","M":2.35,"cd":2,"qi":28},{"id":"TCMB_SOV_03_V2","nameTh":"บทที่ 2 · กงล้อด้ายสังสารวัฏ","arch":"flurry","type":"m","M":2.9,"cd":3,"qi":35},{"id":"TCMB_SOV_03_V3","nameTh":"บทที่ 3 · ตัดขาดเส้นด้ายชะตาฟ้า","arch":"burst","type":"m","M":3.8,"cd":4,"qi":44}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","NEMESIS_CONQUEST"]},{"id":"TCMB_SOV_04_PHANTOM_SEVEN_BLINKS_ECLIPSE","shortId":"TCMB_SOV_04","nameTh":"เจ็ดก้าวสุริยคราสดับเงาไร้ร่องรอย","descTh":"มหาวิชาสังหารพริบตาผ่านรอยแยกเงาสุริยคราส ข้ามแถวหน้าเข้าประชิดจุดตายพร้อมตัดจังหวะร่ายของศัตรูทันที","cat":"COMBAT_TECHNIQUE","role":"SOVEREIGN_COMBAT","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":188,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_WEIGHTED","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1,"WIND":0}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"weaponTypes":["ALL","UNARMED"],"carbonKeyword":"KW_TCMB_WEAPON_OMNI_FORM","sovereignKeywords":["KW_TCMB_WEAPON_OMNI_FORM","KW_TCMB_REALM_DEFIANCE","KW_TCMB_SCAR_DETONATOR"],"scarKind":"SCAR_ECLIPSE_SHADOW_MIRROR","awakeningGate":"GATE_APEX_NEMESIS_DUEL","verses":[{"verse":1,"id":"TCMB_SOV_04_V1","nameTh":"บทที่ 1 · ก้าวเร้นเงาจันทร์ดับ","arch":"pierce","type":"p","M":2.55,"cd":2,"qi":28,"descTh":"พริบตาข้ามแนวป้องกันเข้าจู่โจมจุดสำคัญ"},{"verse":2,"id":"TCMB_SOV_04_V2","nameTh":"บทที่ 2 · เจ็ดเงาสะท้อนคมสังหาร","arch":"flurry","type":"p","M":3.05,"cd":3,"qi":35,"descTh":"ร่างเงาเจ็ดทิศประสานคมอาวุธพร้อมกัน"},{"verse":3,"id":"TCMB_SOV_04_V3","nameTh":"บทที่ 3 · สุริยคราสกลืนแสงนิรันดร์","arch":"burst","type":"p","M":3.9,"cd":4,"qi":46,"descTh":"ปิดม่านสุริยคราสสังหารและรีเซ็ตคูลดาวน์เมื่อโค่นเป้าหมาย"}],"moveDefs":[{"id":"TCMB_SOV_04_V1","nameTh":"บทที่ 1 · ก้าวเร้นเงาจันทร์ดับ","arch":"pierce","type":"p","M":2.55,"cd":2,"qi":28},{"id":"TCMB_SOV_04_V2","nameTh":"บทที่ 2 · เจ็ดเงาสะท้อนคมสังหาร","arch":"flurry","type":"p","M":3.05,"cd":3,"qi":35},{"id":"TCMB_SOV_04_V3","nameTh":"บทที่ 3 · สุริยคราสกลืนแสงนิรันดร์","arch":"burst","type":"p","M":3.9,"cd":4,"qi":46}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","NEMESIS_CONQUEST"]},{"id":"TCMB_SOV_05_HARMONIC_MERCY_WRATH_SEAL","shortId":"TCMB_SOV_05","nameTh":"มุทราทวิลักษณ์เมตตาพิโรธ","descTh":"มหาวิชามุทราทวิลักษณ์แห่งโพธิสัตว์และวัชรปาณี ฟื้นฟูสหายร่วมรบพร้อมสะท้อนโทสะวัชระใส่ผู้รุกราน","cat":"COMBAT_TECHNIQUE","role":"SOVEREIGN_COMBAT","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":184,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_WEIGHTED","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1,"WOOD_LIFE":0}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"weaponTypes":["ALL","UNARMED"],"carbonKeyword":"KW_TCMB_AUTHORED_SOUL_VERSE","sovereignKeywords":["KW_TCMB_AUTHORED_SOUL_VERSE","KW_TCMB_UNBROKEN_FLOW","KW_TCMB_REALM_DEFIANCE"],"scarKind":"SCAR_GOLDEN_LOTUS_SANCTUARY","awakeningGate":"GATE_ANCESTRAL_SHRINE_RESONANCE","verses":[{"verse":1,"id":"TCMB_SOV_05_V1","nameTh":"บทที่ 1 · หัตถ์เมตตาบงกชทอง","arch":"strike","type":"m","M":2.4,"cd":2,"qi":28,"descTh":"โจมตีด้วยรัศมีธรรมพร้อมฟื้นฟูพลังชีวิตสหายที่บาดเจ็บสุด"},{"verse":2,"id":"TCMB_SOV_05_V2","nameTh":"บทที่ 2 · เนตรวัชระสยบมาร","arch":"counter","type":"m","M":2.95,"cd":3,"qi":34,"descTh":"สะท้อนแรงโจมตีและชำระล้างสถานะผิดปกติ"},{"verse":3,"id":"TCMB_SOV_05_V3","nameTh":"บทที่ 3 · มหาอาณาจักรเมตตาพิโรธ","arch":"burst","type":"m","M":3.75,"cd":4,"qi":44,"descTh":"ปลดปล่อยมุทราคู่พิพากษาศัตรูและกางเกราะคุ้มครองทั้งทีม"}],"moveDefs":[{"id":"TCMB_SOV_05_V1","nameTh":"บทที่ 1 · หัตถ์เมตตาบงกชทอง","arch":"strike","type":"m","M":2.4,"cd":2,"qi":28},{"id":"TCMB_SOV_05_V2","nameTh":"บทที่ 2 · เนตรวัชระสยบมาร","arch":"counter","type":"m","M":2.95,"cd":3,"qi":34},{"id":"TCMB_SOV_05_V3","nameTh":"บทที่ 3 · มหาอาณาจักรเมตตาพิโรธ","arch":"burst","type":"m","M":3.75,"cd":4,"qi":44}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TCMB_SOV_06_PRIMORDIAL_FOUR_ELEMENTS_CATACLYSM","shortId":"TCMB_SOV_06","nameTh":"มหาวิบัติสี่ธาตุหลอมคืนปฐมกาล","descTh":"มหาวิชาหลอมรวมดิน น้ำ ลม ไฟ คืนสู่เพลิงโกลาหลปฐมกาล จุดปฏิกิริยาธาตุซ้อนทับโดยไม่สนความต้านทานธาตุ","cat":"COMBAT_TECHNIQUE","role":"SOVEREIGN_COMBAT","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":192,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_WEIGHTED","primary":"FIRE","weights":{"FIRE":1,"WATER_ICE":0}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"weaponTypes":["ALL","UNARMED"],"carbonKeyword":"KW_TCMB_SCAR_DETONATOR","sovereignKeywords":["KW_TCMB_SCAR_DETONATOR","KW_TCMB_REALM_DEFIANCE","KW_TCMB_AUTHORED_SOUL_VERSE"],"scarKind":"SCAR_PRIMORDIAL_CHAOS_CAULDRON","awakeningGate":"GATE_TRIBULATION_SURVIVAL","verses":[{"verse":1,"id":"TCMB_SOV_06_V1","nameTh":"บทที่ 1 · อัคคีเหมันต์หมุนวน","arch":"sweep","type":"m","M":2.48,"cd":2,"qi":30,"descTh":"ประทับตราเพลิงและน้ำแข็งพร้อมกันในคราเดียว"},{"verse":2,"id":"TCMB_SOV_06_V2","nameTh":"บทที่ 2 · วายุอัสนีผ่าปฐพี","arch":"flurry","type":"m","M":3.08,"cd":3,"qi":36,"descTh":"เร่งปฏิกิริยาธาตุสี่ทิศและฉีกเกราะเวท"},{"verse":3,"id":"TCMB_SOV_06_V3","nameTh":"บทที่ 3 · หลอมสี่ธาตุคืนสู่โกลาหล","arch":"burst","type":"m","M":4,"cd":4,"qi":50,"descTh":"ยุบตัวสี่ธาตุเป็นเตาหลอมปฐมกาลเผาผลาญทั้งสนามรบ"}],"moveDefs":[{"id":"TCMB_SOV_06_V1","nameTh":"บทที่ 1 · อัคคีเหมันต์หมุนวน","arch":"sweep","type":"m","M":2.48,"cd":2,"qi":30},{"id":"TCMB_SOV_06_V2","nameTh":"บทที่ 2 · วายุอัสนีผ่าปฐพี","arch":"flurry","type":"m","M":3.08,"cd":3,"qi":36},{"id":"TCMB_SOV_06_V3","nameTh":"บทที่ 3 · หลอมสี่ธาตุคืนสู่โกลาหล","arch":"burst","type":"m","M":4,"cd":4,"qi":50}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","TRIBULATION_EPIPHANY"]}];
  JD.TECH.sovereignMantras = [{"id":"TMNT_SOV_01_PRIMORDIAL_INNER_UNIVERSE","shortId":"TMNT_SOV_01","nameTh":"มหาคัมภีร์จักรวาลภายในปฐมกาล","descTh":"เปลี่ยนตันเถียนให้เป็นจักรวาลจำลองที่ผลิตปราณเองอย่างอิสระแม้ไร้ชีพจรวิญญาณภายนอก และไม่ได้รับผลกระทบจากสภาพอากาศเลวร้าย","cat":"QI_MANTRA","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TMNT_SELF_CONTAINED_STAR","mantraBonus":{"qiMaxPct":0.45,"cultRatePct":0.38,"mdefPct":0.28,"tribulationResist":0.18},"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TMNT_SOV_02_ETERNAL_MOLTING_OUROBOROS","shortId":"TMNT_SOV_02","nameTh":"มหาคัมภีร์เก้าผลัดคราบนิรันดร์ย้อนวัย","descTh":"ผลัดสังขารย้อนวัยและเปลี่ยนความเสื่อมชราเป็นรากฐานตบะบริสุทธิ์ ยืดอายุขัยและฟื้นฟูบาดแผลเรื้อรัง","cat":"QI_MANTRA","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":178,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TMNT_REJUVENATION_MOLT","mantraBonus":{"qiMaxPct":0.38,"cultRatePct":0.34,"lifespanBonusYears":120,"hpRegenPct":0.25},"obtainSources":["SOVEREIGN_AWAKENING_GATE","LONGEVITY_CRUCIBLE"]},{"id":"TMNT_SOV_03_UNMOVING_HEART_MIRROR_SUTRA","shortId":"TMNT_SOV_03","nameTh":"มหาคัมภีร์กระจกจิตว่างเปล่าสะท้อนหมื่นกฎ","descTh":"จิตใสประดุจกระจกสุญตา ป้องกันมารในใจสมบูรณ์และสะท้อนการโจมตีทางจิตวิญญาณกลับสู่ผู้ร่าย","cat":"QI_MANTRA","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":176,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TMNT_VOID_MIND_REFLECT","mantraBonus":{"qiMaxPct":0.4,"cultRatePct":0.35,"mdefPct":0.35,"heartDemonImmune":true},"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TMNT_SOV_04_MYRIAD_LAWS_DEVOURING_CRUCIBLE","shortId":"TMNT_SOV_04","nameTh":"มหาคัมภีร์เตาหลอมกลืนกินหมื่นวิถี","descTh":"ย่อยสลายพิษโอสถ คำสาป และปราณต่างสายให้กลายเป็นปราณต้นกำเนิดบริสุทธิ์","cat":"QI_MANTRA","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":182,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TMNT_OMNI_DIGESTION","mantraBonus":{"qiMaxPct":0.44,"cultRatePct":0.36,"pillToxicityZero":true},"obtainSources":["SOVEREIGN_AWAKENING_GATE","ALCHEMY_CRUCIBLE"]},{"id":"TMNT_SOV_05_MORTAL_SPINE_UNBOWED_HEART","shortId":"TMNT_SOV_05","nameTh":"มหาคัมภีร์หัวใจเหล็กไหลไร้ปราณสยบเซียน","descTh":"จังหวะหัวใจปุถุชนผู้ไม่ก้มหัวให้สวรรค์ รองรับทั้งผู้ไร้ปราณและผู้ฝึกกายา เปลี่ยนแรงกดดันขอบเขตเป็นพลังโจมตี","cat":"QI_MANTRA","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":184,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TMNT_GODSLAYER_HEARTBEAT","mantraBonus":{"qiMaxPct":0.35,"cultRatePct":0.35,"atkPct":0.25,"defPct":0.25},"obtainSources":["SOVEREIGN_AWAKENING_GATE","TRIBULATION_EPIPHANY"]}];
  JD.TECH.sovereignNonCombatArts = [{"id":"TQGG_SOV_01_SHRINKING_CONTINENT_ONE_STEP","shortId":"TQGG_SOV_01","nameTh":"มหาย่างก้าวย่อแผ่นดินในหนึ่งก้าว","descTh":"สุดยอดวิชาตัวเบาเหนือตำนานแห่งโลกเบื้องล่าง บีบอัดระยะก้าวบนผืนดินและปราณลมใต้ฝ่าเท้าให้ประชิดหรือถอนตัวข้ามสนามรบในพริบตา โดยยังคงอยู่ในกรอบกฎมิติของอนุทวีป","cat":"LIGHTNESS_ART","role":"MOVEMENT_STEALTH_RECON","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TQGG_METEOR_LANDING","moveDefs":[{"id":"TQGG_SOV_01_M1","nameTh":"มหาเคล็ด · มหาย่างก้าวย่อแผ่นดินในหนึ่งก้","arch":"evade","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TQGG_SOV_02_KARMA_SHADOWLESS_VANISH","shortId":"TQGG_SOV_02","nameTh":"มหาวิชาไร้ร่องรอยลบตัวตนจากชะตาภพ","descTh":"วิชาเร้นกายเหนือตำนานที่ลบคลื่นปราณและสายใยเหตุผลรอบร่างชั่วขณะ ทำให้ศัตรูและค่ายกลตรวจจับสูญเสียเป้าหมายกลางศึก","cat":"LIGHTNESS_ART","role":"MOVEMENT_STEALTH_RECON","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TQGG_CAUSAL_ERASURE","moveDefs":[{"id":"TQGG_SOV_02_M1","nameTh":"มหาเคล็ด · มหาวิชาไร้ร่องรอยลบตัวตนจากชะต","arch":"evade","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TQGG_SOV_03_HEAVEN_LISTENING_OMNISCIENT_GAZE","shortId":"TQGG_SOV_03","nameTh":"มหาเนตรทิพย์สดับลมเก้าพิภพ","descTh":"สุดยอดเคล็ดสดับกระแสลมและชีพจรปราณทั่วสนามรบ อ่านทิศทางลอบโจมตี อาวุธลับ และจุดบอดของค่ายกลได้ล่วงหน้า","cat":"LIGHTNESS_ART","role":"MOVEMENT_STEALTH_RECON","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WIND","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WIND","weights":{"WIND":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TQGG_OMNISCIENT_EYE","moveDefs":[{"id":"TQGG_SOV_03_M1","nameTh":"มหาเคล็ด · มหาเนตรทิพย์สดับลมเก้าพิภพ","arch":"evade","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TQGG_SOV_04_TITAN_SKY_SHATTERING_BOUND","shortId":"TQGG_SOV_04","nameTh":"มหาย่างก้าวพญามังกรเหยียบเมฆาถล่มฟ้า","descTh":"วิชาเหินหาวสายกายาอสนีที่ถีบอากาศกระโจนข้ามแนวรบแล้วทิ้งน้ำหนักลงประทับดุจดาวตก สร้างแรงสั่นสะเทือนทำลายขบวนศัตรู","cat":"LIGHTNESS_ART","role":"MOVEMENT_STEALTH_RECON","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TQGG_METEOR_LANDING","moveDefs":[{"id":"TQGG_SOV_04_M1","nameTh":"มหาเคล็ด · มหาย่างก้าวพญามังกรเหยียบเมฆาถ","arch":"evade","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TDEF_SOV_01_IMMOVABLE_VAJRA_WORLD_MOUNTAIN","shortId":"TDEF_SOV_01","nameTh":"มหาปราการขุนเขาพระสุเมรุวัชระไม่ไหวติง","descTh":"มหาวิชาตั้งรับสายวัชระที่ตรึงรากปราณลงสู่ชีพจรดิน จำกัดแรงปะทะรุนแรงสูงสุดที่ร่างได้รับไม่ให้ทลายแนวป้องกันในคราวเดียว","cat":"DEFENSIVE_TECHNIQUE","role":"COMBAT_DEFENSE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TDEF_SUMERU_CAP","moveDefs":[{"id":"TDEF_SOV_01_M1","nameTh":"มหาเคล็ด · มหาปราการขุนเขาพระสุเมรุวัชระไ","arch":"guard","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TDEF_SOV_02_TAIJI_ORIGIN_RETURN_EMPTINESS","shortId":"TDEF_SOV_02","nameTh":"มหาวิชาว่างเปล่าสี่ตำลึงคืนหมื่นชั่งสู่ฟ้าดิน","descTh":"สุดยอดเคล็ดผ่อนแรงและเบี่ยงกระแสปราณสายหยินหยาง ดูดซับแรงโจมตีหนักแล้วหมุนเวียนกลับเป็นคลังปราณสำรองให้ตนเอง","cat":"DEFENSIVE_TECHNIQUE","role":"COMBAT_DEFENSE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TDEF_ORIGIN_RESERVOIR","moveDefs":[{"id":"TDEF_SOV_02_M1","nameTh":"มหาเคล็ด · มหาวิชาว่างเปล่าสี่ตำลึงคืนหมื","arch":"guard","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TDEF_SOV_03_NINE_LOTUS_MARTYR_SANCTUARY","shortId":"TDEF_SOV_03","nameTh":"มหาโดมเก้าบงกชคุ้มครองสรรพชีวิต","descTh":"ม่านปราณเก้าบงกชที่สืบทอดจากปณิธานคุ้มครองสหาย กางโดมแสงหยางรับแรงปะทะแทนคณะร่วมรบและบรรเทาบาดแผลต่อเนื่อง","cat":"DEFENSIVE_TECHNIQUE","role":"COMBAT_DEFENSE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TDEF_SQUAD_AEGIS","moveDefs":[{"id":"TDEF_SOV_03_M1","nameTh":"มหาเคล็ด · มหาโดมเก้าบงกชคุ้มครองสรรพชีวิ","arch":"guard","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TDEF_SOV_04_VOID_PHASE_CICADA_SOVEREIGN","shortId":"TDEF_SOV_04","nameTh":"มหาเคล็ดกายาว่างเปล่าไร้ที่ให้ฟันต้อง","descTh":"เคล็ดลอกคราบจั๊กจั่นสุญตา เบี่ยงคลื่นปราณร่างให้เหลื่อมจังหวะกับคมศาสตราในเสี้ยววินาทีเพื่อหลบเลี่ยงการโจมตีปลิดชีพ","cat":"DEFENSIVE_TECHNIQUE","role":"COMBAT_DEFENSE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TDEF_PHASE_IMMUNITY","moveDefs":[{"id":"TDEF_SOV_04_M1","nameTh":"มหาเคล็ด · มหาเคล็ดกายาว่างเปล่าไร้ที่ให้","arch":"guard","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TSUP_SOV_01_NINE_SOULS_RETURN_GOLDEN_NEEDLE","shortId":"TSUP_SOV_01","nameTh":"มหาเข็มทองคำเรียกคืนเก้าวิญญาณ","descTh":"มหาวิชาเข็มทองเก้าจุดที่หลอมรวมศาสตร์หมอสนามและปราณพฤกษา ดึงสหายจากปากเหวความตายและฟื้นฟูเส้นชีพจรที่ฉีกขาดกลางศึก","cat":"SUPPORT_TECHNIQUE","role":"HEAL_SUPPORT_TRAINING","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TSUP_YAMA_RECALL","moveDefs":[{"id":"TSUP_SOV_01_M1","nameTh":"มหาเคล็ด · มหาเข็มทองคำเรียกคืนเก้าวิญญาณ","arch":"heal","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TSUP_SOV_02_CELESTIAL_ORCHESTRA_OF_FORTY_DAOS","shortId":"TSUP_SOV_02","nameTh":"มหาสังคีตประสานสี่สิบสามมรรคาสะเทือนภพ","descTh":"ทำนองประสานชีพจรที่ถอดรหัสจังหวะร่วมของสี่สิบสามมรรคาหลัก ปรับคลื่นปราณสหายต่างวิถีให้เกื้อหนุนกันอย่างกลมกลืน","cat":"SUPPORT_TECHNIQUE","role":"HEAL_SUPPORT_TRAINING","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"LIGHT_YANG","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHT_YANG","weights":{"LIGHT_YANG":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TSUP_DAO_SYMPHONY","moveDefs":[{"id":"TSUP_SOV_02_M1","nameTh":"มหาเคล็ด · มหาสังคีตประสานสี่สิบสามมรรคาส","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TSUP_SOV_03_EIGHT_BANNERS_IMPERIAL_WAR_MATRIX","shortId":"TSUP_SOV_03","nameTh":"มหาพยุหะธงแปดทิศพลิกกระดานศึก","descTh":"ค่ายกลธงแปดทิศฉบับบูรณะจากตำราพิชัยสงครามยุคกลาง จัดระเบียบแนวรุก-รับของคณะและชิงความได้เปรียบด้านจังหวะศึก","cat":"SUPPORT_TECHNIQUE","role":"HEAL_SUPPORT_TRAINING","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TSUP_WAR_MATRIX","moveDefs":[{"id":"TSUP_SOV_03_M1","nameTh":"มหาเคล็ด · มหาพยุหะธงแปดทิศพลิกกระดานศึก","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TSUP_SOV_04_BODHI_RAIN_TRANSMUTING_CALAMITY","shortId":"TSUP_SOV_04","nameTh":"มหาพิรุณโพธิ์แปรพิษภัยเป็นน้ำอมฤต","descTh":"เคล็ดพิรุณชำระมลทินที่แปรไอพิษ หมอกมลทิน และสถานะเสื่อมถอยบนร่างสหายให้กลับกลายเป็นน้ำค้างปราณฟื้นฟูพลังชีวิต","cat":"SUPPORT_TECHNIQUE","role":"HEAL_SUPPORT_TRAINING","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WATER_ICE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WATER_ICE","weights":{"WATER_ICE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TSUP_CALAMITY_NECTAR","moveDefs":[{"id":"TSUP_SOV_04_M1","nameTh":"มหาเคล็ด · มหาพิรุณโพธิ์แปรพิษภัยเป็นน้ำอ","arch":"heal","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TAUX_SOV_01_HEAVEN_PILL_NINE_CLOUDS_CANON","shortId":"TAUX_SOV_01","nameTh":"มหาตำราเมฆาโอสถเก้าสีหลอมฟ้า","descTh":"สุดยอดตำราคุมไฟและผนึกเมฆาโอสถ กักเก็บปราณสมุนไพรไม่ให้รั่วไหลยามปรุงยา เพิ่มโอกาสหลอมโอสถระดับสูงอย่างมั่นคง","cat":"AUXILIARY_ART","role":"PROFESSION_LIFESTYLE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"AKW_PILL_CLOUD_SEALER","moveDefs":[{"id":"TAUX_SOV_01_M1","nameTh":"มหาเคล็ด · มหาตำราเมฆาโอสถเก้าสีหลอมฟ้า","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TAUX_SOV_02_GOD_FORGE_MYRIAD_SPIRITS_HAMMER","shortId":"TAUX_SOV_02","nameTh":"มหาค้อนเทวะหลอมหมื่นจิตศาสตรา","descTh":"เคล็ดตอกค้อนประสานชีพจรโลหะ สืบทอดจากปรมาจารย์ช่างหลอมโบราณ ช่วยผสานแก่นอสูรและแร่ทิพย์เข้ากับศาสตราได้แนบแน่น","cat":"AUXILIARY_ART","role":"PROFESSION_LIFESTYLE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"AKW_SPIRIT_ANVIL_RESONANCE","moveDefs":[{"id":"TAUX_SOV_02_M1","nameTh":"มหาเคล็ด · มหาค้อนเทวะหลอมหมื่นจิตศาสตรา","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TAUX_SOV_03_EARTH_DRAGON_EIGHT_PEAKS_GENESIS","shortId":"TAUX_SOV_03","nameTh":"มหาวิชาพลิกชีพจรปฐพีเนรมิตแดนเซียน","descTh":"ศาสตร์ปรับฮวงจุ้ยและชีพจรมังกรระดับสำนัก ฟื้นฟูความอุดมสมบูรณ์ของแปลงสมุนไพรและเสริมความหนาแน่นของปราณรอบยอดเขา","cat":"AUXILIARY_ART","role":"PROFESSION_LIFESTYLE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"AKW_GARDEN_TOTEM_POLLINATION","moveDefs":[{"id":"TAUX_SOV_03_M1","nameTh":"มหาเคล็ด · มหาวิชาพลิกชีพจรปฐพีเนรมิตแดนเ","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TAUX_SOV_04_MYRIAD_BEASTS_SOVEREIGN_COVENANT","shortId":"TAUX_SOV_04","nameTh":"มหาพันธสัญญาจอมราชันย์สรรพสัตว์ร่วมใจ","descTh":"พันธสัญญาจิตวิญญาณที่ผูกใจสัตว์อสูรและกองคาราวานให้ร่วมแรงกัน ลดความตื่นตระหนกและเพิ่มประสิทธิภาพการสำรวจทางไกล","cat":"AUXILIARY_ART","role":"PROFESSION_LIFESTYLE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"AKW_CARAVAN_CRYO_STASIS","moveDefs":[{"id":"TAUX_SOV_04_M1","nameTh":"มหาเคล็ด · มหาพันธสัญญาจอมราชันย์สรรพสัตว","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TAUX_SOV_05_AKASHIC_GRAND_MENTOR_TRANSMISSION","shortId":"TAUX_SOV_05","nameTh":"มหาศาสตร์หนึ่งคำชี้แนะเบิกเนตรพันศิษย์","descTh":"เคล็ดชี้แนะและตรวจสอบข้อบกพร่องคัมภีร์ของยอดอาลักษณ์ ช่วยให้ศิษย์รุ่นหลังเข้าใจรากฐานวิชาได้เร็วขึ้นและลดความเสี่ยงธาตุไฟแทรก","cat":"AUXILIARY_ART","role":"PROFESSION_LIFESTYLE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"AKW_CENSOR_TRUTH_MIRROR","moveDefs":[{"id":"TAUX_SOV_05_M1","nameTh":"มหาเคล็ด · มหาศาสตร์หนึ่งคำชี้แนะเบิกเนตร","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TFRB_SOV_01_USURPING_HEAVEN_MANDATE_DECREE","shortId":"TFRB_SOV_01","nameTh":"มหาโองการช่วงชิงอาณัติสวรรค์","descTh":"วิชาต้องห้ามที่ฉวยดึงพลังสายฟ้าและแรงกดดันฟ้าดินรอบสนามมาใช้ชั่วขณะ แลกกับแรงสะท้อนกลับอย่างหนักต่อเส้นชีพจรผู้ร่าย","cat":"FORBIDDEN_ART","role":"TABOO_OVERDRIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"LIGHTNING","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"LIGHTNING","weights":{"LIGHTNING":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TFRB_STEAL_MANDATE","moveDefs":[{"id":"TFRB_SOV_01_M1","nameTh":"มหาเคล็ด · มหาโองการช่วงชิงอาณัติสวรรค์","arch":"burst","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TFRB_SOV_02_NAMELESS_ERASURE_SAVING_ALL_BEINGS","shortId":"TFRB_SOV_02","nameTh":"มหาวิชาลบนามตนเองจากแผ่นดินแลกชีวิตหมู่สหาย","descTh":"มหาปณิธานต้องห้ามที่เผาผลาญชื่อเสียง ตบะ และร่องรอยปราณของตนเพื่อกางม่านคุ้มชีวิตสหายทั้งหมดจากมหันตภัยถึงตาย","cat":"FORBIDDEN_ART","role":"TABOO_OVERDRIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TFRB_OBLIVION_SAVE","moveDefs":[{"id":"TFRB_SOV_02_M1","nameTh":"มหาเคล็ด · มหาวิชาลบนามตนเองจากแผ่นดินแลก","arch":"support","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TFRB_SOV_03_NINE_ABYSSES_BLOOD_GOD_AVATAR","shortId":"TFRB_SOV_03","nameTh":"มหาวิชาจุติร่างอสูรโลหิตผ่าเก้าอเวจี","descTh":"วิชาต้องห้ามสายมารโลหิตที่ปลุกไออสูรเดือดพล่านทั่วร่างเพื่อแลกพลังโจมตีดุดันสูงสุด ทว่าเสี่ยงต่อการสูญเสียสติและกัดกร่อนอายุขัย","cat":"FORBIDDEN_ART","role":"TABOO_OVERDRIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"BLOOD_DEMON","elementProfile":{"mode":"SPECIAL_ELEMENT","primary":"BLOOD_DEMON","weights":{"BLOOD_DEMON":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TFRB_ASURA_AVATAR","moveDefs":[{"id":"TFRB_SOV_03_M1","nameTh":"มหาเคล็ด · มหาวิชาจุติร่างอสูรโลหิตผ่าเก้","arch":"burst","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TFRB_SOV_04_SAMSARA_NIRVANA_REINCARNATION_LOTUS","shortId":"TFRB_SOV_04","nameTh":"มหาปณิธานเผาสังขารฝากเมล็ดพันธุ์ชาติหน้า","descTh":"เคล็ดต้องห้ามสุดท้ายที่ผนึกความทรงจำยุทธ์และเศษปราณไว้เป็นเมล็ดพันธุ์มรดกก่อนดับสูญ เพื่อให้ศิษย์หรือรุ่นถัดไปสืบต่อเจตจำนง","cat":"FORBIDDEN_ART","role":"TABOO_OVERDRIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"carbonKeyword":"KW_TFRB_REINCARNATION_SEED","moveDefs":[{"id":"TFRB_SOV_04_M1","nameTh":"มหาเคล็ด · มหาปณิธานเผาสังขารฝากเมล็ดพันธ","arch":"burst","type":"m","M":2.85,"cd":3,"qi":32}],"obtainSources":["SOVEREIGN_AWAKENING_GATE","ANCESTRAL_SHRINE_EPIPHANY"]},{"id":"TPAS_SOV_01_SWORD_STAR_APEX_HEART","shortId":"TPAS_SOV_01","nameTh":"มหาดาราจักรหัวใจกระบี่เอกะสะบั้นดารา","descTh":"มหาดาราจักรหัวใจกระบี่เอกะสะบั้นดารา · ดาวฤกษ์หลักติดตัวไม่กินช่องสวมใส่ (Zero-Slot Keystone +2 ดวงดาวดาราจักร)","cat":"PASSIVE","role":"PASSIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"zeroSlotPassive":true,"constellationStarBonus":2,"passiveConstellation":"SWORD_STAR","passive":{"atkPct":0.18,"defPct":0.18,"hpMaxPct":0.22,"qiMaxPct":0.22,"critAdd":8},"obtainSources":["SOVEREIGN_AWAKENING_GATE","CONSTELLATION_EPIPHANY"]},{"id":"TPAS_SOV_02_VAJRA_TIGER_UNDYING_MARROW","shortId":"TPAS_SOV_02","nameTh":"มหาดาราจักรพยัคฆ์วัชระค้ำพิภพ","descTh":"มหาดาราจักรพยัคฆ์วัชระค้ำพิภพ · ดาวฤกษ์หลักติดตัวไม่กินช่องสวมใส่ (Zero-Slot Keystone +2 ดวงดาวดาราจักร)","cat":"PASSIVE","role":"PASSIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"EARTH_METAL","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"EARTH_METAL","weights":{"EARTH_METAL":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"zeroSlotPassive":true,"constellationStarBonus":2,"passiveConstellation":"VAJRA_TIGER","passive":{"atkPct":0.18,"defPct":0.18,"hpMaxPct":0.22,"qiMaxPct":0.22,"critAdd":8},"obtainSources":["SOVEREIGN_AWAKENING_GATE","CONSTELLATION_EPIPHANY"]},{"id":"TPAS_SOV_03_JADE_SPRING_IMMORTAL_NECTAR_BODY","shortId":"TPAS_SOV_03","nameTh":"มหาดาราจักรน้ำพุหยกอมฤตนิรันดร์","descTh":"มหาดาราจักรน้ำพุหยกอมฤตนิรันดร์ · ดาวฤกษ์หลักติดตัวไม่กินช่องสวมใส่ (Zero-Slot Keystone +2 ดวงดาวดาราจักร)","cat":"PASSIVE","role":"PASSIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"WOOD_LIFE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"WOOD_LIFE","weights":{"WOOD_LIFE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"zeroSlotPassive":true,"constellationStarBonus":2,"passiveConstellation":"JADE_SPRING","passive":{"atkPct":0.18,"defPct":0.18,"hpMaxPct":0.22,"qiMaxPct":0.22,"critAdd":8},"obtainSources":["SOVEREIGN_AWAKENING_GATE","CONSTELLATION_EPIPHANY"]},{"id":"TPAS_SOV_04_SHADOW_MOON_PHANTOM_FATE","shortId":"TPAS_SOV_04","nameTh":"มหาดาราจักรเงาจันทราเร้นชะตา","descTh":"มหาดาราจักรเงาจันทราเร้นชะตา · ดาวฤกษ์หลักติดตัวไม่กินช่องสวมใส่ (Zero-Slot Keystone +2 ดวงดาวดาราจักร)","cat":"PASSIVE","role":"PASSIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"YIN_SHADOW","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"YIN_SHADOW","weights":{"YIN_SHADOW":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"zeroSlotPassive":true,"constellationStarBonus":2,"passiveConstellation":"SHADOW_MOON","passive":{"atkPct":0.18,"defPct":0.18,"hpMaxPct":0.22,"qiMaxPct":0.22,"critAdd":8},"obtainSources":["SOVEREIGN_AWAKENING_GATE","CONSTELLATION_EPIPHANY"]},{"id":"TPAS_SOV_05_ASTRAL_MIND_OMNISCIENT_CALCULUS","shortId":"TPAS_SOV_05","nameTh":"มหาดาราจักรจิตดาราคำนวณหมื่นกัลป์","descTh":"มหาดาราจักรจิตดาราคำนวณหมื่นกัลป์ · ดาวฤกษ์หลักติดตัวไม่กินช่องสวมใส่ (Zero-Slot Keystone +2 ดวงดาวดาราจักร)","cat":"PASSIVE","role":"PASSIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"ASTRAL_VOID","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"ASTRAL_VOID","weights":{"ASTRAL_VOID":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"zeroSlotPassive":true,"constellationStarBonus":2,"passiveConstellation":"ASTRAL_MIND","passive":{"atkPct":0.18,"defPct":0.18,"hpMaxPct":0.22,"qiMaxPct":0.22,"critAdd":8},"obtainSources":["SOVEREIGN_AWAKENING_GATE","CONSTELLATION_EPIPHANY"]},{"id":"TPAS_SOV_06_GOLDEN_CRUCIBLE_HEAVEN_ARTISAN","shortId":"TPAS_SOV_06","nameTh":"มหาดาราจักรเตาทองคำสรรค์สร้างเทวะ","descTh":"มหาดาราจักรเตาทองคำสรรค์สร้างเทวะ · ดาวฤกษ์หลักติดตัวไม่กินช่องสวมใส่ (Zero-Slot Keystone +2 ดวงดาวดาราจักร)","cat":"PASSIVE","role":"PASSIVE","tier":8,"transcendentRank":8,"reqTier":5,"path":"ANY","sub":"NONE","power":180,"element":"FIRE","elementProfile":{"mode":"INTRINSIC_SINGLE","primary":"FIRE","weights":{"FIRE":1}},"grade":"Transcendent","transcendent":true,"transcendentArt":true,"isSectHeritage":true,"zeroSlotPassive":true,"constellationStarBonus":2,"passiveConstellation":"GOLDEN_CRUCIBLE","passive":{"atkPct":0.18,"defPct":0.18,"hpMaxPct":0.22,"qiMaxPct":0.22,"critAdd":8},"obtainSources":["SOVEREIGN_AWAKENING_GATE","CONSTELLATION_EPIPHANY"]}];
  // Named inheritances from the four existing autonomous sanctum expeditions.
  const codex = (shortId, suffix, cat, element, sanctum, nameTh, descTh, moves, extras = {}) => {
    const id = shortId + '_' + suffix;
    return {
      id, shortId, nameTh, descTh, cat, tier: 8, reqTier: 5, power: 175, path: 'ANY', sub: 'NONE',
      grade: 'Transcendent', transcendent: true, transcendentArt: true, isSectHeritage: true,
      element, elementProfile: { primary: element, affinityWeight: 0.9 },
      sanctum, obtainSources: [sanctum + ':SOVEREIGN_ARCHIVE'],
      moveDefs: moves.map(([title, arch, details], i) => ({
        id: id + '_M' + (i + 1), nameTh: title, arch, type: 'm',
        reqMastery: i ? 65 : 0, costPct: i ? 15 : 10, cd: i ? 36 : 23, ...details
      })),
      ...extras
    };
  };
  const abyss = 'SANCTUM_SWORD_ABYSS', vajra = 'SANCTUM_BLOOD_VAJRA';
  const astral = 'SANCTUM_ASTRAL_DIVINE', beast = 'SANCTUM_MYRIAD_BEAST_TOTEM';
  const newCombat = codex('TCMB_SOV_07', 'SUNDERED_TIDE', 'COMBAT_TECHNIQUE', 'WATER_ICE', abyss,
    'กระบวนคลื่นผ่าสันดอน', 'จารึกแนวทวนของผู้พิทักษ์ทางน้ำ มีท่าเดี่ยวเจาะเกราะและท่ากวาดแนวหน้า', [
      ['ทวนวารีเจาะเขื่อน', 'pierce', { M: 2.05, hits: 1, pen: 24 }],
      ['น้ำหลากตีสองฝั่ง', 'sweep', { M: 1.53, hits: 1, aoe: true, rider: 'slow' }]
    ], { scarKind: 'SCAR_TIDAL_FRACTURE', vfxShape: 'wave' });
  const newMantra = codex('TMNT_SOV_06', 'LANTERN_BREATH', 'QI_MANTRA', 'LIGHT_YANG', astral,
    'เคล็ดจุดโคมในทรวง', 'จังหวะลมปราณจากหอดูดาวส่องทางให้ศิษย์กลับจากสมาธิลึก ใช้ได้เมื่อโคจรคัมภีร์นี้', [
      ['ประคองไส้โคม', 'heal', { heal: .17, self: true }],
      ['ส่งแสงนำทาง', 'support', { team: true, grantBuff: 'clarityLotus', support: { kind:'clarityLotus', dur:12 } }]
    ], { vfxShape: 'flame' });
  const newNonCombat = [
    codex('TQGG_SOV_05', 'SWALLOW_FERRY', 'LIGHTNESS_ART', 'WIND', beast,
      'วิชานางแอ่นข้ามห้วย', 'พรานโบราณอ่านช่องลมเลียบหน้าผาเพื่อเข้าประชิดหรือถอนตัว', [
        ['แอ่นปีกข้ามสายลม', 'charge', { M: 1.45, hits: 1 }],
        ['วกกลับเลียบหน้าผา', 'evade', { cd: 29 }]
      ], { qinggongMode: 'LEAP_BOUND', vfxShape: 'wings' }),
    codex('TDEF_SOV_05', 'BASALT_BREAKWATER', 'DEFENSIVE_TECHNIQUE', 'EARTH_METAL', vajra,
      'วิชาฐานศิลากั้นคลื่น', 'ผู้เฝ้าประตูวิหารทิ้งตำราลงหลักรับแรงและส่งแรงย้อนเมื่อประชิด', [
        ['หยั่งรากใต้ผา', 'shield', { shield: .28 }],
        ['สะท้อนแรงกระแทก', 'counter', { grantBuff:'guardUp' }]
      ], { vfxShape: 'gate' }),
    codex('TSUP_SOV_05', 'FROSTWELL_REMEDY', 'SUPPORT_TECHNIQUE', 'WATER_ICE', beast,
      'วิชาน้ำค้างจากบ่อหนาว', 'หมอพรานเก็บหยดน้ำเย็นเพื่อช่วยผู้บาดเจ็บหนักหรือคุ้มกันหมู่ก่อนฝ่าวงล้อม', [
        ['หยดค้างประสานแผล', 'heal', { heal:.28, cleanseDebuffs:true }],
        ['ห่มหมอกทั่วคณะ', 'support', { team:true, grantBuff:'vitalRegen', support:{ kind:'vitalRegen', dur:13 } }]
      ], { vfxShape: 'vial' }),
    codex('TAUX_SOV_06', 'CAMPKEEPER_COMPASS', 'AUXILIARY_ART', 'LIGHT_YANG', abyss,
      'วิชาเข็มทิศคนเฝ้าค่าย', 'นักเดินทางผูกทิศกับลมหายใจเพื่อจัดระเบียบค่ายหรือช่วยคนหลงทิศ', [
        ['ปักหลักบอกทิศ', 'support', { team:true, grantBuff:'tacticalCommand', support:{ kind:'tacticalCommand', dur:13 } }],
        ['จุดหลักกลับค่าย', 'heal', { heal:.12, cleanseDebuffs:true, qiRestorePct:.13 }]
      ], { vfxShape: 'dial' }),
    codex('TFRB_SOV_05', 'BORROWED_RED_DAWN', 'FORBIDDEN_ART', 'BLOOD_DEMON', vajra,
      'วิชายืมรุ่งอรุณโลหิต', 'จารึกต้องห้ามของผู้เฝ้าผา แลกความมั่นคงของกายกับแรงคมชั่วขณะ', [
        ['กรีดรุ่งอรุณบาดจิต', 'forbid', { M: 2.3, hits:1, recoil:.12, drawback:{ heartDemonAdd:6 } }],
        ['เผาชีพจรสามลมหายใจ', 'dot', { M:1.28, hits:1, dotKind:'bleed', dot:1.25, recoil:.08, drawback:{ heartDemonAdd:4 } }]
      ], { vfxShape: 'claw' }),
    codex('TPAS_SOV_07', 'HERON_AT_THE_WEIR', 'PASSIVE', 'WIND', astral,
      'ปณิธานกระสาเฝ้าฝาย', 'สองจังหวะติดตัว ตอบโต้เมื่อศัตรูเสียจังหวะและฟื้นปราณเมื่อหลบได้', [], {
        vfxShape:'spear',
        passiveForms:[
          { nameTh:'จิกช่องว่าง', descTh:'เพิ่มเจาะเกราะ 9 เมื่อเป้าหมายติดผลเสีย' },
          { nameTh:'พักปีกเหนือผิวน้ำ', descTh:'ฟื้นปราณ 6% เมื่อหลบสำเร็จ เว้นอย่างน้อย 24 หน่วยเวลา' }
        ],
        passive:{ cond:{ requiresDebuffOnTarget:true, pp:{ pen:9 }, p:{ atk:.03 } }, proc:{ kind:'onDodge', qiRestorePct:.06, icdTicks:24 } }
      })
  ];
  JD.TECH.sovereignCombatArts.push(newCombat);
  JD.TECH.sovereignMantras.push(newMantra);
  JD.TECH.sovereignNonCombatArts.push(...newNonCombat);
  JD.CORE.worldTranscendentArtifacts.push(
    {
      id:'WPN_TRANSCENDENT_MOURNING_WEATHER_FAN', nameTh:'พัดบัญชาลมเงียบ',
      descTh:'พัดของผู้เฝ้าหอดูดาว เมื่อโจมตีโดนผู้กำลังร่าย จะกดเสียงคาถาชั่วครู่ เว้น 26 หน่วยเวลา',
      cat:'EQUIPMENT', out:'EQUIPMENT', slot:'WEAPON', gearType:'FAN', subType:'FAN', tier:8, minStage:6,
      grade:'Transcendent', transcendent:true, worldSingleton:true, element:'WIND', value:90000,
      combatMult:.58, defenseMult:.14, sanctum:astral, vfxShape:'fan', obtainSources:[astral + ':SOVEREIGN_ARCHIVE']
    },
    {
      id:'ARM_TRANSCENDENT_PILGRIM_HORIZON_MAIL', nameTh:'อาภรณ์พรานเลียบขอบฟ้า',
      descTh:'เกราะเบาจากผู้พิทักษ์ห้วยอสูร เมื่อหลบสำเร็จ จะแผ่ม่านกันคมชั่วครู่ เว้น 30 หน่วยเวลา',
      cat:'EQUIPMENT', out:'EQUIPMENT', slot:'ARMOR', gearType:'LIGHT', subType:'LIGHT', tier:8, minStage:6,
      grade:'Transcendent', transcendent:true, worldSingleton:true, element:'WOOD_LIFE', value:87500,
      combatMult:.22, defenseMult:.68, sanctum:beast, vfxShape:'robe', obtainSources:[beast + ':SOVEREIGN_ARCHIVE']
    }
  );
  // Living inheritances, outside the ordinary beast and breeding lotteries.
  JD.CORE.sovereignCompanions = [
    { id:'PET_TR_AZURE_DRAGON', symbol:'AZURE_DRAGON', nameTh:'มังกรครามเมฆสมุทร', directionTh:'บูรพา',
      eggTh:'ไข่มังกรครามแห่งธารเคียงเมฆ', eggDays:9, sanctum:abyss,
      family:'DRAGON_MYTHIC', element:'WATER_ICE', role:'FEROCIOUS_ASSAULT', tier:3, cp:120 },
    { id:'PET_TR_VERMILION_PHOENIX', symbol:'VERMILION_PHOENIX', nameTh:'หงส์เพลิงตะวันกำเนิด', directionTh:'ทักษิณ',
      eggTh:'ไข่หงส์เพลิงประกายอรุณ', eggDays:7, sanctum:astral,
      family:'AVIAN', element:'FIRE', role:'MYSTIC_SUPPORT', tier:3, cp:107 },
    { id:'PET_TR_WHITE_TIGER', symbol:'WHITE_TIGER', nameTh:'พยัคฆ์ขาวเขี้ยวจันทรา', directionTh:'ประจิม',
      sanctum:vajra, family:'FELINE', element:'EARTH_METAL', role:'FEROCIOUS_ASSAULT', tier:3, cp:135 },
    { id:'PET_TR_BLACK_TORTOISE', symbol:'BLACK_TORTOISE', nameTh:'เต่าดำภูผาราตรี', directionTh:'อุดร',
      eggTh:'ไข่เต่าดำแห่งบ่อหินจันทรา', eggDays:12, sanctum:beast, family:'SHELL_GUARDIAN', element:'YIN_SHADOW', role:'IRON_GUARDIAN', tier:3, cp:105 }
  ];
  // These are living inheritances, distinct from the wild species that inspire them.
  const lineageGrades = [
    { grade:'Apex', gradeTh:'T7 ขั้นสูงสุด', impact:.62, fatigue:3, cooldown:18, scale:.81, cp:112 },
    { grade:'Legendary', gradeTh:'ตำนาน', impact:.83, fatigue:6, cooldown:25, scale:.98, cp:132 },
    { grade:'Transcendent', gradeTh:'เหนือตำนาน', impact:1.0, fatigue:10, cooldown:34, scale:1.21, cp:160 }
  ];
  const lineage = (familyId, familyTh, sanctum, role, family, element, forms, focusTh, drawbackTh, traits) =>
    forms.map(([nameTh, descTh], i) => ({
      ...lineageGrades[i], id:'PET_LINEAGE_' + familyId + '_' + (i + 1), familyId, familyTh, sanctum,
      role, family, element, nameTh, descTh, focusTh, drawbackTh, traits, gradeRank:i + 1, tier:3,
      eggDays:familyId === 'KUNPENG' ? [4,7,12][i] : 0,
      eggTh:familyId === 'KUNPENG' ? 'ไข่ของ' + nameTh : '',
      obtainSources:[sanctum + ':LINEAGE_' + lineageGrades[i].grade.toUpperCase()]
    }));

  JD.CORE.lineageCompanions = [
    ...lineage('KUNPENG', 'คุนเผิง', abyss, 'MOUNT_CHARGER', 'AVIAN', 'WIND', [
      ['เผิงปีกคลื่นคราม', 'ออกแรงสั้น ๆ ได้บ่อย เหมาะกับการไล่ตามศัตรูที่อยู่ไกล'],
      ['คุนเผิงทะเลเมฆ', 'ปีกใหญ่สร้างลมกดศัตรู ทำให้เสียความเร็วช่วงสั้น'],
      ['คุนเผิงแบกนภา', 'เงาปลาคุนปรากฏใต้ปีก ยิ่งมีที่ให้ร่อน ยิ่งช่วยเปิดแนวได้แรง']
    ], 'โจมตีสนับสนุนจากระยะห่าง 2.8 ช่องขึ้นไป', 'ระยะประชิดแรงสนับสนุนลดลงและไม่ปล่อยลม', {move:7,eva:4,def:-.05}),
    ...lineage('FOX', 'จิ้งจอกเก้าหาง', astral, 'MYSTIC_SUPPORT', 'CANINE', 'YIN_SHADOW', [
      ['จิ้งจอกเก้าหางแพรหมอก', 'หางเล็กคล้ายพู่ไหม โจมตีซ้ำจังหวะศัตรูชะงักได้บ่อย'],
      ['จิ้งจอกเก้าหางกระจกจันทร์', 'หางเงินแตกเป็นเงาจันทร์ ทำให้เป้าหมายที่เสียจังหวะมองผิดทิศ'],
      ['จิ้งจอกเก้าหางจันทร์คราส', 'หางเก้าสายโอบจันทร์ดำ ย้ำภาพลวงจนเป้าหมายเสียทั้งสายตาและกำลัง']
    ], 'ต่อยอดเมื่อศัตรูมีผลเสียอยู่แล้ว', 'ไม่มีภาพลวงพิเศษเมื่อศัตรูยังไม่เสียจังหวะ และตัวคู่หูช่วยป้องกันกายได้น้อย', {matk:.07,cast:4,def:-.04}),
    ...lineage('QILIN', 'กิเลน', beast, 'IRON_GUARDIAN', 'UNGULATE', 'WOOD_LIFE', [
      ['กิเลนกีบหยก', 'รับแนวหน้าและกางม่านเล็ก เมื่อสหายเริ่มเสียเปรียบ'],
      ['กิเลนเกล็ดเมฆาทอง', 'เกล็ดทองพยุงม่านได้นานขึ้น เหมาะกับคณะเดินทางที่เจอศึกหนัก'],
      ['กิเลนพิทักษ์ชีพจรแผ่นดิน', 'มงกุฎกิ่งหยกส่งปราณลงพื้น กางม่านใหญ่ให้ผู้บาดเจ็บที่สุด']
    ], 'คุ้มกันผู้บาดเจ็บใกล้ตัวหลังผู้เลี้ยงโดนโจมตี', 'ม่านไม่ซ้อนกับโล่เดิม และช่วยไล่ล่าศัตรูได้ช้า', {def:.08,hp:.04,move:-4}),
    ...lineage('BAIZE', 'ไป๋เจ๋อ', vajra, 'MYSTIC_SUPPORT', 'CHIMERA', 'LIGHT_YANG', [
      ['ไป๋เจ๋อตาขาวอ่านลม', 'แยกพิรุธได้ทีละอย่าง เหมาะกับศึกที่มีผลรบกวนเบา ๆ'],
      ['ไป๋เจ๋อผู้จารึกนามอสูร', 'ขนขาวแต้มลายอักขระ ช่วยผู้รับผลรบกวนฟื้นสมาธิ'],
      ['ไป๋เจ๋อจักษุสารพัดภพ', 'ดวงตารอบเรือนกายอ่านทั้งร่องรอยและคำสาป ชะล้างผลเสียได้สองอย่างในจังหวะเดียว']
    ], 'อ่านและล้างผลรบกวนของสหายใกล้ตัว', 'เสริมการโจมตีโดยตรงได้น้อย และไม่มีผลชะล้างเมื่อทีมยังปกติ', {mdef:.08,acc:5,atk:-.05})
  ];
  // Bonded forms of existing wild species. The wild source keeps its original behavior and drops.
  const regionalForm = (tier, key, sourceId, nameTh, family, role, cp, trait, stats, strengthTh, limitTh) => ({
    id:'PET_REGIONAL_' + key, key, sourceId, nameTh, tier, family, role, cp, trait, stats, strengthTh, limitTh
  });
  JD.CORE.regionalCompanions = [
    regionalForm(6, 'TAOTIE', 'BEAST_MYTHIC_TAOTIE_SHADOW', 'เทาเที่ยคาบเงาผา', 'CHIMERA', 'FEROCIOUS_ASSAULT', 254, 'ALPHA_FANG',
      { p:{ atk:.035, mdef:-.045 }, f:{ pen:4 } }, 'เสริมแรงโจมตีและเจาะเกราะ', 'ผู้เลี้ยงต้านเวทได้น้อยลง'),
    regionalForm(6, 'BODHI', 'ECO2_BEAST_PLANT_SPIRIT_6', 'ภูตพฤกษาผาหยั่งราก', 'PLANT_SPIRIT', 'IRON_GUARDIAN', 237, 'IRON_CARAPACE',
      { p:{ hp:.045, def:.035 }, f:{ move:-5 } }, 'เสริมพลังชีวิตและการป้องกันกาย', 'ผู้เลี้ยงเคลื่อนที่ช้าลง'),
    regionalForm(5, 'HAWK', 'BEAST_ASTRAL_VOID_HAWK_5', 'เหยี่ยวแหวกช่องดารา', 'AVIAN', 'MOUNT_CHARGER', 186, 'ALPHA_FANG',
      { p:{ hp:-.025 }, f:{ move:4, eva:5 } }, 'หนุนความเร็วและการหลบ โตแล้วพาคณะเดินทางได้', 'ผู้เลี้ยงมีพลังชีวิตลดลง'),
    regionalForm(5, 'FOX', 'ECO2_BEAST_CANINE_5', 'จิ้งจอกเงินหางแพรดึก', 'CANINE', 'MYSTIC_SUPPORT', 173, 'AUSPICIOUS_SPIRIT',
      { p:{ matk:.032, def:-.035 }, f:{ cast:4 } }, 'เสริมพลังเวทและความเร็วร่าย', 'ผู้เลี้ยงรับการโจมตีกายภาพได้ลดลง'),
    regionalForm(4, 'TORTOISE', 'BEAST_LAVA_FLAME_TORTOISE_4', 'เต่ากระดองตะกรันเพลิง', 'SHELL_GUARDIAN', 'IRON_GUARDIAN', 136, 'IRON_CARAPACE',
      { p:{ def:.033 }, f:{ move:-4 } }, 'เพิ่มการป้องกันกาย', 'หนักและทำให้ผู้เลี้ยงเดินช้าลง'),
    regionalForm(4, 'SCORPION', 'BEAST_SAND_SCORPION', 'แมงป่องหางถ่านแดง', 'ARTHROPOD_SWARM', 'VENOM_SWARM', 129, 'VENOM_GLAND',
      { p:{ mdef:-.027 }, f:{ pen:5 } }, 'เพิ่มการเจาะเกราะ', 'ผู้เลี้ยงต้านเวทได้น้อยลง'),
    regionalForm(3, 'PYTHON', 'BEAST_EMERALD_PYTHON', 'เหลือมหวายหยก', 'SERPENT', 'VENOM_SWARM', 101, 'VENOM_GLAND',
      { p:{ atk:.02 }, f:{ move:-2 } }, 'เสริมแรงโจมตีและเจาะเกราะ', 'เคลื่อนที่ได้คล่องน้อยลง'),
    regionalForm(3, 'BAT', 'BEAST_YIN_SHADOW_BAT_3', 'ค้างคาวใบหูม่วง', 'AVIAN', 'MYSTIC_SUPPORT', 94, 'AUSPICIOUS_SPIRIT',
      { p:{ def:-.022 }, f:{ acc:4 } }, 'หนุนความแม่นยำและการต้านเวท', 'เกราะกายลดลงและขี่เดินทางไม่ได้'),
    regionalForm(2, 'BOAR', 'BEAST_IRON_BOAR', 'หมูป่าสันเหล็ก', 'URSINE_BOAR', 'IRON_GUARDIAN', 76, 'IRON_CARAPACE',
      { p:{ hp:.018 }, f:{ move:-2 } }, 'เสริมพลังชีวิตและการป้องกันกาย', 'ลดความเร็วเคลื่อนที่เล็กน้อย'),
    regionalForm(2, 'CRANE', 'ECO2_BEAST_AVIAN_2', 'กระเรียนปีกหยกน้ำค้าง', 'AVIAN', 'MYSTIC_SUPPORT', 70, 'AUSPICIOUS_SPIRIT',
      { p:{ mdef:.023, hp:-.015 } }, 'หนุนการต้านเวทและการทะลวงด่าน', 'พลังชีวิตลดเล็กน้อยและขี่เดินทางไม่ได้'),
    regionalForm(2, 'GRASS_TURTLE', 'ECO2_BEAST_SHELL_2', 'เต่ากระดองตะไคร่', 'SHELL_GUARDIAN', 'IRON_GUARDIAN', 74, 'IRON_CARAPACE',
      { p:{ mdef:.024, atk:-.018 } }, 'หนุนการป้องกันกายและต้านเวท', 'แรงโจมตีกายของผู้เลี้ยงลดเล็กน้อย'),
    regionalForm(2, 'GOAT', 'ECO2_BEAST_UNGULATE_2', 'แพะผาเขาเมฆ', 'UNGULATE', 'MOUNT_CHARGER', 71, 'ALPHA_FANG',
      { p:{ mdef:-.025 }, f:{ move:2 } }, 'ช่วยเดินทางและบรรทุกสัมภาระเมื่อโตเต็มวัย', 'ต้านเวทได้น้อยลงและต้องพักเมื่อเหนื่อย'),
    regionalForm(2, 'MOTH', 'BEAST_V222_MIRAGE_SILK_MOTH', 'ผีเสื้อแพรหมอกจันทร์', 'ARTHROPOD_SWARM', 'MYSTIC_SUPPORT', 68, 'AUSPICIOUS_SPIRIT',
      { p:{ hp:-.012 }, f:{ cast:2, eva:2 } }, 'ช่วยให้ร่ายไวและหลบได้ดีขึ้น', 'พลังชีวิตผู้เลี้ยงลดเล็กน้อย'),
    regionalForm(1, 'WOLF', 'BEAST_MIST_WOLF', 'หมาป่าหูหมอก', 'CANINE', 'FEROCIOUS_ASSAULT', 57, 'ALPHA_FANG',
      { p:{ def:-.014 }, f:{ move:2 } }, 'ช่วยจู่โจมและเพิ่มความเร็วเคลื่อนที่', 'พลังป้องกันกายลดเล็กน้อย'),
    regionalForm(1, 'MUSHROOM', 'ECO2_BEAST_PLANT_SPIRIT_1', 'ภูตเห็ดตะเกียงมอส', 'PLANT_SPIRIT', 'MYSTIC_SUPPORT', 52, 'AUSPICIOUS_SPIRIT',
      { p:{ mdef:.016 }, f:{ move:-1 } }, 'เสริมการต้านเวทและหนุนการทะลวงด่าน', 'เคลื่อนตัวช้าลงเล็กน้อย'),
    regionalForm(1, 'WILDCAT', 'ECO2_BEAST_FELINE_1', 'แมวป่าหางหินลาย', 'FELINE', 'FEROCIOUS_ASSAULT', 55, 'ALPHA_FANG',
      { p:{ mdef:-.012 }, f:{ acc:3 } }, 'เสริมความแม่นยำและการโจมตีกาย', 'ต้านเวทได้น้อยลงเล็กน้อย'),
    regionalForm(1, 'FAWN', 'ECO2_BEAST_UNGULATE_1', 'กวางดาวยอดหญ้า', 'UNGULATE', 'MYSTIC_SUPPORT', 51, 'AUSPICIOUS_SPIRIT',
      { p:{ hp:.013, atk:-.012 } }, 'หนุนพลังชีวิตและการทะลวงด่าน', 'แรงโจมตีกายลดลงและขี่ไม่ได้'),
    regionalForm(1, 'MANTIS', 'ECO2_BEAST_ARTHROPOD_1', 'ตั๊กแตนตะขอใบไผ่', 'ARTHROPOD_SWARM', 'VENOM_SWARM', 53, 'VENOM_GLAND',
      { p:{ def:-.018 }, f:{ pen:2 } }, 'หนุนการเจาะเกราะ', 'เกราะกายผู้เลี้ยงลดเล็กน้อย')
  ];
  JD.TECH.transcendentCodices = [].concat(JD.TECH.sovereignCombatArts, JD.TECH.sovereignMantras, JD.TECH.sovereignNonCombatArts);
  JD.TECH.transcendentArts = JD.TECH.transcendentCodices;

  JD.TECH.extraMantras = [].concat(JD.TECH.lowTierMantras, JD.TECH.midHighMantras, JD.TECH.sovereignMantras);
  JD.TECH.expansionNonCombatArts = [].concat(JD.TECH.lowTierNonCombatArts, JD.TECH.midHighNonCombatOnly, JD.TECH.sovereignCombatArts, JD.TECH.sovereignNonCombatArts);
})(typeof globalThis !== 'undefined' ? globalThis : this);
