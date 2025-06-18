// 日本人の食事摂取基準（2025年版）データ
const nutritionData = {
    protein: {
        name: "たんぱく質",
        unit: "g/日",
        type: "推奨量",
        values: [
            { age: "0～5（月）", male: 10, female: 10, note: "目安量" },
            { age: "6～8（月）", male: 15, female: 15, note: "目安量" },
            { age: "9～11（月）", male: 25, female: 25, note: "目安量" },
            { age: "1～2（歳）", male: 20, female: 20 },
            { age: "3～5（歳）", male: 25, female: 25 },
            { age: "6～7（歳）", male: 30, female: 30 },
            { age: "8～9（歳）", male: 40, female: 40 },
            { age: "10～11（歳）", male: 45, female: 50 },
            { age: "12～14（歳）", male: 60, female: 55 },
            { age: "15～17（歳）", male: 65, female: 55 },
            { age: "18～29（歳）", male: 65, female: 50 },
            { age: "30～49（歳）", male: 65, female: 50 },
            { age: "50～64（歳）", male: 65, female: 50 },
            { age: "65～74（歳）", male: 60, female: 50 },
            { age: "75以上（歳）", male: 60, female: 50 },
            { age: "妊婦（初期）", male: null, female: "+0", note: "付加量" },
            { age: "妊婦（中期）", male: null, female: "+5", note: "付加量" },
            { age: "妊婦（後期）", male: null, female: "+25", note: "付加量" },
            { age: "授乳婦", male: null, female: "+20", note: "付加量" }
        ],
        description: "体の組織を構成し、酵素やホルモンとして働く栄養素です。筋肉量の維持・増加に必要です。",
        foodSources: ["肉", "魚", "卵", "大豆製品", "乳製品"]
    },
    chromium: {
        name: "クロム",
        unit: "μg/日",
        type: "目安量",
        values: [
            { age: "0～5（月）", male: 0.8, female: 0.8 },
            { age: "6～11（月）", male: 1.0, female: 1.0 },
            { age: "18～29（歳）", male: 10, female: 10 },
            { age: "30～49（歳）", male: 10, female: 10 },
            { age: "50～64（歳）", male: 10, female: 10 },
            { age: "65～74（歳）", male: 10, female: 10 },
            { age: "75以上（歳）", male: 10, female: 10 },
            { age: "妊婦", male: null, female: 10 },
            { age: "授乳婦", male: null, female: 10 }
        ],
        description: "糖質代謝に関わるミネラルで、インスリンの働きを助ける役割があります。",
        foodSources: ["全粒穀物", "ナッツ類", "肉類"]
    },
    molybdenum: {
        name: "モリブデン",
        unit: "μg/日",
        type: "推奨量",
        values: [
            { age: "0～5（月）", male: 2.5, female: 2.5, note: "目安量" },
            { age: "6～11（月）", male: 3.0, female: 3.0, note: "目安量" },
            { age: "1～2（歳）", male: 10, female: 10 },
            { age: "3～5（歳）", male: 10, female: 10 },
            { age: "6～7（歳）", male: 15, female: 15 },
            { age: "8～9（歳）", male: 20, female: 15 },
            { age: "10～11（歳）", male: 20, female: 20 },
            { age: "12～14（歳）", male: 25, female: 25 },
            { age: "15～17（歳）", male: 30, female: 25 },
            { age: "18～29（歳）", male: 30, female: 25 },
            { age: "30～49（歳）", male: 30, female: 25 },
            { age: "50～64（歳）", male: 30, female: 25 },
            { age: "65～74（歳）", male: 30, female: 25 },
            { age: "75以上（歳）", male: 25, female: 25 },
            { age: "妊婦", male: null, female: "+0", note: "付加量" },
            { age: "授乳婦", male: null, female: "+3.5", note: "付加量" }
        ],
        description: "酵素の構成成分として、アミノ酸や核酸の代謝に関わります。",
        foodSources: ["豆類", "穀物", "緑黄色野菜"]
    },
    fat: {
        name: "脂質",
        unit: "%エネルギー",
        type: "目標量範囲",
        values: [
            { age: "0～5（月）", male: 50, female: 50, note: "目安量" },
            { age: "6～11（月）", male: 40, female: 40, note: "目安量" },
            { age: "1～2（歳）", male: "20～30", female: "20～30" },
            { age: "3～5（歳）", male: "20～30", female: "20～30" },
            { age: "6～7（歳）", male: "20～30", female: "20～30" },
            { age: "8～9（歳）", male: "20～30", female: "20～30" },
            { age: "10～11（歳）", male: "20～30", female: "20～30" },
            { age: "12～14（歳）", male: "20～30", female: "20～30" },
            { age: "15～17（歳）", male: "20～30", female: "20～30" },
            { age: "18～29（歳）", male: "20～30", female: "20～30" },
            { age: "30～49（歳）", male: "20～30", female: "20～30" },
            { age: "50～64（歳）", male: "20～30", female: "20～30" },
            { age: "65～74（歳）", male: "20～30", female: "20～30" },
            { age: "75以上（歳）", male: "20～30", female: "20～30" },
            { age: "妊婦", male: null, female: "20～30" },
            { age: "授乳婦", male: null, female: "20～30" }
        ],
        description: "エネルギー源として、また脂溶性ビタミンの吸収を助ける働きがあります。",
        foodSources: ["油脂類", "肉類", "乳製品", "ナッツ類"]
    },
    carbohydrate: {
        name: "炭水化物",
        unit: "%エネルギー",
        type: "目標量範囲",
        values: [
            { age: "1～2（歳）", male: "50～65", female: "50～65" },
            { age: "3～5（歳）", male: "50～65", female: "50～65" },
            { age: "6～7（歳）", male: "50～65", female: "50～65" },
            { age: "8～9（歳）", male: "50～65", female: "50～65" },
            { age: "10～11（歳）", male: "50～65", female: "50～65" },
            { age: "12～14（歳）", male: "50～65", female: "50～65" },
            { age: "15～17（歳）", male: "50～65", female: "50～65" },
            { age: "18～29（歳）", male: "50～65", female: "50～65" },
            { age: "30～49（歳）", male: "50～65", female: "50～65" },
            { age: "50～64（歳）", male: "50～65", female: "50～65" },
            { age: "65～74（歳）", male: "50～65", female: "50～65" },
            { age: "75以上（歳）", male: "50～65", female: "50～65" },
            { age: "妊婦", male: null, female: "50～65" },
            { age: "授乳婦", male: null, female: "50～65" }
        ],
        description: "主要なエネルギー源であり、脳や赤血球のエネルギーとして重要です。",
        foodSources: ["穀物", "いも類", "砂糖", "果物"]
    },
    vitaminA: {
        name: "ビタミンA",
        unit: "μgRAE/日",
        type: "推奨量",
        values: [
            { age: "0～5（月）", male: 300, female: 300, note: "目安量" },
            { age: "6～11（月）", male: 400, female: 400, note: "目安量" },
            { age: "1～2（歳）", male: 400, female: 350 },
            { age: "3～5（歳）", male: 500, female: 500 },
            { age: "6～7（歳）", male: 500, female: 500 },
            { age: "8～9（歳）", male: 500, female: 500 },
            { age: "10～11（歳）", male: 600, female: 600 },
            { age: "12～14（歳）", male: 800, female: 700 },
            { age: "15～17（歳）", male: 900, female: 650 },
            { age: "18～29（歳）", male: 850, female: 650 },
            { age: "30～49（歳）", male: 900, female: 700 },
            { age: "50～64（歳）", male: 900, female: 700 },
            { age: "65～74（歳）", male: 850, female: 700 },
            { age: "75以上（歳）", male: 800, female: 650 },
            { age: "妊婦（初期）", male: null, female: "+0", note: "付加量" },
            { age: "妊婦（中期）", male: null, female: "+0", note: "付加量" },
            { age: "妊婦（後期）", male: null, female: "+80", note: "付加量" },
            { age: "授乳婦", male: null, female: "+450", note: "付加量" }
        ],
        description: "視覚、皮膚や粘膜の健康維持、免疫機能に関わる重要なビタミンです。",
        foodSources: ["レバー", "緑黄色野菜", "卵黄", "乳製品"]
    },
    calcium: {
        name: "カルシウム",
        unit: "mg/日",
        type: "推奨量",
        values: [
            { age: "0～5（月）", male: 200, female: 200, note: "目安量" },
            { age: "6～11（月）", male: 250, female: 250, note: "目安量" },
            { age: "1～2（歳）", male: 450, female: 400 },
            { age: "3～5（歳）", male: 600, female: 550 },
            { age: "6～7（歳）", male: 600, female: 550 },
            { age: "8～9（歳）", male: 650, female: 750 },
            { age: "10～11（歳）", male: 700, female: 750 },
            { age: "12～14（歳）", male: 1000, female: 800 },
            { age: "15～17（歳）", male: 800, female: 650 },
            { age: "18～29（歳）", male: 800, female: 650 },
            { age: "30～49（歳）", male: 750, female: 650 },
            { age: "50～64（歳）", male: 750, female: 650 },
            { age: "65～74（歳）", male: 750, female: 650 },
            { age: "75以上（歳）", male: 750, female: 600 },
            { age: "妊婦", male: null, female: "+0", note: "付加量" },
            { age: "授乳婦", male: null, female: "+0", note: "付加量" }
        ],
        description: "骨や歯の形成、筋肉の収縮、神経伝達、血液凝固など多くの機能に関わります。",
        foodSources: ["乳製品", "小魚", "大豆製品", "緑黄色野菜"]
    },
    iron: {
        name: "鉄",
        unit: "mg/日",
        type: "推奨量",
        values: [
            { age: "0～5（月）", male: 0.5, female: 0.5, note: "目安量" },
            { age: "6～11（月）", male: 4.5, female: 4.5 },
            { age: "1～2（歳）", male: 4.0, female: 4.0 },
            { age: "3～5（歳）", male: 5.0, female: 5.0 },
            { age: "6～7（歳）", male: 6.0, female: 6.0 },
            { age: "8～9（歳）", male: 7.5, female: 8.0 },
            { age: "10～11（歳）", male: 9.5, female: 9.0, femaleWithMenstruation: 12.5 },
            { age: "12～14（歳）", male: 9.0, female: 8.0, femaleWithMenstruation: 12.5 },
            { age: "15～17（歳）", male: 9.0, female: 6.5, femaleWithMenstruation: 11.0 },
            { age: "18～29（歳）", male: 7.0, female: 6.0, femaleWithMenstruation: 10.0 },
            { age: "30～49（歳）", male: 7.5, female: 6.0, femaleWithMenstruation: 10.5 },
            { age: "50～64（歳）", male: 7.0, female: 6.0, femaleWithMenstruation: 10.5 },
            { age: "65～74（歳）", male: 7.0, female: 6.0 },
            { age: "75以上（歳）", male: 6.5, female: 5.5 },
            { age: "妊婦（初期）", male: null, female: "+2.5", note: "付加量" },
            { age: "妊婦（中期・後期）", male: null, female: "+8.5", note: "付加量" },
            { age: "授乳婦", male: null, female: "+2.0", note: "付加量" }
        ],
        description: "赤血球のヘモグロビンの構成成分として、酸素を運搬する重要な役割を担います。",
        foodSources: ["レバー", "赤身肉", "貝類", "大豆製品", "ほうれん草"]
    }
};

// 栄養素カテゴリ分類
const nutritionCategories = {
    macronutrients: {
        name: "三大栄養素",
        nutrients: ["protein", "fat", "carbohydrate"]
    },
    vitamins: {
        name: "ビタミン類",
        nutrients: ["vitaminA"]
    },
    minerals: {
        name: "ミネラル類",
        nutrients: ["calcium", "iron", "chromium", "molybdenum"]
    }
};

// 栄養素情報の種類の説明
const nutritionTypeDescriptions = {
    "推奨量": "ほとんどの人（97～98%）が必要量を満たすと推定される量",
    "目安量": "健康な人々を対象として、ある一定の栄養状態を維持するのに十分な量",
    "目標量": "生活習慣病の発症予防のために、現在の日本人が当面の目標とすべき摂取量",
    "目標量範囲": "健康維持に適したエネルギー源の摂取割合"
}; 