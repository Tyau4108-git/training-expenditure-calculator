// グローバル変数
let trainingSectionsContainer;
let trainingSections;
let sectionCaloriesContainer;
let additionalSectionCount = 0;
let draggedSection = null;
let trainingResultCard;
let totalCaloriesResult;
let menuResults;
let existingSectionIds = ['warmup', 'main', 'cooldown'];
let sectionResults = [];
let metsDataCheckAttempts = 0;

// タッチデバイスかどうかを判定
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

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

    // 身体活動レベルの詳細な説明
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
    const WEIGHT_LOSS_MIN_PERCENT = 0.10;
    const WEIGHT_LOSS_MAX_PERCENT = 0.20;
    const MUSCLE_GAIN_PERCENT = 0.075;

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
        
        const ageGroup = activityLevelsByAge.find(group => age >= group.min && age <= group.max);
        
        if (ageGroup) {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 選択してください --';
            activityLevelSelect.appendChild(defaultOption);
            
            ageGroup.levels.forEach((level, index) => {
                if (level !== null) {
                    const option = document.createElement('option');
                    option.value = level;
                    const levelNumber = index + 1;
                    const levelName = ageGroup.descriptions[index];
                    
                    let levelTitle = "";
                    if (index === 0) levelTitle = activityLevelDetails.low.title;
                    else if (index === 1) levelTitle = activityLevelDetails.medium.title;
                    else if (index === 2) levelTitle = activityLevelDetails.high.title;
                    
                    option.textContent = `レベル ${levelNumber} (${levelName}) - ${levelTitle}`;
                    activityLevelSelect.appendChild(option);
                }
            });
            
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
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const bodyFat = parseFloat(document.getElementById('body-fat').value) || null;
        const activityLevel = parseFloat(document.getElementById('activity-level').value);

        if (isNaN(age) || isNaN(weight) || isNaN(height)) {
            alert('年齢、体重、身長には数値を入力してください。');
            return;
        }
        
        if (!activityLevel) {
            alert('身体活動レベルを選択してください。');
            return;
        }

        let bmr;
        const genderFactor = gender === 'male' ? 0.5473 : 0.5473 * 2;
        bmr = ((0.1238 + (0.0481 * weight) + (0.0234 * height) - (0.0138 * age) - genderFactor)) * 1000 / 4.186;

        const tdee = bmr * activityLevel;
        
        const weightLossMinCal = tdee * (1 - WEIGHT_LOSS_MAX_PERCENT);
        const weightLossMaxCal = tdee * (1 - WEIGHT_LOSS_MIN_PERCENT);
        const weightLossCal = Math.round((weightLossMinCal + weightLossMaxCal) / 2);
        const muscleGainCal = Math.round(tdee * (1 + MUSCLE_GAIN_PERCENT));
        const maintenanceCal = Math.round(tdee);

        bmrResult.textContent = `${Math.round(bmr)} kcal/日`;
        tdeeResult.textContent = `${maintenanceCal} kcal/日`;
        weightLossResult.textContent = `${weightLossCal} kcal/日`;
        maintenanceResult.textContent = `${maintenanceCal} kcal/日`;
        muscleGainResult.textContent = `${muscleGainCal} kcal/日`;

        resultCard.style.display = 'block';
        nutritionCard.style.display = 'block';

        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });

        animateValue(bmrResult, 0, Math.round(bmr), 1000);
        animateValue(tdeeResult, 0, maintenanceCal, 1200);
        animateValue(weightLossResult, 0, weightLossCal, 1400);
        animateValue(maintenanceResult, 0, maintenanceCal, 1600);
        animateValue(muscleGainResult, 0, muscleGainCal, 1800);

        updateBMIInfo(weight, height, age);
        
        // 結果セクションを表示
        const resultSection = document.querySelector('.result-section');
        if (resultSection) {
            resultSection.classList.add('visible');
        }
    }

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

    function initializeAnimations() {
        const calculateBtn = document.querySelector('.calculate-btn');
        calculateBtn.style.opacity = '0';
        calculateBtn.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            calculateBtn.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            calculateBtn.style.opacity = '1';
            calculateBtn.style.transform = 'translateY(0)';
        }, 800);
    }

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
        const idealWeight = 22 * Math.pow(height / 100, 2);
        return {
            min: idealWeight * 0.9,
            max: idealWeight * 1.1
        };
    }

    function getAgeRangeBMI(age) {
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

    function updateBMIInfo(weight, height, age) {
        const bmi = calculateBMI(weight, height);
        const bmiCategory = getBMICategory(bmi);
        const idealWeightRange = getIdealWeight(height);
        const ageRangeBMI = getAgeRangeBMI(age);
        
        document.querySelector('.bmi-current').textContent = bmi.toFixed(1);
        document.querySelector('.status-category').textContent = bmiCategory.name;
        
        const statusIndicator = document.querySelector('.status-indicator');
        const statusContainer = document.querySelector('.status-category-container');
        const statusCategory = document.querySelector('.status-category');
        
        statusIndicator.style.backgroundColor = bmiCategory.color;
        statusContainer.style.backgroundColor = `rgba(${bmiCategory.rgb}, 0.1)`;
        statusCategory.style.color = bmiCategory.color;
        
        document.querySelector('.ideal-min-value').textContent = idealWeightRange.min.toFixed(1);
        document.querySelector('.ideal-max-value').textContent = idealWeightRange.max.toFixed(1);
        document.querySelector('.current-weight-value').textContent = weight.toFixed(1);
        
        document.querySelector('.age-range-bmi span').textContent = `${ageRangeBMI.min} - ${ageRangeBMI.max}`;
        
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
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-category');
            displayNutritionCategory(category);
        });
    });

    function displayNutritionInfo() {
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        
        const activeTab = document.querySelector('.tab-button.active');
        const category = activeTab ? activeTab.getAttribute('data-category') : 'macronutrients';
        
        displayNutritionCategory(category);
    }

    function displayNutritionCategory(category) {
        const gender = document.querySelector('input[name="gender"]:checked').value;
        const age = parseFloat(document.getElementById('age').value);
        
        if (isNaN(age)) return;
        
        nutritionContent.innerHTML = `
            <div class="nutrition-loading">
                <div class="spinner"></div>
                <p>あなたの年齢と性別に基づいた栄養素情報を読み込んでいます...</p>
            </div>
        `;
        
        setTimeout(() => {
            const nutrients = nutritionCategories[category].nutrients;
            
            let html = `<h3 class="nutrition-category-title">${nutritionCategories[category].name}</h3>`;
            html += `<div class="nutrition-cards">`;
            
            nutrients.forEach(nutrientKey => {
                const nutrient = nutritionData[nutrientKey];
                const ageGroup = getNutrientValueForAge(nutrient, age);
                const genderValue = gender === 'male' ? ageGroup.male : 
                                   (gender === 'female' && nutrientKey === 'iron' && age >= 10 && age <= 64) ? 
                                   ageGroup.femaleWithMenstruation || ageGroup.female : ageGroup.female;
                
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

    function getNutrientValueForAge(nutrient, age) {
        let matchingValue = null;
        
        for (const value of nutrient.values) {
            const ageRange = value.age;
            
            if (ageRange.includes('妊婦') || ageRange.includes('授乳婦')) continue;
            
            const match = ageRange.match(/(\d+)～(\d+)（([^）]+)）/);
            if (match) {
                const minAge = parseInt(match[1]);
                const maxAge = parseInt(match[2]);
                const unit = match[3];
                
                if (unit === '月') {
                    if (age < 1 && age * 12 >= minAge && age * 12 <= maxAge) {
                        matchingValue = value;
                        break;
                    }
                } else if (unit === '歳') {
                    if (age >= minAge && age <= maxAge) {
                        matchingValue = value;
                        break;
                    }
                }
            } else if (ageRange.includes('以上')) {
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
        
        return matchingValue || { age: "不明", male: "-", female: "-" };
    }

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
    checkMetsDataLoaded();
    fixMobileScroll();

    function initializeTabs() {
        console.log('タブ初期化');
        if (tdeeTab && trainingTab) {
            tdeeTab.addEventListener('click', () => {
                switchTab('tdee');
            });
            
            trainingTab.addEventListener('click', () => {
                switchTab('training');
            });
        }
    }

    // モバイルスクロール問題の修正
    function fixMobileScroll() {
        // タッチデバイスかどうかを確認
        if (!('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
            return;
        }
        
        // トレーニングタブがアクティブな時のスクロール問題を修正
        const trainingTab = document.getElementById('training-tab');
        const trainingCalculator = document.getElementById('training-calculator');
        const trainingSectionsContainer = document.getElementById('training-sections-container');
        
        if (trainingTab && trainingCalculator) {
            // タブ切り替え時にスクロール設定をリセット
            trainingTab.addEventListener('click', function() {
                setTimeout(() => {
                    // bodyのスクロールを確実に有効化
                    document.body.style.overflow = 'auto';
                    document.body.style.position = 'relative';
                    document.body.style.height = 'auto';
                    
                    // コンテナのスクロールも有効化
                    if (trainingSectionsContainer) {
                        trainingSectionsContainer.style.overflow = 'visible';
                        trainingSectionsContainer.style.height = 'auto';
                        trainingSectionsContainer.style.minHeight = 'auto';
                    }
                    
                    // iOSのスクロール問題を回避
                    document.documentElement.style.overflow = 'auto';
                    document.documentElement.style.height = 'auto';
                }, 100);
            });
        }
        
        // タッチイベントの処理を改善
        if (trainingSectionsContainer) {
            let touchStartY = 0;
            let touchEndY = 0;
            
            // タッチ開始時の処理
            trainingSectionsContainer.addEventListener('touchstart', function(e) {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            
            // タッチ移動時の処理
            trainingSectionsContainer.addEventListener('touchmove', function(e) {
                touchEndY = e.touches[0].clientY;
                
                // スクロール方向を検出
                const scrollDirection = touchStartY - touchEndY;
                
                // ページ全体のスクロールを許可
                if (Math.abs(scrollDirection) > 10) {
                    e.stopPropagation();
                }
            }, { passive: true });
        }
        
        // 入力フィールドのフォーカス時の処理
        document.addEventListener('focusin', function(e) {
            if (e.target.matches('input, select, textarea')) {
                // フォーカス時もスクロールを維持
                document.body.style.overflow = 'auto';
                
                // iOS Safariでキーボード表示時のスクロール問題を回避
                setTimeout(() => {
                    if (window.visualViewport) {
                        const viewportHeight = window.visualViewport.height;
                        const elementBottom = e.target.getBoundingClientRect().bottom;
                        
                        if (elementBottom > viewportHeight) {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }
                }, 300);
            }
        });
        
        // フォーカスが外れた時の処理
        document.addEventListener('focusout', function(e) {
            if (e.target.matches('input, select, textarea')) {
                // スクロール位置を保持
                const scrollY = window.scrollY;
                
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                    document.body.style.overflow = 'auto';
                }, 100);
            }
        });
    }

    // タブ切り替え関数も修正（switchTab関数内に追加）
    // switchTab関数の最後に以下を追加：
    function switchTabWithScrollFix(tabName) {
        // 既存のswitchTab処理...
        
        // モバイルでのスクロール問題を修正
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            setTimeout(() => {
                document.body.style.overflow = 'auto';
                document.body.style.position = 'relative';
                document.body.style.height = 'auto';
                window.scrollTo(0, window.scrollY);
            }, 100);
        }
    }

    function switchTab(tabName) {
        console.log('タブ切り替え:', tabName);
        
        if (!tdeeTab || !trainingTab) {
            console.error('タブ要素が未定義です');
            return;
        }
        
        if (!tdeeCalculator || !trainingCalculator) {
            console.error('計算機要素が未定義です');
            return;
        }
        
        if (tabName === 'tdee') {
            tdeeTab.classList.add('active');
            trainingTab.classList.remove('active');
            tdeeCalculator.style.display = 'block';
            trainingCalculator.style.display = 'none';
            tdeeExplanation.style.display = 'block';
            trainingExplanation.style.display = 'none';
            
            if (resultCard.style.display === 'block') {
                resultCard.style.display = 'block';
                nutritionCard.style.display = 'block';
            }
            
            if (trainingResultCard) {
                trainingResultCard.style.display = 'none';
            }
        } else {
            tdeeTab.classList.remove('active');
            trainingTab.classList.add('active');
            tdeeCalculator.style.display = 'none';
            trainingCalculator.style.display = 'block';
            tdeeExplanation.style.display = 'none';
            trainingExplanation.style.display = 'block';
            
            resultCard.style.display = 'none';
            nutritionCard.style.display = 'none';
            
            if (trainingResultCard) {
                if (trainingResultCard.getAttribute('data-has-results') === 'true' || 
                    (totalCaloriesResult && totalCaloriesResult.textContent && 
                    totalCaloriesResult.textContent !== '- kcal')) {
                    trainingResultCard.style.display = 'block';
                }
            }
            
            populateActivitySelects();
        }
    }

    function initializeTrainingForm() {
        console.log('トレーニングフォーム初期化開始');
        
        const trainingFormElement = document.getElementById('training-form');
        
        if (!trainingFormElement) {
            console.error('トレーニングフォーム要素が見つかりません');
            return;
        }
        
        // イベントリスナーを設定
        trainingFormElement.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('トレーニングフォームのsubmitイベントが発火しました');
            calculateTrainingCalories();
        });
        
        const calculateBtn = trainingFormElement.querySelector('.calculate-btn');
        if (calculateBtn) {
            calculateBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('計算ボタンがクリックされました');
                calculateTrainingCalories();
            });
        }
        
        const addMenuBtn = document.getElementById('add-training-menu-btn');
        if (addMenuBtn) {
            addMenuBtn.addEventListener('click', function(e) {
                e.preventDefault();
                addTrainingMenu();
            });
        }
        
        const existingRemoveBtns = document.querySelectorAll('.remove-section-btn');
        existingRemoveBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionIdToRemove = this.getAttribute('data-section-id');
                removeTrainingSection(sectionIdToRemove);
            });
        });
        
        // モバイル向けドラッグ&ドロップ機能を初期化
        if (isTouchDevice) {
            initMobileDragAndDrop();
        } else {
            initDragAndDrop();
        }
        
        initMenuForm();
        
        if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
            populateActivitySelects();
        }
        
        console.log('トレーニングフォーム初期化完了');
    }

    // モバイル向けドラッグ&ドロップ機能
    function initMobileDragAndDrop() {
        console.log('モバイル向けドラッグ&ドロップ機能を初期化');
        
        const container = document.getElementById('training-sections-container');
        trainingSections = document.querySelectorAll('.training-section');
        
        // ドラッグハンドルを非表示にする
        trainingSections.forEach(section => {
            const handle = section.querySelector('.training-section-handle');
            if (handle) {
                handle.style.display = 'none';
            }
        });
        
        // 並び替えボタンを追加
        addSortButtons();
    }

    // 並び替えボタンを追加する関数
    function addSortButtons() {
        const sections = document.querySelectorAll('.training-section');
        
        sections.forEach((section, index) => {
            // 既存のボタンがある場合は削除
            const existingButtons = section.querySelectorAll('.mobile-sort-btn');
            existingButtons.forEach(btn => btn.remove());
            
            // ボタンコンテナを作成
            const buttonContainer = document.createElement('div');
            buttonContainer.className = 'mobile-sort-buttons';
            
            // 上に移動ボタン
            if (index > 0) {
                const upButton = document.createElement('button');
                upButton.className = 'mobile-sort-btn sort-up-btn';
                upButton.innerHTML = '↑';
                upButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveSection(section, 'up');
                });
                buttonContainer.appendChild(upButton);
            }
            
            // 下に移動ボタン
            if (index < sections.length - 1) {
                const downButton = document.createElement('button');
                downButton.className = 'mobile-sort-btn sort-down-btn';
                downButton.innerHTML = '↓';
                downButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    moveSection(section, 'down');
                });
                buttonContainer.appendChild(downButton);
            }
            
            // セクションタイトルの横にボタンを配置
            const titleContainer = section.querySelector('.section-title-container');
            if (titleContainer) {
                titleContainer.appendChild(buttonContainer);
            }
        });
    }

    // セクションを移動する関数
    function moveSection(section, direction) {
        const container = document.getElementById('training-sections-container');
        const sections = Array.from(container.querySelectorAll('.training-section'));
        const currentIndex = sections.indexOf(section);
        
        if (direction === 'up' && currentIndex > 0) {
            container.insertBefore(section, sections[currentIndex - 1]);
        } else if (direction === 'down' && currentIndex < sections.length - 1) {
            container.insertBefore(sections[currentIndex + 1], section);
        }
        
        // ボタンを再配置
        addSortButtons();
        
        // 結果表示の順序を更新
        updateMenuResultsOrder();
    }

    // デスクトップ向けドラッグ&ドロップ機能（既存のコードを維持）
    function initDragAndDrop() {
        console.log('ドラッグ&ドロップ機能を初期化しています');
        const container = document.getElementById('training-sections-container');
        trainingSections = document.querySelectorAll('.training-section');
        
        addDragAndDropStyles();
        
        trainingSections.forEach(section => {
            const handle = section.querySelector('.training-section-handle');
            
            if (handle) {
                handle.style.cursor = 'grab';
                handle.title = 'ドラッグしてメニューの順序を変更';
                handle.classList.add('draggable-handle');
                
                handle.removeEventListener('mousedown', handleDragStart);
                handle.addEventListener('mousedown', handleDragStart);
            }
        });
        
        if (container) {
            container.removeEventListener('dragover', handleDragOver);
            container.addEventListener('dragover', handleDragOver);
            
            container.removeEventListener('drop', handleDrop);
            container.addEventListener('drop', handleDrop);
        }
        
        document.removeEventListener('dragend', handleDragEnd);
        document.addEventListener('dragend', handleDragEnd);
    }

    function handleDragStart(e) {
        const section = this.closest('.training-section');
        if (!section) return;
        
        draggedSection = section;
        this.style.cursor = 'grabbing';
        section.setAttribute('draggable', 'true');
        
        section.ondragstart = function(event) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', '');
            section.classList.add('dragging');
            
            const allSections = document.querySelectorAll('.training-section');
            allSections.forEach(s => {
                s.style.zIndex = s === section ? '10' : '1';
            });
        };
        
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

    function handleDragEnd(e) {
        if (!draggedSection) return;
        
        draggedSection.classList.remove('dragging');
        draggedSection.setAttribute('draggable', 'false');
        
        const allSections = document.querySelectorAll('.training-section');
        allSections.forEach(section => {
            section.classList.add('drag-complete');
            setTimeout(() => {
                section.classList.remove('drag-complete');
            }, 500);
        });
        
        updateMenuResultsOrder();
        
        const finishedSection = draggedSection;
        draggedSection = null;
        
        const titleInput = finishedSection.querySelector('.section-title-input');
        if (titleInput) {
            const savedTitle = titleInput.value;
            setTimeout(() => {
                titleInput.value = savedTitle;
            }, 10);
        }
    }

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

    function handleDrop(e) {
        e.preventDefault();
        console.log('アイテムがドロップされました');
        
        const draggable = document.querySelector('.dragging');
        if (draggable) {
            draggable.classList.remove('dragging');
            draggable.setAttribute('draggable', 'false');
        }
        
        updateMenuResultsOrder();
        draggedSection = null;
        
        return false;
    }

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

    function addDragAndDropStyles() {
        const existingStyle = document.getElementById('drag-drop-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        const styleEl = document.createElement('style');
        styleEl.id = 'drag-drop-styles';
        styleEl.textContent = `
            .draggable-handle {
                background-color: rgba(0, 150, 255, 0.1);
                border-radius: 4px;
                padding: 4px;
                margin: -4px;
                transition: all 0.2s ease;
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
            
            /* モバイル向けソートボタンのスタイル */
            .mobile-sort-buttons {
                display: flex;
                gap: 0.5rem;
                margin-left: auto;
            }
            
            .mobile-sort-btn {
                width: 30px;
                height: 30px;
                padding: 0;
                background-color: rgba(45, 212, 191, 0.2);
                border: 1px solid var(--secondary-color);
                color: var(--secondary-color);
                border-radius: 4px;
                cursor: pointer;
                font-size: 16px;
                font-weight: bold;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .mobile-sort-btn:hover,
            .mobile-sort-btn:active {
                background-color: rgba(45, 212, 191, 0.3);
                transform: scale(1.1);
            }
            
            @media (min-width: 769px) {
                .mobile-sort-buttons {
                    display: none;
                }
            }
            
            @media (max-width: 768px) {
                .draggable-handle {
                    display: none;
                }
            }
        `;
        
        document.head.appendChild(styleEl);
    }

    function removeTrainingSection(sectionId) {
        if (['warmup', 'main', 'cooldown'].includes(sectionId)) {
            alert('デフォルトのトレーニングメニューは削除できません。');
            return;
        }
        
        const sectionToRemove = document.querySelector(`.training-section[data-section-id="${sectionId}"]`);
        if (sectionToRemove) {
            sectionToRemove.remove();
        }
        
        const resultItemToRemove = document.querySelector(`.details-item[data-section-id="${sectionId}"]`);
        if (resultItemToRemove) {
            resultItemToRemove.remove();
        }
        
        const index = existingSectionIds.indexOf(sectionId);
        if (index !== -1) {
            existingSectionIds.splice(index, 1);
        }
        
        const sections = document.querySelectorAll('.training-section');
        sections.forEach((section, index) => {
            const titleInput = section.querySelector('.section-title-input');
            if (titleInput && titleInput.value.match(/^トレーニングメニュー\d+$/)) {
                const newTitle = `トレーニングメニュー${index + 1}`;
                titleInput.value = newTitle;
                
                const sectionId = section.getAttribute('data-section-id');
                const resultTitle = document.querySelector(`.training-menu-title[data-section-id="${sectionId}"]`);
                if (resultTitle) {
                    resultTitle.textContent = newTitle;
                }
            }
        });
        
        // モバイルの場合はソートボタンを再配置
        if (isTouchDevice) {
            addSortButtons();
        } else {
            initDragAndDrop();
        }
        
        console.log(`トレーニングメニューが削除されました: ${sectionId}`);
    }

    function addTrainingMenu() {
        additionalSectionCount++;
        const newSectionId = `menu-${additionalSectionCount}`;
        
        const currentSections = document.querySelectorAll('.training-section');
        const menuNumber = currentSections.length + 1;
        
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
        
        const container = document.getElementById('training-sections-container');
        if (container) {
            container.appendChild(newSection);
        }
        
        existingSectionIds.push(newSectionId);
        
        if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
            populateActivitySelects();
        }
        
        // モバイルの場合はソートボタンを追加
        if (isTouchDevice) {
            addSortButtons();
        } else {
            initDragAndDrop();
        }
        
        initMenuForm();
        
        const removeBtn = newSection.querySelector('.remove-section-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionIdToRemove = this.getAttribute('data-section-id');
                removeTrainingSection(sectionIdToRemove);
            });
        }

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

    function populateActivitySelects() {
        const activitySelects = document.querySelectorAll('select.section-activity');
        if (activitySelects.length === 0) {
            console.warn('アクティビティセレクトボックスが見つかりません');
            return;
        }
        activitySelects.forEach(select => {
            select.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = '-- 選択してください --';
            select.appendChild(defaultOption);
            
            metsData.activities.forEach(activity => {
                const option = document.createElement('option');
                option.value = activity.description_ja;
                option.textContent = `${activity.description_ja} (METs: ${activity.mets})`;
                select.appendChild(option);
            });
            
            if (!select.parentElement.classList.contains('activity-select-container')) {
                const container = document.createElement('div');
                container.className = 'activity-select-container';
                select.parentNode.insertBefore(container, select);
                container.appendChild(select);
                
                const searchInput = document.createElement('input');
                searchInput.type = 'text';
                searchInput.className = 'activity-search-input';
                searchInput.placeholder = '活動を検索...';
                container.insertBefore(searchInput, select);
                
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

    function getMetsValueByActivityName(activityName) {
        if (typeof metsData !== 'undefined' && metsData.activities) {
            const activity = metsData.activities.find(a => a.description_ja === activityName);
            return activity ? activity.mets : null;
        } else {
            console.error('mets-data_latest.jsが正しく読み込まれていません');
            return null;
        }
    }

    function calculateTrainingCalories() {
        console.log('計算開始: calculateTrainingCalories()');
        
        if (!trainingResultCard) {
            trainingResultCard = document.getElementById('training-result-card');
        }
        
        if (!totalCaloriesResult) {
            totalCaloriesResult = document.getElementById('total-calories-result');
        }
        
        if (!menuResults) {
            menuResults = document.getElementById('menu-results');
        }
        
        if (!sectionCaloriesContainer) {
            sectionCaloriesContainer = document.getElementById('section-calories-container');
        }
        
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

        let totalCalories = 0;
        sectionResults = [];
        
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
            
            if (!activity || activity === '' || isNaN(duration) || duration <= 0) {
                console.log(`- セクション ${index+1}: 入力が不完全なのでスキップします`);
                return;
            }
            
            const metsValue = getMetsValueByActivityName(activity);
            if (!metsValue) {
                alert(`${activity}のMETs値が見つかりませんでした`);
                console.log(`- セクション ${index+1}: METs値が見つかりません`);
                return;
            }
            
            hasValidInput = true;
            console.log(`- セクション ${index+1}: 有効な入力です (METs=${metsValue})`);
            
            const durationHours = duration / 60;
            const calories = metsValue * weight * durationHours * 1.05;
            
            totalCalories += calories;
            
            sectionResults.push({
                id: sectionId,
                title: title,
                calories: Math.round(calories)
            });
        });
        
        if (!hasValidInput) {
            alert('少なくとも1つのトレーニングメニューに種類と時間を入力してください');
            console.log('有効な入力が1つもありません');
            return;
        }
        
        console.log(`計算完了: 総消費カロリー = ${Math.round(totalCalories)} kcal`);
        
        if (totalCaloriesResult) {
            totalCaloriesResult.textContent = `${Math.round(totalCalories)} kcal`;
            console.log('総消費カロリーを表示しました');
        } else {
            console.error('総消費カロリー表示要素が見つかりません');
        }
        
        updateSectionCalories();
        updateMenuResultsOrder();
        
        if (menuResults) {
            menuResults.style.display = 'block';
            console.log('メニュー別結果を表示しました');
        } else {
            console.error('メニュー別結果表示要素が見つかりません');
        }
        
        if (trainingResultCard) {
            console.log(`結果カード表示前の状態: ${trainingResultCard.style.display}`);
            trainingResultCard.style.display = 'block';
            trainingResultCard.setAttribute('data-has-results', 'true');
            console.log('結果カードを表示しました');
            
            trainingResultCard.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
            console.error('結果カード表示要素が見つかりません (ID: training-result-card)');
        }
        
        console.log('計算完了: 全ての表示処理が終了しました');
    }

    function updateSectionCalories() {
        console.log('各セクションの消費カロリーを更新します');
        
        if (!sectionCaloriesContainer) {
            console.error('セクションカロリーコンテナが見つかりません');
            return;
        }
        
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

    function updateMenuResultsOrder() {
        console.log('メニュー結果の表示順序を更新します');
        const sectionsContainer = document.getElementById('training-sections-container');
        const sections = sectionsContainer.querySelectorAll('.training-section');
        const resultContainer = document.getElementById('section-calories-container');
        
        const existingResultItems = {};
        resultContainer.querySelectorAll('.details-item').forEach(item => {
            const sectionId = item.getAttribute('data-section-id');
            if (sectionId) {
                existingResultItems[sectionId] = item;
            }
        });
        
        sections.forEach((section, index) => {
            const sectionId = section.getAttribute('data-section-id');
            
            const titleInput = section.querySelector('.section-title-input');
            if (titleInput && titleInput.value.startsWith('トレーニングメニュー')) {
                const newTitle = `トレーニングメニュー${index + 1}`;
                titleInput.value = newTitle;
                
                const resultItem = existingResultItems[sectionId];
                if (resultItem) {
                    const titleElement = resultItem.querySelector('.training-menu-title');
                    if (titleElement) {
                        titleElement.textContent = newTitle;
                    }
                }
            }
            
            if (titleInput) {
                const resultItem = existingResultItems[sectionId];
                if (resultItem) {
                    const titleElement = resultItem.querySelector('.training-menu-title');
                    if (titleElement) {
                        titleElement.textContent = titleInput.value;
                    }
                }
            }
            
            if (existingResultItems[sectionId]) {
                resultContainer.appendChild(existingResultItems[sectionId]);
            } else {
                console.log(`セクション ${sectionId} の結果表示要素を新規作成`);
                createResultItemForSection(section, sectionId, resultContainer);
            }
        });
        
        console.log('メニュー結果の表示順序を更新しました');
    }

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

    function initMenuForm() {
        console.log('メニューフォーム機能を初期化します');
        document.querySelectorAll('.section-title-input').forEach(input => {
            input.removeEventListener('input', handleTitleInput);
            input.addEventListener('input', handleTitleInput);
            
            input.removeEventListener('change', handleTitleChange);
            input.addEventListener('change', handleTitleChange);
            
            // モバイルでの入力問題を修正
            input.addEventListener('focus', function() {
                this.setAttribute('data-focused', 'true');
            });
            
            input.addEventListener('blur', function() {
                this.removeAttribute('data-focused');
                // 入力値を確実に保存
                const value = this.value;
                setTimeout(() => {
                    if (this.value !== value) {
                        this.value = value;
                    }
                }, 100);
            });
        });
        
        document.removeEventListener('input', handleGlobalInput);
        document.addEventListener('input', handleGlobalInput);
        
        console.log('メニューフォーム機能の初期化が完了しました');
    }

    function handleTitleInput(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        updateMenuTitle(sectionId, newTitle);
    }

    function handleTitleChange(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        updateMenuTitle(sectionId, newTitle);
        updateSectionResultTitle(sectionId, newTitle);
    }

    function handleGlobalInput(e) {
        if (!e.target.classList.contains('section-title-input')) return;
        
        const sectionId = e.target.getAttribute('data-section-id');
        const newTitle = e.target.value;
        
        updateMenuTitle(sectionId, newTitle);
    }

    function updateMenuTitle(sectionId, newTitle) {
        const titleElements = document.querySelectorAll(`.training-menu-title[data-section-id="${sectionId}"]`);
        titleElements.forEach(el => {
            el.textContent = newTitle;
        });
    }

    function updateSectionResultTitle(sectionId, newTitle) {
        for (let i = 0; i < sectionResults.length; i++) {
            if (sectionResults[i].id === sectionId) {
                sectionResults[i].title = newTitle;
                break;
            }
        }
    }
});

function checkMetsDataLoaded() {
    if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
        console.log('METs情報を検証: 正常に読み込まれました (' + metsData.activities.length + '件)');
        populateActivitySelects();
        return true;
    } else {
        metsDataCheckAttempts++;
        if (metsDataCheckAttempts < 15) {
            console.log('METs情報の読み込みを待機中... 試行回数: ' + metsDataCheckAttempts);
            setTimeout(checkMetsDataLoaded, 500);
        } else {
            console.error('METs情報の読み込みに失敗しました。ページをリロードしてください。', typeof metsData);
            alert('運動データの読み込みに失敗しました。ページをリロードしてください。');
        }
        return false;
    }
}

window.addEventListener('load', function() {
    console.log('ページ読み込み完了：初期化処理を実行します');
    
    if (typeof metsData !== 'undefined' && metsData.activities && metsData.activities.length > 0) {
        console.log('METs情報：すでに読み込まれています');
        if (typeof populateActivitySelects === 'function') {
            populateActivitySelects();
        }
    } else {
        console.log('METs情報：読み込みを待機します');
        checkMetsDataLoaded();
    }
    
    // モバイルデバイスの場合は、モバイル用の機能を初期化
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        const initMobileDragAndDrop = window.initMobileDragAndDrop;
        if (typeof initMobileDragAndDrop === 'function') {
            initMobileDragAndDrop();
        }
    } else {
        const initDragAndDrop = window.initDragAndDrop;
        if (typeof initDragAndDrop === 'function') {
            initDragAndDrop();
        }
    }
});
