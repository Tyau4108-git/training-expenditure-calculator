// ここから下はDOM Content Loadedの外に移動
// METs情報の読み込みを確認するためのタイマー
let metsDataCheckAttempts = 0;
// グローバル変数として外に出す
let trainingSectionsContainer;
let trainingSections;
let sectionCaloriesContainer;
let additionalSectionCount = 0;
let draggedSection = null;
let trainingResultCard;
let totalCaloriesResult;
let menuResults;
// 既存のセクションIDを保持する配列
let existingSectionIds = ['warmup', 'main', 'cooldown'];
// トレーニングメニューごとの計算結果を保持する配列
let sectionResults = [];

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('tdee-form');
    const resultCard = document.getElementById('result-card');
    const nutritionCard = document.getElementById('nutrition-card');
    const bmrResult = document.getElementById('bmr-result');
    const tdeeResult = document.getElementById('tdee-result');
    const weightLossResult = document.getElementById('weight-loss-result');
    const maintenanceResult = document.getElementById('maintenance-result');
    const muscleGainResult = document.getElementById('muscle-gain-result');
    const ageInput = document.getElementById('age');
    const activityLevelSelect = document.getElementById('activity-level');
    const activityLevelDescription = document.getElementById('activity-level-description');
    const activityLevelExamples = document.getElementById('activity-level-examples');
    const nutritionContent = document.getElementById('nutrition-content');
    const tabButtons = document.querySelectorAll('.tab-button');

    // トレーニング消費量計算用の要素
    const tdeeTab = document.getElementById('tdee-tab');
    const trainingTab = document.getElementById('training-tab');
    const tdeeCalculator = document.getElementById('tdee-calculator');
    const trainingCalculator = document.getElementById('training-calculator');
    const tdeeExplanation = document.getElementById('tdee-explanation');
    const trainingExplanation = document.getElementById('training-explanation');
    const trainingForm = document.getElementById('training-form');
    
    // トレーニング結果カードを初期化
    trainingResultCard = document.getElementById('training-result-card');
    
    // トレーニングセクション関連
    trainingSectionsContainer = document.getElementById('training-sections-container');
    sectionCaloriesContainer = document.getElementById('section-calories-container');
    
    // トレーニング消費量計算結果表示要素
    totalCaloriesResult = document.getElementById('total-calories-result');
    menuResults = document.getElementById('menu-results');
    const warmupCalories = document.getElementById('warmup-calories');
    const mainCalories = document.getElementById('main-calories');
    const cooldownCalories = document.getElementById('cooldown-calories');
    
    // 年齢別の身体活動レベル定義
    const activityLevelsByAge = [
        { min: 1, max: 2, levels: [null, 1.35, null], descriptions: ["", "ふつう", ""] },
        { min: 3, max: 5, levels: [null, 1.45, null], descriptions: ["", "ふつう", ""] },
        { min: 6, max: 7, levels: [1.35, 1.55, 1.75], descriptions: ["低い", "ふつう", "高い"] },
        { min: 8, max: 9, levels: [1.40, 1.60, 1.80], descriptions: ["低い", "ふつう", "高い"] },
        { min: 10, max: 11, levels: [1.45, 1.65, 1.85], descriptions: ["低い", "ふつう", "高い"] },
        { min: 12, max: 14, levels: [1.50, 1.70, 1.90], descriptions: ["低い", "ふつう", "高い"] },
        { min: 15, max: 17, levels: [1.55, 1.75, 1.95], descriptions: ["低い", "ふつう", "高い"] },
        { min: 18, max: 29, levels: [1.50, 1.75, 2.00], descriptions: ["低い", "ふつう", "高い"] },
        { min: 30, max: 49, levels: [1.50, 1.75, 2.00], descriptions: ["低い", "ふつう", "高い"] },
        { min: 50, max: 64, levels: [1.50, 1.75, 2.00], descriptions: ["低い", "ふつう", "高い"] },
        { min: 65, max: 74, levels: [1.50, 1.70, 1.90], descriptions: ["低い", "ふつう", "高い"] },
        { min: 75, max: 120, levels: [1.40, 1.70, null], descriptions: ["低い", "ふつう", ""] }
    ];

    // 身体活動レベルの詳細な説明とわかりやすい例
    const activityLevelDetails = {
        low: {
            title: "座っていることが多い生活",
            description: "一日のほとんどを座って過ごし、運動はほとんどしない生活スタイル",
            examples: [
                "デスクワークが中心の仕事",
                "通学・通勤で電車やバスに座っていることが多い",
                "休日はテレビを見たり、読書したりして過ごす",
                "運動はほとんどしない"
            ]
        },
        medium: {
            title: "適度に動く生活",
            description: "日常生活で立ったり歩いたりする時間が比較的多い生活スタイル",
            examples: [
                "立ち仕事や軽い肉体労働の仕事",
                "通学・通勤で歩く時間がある（一日20分程度）",
                "家事や買い物など、日常的に動く機会がある",
                "週に1〜2回程度の軽い運動やウォーキングをする"
            ]
        },
        high: {
            title: "活発に動く生活",
            description: "日常的に活発に体を動かし、定期的に運動する生活スタイル",
            examples: [
                "肉体労働が多い仕事",
                "一日の大部分を立ったり歩いたりして過ごす",
                "定期的なスポーツや運動を週に3回以上行う",
                "日常的に長時間のウォーキングや自転車通勤をする"
            ]
        }
    };

    // 年齢グループごとのわかりやすい説明
    const ageGroupDescriptions = {
        child: "子どもの場合は、遊びや学校での活動も含めて考えてください。",
        teen: "部活動やスポーツをしているかどうかで活動レベルが変わります。",
        adult: "仕事の内容や通勤方法、運動習慣などから選んでください。",
        senior: "健康維持のための活動量を考慮して選んでください。"
    };

    // 目標カロリー計算の定数
    const WEIGHT_LOSS_MIN_PERCENT = 0.10; // 10%減
    const WEIGHT_LOSS_MAX_PERCENT = 0.20; // 20%減
    const MUSCLE_GAIN_PERCENT = 0.075;    // 7.5%増

    // 最初は結果カードと栄養素カードを非表示
    resultCard.style.display = 'none';
    nutritionCard.style.display = 'none';
    if (trainingResultCard) {
        trainingResultCard.style.display = 'none';
    }

    // 年齢入力時に身体活動レベルを更新
    ageInput.addEventListener('input', updateActivityLevels);
    ageInput.addEventListener('change', updateActivityLevels);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        calculateTDEE();
        displayNutritionInfo();
    });

    // 身体活動レベルの選択肢を更新する関数
    function updateActivityLevels() {
        const age = parseInt(ageInput.value);
        
        // 入力値のクリア
        activityLevelSelect.innerHTML = '';
        activityLevelDescription.textContent = '';
        activityLevelExamples.innerHTML = '';
        
        if (isNaN(age) || age < 1) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 年齢を入力してください --';
            activityLevelSelect.appendChild(defaultOption);
            return;
        }
        
        // 年齢に対応する身体活動レベルを見つける
        const ageGroup = activityLevelsByAge.find(group => age >= group.min && age <= group.max);
        
        if (ageGroup) {
            // デフォルトオプション
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 選択してください --';
            activityLevelSelect.appendChild(defaultOption);
            
            // 各レベルのオプションを追加
            ageGroup.levels.forEach((level, index) => {
                if (level !== null) {
                    const option = document.createElement('option');
                    option.value = level;
                    const levelNumber = index + 1;
                    const levelName = ageGroup.descriptions[index];
                    
                    // 活動レベルの説明を簡潔に
                    let levelTitle = "";
                    if (index === 0) levelTitle = activityLevelDetails.low.title;
                    else if (index === 1) levelTitle = activityLevelDetails.medium.title;
                    else if (index === 2) levelTitle = activityLevelDetails.high.title;
                    
                    option.textContent = `レベル ${levelNumber} (${levelName}) - ${levelTitle}`;
                    activityLevelSelect.appendChild(option);
                }
            });
            
            // 年齢に応じた説明を追加
            let ageDescription = "";
            if (age < 12) {
                ageDescription = ageGroupDescriptions.child;
            } else if (age < 18) {
                ageDescription = ageGroupDescriptions.teen;
            } else if (age < 65) {
                ageDescription = ageGroupDescriptions.adult;
            } else {
                ageDescription = ageGroupDescriptions.senior;
            }
            
            activityLevelDescription.textContent = `${age}歳向けの活動レベル: ${ageDescription}`;
        } else {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 対応する年齢区分がありません --';
            activityLevelSelect.appendChild(defaultOption);
        }
        
        // 最初のオプションを選択
        if (activityLevelSelect.options.length > 1) {
            activityLevelSelect.selectedIndex = 1;
            activityLevelSelect.dispatchEvent(new Event('change'));
        }
    }

    // 身体活動レベル変更時の説明更新
    activityLevelSelect.addEventListener('change', () => {
        const selectedIndex = activityLevelSelect.selectedIndex;
        if (selectedIndex <= 0) {
            activityLevelExamples.innerHTML = '';
            return;
        }
        
        let levelDetail;
        if (selectedIndex === 1) {
            levelDetail = activityLevelDetails.low;
        } else if (selectedIndex === 2) {
            levelDetail = activityLevelDetails.medium;
        } else if (selectedIndex === 3) {
            levelDetail = activityLevelDetails.high;
        }
        
        if (levelDetail) {
            activityLevelExamples.innerHTML = `
                <h4>${levelDetail.title}</h4>
                <p>${levelDetail.description}</p>
                <p>例えば：</p>
                <ul>
                    ${levelDetail.examples.map(ex => `<li>${ex}</li>`).join('')}
                </ul>
            `;
        }
    });

    function calculateTDEE() {
        // フォームからデータを取得
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const bodyFat = parseFloat(document.getElementById('body-fat').value) || null;
        const activityLevel = parseFloat(document.getElementById('activity-level').value);

        // 入力値の検証
        if (isNaN(age) || isNaN(weight) || isNaN(height)) {
            alert('年齢、体重、身長には数値を入力してください。');
            return;
        }
        
        if (!activityLevel) {
            alert('身体活動レベルを選択してください。');
            return;
        }

        let bmr;

        // 新しい計算式を使用
        // ((0.1238+(0.0481×体重kg)+(0.0234×身長cm)-(0.0138×年齢)-性別*1))×1000/4.186
        // 注）*1；男性=0.5473×1、女性=0.5473×2
        const genderFactor = gender === 'male' ? 0.5473 : 0.5473 * 2;
        bmr = ((0.1238 + (0.0481 * weight) + (0.0234 * height) - (0.0138 * age) - genderFactor)) * 1000 / 4.186;

        // 1日あたりの総エネルギー消費量(TDEE)を計算
        const tdee = bmr * activityLevel;
        
        // 目標カロリーの計算
        // 体重減少: TDEEから10-20%減らす（平均値を表示）
        const weightLossMinCal = tdee * (1 - WEIGHT_LOSS_MAX_PERCENT); // 20%減
        const weightLossMaxCal = tdee * (1 - WEIGHT_LOSS_MIN_PERCENT); // 10%減
        const weightLossCal = Math.round((weightLossMinCal + weightLossMaxCal) / 2); // 平均値
        
        // 筋肉増加: TDEEから7.5%増やす
        const muscleGainCal = Math.round(tdee * (1 + MUSCLE_GAIN_PERCENT));
        
        // 現状維持: TDEEそのまま
        const maintenanceCal = Math.round(tdee);

        // 結果を表示
        bmrResult.textContent = `${Math.round(bmr)} kcal/日`;
        tdeeResult.textContent = `${maintenanceCal} kcal/日`;
        weightLossResult.textContent = `${weightLossCal} kcal/日`;
        maintenanceResult.textContent = `${maintenanceCal} kcal/日`;
        muscleGainResult.textContent = `${muscleGainCal} kcal/日`;

        // 結果カードを表示
        resultCard.style.display = 'block';
        nutritionCard.style.display = 'block';

        // 滑らかにスクロール
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // 結果表示時のアニメーション
        animateValue(bmrResult, 0, Math.round(bmr), 1000);
        animateValue(tdeeResult, 0, maintenanceCal, 1200);
        animateValue(weightLossResult, 0, weightLossCal, 1400);
        animateValue(maintenanceResult, 0, maintenanceCal, 1600);
        animateValue(muscleGainResult, 0, muscleGainCal, 1800);

        // BMI情報の更新を追加
        updateBMIInfo(weight, height, age);
        
        // 結果セクションを表示
        document.querySelector('.result-section').classList.add('visible');
    }

    // 数値をアニメーションさせる関数
    function animateValue(element, start, end, duration) {
        const originalText = element.textContent;
        const unitText = originalText.replace(/[0-9-]/g, '').trim();
        let startTimestamp = null;
        
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = `${value} ${unitText}`;
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        
        window.requestAnimationFrame(step);
    }

    // 初期ページロード時のアニメーション
    function initializeAnimations() {
        // フォームグループのアニメーションはCSSで処理
        
        // ボタンのアニメーション
        const calculateBtn = document.querySelector('.calculate-btn');
        calculateBtn.style.opacity = '0';
        calculateBtn.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            calculateBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            calculateBtn.style.opacity = '1';
            calculateBtn.style.transform = 'translateY(0)';
        }, 800);
    }

    // ページロード時のアニメーションを初期化
    initializeAnimations();

    function calculateBMI(weight, height) {
        return weight / Math.pow(height / 100, 2);
    }

    function getBMICategory(bmi) {
        if (bmi < 18.5) {
            return {
                name: '低体重',
                color: '#ff6b6b',
                rgb: '255, 107, 107'
            };
        } else if (bmi < 25) {
            return {
                name: '標準体重',
                color: '#20bf6b',
                rgb: '32, 191, 107'
            };
        } else if (bmi < 30) {
            return {
                name: '過体重',
                color: '#f7b731',
                rgb: '247, 183, 49'
            };
        } else {
            return {
                name: '肥満',
                color: '#eb3b5a',
                rgb: '235, 59, 90'
            };
        }
    }

    function getIdealWeight(height) {
        // BMI 22を目標として理想体重を計算し、範囲を±10%とする
        const idealWeight = 22 * Math.pow(height / 100, 2);
        return {
            min: idealWeight * 0.9,
            max: idealWeight * 1.1
        };
    }

    function getAgeRangeBMI(age) {
        // 年齢別の適正BMI範囲（一般的な目安）
        if (age < 18) {
            return { min: 18.5, max: 24 };
        } else if (age < 30) {
            return { min: 19, max: 24 };
        } else if (age < 50) {
            return { min: 20, max: 25 };
        } else if (age < 65) {
            return { min: 21, max: 26 };
        } else {
            return { min: 22, max: 27 };
        }
    }

    function getBMIScoreInfo() {
        return 'BMIスコア: 18.5未満=低体重, 18.5-24.99=標準体重, 25-29.99=過体重, 30以上=肥満';
    }

    function updateBMIInfo(weight, height, age) {
        const bmi = calculateBMI(weight, height);
        const bmiCategory = getBMICategory(bmi);
        const idealWeightRange = getIdealWeight(height);
        const ageRangeBMI = getAgeRangeBMI(age);
        
        // BMI値と分類を表示
        document.querySelector('.bmi-current').textContent = bmi.toFixed(1);
        document.querySelector('.status-category').textContent = bmiCategory.name;
        
        // ステータスインジケータの色を更新
        const statusIndicator = document.querySelector('.status-indicator');
        const statusContainer = document.querySelector('.status-category-container');
        const statusCategory = document.querySelector('.status-category');
        
        statusIndicator.style.backgroundColor = bmiCategory.color;
        statusContainer.style.backgroundColor = `rgba(${bmiCategory.rgb}, 0.1)`;
        statusCategory.style.color = bmiCategory.color;
        
        // 理想体重情報の更新
        document.querySelector('.ideal-min-value').textContent = idealWeightRange.min.toFixed(1);
        document.querySelector('.ideal-max-value').textContent = idealWeightRange.max.toFixed(1);
        document.querySelector('.current-weight-value').textContent = weight.toFixed(1);
        
        // 年齢別の適正BMI範囲を表示
        document.querySelector('.age-range-bmi span').textContent = `${ageRangeBMI.min} - ${ageRangeBMI.max}`;
        
        // レコメンデーションの更新
        updateBMIRecommendations(bmi, bmiCategory, weight, idealWeightRange, age);
    }

    function updateBMIRecommendations(bmi, bmiCategory, weight, idealWeight, age) {
        const recommendationText = document.querySelector('.recommendation-text');
        const idealMidWeight = (idealWeight.min + idealWeight.max) / 2;
        const weightDiff = weight - idealMidWeight;
        
        let recommendation = '';
        
        if (bmi < 18.5) {
            recommendation = `BMIが${bmi.toFixed(1)}の場合、低体重に分類されます。理想体重までは約${Math.abs(weightDiff).toFixed(1)}kgの増量が推奨されます。栄養バランスの取れた食事と適切な運動を心がけましょう。`;
        } else if (bmi >= 18.5 && bmi < 25) {
            if (Math.abs(weightDiff) < 3) {
                recommendation = `BMIが${bmi.toFixed(1)}で標準体重の範囲です。現在の体重は理想的な範囲内にあります。健康的な生活習慣を継続しましょう。`;
            } else if (weightDiff > 0) {
                recommendation = `BMIが${bmi.toFixed(1)}で標準体重の範囲ですが、理想的な体重より約${weightDiff.toFixed(1)}kg多いです。バランスの良い食事と定期的な運動を心がけましょう。`;
            } else {
                recommendation = `BMIが${bmi.toFixed(1)}で標準体重の範囲ですが、理想的な体重より約${Math.abs(weightDiff).toFixed(1)}kg少ないです。栄養バランスに注意して健康的な体重を維持しましょう。`;
            }
        } else if (bmi >= 25 && bmi < 30) {
            recommendation = `BMIが${bmi.toFixed(1)}で過体重に分類されます。理想体重まで約${weightDiff.toFixed(1)}kgの減量が推奨されます。バランスの良い食事と適度な運動を心がけましょう。`;
        } else {
            recommendation = `BMIが${bmi.toFixed(1)}で肥満に分類されます。健康リスクを下げるために、約${weightDiff.toFixed(1)}kgの減量が推奨されます。医師や栄養士に相談しながら、健康的な食事と定期的な運動を心がけましょう。`;
        }
        
        // 年齢に応じた追加アドバイス
        if (age < 18) {
            recommendation += ` なお、成長期の方は、BMIの評価は成人とは異なる場合があります。健全な成長のためにバランスの良い食事を心がけましょう。`;
        } else if (age >= 65) {
            recommendation += ` 高齢の方は、極端な体重変化よりも、筋力維持と栄養バランスが重要です。急激なダイエットは避け、適度な運動と栄養バランスの良い食事を心がけましょう。`;
        }
        
        recommendationText.textContent = recommendation;
    }

    // タブ切り替え機能
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // アクティブなタブをリセット
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // クリックされたタブをアクティブに
            button.classList.add('active');
            // 対応するカテゴリの栄養素を表示
            const category = button.getAttribute('data-category');
            displayNutritionCategory(category);
        });
    });

    // 栄養素情報を表示する関数
    function displayNutritionInfo() {
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        
        // アクティブなタブを取得
        const activeTab = document.querySelector('.tab-button.active');
        const category = activeTab ? activeTab.getAttribute('data-category') : 'macronutrients';
        
        // そのカテゴリの栄養素を表示
        displayNutritionCategory(category);
    }

    // 特定のカテゴリの栄養素を表示する関数
    function displayNutritionCategory(category) {
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        
        if (isNaN(age)) return;
        
        // ローディング表示
        nutritionContent.innerHTML = `
            <div class="nutrition-loading">
                <div class="spinner"></div>
                <p>あなたの年齢と性別に基づいた栄養素情報を読み込んでいます...</p>
            </div>
        `;
        
        // 少し遅延を入れてローディングアニメーションを見せる
        setTimeout(() => {
            // 選択されたカテゴリの栄養素リストを取得
            const nutrients = nutritionCategories[category].nutrients;
            
            let html = `<h3 class="nutrition-category-title">${nutritionCategories[category].name}</h3>`;
            html += `<div class="nutrition-cards">`;
            
            // 各栄養素のカードを作成
            nutrients.forEach(nutrientKey => {
                const nutrient = nutritionData[nutrientKey];
                const ageGroup = getNutrientValueForAge(nutrient, age);
                const genderValue = gender === 'male' ? ageGroup.male : 
                                   (gender === 'female' && nutrientKey === 'iron' && age >= 10 && age <= 64) ? 
                                   ageGroup.femaleWithMenstruation || ageGroup.female : ageGroup.female;
                
                // 栄養素のタイプに基づいてスタイルクラスを決定
                let typeClass = '';
                if (nutrient.type.includes('推奨量')) typeClass = 'recommended';
                else if (nutrient.type.includes('目安量')) typeClass = 'adequate';
                else if (nutrient.type.includes('目標量')) typeClass = 'target';
                
                html += `
                    <div class="nutrition-card-item ${typeClass}">
                        <div class="nutrition-icon">
                            ${getNutrientIcon(nutrientKey)}
                        </div>
                        <div class="nutrition-card-content">
                            <h4>${nutrient.name}</h4>
                            <div class="nutrition-value">
                                <span class="value-number">${genderValue !== null ? genderValue : '-'}</span>
                                <span class="value-unit">${nutrient.unit}</span>
                            </div>
                            <div class="nutrition-type">${nutrient.type}${ageGroup.note ? `（${ageGroup.note}）` : ''}</div>
                            <p class="nutrition-description">${nutrient.description}</p>
                            <div class="food-sources">
                                <h5>代表的な食品源:</h5>
                                <div class="food-tags">
                                    ${nutrient.foodSources.map(food => `<span class="food-tag">${food}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            
            nutritionContent.innerHTML = html;
            
            // 値のアニメーション
            document.querySelectorAll('.value-number').forEach(el => {
                const value = el.textContent;
                if (value !== '-' && !value.startsWith('+')) {
                    const numericValue = parseFloat(value);
                    if (!isNaN(numericValue)) {
                        animateValue(el, 0, numericValue, 1200);
                    }
                }
            });
        }, 500);
    }

    // 年齢に対応する栄養素値を取得する関数
    function getNutrientValueForAge(nutrient, age) {
        let matchingValue = null;
        
        // 妊娠中や授乳中の場合は特別な処理が必要になるため、今回は対象外とします
        
        // 年齢範囲からマッチする値を見つける
        for (const value of nutrient.values) {
            const ageRange = value.age;
            
            // 特殊なケース（妊婦、授乳婦）をスキップ
            if (ageRange.includes('妊婦') || ageRange.includes('授乳婦')) continue;
            
            // 年齢範囲を解析
            const match = ageRange.match(/(\d+)～(\d+)（([^）]+)）/);
            if (match) {
                const minAge = parseInt(match[1]);
                const maxAge = parseInt(match[2]);
                const unit = match[3];
                
                // 月齢の処理
                if (unit === '月') {
                    if (age < 1 && age * 12 >= minAge && age * 12 <= maxAge) {
                        matchingValue = value;
                        break;
                    }
                } 
                // 年齢の処理
                else if (unit === '歳') {
                    if (age >= minAge && age <= maxAge) {
                        matchingValue = value;
                        break;
                    }
                }
            }
            // 「75以上（歳）」のような特殊なケース
            else if (ageRange.includes('以上')) {
                const match = ageRange.match(/(\d+)以上（([^）]+)）/);
                if (match) {
                    const minAge = parseInt(match[1]);
                    if (age >= minAge) {
                        matchingValue = value;
                        break;
                    }
                }
            }
        }
        
        // マッチする値が見つからない場合はデフォルト値を返す
        return matchingValue || { age: "不明", male: "-", female: "-" };
    }

    // 栄養素アイコンを取得する関数
    function getNutrientIcon(nutrientKey) {
        const icons = {
            protein: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 5a5 5 0 1 1 0 10a5 5 0 0 1 0-10zm10 0a5 5 0 1 1 0 10a5 5 0 0 1 0-10zM7 15a9 9 0 0 0 10 0"/>
                    </svg>`,
            fat: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8zM17 12m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0"/>
                </svg>`,
            carbohydrate: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17l-4 4l-4-4m8-10l-4-4l-4 4M4 21h16M4 3h16M4 9h16M4 15h16"/>
                        </svg>`,
            vitaminA: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 11h4M6 14a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2H9a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2M15 5v14"/>
                    </svg>`,
            calcium: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0v-6a3 3 0 0 1 3-3zm0-5a2 2 0 0 1 2 2v1a2 2 0 1 1-4 0V5c0-1.1.9-2 2-2z"/>
                    </svg>`,
            iron: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 16v2M3 10v4h5m3-6h6a3 3 0 0 1 0 6H8m-5 0h18M4 8h1M12 8h7M21 12h-7"/>
                </svg>`,
            chromium: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v19m0-19l-8 6m8-6l8 6"/>
                    </svg>`,
            molybdenum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
                            <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12h-2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2zM7 6l5 12l5-12M3 4v16"/>
                        </svg>`
        };
        
        return icons[nutrientKey] || icons.protein;
    }

    // 初期化処理
    initializeTabs();
    initializeTrainingForm();
    
    // METs情報のチェック処理を実行
    checkMetsDataLoaded();

    // タブの初期化と切り替え機能の設定
    function initializeTabs() {
        console.log('タブ初期化');
        if (tdeeTab && trainingTab) {
            tdeeTab.addEventListener('click', () => {
                switchTab('tdee');
            });
            
            trainingTab.addEventListener('click', () => {
                switchTab('training');
            });
        } else {
            console.error('タブ要素が見つかりません: tdeeTab=', tdeeTab, 'trainingTab=', trainingTab);
        }
    }

    // タブ切り替え処理
    function switchTab(tabName) {
        console.log('タブ切り替え:', tabName);
        
        if (!tdeeTab || !trainingTab) {
            console.error('タブ要素が未定義です: tdeeTab=', tdeeTab, 'trainingTab=', trainingTab);
            return;
        }
        
        if (!tdeeCalculator || !trainingCalculator) {
            console.error('計算機要素が未定義です: tdeeCalculator=', tdeeCalculator, 'trainingCalculator=', trainingCalculator);
            return;
        }
        
        console.log('タブ切り替え前の状態: tdeeTab.classList=', tdeeTab.classList, 'trainingTab.classList=', trainingTab.classList);
        
        // タブの切り替え
        if (tabName === 'tdee') {
            tdeeTab.classList.add('active');
            trainingTab.classList.remove('active');
            tdeeCalculator.style.display = 'block';
            trainingCalculator.style.display = 'none';
            tdeeExplanation.style.display = 'block';
            trainingExplanation.style.display = 'none';
            
            // TDEEの計算結果を表示（あれば）
            if (resultCard.style.display === 'block') {
                resultCard.style.display = 'block';
                nutritionCard.style.display = 'block';
            }
            
            // トレーニング結果は非表示
            if (trainingResultCard) {
                trainingResultCard.style.display = 'none';
            }
            
            console.log('TDEE計算タブに切り替えました');
        } else {
            tdeeTab.classList.remove('active');
            trainingTab.classList.add('active');
            tdeeCalculator.style.display = 'none';
            trainingCalculator.style.display = 'block';
            tdeeExplanation.style.display = 'none';
            trainingExplanation.style.display = 'block';
            
            // TDEEの計算結果を非表示
            resultCard.style.display = 'none';
            nutritionCard.style.display = 'none';
            
            // トレーニング結果を表示（あれば）
            if (trainingResultCard) {
                // 計算結果があれば表示する
                if (trainingResultCard.getAttribute('data-has-results') === 'true' || 
                    (totalCaloriesResult && totalCaloriesResult.textContent && 
                    totalCaloriesResult.textContent !== '- kcal')) {
                    trainingResultCard.style.display = 'block';
                }
            }
            
            // アクティビティセレクトボックスを初期化（即時実行）
            populateActivitySelects();
            
            console.log('トレーニング消費量タブに切り替えました');
        }
        
        console.log('タブ切り替え後の状態: tdeeTab.classList=', tdeeTab.classList, 'trainingTab.classList=', trainingTab.classList);
    }

    // トレーニングフォームの初期化
    function initializeTrainingForm() {
        console.log('トレーニングフォーム初期化開始');
        
        // トレーニングフォーム要素を取得
        const trainingFormElement = document.getElementById('training-form');
        
        if (!trainingFormElement) {
            console.error('トレーニングフォーム要素が見つかりません');
            return;
        }
        
        console.log('トレーニングフォーム要素が見つかりました');
        
        // 既存のイベントリスナーを削除して再設定（重複防止）
        const newForm = trainingFormElement.cloneNode(true);
        trainingFormElement.parentNode.replaceChild(newForm, trainingFormElement);
        
        // 新しいフォームに対してイベントリスナーを設定
        newForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('トレーニングフォームのsubmitイベントが発火しました');
            calculateTrainingCalories();
        });
        
        // 計算ボタンにもクリックイベントを追加（念のため）
        const calculateBtn = newForm.querySelector('.calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('計算ボタンがクリックされました');
                calculateTrainingCalories();
            });
        }
        
        // トレーニングメニュー追加ボタンのイベントリスナーを設定
        const addMenuBtn = document.getElementById('add-training-menu-btn');
        if (addMenuBtn) {
            addMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addTrainingMenu();
            });
        }
        
        // 既存の削除ボタンのイベントリスナーを設定
        const existingRemoveBtns = document.querySelectorAll('.remove-section-btn');
        existingRemoveBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionIdToRemove = this.getAttribute('data-section-id');
                removeTrainingSection(sectionIdToRemove);
            });
        });
        
        // セクション管理関連の初期化
        initDragAndDrop();
        
        // トレーニングメニュー名の変更をリアルタイムで反映するための機能を初期化
        initMenuForm();
        
        // METs情報が読み込まれていればセレクトボックスを初期化
        if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
            populateActivitySelects();
        }
        
        console.log('トレーニングフォーム初期化完了');
    }

    // ドラッグ&ドロップ機能の初期化
    function initDragAndDrop() {
        console.log('ドラッグ&ドロップ機能を初期化しています');
        const container = document.getElementById('training-sections-container');
        trainingSections = document.querySelectorAll('.training-section');
        
        // スタイルを動的に追加
        addDragAndDropStyles();
        
        trainingSections.forEach(section => {
            // セクション要素を取得
            const handle = section.querySelector('.training-section-handle');
            
            // ドラッグハンドルのスタイルを強調して視覚的にドラッグ可能であることを示す
            if (handle) {
                handle.style.cursor = 'grab';
                handle.title = 'ドラッグしてメニューの順序を変更';
                handle.classList.add('draggable-handle');
                
                // マウスイベントリスナー
                handle.removeEventListener('mousedown', handleDragStart);
                handle.addEventListener('mousedown', handleDragStart);
                
                // タッチデバイス用のイベントリスナー
                handle.removeEventListener('touchstart', handleTouchStart);
                handle.addEventListener('touchstart', handleTouchStart, { passive: false });
            }
        });
        
        // コンテナのイベントリスナー
        if (container) {
            // マウスイベント
            container.removeEventListener('dragover', handleDragOver);
            container.addEventListener('dragover', handleDragOver);
            
            container.removeEventListener('drop', handleDrop);
            container.addEventListener('drop', handleDrop);
            
            // モバイル用のドラッグエリア全体のイベント
            container.removeEventListener('touchmove', handleTouchMove);
            container.addEventListener('touchmove', handleTouchMove, { passive: false });
            
            container.removeEventListener('touchend', handleTouchEnd);
            container.addEventListener('touchend', handleTouchEnd);
        }
        
        // 画面外ドロップの対策としてdocumentにもイベントを設定
        document.removeEventListener('dragend', handleDragEnd);
        document.addEventListener('dragend', handleDragEnd);
    }

    // ドラッグスタートハンドラー（ハンドル要素に対して）
    function handleDragStart(e) {
        // ハンドルからセクション要素を見つける
        const section = this.closest('.training-section');
        if (!section) return;
        
        // グローバル変数にドラッグ中のセクションを保存
        draggedSection = section;
        
        // スタイル変更
        this.style.cursor = 'grabbing';
        
        // ドラッグ操作のためにセクションをドラッグ可能に設定
        section.setAttribute('draggable', 'true');
        
        // ドラッグ操作を開始
        section.ondragstart = function(event) {
            event.dataTransfer.effectAllowed = 'move';
            // Firefoxでドラッグを開始するために必要
            event.dataTransfer.setData('text/plain', '');
            
            // ドラッグ中のスタイル
            section.classList.add('dragging');
            
            // すべてのセクションのzインデックスをリセット
            const allSections = document.querySelectorAll('.training-section');
            allSections.forEach(s => {
                s.style.zIndex = s === section ? '10' : '1';
            });
        };
        
        // マウスアップリスナーを追加
        document.addEventListener('mouseup', function onMouseUp() {
            document.removeEventListener('mouseup', onMouseUp);
            if (section) {
                const handle = section.querySelector('.training-section-handle');
                if (handle) {
                    handle.style.cursor = 'grab';
                }
            }
        });
    }

    // モバイル用タッチスタートハンドラー
    function handleTouchStart(e) {
        e.preventDefault(); // デフォルトのスクロール動作を防止
        
        const section = this.closest('.training-section');
        if (!section) return;
        
        // グローバル変数にドラッグ中のセクションを保存
        draggedSection = section;
        
        // ドラッグ中のスタイル
        section.classList.add('dragging');
        
        // タッチ位置を記録
        const touch = e.touches[0];
        const startY = touch.clientY;
        section.dataset.startY = startY;
        section.dataset.startTop = section.offsetTop;
        
        // すべてのセクションのzインデックスをリセット
        const allSections = document.querySelectorAll('.training-section');
        allSections.forEach(s => {
            s.style.zIndex = s === section ? '10' : '1';
        });
    }

    // モバイル用タッチムーブハンドラー
    function handleTouchMove(e) {
        e.preventDefault(); // スクロールを防止
        
        if (!draggedSection) return;
        
        const touch = e.touches[0];
        const currentY = touch.clientY;
        const container = document.getElementById('training-sections-container');
        
        // ドラッグ位置に基づいて適切な位置にセクションを移動
        const afterElement = getTouchAfterElement(container, currentY);
        
        if (afterElement == null) {
            container.appendChild(draggedSection);
        } else {
            container.insertBefore(draggedSection, afterElement);
        }
    }

    // モバイル用タッチ終了ハンドラー
    function handleTouchEnd(e) {
        if (!draggedSection) return;
        
        // ドラッグ終了のスタイルリセット
        draggedSection.classList.remove('dragging');
        draggedSection.removeAttribute('data-start-y');
        draggedSection.removeAttribute('data-start-top');
        
        // ドラッグ&ドロップ後の視覚的フィードバック
        const allSections = document.querySelectorAll('.training-section');
        allSections.forEach(section => {
            section.classList.add('drag-complete');
            setTimeout(() => {
                section.classList.remove('drag-complete');
            }, 500);
        });
        
        // 直ちに結果表示の順序を更新（遅延なし）
        updateMenuResultsOrder();
        
        // グローバル変数をリセット
        const finishedSection = draggedSection;
        draggedSection = null;
        
        // 入力値を確実に保持するために、フォーカスを一度設定してから外す
        const titleInput = finishedSection.querySelector('.section-title-input');
        if (titleInput) {
            // タイトル入力の状態を保存
            const savedTitle = titleInput.value;
            // 明示的に値を再設定して状態を確実に保存
            setTimeout(() => {
                titleInput.value = savedTitle;
            }, 10);
        }
    }

    // ドラッグ終了ハンドラー
    function handleDragEnd(e) {
        if (!draggedSection) return;
        
        // ドラッグ終了時の処理
        draggedSection.classList.remove('dragging');
        draggedSection.setAttribute('draggable', 'false');
        
        // ドラッグ&ドロップ後の視覚的フィードバック
        const allSections = document.querySelectorAll('.training-section');
        allSections.forEach(section => {
            section.classList.add('drag-complete');
            setTimeout(() => {
                section.classList.remove('drag-complete');
            }, 500);
        });
        
        // 直ちに結果表示の順序を更新（遅延なし）
        updateMenuResultsOrder();
        
        // グローバル変数を一時保存してリセット
        const finishedSection = draggedSection;
        draggedSection = null;
        
        // 入力値を確実に保持するために、フォーカスを一度設定してから外す
        const titleInput = finishedSection.querySelector('.section-title-input');
        if (titleInput) {
            // タイトル入力の状態を保存
            const savedTitle = titleInput.value;
            // 明示的に値を再設定して状態を確実に保存
            setTimeout(() => {
                titleInput.value = savedTitle;
            }, 10);
        }
    }

    // ドラッグオーバーハンドラー
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const draggable = document.querySelector('.dragging');
        if (!draggable) return;
        
        const afterElement = getDragAfterElement(this, e.clientY);
        
        if (afterElement == null) {
            this.appendChild(draggable);
        } else {
            this.insertBefore(draggable, afterElement);
        }
    }

    // ドロップハンドラー
    function handleDrop(e) {
        e.preventDefault();
        console.log('アイテムがドロップされました');
        
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            draggable.classList.remove('dragging');
            draggable.setAttribute('draggable', 'false');
        }
        
        // ドロップ後のセクションの順序を更新
        updateMenuResultsOrder();
        
        // グローバル変数をリセット
        draggedSection = null;
        
        return false;
    }

    // マウス位置に基づいて要素の挿入位置を決定
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.training-section:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // タッチ位置に基づいて要素の挿入位置を決定（モバイル用）
    function getTouchAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.training-section:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // ドラッグ&ドロップのスタイルを動的に追加
    function addDragAndDropStyles() {
        // 既存のスタイル要素があれば削除
        const existingStyle = document.getElementById('drag-drop-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        // 新しいスタイル要素を作成
        const styleEl = document.createElement('style');
        styleEl.id = 'drag-drop-styles';
        styleEl.textContent = `
            .draggable-handle {
                background-color: rgba(0, 150, 255, 0.1);
                border-radius: 4px;
                padding: 4px;
                margin: -4px;
                transition: all 0.2s ease;
                touch-action: none; /* タッチスクロールを防止 */
            }
            
            .draggable-handle:hover {
                background-color: rgba(0, 150, 255, 0.2);
                transform: scale(1.1);
            }
            
            .draggable-handle:active {
                background-color: rgba(0, 150, 255, 0.3);
                cursor: grabbing;
            }
            
            .training-section {
                transition: background-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
                position: relative;
                z-index: 1;
                touch-action: pan-x; /* 縦スクロールのみ禁止 */
            }
            
            .training-section.dragging {
                background-color: rgba(0, 150, 255, 0.1);
                transform: scale(1.02);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
                z-index: 10;
                opacity: 0.9;
            }
            
            .training-section.drag-complete {
                animation: pulse 0.5s ease;
            }
            
            @keyframes pulse {
                0% { background-color: rgba(0, 150, 255, 0); }
                50% { background-color: rgba(0, 150, 255, 0.2); }
                100% { background-color: rgba(0, 150, 255, 0); }
            }
        `;
        
        // スタイルをドキュメントに追加
        document.head.appendChild(styleEl);
    }

    // トレーニングセクションを追加

    // トレーニングセクションを削除
    function removeTrainingSection(sectionId) {
        // デフォルトの3つのセクションは削除不可
        if (['warmup', 'main', 'cooldown'].includes(sectionId)) {
            alert('デフォルトのトレーニングメニューは削除できません。');
            return;
        }
        
        // フォームからセクションを削除
        const sectionToRemove = document.querySelector(`.training-section[data-section-id="${sectionId}"]`);
        if (sectionToRemove) {
            sectionToRemove.remove();
        }
        
        // 結果表示からも削除
        const resultItemToRemove = document.querySelector(`.details-item[data-section-id="${sectionId}"]`);
        if (resultItemToRemove) {
            resultItemToRemove.remove();
        }
        
        // 既存IDリストからセクションIDを削除
        const index = existingSectionIds.indexOf(sectionId);
        if (index !== -1) {
            existingSectionIds.splice(index, 1);
        }
        
        // 残りのセクションのタイトルを再番号付け（デフォルトタイトルの場合のみ）
        const sections = document.querySelectorAll('.training-section');
        sections.forEach((section, index) => {
            const titleInput = section.querySelector('.section-title-input');
            if (titleInput && titleInput.value.match(/^トレーニングメニュー\d+$/)) {
                const newTitle = `トレーニングメニュー${index + 1}`;
                titleInput.value = newTitle;
                
                // 結果表示側のタイトルも更新
                const sectionId = section.getAttribute('data-section-id');
                const resultTitle = document.querySelector(`.training-menu-title[data-section-id="${sectionId}"]`);
                if (resultTitle) {
                    resultTitle.textContent = newTitle;
                }
            }
        });
        
        // ドラッグ&ドロップを再初期化
        initDragAndDrop();
        
        console.log(`トレーニングメニューが削除されました: ${sectionId}`);
    }

    // トレーニングメニューを追加する関数
    function addTrainingMenu() {
        additionalSectionCount++;
        const newSectionId = `menu-${additionalSectionCount}`;
        
        // 現在のセクション数をカウント
        const currentSections = document.querySelectorAll('.training-section');
        const menuNumber = currentSections.length + 1;
        
        // 新しいセクションHTML要素を作成
        const newSection = document.createElement('div');
        newSection.className = 'training-section';
        newSection.setAttribute('data-section-id', newSectionId);
        
        newSection.innerHTML = `
            <div class="training-section-handle">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                    <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"/>
                </svg>
            </div>
            <div class="section-title-container">
                <input type="text" class="section-title-input" value="トレーニングメニュー${menuNumber}" 
                       data-section-id="${newSectionId}" placeholder="トレーニング名を入力">
            </div>
            <div class="form-group">
                <label for="${newSectionId}-activity">種類</label>
                <select id="${newSectionId}-activity" name="${newSectionId}-activity" class="section-activity">
                    <option value="">-- 選択してください --</option>
                    <!-- METs情報はJavaScriptで動的に追加されます -->
                </select>
            </div>
            <div class="form-group">
                <label for="${newSectionId}-duration">時間 (分)</label>
                <input type="number" id="${newSectionId}-duration" name="${newSectionId}-duration" min="0" max="300" class="section-duration">
            </div>
            <div class="form-group">
                <button type="button" class="remove-section-btn cyber-btn" data-section-id="${newSectionId}">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
                        <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                    <span>削除</span>
                </button>
            </div>
        `;
        
        // セクションコンテナに新しいセクションを追加
        const container = document.getElementById('training-sections-container');
        if (container) {
            container.appendChild(newSection);
        }
        
        // 既存IDリストに新しいIDを追加
        existingSectionIds.push(newSectionId);
        
        // METs情報が読み込まれていれば新しいセレクトボックスを初期化
        if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
            populateActivitySelects();
        }
        
        // ドラッグ&ドロップを再初期化
        initDragAndDrop();
        
        // メニューフォームイベントを再初期化
        initMenuForm();
        
        // 削除ボタンのイベントリスナーを設定
        const removeBtn = newSection.querySelector('.remove-section-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionIdToRemove = this.getAttribute('data-section-id');
                removeTrainingSection(sectionIdToRemove);
            });
        }

        // 新しく追加されたセクションに結果カードも追加
        if (sectionCaloriesContainer) {
            const resultItem = document.createElement('div');
            resultItem.className = 'details-item';
            resultItem.setAttribute('data-section-id', newSectionId);
            resultItem.innerHTML = `
                <h4 class="training-menu-title" data-section-id="${newSectionId}">トレーニングメニュー${menuNumber}</h4>
                <p id="${newSectionId}-calories">- kcal</p>
            `;
            sectionCaloriesContainer.appendChild(resultItem);
        }
        
        console.log(`新しいトレーニングメニューが追加されました: ${newSectionId}`);
    }

    // METs情報をセレクトボックスに追加
    function populateActivitySelects() {
        // 全活動オプションをプリロードして、検索入力でフィルタリングする実装
        const activitySelects = document.querySelectorAll('select.section-activity');
        if (activitySelects.length === 0) {
            console.warn('アクティビティセレクトボックスが見つかりません');
            return;
        }
        activitySelects.forEach(select => {
            // オプションをリセット
            select.innerHTML = '';
            // デフォルトオプション
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 選択してください --';
            select.appendChild(defaultOption);
            // 全活動をオプションとして追加
            metsData.activities.forEach(activity => {
                const option = document.createElement('option');
                option.value = activity.description_ja;
                option.textContent = `${activity.description_ja} (METs: ${activity.mets})`;
                select.appendChild(option);
            });
            // 検索入力フィールドをラップして追加（未追加の場合のみ）
            if (!select.parentElement.classList.contains('activity-select-container')) {
                const container = document.createElement('div');
                container.className = 'activity-select-container';
                select.parentNode.insertBefore(container, select);
                container.appendChild(select);
                // 検索入力
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.className = 'activity-search-input';
                searchInput.placeholder = '活動を検索...';
                container.insertBefore(searchInput, select);
                // 検索時にselectのオプションをフィルタリング
                searchInput.addEventListener('input', () => {
                    const term = searchInput.value.toLowerCase();
                    Array.from(select.options).forEach(opt => {
                        if (!opt.value) {
                            opt.hidden = false;
                        } else {
                            opt.hidden = !opt.textContent.toLowerCase().includes(term);
                        }
                    });
                });
            }
        });
    }

    // 活動名からMETs値を取得する関数
    function getMetsValueByActivityName(activityName) {
        // 活動名からMETs値を取得
        if (typeof metsData !== 'undefined' && metsData.activities) {
            const activity = metsData.activities.find(a => a.description_ja === activityName);
            return activity ? activity.mets : null;
        } else {
            console.error('mets-data_latest.jsが正しく読み込まれていません');
            return null;
        }
    }

    // トレーニング消費カロリーの計算
    function calculateTrainingCalories() {
        console.log('計算開始: calculateTrainingCalories()');
        
        // 結果表示用の要素を再取得（念のため）
        if (!trainingResultCard) {
            console.log('trainingResultCardが未初期化なので再取得します');
            trainingResultCard = document.getElementById('training-result-card');
        }
        
        if (!totalCaloriesResult) {
            console.log('totalCaloriesResultが未初期化なので再取得します');
            totalCaloriesResult = document.getElementById('total-calories-result');
        }
        
        if (!menuResults) {
            console.log('menuResultsが未初期化なので再取得します');
            menuResults = document.getElementById('menu-results');
        }
        
        if (!sectionCaloriesContainer) {
            console.log('sectionCaloriesContainerが未初期化なので再取得します');
            sectionCaloriesContainer = document.getElementById('section-calories-container');
        }
        
        // 計算に必要な値を取得
        const weightInput = document.getElementById('training-weight');
        if (!weightInput || !weightInput.value) {
            alert('体重を入力してください');
            return;
        }
        
        const weight = parseFloat(weightInput.value);
        if (isNaN(weight) || weight <= 0) {
            alert('有効な体重を入力してください');
            return;
        }

        // トレーニングメニューの消費カロリーを計算
        let totalCalories = 0;
        // 計算結果をグローバル変数にリセット
        sectionResults = [];
        
        // 全てのセクションを処理
        const sections = document.querySelectorAll('.training-section');
        let hasValidInput = false;
        
        console.log(`トレーニングセクション数: ${sections.length}`);
        
        sections.forEach((section, index) => {
            const sectionId = section.dataset.sectionId;
            const activitySelect = section.querySelector('.section-activity');
            const durationInput = section.querySelector('.section-duration');
            const titleInput = section.querySelector('.section-title-input');
            
            console.log(`セクション ${index+1} (ID: ${sectionId}) をチェック中`);
            
            if (!activitySelect || !durationInput) {
                console.log(`- セクション ${index+1}: 必要な要素が見つかりません`);
                return;
            }
            
            const activity = activitySelect.value;
            const duration = parseFloat(durationInput.value);
            const title = titleInput ? titleInput.value : 'トレーニングメニュー';
            
            console.log(`- セクション ${index+1}: 種類=${activity}, 時間=${duration}`);
            
            // このメニューに有効な入力がない場合はスキップ
            if (!activity || activity === '' || isNaN(duration) || duration <= 0) {
                console.log(`- セクション ${index+1}: 入力が不完全なのでスキップします`);
                return;
            }
            
            // METs値を取得
            const metsValue = getMetsValueByActivityName(activity);
            if (!metsValue) {
                alert(`${activity}のMETs値が見つかりませんでした`);
                console.log(`- セクション ${index+1}: METs値が見つかりません`);
                return;
            }
            
            // 有効な入力がある
            hasValidInput = true;
            console.log(`- セクション ${index+1}: 有効な入力です (METs=${metsValue})`);
            
            // 消費カロリーを計算 (METs × 体重kg × 運動時間(時間) × 1.05)
            const durationHours = duration / 60;
            const calories = metsValue * weight * durationHours * 1.05;
            
            totalCalories += calories;
            
            sectionResults.push({
                id: sectionId,
                title: title,
                calories: Math.round(calories)
            });
        });
        
        // 有効な入力が1つもない場合はエラーメッセージを表示
        if (!hasValidInput) {
            alert('少なくとも1つのトレーニングメニューに種類と時間を入力してください');
            console.log('有効な入力が1つもありません');
            return;
        }
        
        console.log(`計算完了: 総消費カロリー = ${Math.round(totalCalories)} kcal`);
        
        // 計算結果を表示
        if (totalCaloriesResult) {
            totalCaloriesResult.textContent = `${Math.round(totalCalories)} kcal`;
            console.log('総消費カロリーを表示しました');
        } else {
            console.error('総消費カロリー表示要素が見つかりません');
        }
        
        // 各メニューの消費カロリーを表示
        updateSectionCalories();
        
        // 結果セクションの順序を更新
        updateMenuResultsOrder();
        
        // 詳細結果セクションを表示
        if (menuResults) {
            menuResults.style.display = 'block';
            console.log('メニュー別結果を表示しました');
        } else {
            console.error('メニュー別結果表示要素が見つかりません');
        }
        
        // 結果カードを表示
        if (trainingResultCard) {
            console.log(`結果カード表示前の状態: ${trainingResultCard.style.display}`);
            trainingResultCard.style.display = 'block';
            trainingResultCard.setAttribute('data-has-results', 'true');
            console.log('結果カードを表示しました');
            
            // 結果表示までスクロール
            trainingResultCard.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            console.error('結果カード表示要素が見つかりません (ID: training-result-card)');
        }
        
        console.log('計算完了: 全ての表示処理が終了しました');
    }

    // 各セクションの消費カロリーを更新する関数
    function updateSectionCalories() {
        console.log('各セクションの消費カロリーを更新します');
        
        // 結果表示コンテナがなければ処理を終了
        if (!sectionCaloriesContainer) {
            console.error('セクションカロリーコンテナが見つかりません');
            return;
        }
        
        // 各セクションの結果を更新
        sectionResults.forEach(result => {
            const caloriesElement = document.getElementById(`${result.id}-calories`);
            const titleElement = document.querySelector(`.training-menu-title[data-section-id="${result.id}"]`);
            
            if (caloriesElement) {
                caloriesElement.textContent = `${result.calories} kcal`;
                console.log(`セクション ${result.id} の消費カロリーを更新: ${result.calories} kcal`);
            }
            
            if (titleElement) {
                titleElement.textContent = result.title;
                console.log(`セクション ${result.id} のタイトルを更新: ${result.title}`);
            }
        });
        
        console.log('各セクションの消費カロリー更新完了');
    }

    // 計算結果の表示順序をトレーニングセクションの順序に合わせる
    function updateMenuResultsOrder() {
        console.log('メニュー結果の表示順序を更新します');
        const sectionsContainer = document.getElementById('training-sections-container');
        const sections = sectionsContainer.querySelectorAll('.training-section');
        const resultContainer = document.getElementById('section-calories-container');
        
        // セクションIDと対応する結果表示要素のマップを作成
        const existingResultItems = {};
        resultContainer.querySelectorAll('.details-item').forEach(item => {
            const sectionId = item.getAttribute('data-section-id');
            if (sectionId) {
                existingResultItems[sectionId] = item;
            }
        });
        
        // セクションの順序に応じて結果表示要素の順序を調整
        sections.forEach((section, index) => {
            const sectionId = section.getAttribute('data-section-id');
            
            // メニュータイトルの更新（トレーニングメニューX形式の場合のみ）
            const titleInput = section.querySelector('.section-title-input');
            if (titleInput && titleInput.value.startsWith('トレーニングメニュー')) {
                const newTitle = `トレーニングメニュー${index + 1}`;
                titleInput.value = newTitle;
                
                // 対応する結果表示のタイトルも更新
                const resultItem = existingResultItems[sectionId];
                if (resultItem) {
                    const titleElement = resultItem.querySelector('.training-menu-title');
                    if (titleElement) {
                        titleElement.textContent = newTitle;
                    }
                }
            }
            
            // ユーザーが変更したタイトルを反映（計算結果がない場合にも対応）
            if (titleInput) {
                // 対応する結果表示のタイトルを更新
                const resultItem = existingResultItems[sectionId];
                if (resultItem) {
                    const titleElement = resultItem.querySelector('.training-menu-title');
                    if (titleElement) {
                        titleElement.textContent = titleInput.value;
                    }
                }
            }
            
            // 既存の結果表示要素があれば、その位置を調整
            if (existingResultItems[sectionId]) {
                resultContainer.appendChild(existingResultItems[sectionId]);
            } else {
                // 結果表示要素がない場合は新規作成（通常は計算前には表示されない）
                console.log(`セクション ${sectionId} の結果表示要素を新規作成`);
                createResultItemForSection(section, sectionId, resultContainer);
            }
        });
        
        console.log('メニュー結果の表示順序を更新しました');
    }

    // セクション用の結果表示要素を作成する関数
    function createResultItemForSection(section, sectionId, resultContainer) {
        const titleInput = section.querySelector('.section-title-input');
        const title = titleInput ? titleInput.value : 'トレーニングメニュー';
        
        const detailItem = document.createElement('div');
        detailItem.className = 'details-item';
        detailItem.setAttribute('data-section-id', sectionId);
        
        const titleElement = document.createElement('h4');
        titleElement.className = 'training-menu-title';
        titleElement.setAttribute('data-section-id', sectionId);
        titleElement.textContent = title;
        
        const caloriesElement = document.createElement('p');
        caloriesElement.id = `${sectionId}-calories`;
        
        // グローバル変数に保存されている計算結果から該当するセクションの結果を探す
        const sectionResult = sectionResults.find(result => result.id === sectionId);
        if (sectionResult) {
            caloriesElement.textContent = `${sectionResult.calories} kcal`;
        } else {
            caloriesElement.textContent = '- kcal';
        }
        
        detailItem.appendChild(titleElement);
        detailItem.appendChild(caloriesElement);
        resultContainer.appendChild(detailItem);
        
        return detailItem;
    }

    // 新しいセクションを追加する関数

    // 詳細計算フォームの初期化時にドラッグ＆ドロップ機能を初期化
    function initMenuForm() {
        console.log('メニューフォーム機能を初期化します');
        // セクションのタイトルが変更されたときの処理
        document.querySelectorAll('.section-title-input').forEach(input => {
            // input イベントリスナーを設定（リアルタイムで反映）
            input.removeEventListener('input', handleTitleInput);
            input.addEventListener('input', handleTitleInput);
            
            // change イベントリスナーも設定（フォーカスが外れたときに確実に反映）
            input.removeEventListener('change', handleTitleChange);
            input.addEventListener('change', handleTitleChange);
        });
        
        // グローバルなinputイベントリスナーも設定（動的に追加される要素にも対応）
        document.removeEventListener('input', handleGlobalInput);
        document.addEventListener('input', handleGlobalInput);
        
        console.log('メニューフォーム機能の初期化が完了しました');
    }

    // タイトル入力時のハンドラー
    function handleTitleInput(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        // 対応する結果表示のタイトルを更新
        updateMenuTitle(sectionId, newTitle);
    }

    // タイトル変更時のハンドラー
    function handleTitleChange(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        // 対応する結果表示のタイトルを更新
        updateMenuTitle(sectionId, newTitle);
        
        // 計算結果配列のタイトルも更新
        updateSectionResultTitle(sectionId, newTitle);
    }

    // グローバルinputイベントのハンドラー（動的に追加された要素に対応）
    function handleGlobalInput(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        // 対応する結果表示のタイトルを更新
        updateMenuTitle(sectionId, newTitle);
    }

    // メニュータイトルを更新する関数
    function updateMenuTitle(sectionId, newTitle) {
        const titleElements = document.querySelectorAll(`.training-menu-title[data-section-id="${sectionId}"]`);
        titleElements.forEach(el => {
            el.textContent = newTitle;
        });
    }

    // 計算結果配列内のタイトルを更新する関数
    function updateSectionResultTitle(sectionId, newTitle) {
        for (let i = 0; i < sectionResults.length; i++) {
            if (sectionResults[i].id === sectionId) {
                sectionResults[i].title = newTitle;
                break;
            }
        }
    }

    // ページ読み込み完了時の処理
    document.addEventListener('DOMContentLoaded', function() {
        // ... existing code ...
        
        // 詳細計算フォームの初期化
        initMenuForm();
        
        // ... rest of the existing code ...
    });
});

// METs情報の読み込みを確認するためのタイマー
// let metsDataCheckAttempts = 0; // 重複定義のため削除

function checkMetsDataLoaded() {
    if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
        console.log('METs情報を検証: 正常に読み込まれました (' + metsData.activities.length + '件)');
        
        // METs情報が読み込まれたので、アクティビティセレクトを初期化
        populateActivitySelects();
        
        return true;
    } else {
        metsDataCheckAttempts++;
        if (metsDataCheckAttempts < 15) { // 最大15回まで試行
            console.log('METs情報の読み込みを待機中... 試行回数: ' + metsDataCheckAttempts);
            setTimeout(checkMetsDataLoaded, 500); // 500ms後に再試行
        } else {
            console.error('METs情報の読み込みに失敗しました。ページをリロードしてください。', typeof metsData);
            alert('運動データの読み込みに失敗しました。ページをリロードしてください。');
        }
        
        return false;
    }
}

// ページロード完了後に実行
window.addEventListener('load', function() {
    console.log('ページ読み込み完了：初期化処理を実行します');
    
    // METs情報の読み込みを確認
    if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
        console.log('METs情報：すでに読み込まれています');
        populateActivitySelects();
    } else {
        console.log('METs情報：読み込みを待機します');
        checkMetsDataLoaded();
    }
    
    // ドラッグ&ドロップ機能を初期化
    initDragAndDrop();
}); 